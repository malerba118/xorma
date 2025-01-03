import {
  observable,
  makeObservable,
  runInAction,
  action,
  values,
  keys,
  computed,
} from "mobx";
import { HistoryManager } from "./history";

// 1) Helper type to extract toJSON() return shape from a Model
export type BaseModelJSON<BC extends typeof Model> = BC extends {
  prototype: { toJSON: () => infer R };
}
  ? R
  : unknown;

/**
 * 2) The type of the "retyped" class we get from `withType<NewData>()`.
 *
 *    - We Omit 'withType', 'create', 'getById', 'getAll' from the base class
 *      so we can override them with our new signatures.
 *    - The constructor yields an instance that merges the base class instance
 *      with any method overrides we define.
 */
export type RetypedModelClass<
  BC extends typeof Model,
  NewData extends DefaultData
> = Omit<BC, "withType" | "create" | "getById" | "getAll"> & {
  new (...args: any[]): InstanceType<BC> & {
    toJSON(): BaseModelJSON<BC>;
    loadJSON(data: BaseModelJSON<BC>): void;
  };

  // Overridden static create()
  create<Instance extends InstanceType<BC>>(
    this: ConstructorType<Instance>,
    data: NewData
  ): Instance;

  // Overridden static getById()
  getById<Instance extends InstanceType<BC>>(
    this: ConstructorType<Instance>,
    id: string
  ): Instance | undefined;

  // Overridden static getAll()
  getAll<Instance extends InstanceType<BC>>(
    this: ConstructorType<Instance>,
    options?: GetAllOptions
  ): Instance[];

  /**
   * Overridden static withType().
   * We want to be able to call `.withType()` on the newly retyped class
   * and get another retyped class out.
   */
  withType<
    AnotherNewData extends DefaultData = DefaultData,
    AnotherBaseClass extends typeof Model = typeof Model
  >(
    this: AnotherBaseClass,
    _data?: AnotherNewData
  ): RetypedModelClass<AnotherBaseClass, AnotherNewData>;
};

function mapValues<T, U>(
  obj: { [K in keyof T]: T[K] },
  mapper: (value: T[keyof T], key: keyof T) => U
): { [K in keyof T]: U } {
  const result: Partial<{ [K in keyof T]: U }> = {};
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      result[key] = mapper(obj[key], key);
    }
  }
  return result as { [K in keyof T]: U };
}

export const DataType = <T extends DefaultData>(_data?: T) => ({} as T);

export type ConstructorType<T> = {
  new (...params: any[]): T;
  [x: string | number | symbol]: any;
};

export type DefaultData = {
  [x: string | number | symbol]: any;
};

export interface StoreParams<
  Models extends Record<string, RetypedModelClass<typeof Model, any>>
> {
  schemaVersion: number;
  models: Models;
}

export class Store<
  Models extends Record<string, RetypedModelClass<typeof Model, any>>
> {
  // declare readonly Data: {
  //   schemaVersion: number;
  //   data: {
  //     [K in keyof Models]: ReturnType<Collection<Models[K]>["toJSON"]>;
  //   };
  // };
  schemaVersion: number;
  models: {
    [K in keyof Models]: Models[K];
  };
  _history = new HistoryManager();

  constructor(params: StoreParams<Models>) {
    this.models = params.models;
    Object.values(params.models).forEach((model) => {
      model._store = this;
      model._collection = new Collection(model);
    });
    this.schemaVersion = params.schemaVersion;
    makeObservable(this, {
      loadJSON: action,
    });
    this._history.onChange((ev) => {
      if (ev.action === "undo" || ev.action === "redo") {
        this.loadJSON(ev.item);
      }
    });
  }

  history = {
    _instance: this as Store<any>,
    commit({ replace = false }: { replace?: boolean } = {}) {
      if (replace) {
        return this._instance._history.replace(
          JSON.parse(JSON.stringify(this._instance.toJSON()))
        );
      } else {
        return this._instance._history.push(
          JSON.parse(JSON.stringify(this._instance.toJSON()))
        );
      }
    },
    undo() {
      this._instance._history.undo();
    },
    redo() {
      this._instance._history.redo();
    },
    get activeItem() {
      return this._instance._history.activeItem;
    },
  };

  toJSON(): {
    schemaVersion: number;
    data: {
      [K in keyof Models]: ReturnType<Collection<Models[K]>["toJSON"]>;
    };
  } {
    return {
      schemaVersion: this.schemaVersion,
      data: mapValues(this.models, (model) => model._collection.toJSON()),
    };
  }

  loadJSON(data: {
    schemaVersion: number;
    data: {
      [K in keyof Models]: ReturnType<Collection<Models[K]>["toJSON"]>;
    };
  }) {
    if (this.schemaVersion !== data.schemaVersion) {
      throw new Error(
        "The schema version of the data loaded into the store does not match the current store schema version."
      );
    }
    Object.entries(this.models).forEach(([key, model]) => {
      model._collection.loadJSON(data.data[key] || {});
    });
  }
}

export class Collection<ModelClass extends typeof Model> {
  // declare readonly Data: Record<
  //   string,
  //   ReturnType<InstanceType<ModelClass>["toJSON"]>
  // >;
  model: ModelClass;
  instances: Record<string, InstanceType<ModelClass>> = {};

  constructor(model: ModelClass) {
    this.model = model;
    makeObservable(this, {
      instances: observable.shallow,
      loadJSON: action,
    });
  }

  loadJSON(
    data: Record<string, ReturnType<InstanceType<ModelClass>["toJSON"]>>
  ) {
    for (const [id, val] of Object.entries(data)) {
      if (this.instances[id]) {
        this.instances[id].loadJSON(val);
      } else {
        this.instances[id] = this.model.create(val) as any;
      }
    }
    keys(this.instances).forEach((id: any) => {
      if (!data[id]) {
        const instance = this.instances[id];
        instance?.delete();
      }
    });
  }

  toJSON(): Record<string, ReturnType<InstanceType<ModelClass>["toJSON"]>> {
    return Object.fromEntries(
      Object.entries(this.instances).map(([key, instance]) => [
        key,
        instance.toJSON(),
      ])
    ) as any;
  }
}

export type GetAllOptions = {
  includeChildren?: boolean;
};

export type GetByIdOptions = {
  includeChildren?: boolean;
};

export class Model {
  id: string;
  _deleted: boolean = false;
  static _collection: Collection<any>;
  static _store: Store<any>;

  getClass<T extends this>(this: T): ConstructorType<T> {
    return this.constructor as ConstructorType<T>;
  }

  static get _children(): Array<typeof Model> {
    return Object.values(this._store.models).filter(
      (model) => Object.getPrototypeOf(model) === this
    );
  }

  static idSelector(data: any) {
    return data?.id;
  }

  static assertStore() {
    if (!this._store || !this._collection) {
      throw new Error(
        "Models must be attached to a store instance before they can be used."
      );
    }
  }

  static create<Instance extends Model>(
    this: ConstructorType<Instance>,
    data: DefaultData
  ): Instance {
    this.assertStore();
    const id = this.idSelector(data);
    if (this._collection.instances[id]) {
      // load any new data into existing instance
      this._collection.instances[id].loadJSON(data);
    } else {
      // create new instance if none exists
      runInAction(() => {
        this._collection.instances[id] = new this(data);
      });
    }
    return this._collection.instances[id] as Instance;
  }

  static getById<Instance extends Model>(
    this: ConstructorType<Instance>,
    id: string,
    { includeChildren = true }: GetByIdOptions = {}
  ): Instance | undefined {
    this.assertStore();
    let instance = this._collection.instances[id];
    if (instance) {
      return instance.isDeleted ? undefined : instance;
    }
    if (includeChildren) {
      for (const child of this._children) {
        instance = child.getById(id);
        if (instance) return instance as Instance;
      }
    }
  }

  static getAll<Instance extends Model>(
    this: ConstructorType<Instance>,
    { includeChildren = true }: GetAllOptions = {}
  ) {
    this.assertStore();
    let all = values(this._collection.instances).filter(
      (inst: any) => !inst.isDeleted
    );
    if (includeChildren) {
      this._children.forEach((child: typeof Model) => {
        all = all.concat(child.getAll());
      });
    }
    return all as Instance[];
  }

  constructor(data: any) {
    this.id = this.getClass().idSelector(data);
    // this.loadJSON(data);
    makeObservable(this, {
      isDeleted: computed,
      delete: action,
      loadJSON: action,
    });
  }

  delete() {
    this._deleted = true;
    delete this.getClass()._collection.instances[this.id];
    return this;
  }

  get isDeleted() {
    return this._deleted;
  }

  toJSON(): DefaultData {
    return {};
  }

  loadJSON(_data: DefaultData) {}

  // static withType<
  //   NewData extends DefaultData = DefaultData,
  //   BaseClass extends typeof Model = typeof Model
  // >(this: BaseClass, _data?: NewData) {
  //   type OldData = ReturnType<InstanceType<BaseClass>["toJSON"]>;
  //   const parentThis = this;

  //   // @ts-ignore
  //   class RetypedModel extends parentThis {
  //     declare id: string;
  //     declare _deleted: boolean;

  //     constructor(...args: any[]) {
  //       // @ts-ignore
  //       super(...args);
  //     }

  //     static override create(data: NewData): InstanceType<typeof RetypedModel> {
  //       return super.create(data) as InstanceType<typeof RetypedModel>;
  //     }

  //     static override getById(
  //       id: string,
  //       options?: GetByIdOptions
  //     ): InstanceType<typeof RetypedModel> | undefined {
  //       return super.getById(id, options) as
  //         | InstanceType<typeof RetypedModel>
  //         | undefined;
  //     }

  //     static override getAll(
  //       options?: GetAllOptions
  //     ): InstanceType<typeof RetypedModel>[] {
  //       return super.getAll(options) as InstanceType<typeof RetypedModel>[];
  //     }

  //     override toJSON(): OldData {
  //       return super.toJSON() as OldData;
  //     }

  //     override loadJSON(data: OldData): void {
  //       super.loadJSON(data);
  //     }
  //   }

  //   return RetypedModel;

  //   //   return this as unknown as BaseClass & {
  //   //     new (...args: any[]): InstanceType<BaseClass> & {
  //   //       toJSON(): OldData;
  //   //       loadJSON(data: OldData): void;
  //   //     };
  //   //     create(data: NewData): InstanceType<BaseClass>;
  //   //     getById(
  //   //       id: string,
  //   //       options?: GetByIdOptions
  //   //     ): InstanceType<BaseClass> | undefined;
  //   //     getAll(options?: GetAllOptions): InstanceType<BaseClass>[];
  //   //   };
  //   // }
  // }

  static withType<
    NewData extends DefaultData = DefaultData,
    BaseClass extends typeof Model = typeof Model
  >(this: BaseClass, _data?: NewData) {
    // type OldData = ReturnType<InstanceType<BaseClass>["toJSON"]>;
    // const parentThis = this;

    return this as unknown as RetypedModelClass<BaseClass, NewData>;
  }
}
