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
import { dereference, isDeepEqual, mapValues } from "./utils";

interface StoreData<Data extends Record<string, Record<string, object>>> {
  schemaVersion: number;
  data: Data;
}

interface StorePatch {
  schemaVersion: number;
  data: Record<string, Record<string, object | null>>;
}

export const diff = (
  prev: StoreData<Record<string, Record<string, object>>>,
  next: StoreData<Record<string, Record<string, object>>>
): StorePatch => {
  if (prev.schemaVersion !== next.schemaVersion) {
    throw new Error("Schema versions do not match");
  }

  const changes: Record<string, Record<string, any>> = {};

  // Get all unique model types from both prev and next
  const modelTypes = new Set([
    ...Object.keys(prev.data),
    ...Object.keys(next.data),
  ]);

  for (const modelType of modelTypes) {
    const prevInstances = prev.data[modelType] || {};
    const nextInstances = next.data[modelType] || {};

    // Get all unique instance IDs from both prev and next
    const instanceIds = new Set([
      ...Object.keys(prevInstances),
      ...Object.keys(nextInstances),
    ]);

    for (const id of instanceIds) {
      const prevInstance = prevInstances[id];
      const nextInstance = nextInstances[id];

      // Instance was deleted
      if (!nextInstance && prevInstance) {
        if (!changes[modelType]) changes[modelType] = {};
        changes[modelType][id] = null;
        continue;
      }

      // Instance was added
      if (!prevInstance && nextInstance) {
        if (!changes[modelType]) changes[modelType] = {};
        changes[modelType][id] = nextInstance;
        continue;
      }

      // Instance was modified - check deep equality
      if (prevInstance && nextInstance) {
        if (!isDeepEqual(prevInstance, nextInstance)) {
          if (!changes[modelType]) changes[modelType] = {};
          changes[modelType][id] = nextInstance;
        }
      }
    }
  }

  return {
    schemaVersion: next.schemaVersion,
    data: changes,
  };
};

export type SandboxOptions = {
  commit: () => void;
  revert: () => void;
};

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
  schemaVersion: number;
  models: {
    [K in keyof Models]: Models[K];
  };
  private _history = new HistoryManager();

  constructor(params: StoreParams<Models>) {
    this.models = params.models;
    Object.values(params.models).forEach((model) => {
      model._store = this;
      model._collection = new Collection(model);
    });
    this.schemaVersion = params.schemaVersion;
    makeObservable(this, {
      sandbox: action,
      loadJSON: action,
      loadPatch: action,
    });
    this._history.onChange((ev) => {
      if (ev.action === "undo" || ev.action === "redo") {
        this.loadJSON(ev.item);
      }
    });
  }

  sandbox<ReturnVal>(
    callback: (options: SandboxOptions) => ReturnVal
  ): ReturnVal {
    const snapshot = this.toJSON();
    let shouldRevert = true;
    const revert = () => {
      shouldRevert = true;
    };
    const commit = () => {
      shouldRevert = false;
    };
    try {
      let returnValue = callback({ commit, revert });
      return returnValue;
    } catch (err: any) {
      throw err;
    } finally {
      if (shouldRevert) {
        const patch = diff(this.toJSON(), snapshot);
        this.loadPatch(patch);
      }
    }
  }

  reset() {
    // Clear all instances from each model collection
    Object.values(this.models).forEach((model) => {
      model._collection.instances = {};
    });
    // Clear history
    this._history.clear();
  }

  history = {
    _instance: this as Store<any>,
    commit({ replace = false }: { replace?: boolean } = {}) {
      if (replace) {
        return this._instance._history.replace(this._instance.toJSON());
      } else {
        return this._instance._history.push(this._instance.toJSON());
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

  toJSON(): StoreData<{
    [K in keyof Models]: ReturnType<Collection<Models[K]>["toJSON"]>;
  }> {
    return dereference({
      schemaVersion: this.schemaVersion,
      data: mapValues(this.models, (model) => model._collection.toJSON()),
    });
  }

  loadJSON(
    data: StoreData<{
      [K in keyof Models]: ReturnType<Collection<Models[K]>["toJSON"]>;
    }>
  ) {
    if (this.schemaVersion !== data.schemaVersion) {
      throw new Error(
        "The schema version of the data loaded into the store does not match the current store schema version."
      );
    }
    Object.entries(this.models).forEach(([key, model]) => {
      model._collection.loadJSON(data.data[key] || {});
    });
  }

  loadPatch(patch: StorePatch) {
    if (this.schemaVersion !== patch.schemaVersion) {
      throw new Error(
        "The schema version of the patch loaded into the store does not match the current store schema version."
      );
    }
    Object.entries(this.models).forEach(([key, model]) => {
      model._collection.loadPatch(patch.data[key] || {});
    });
  }
}

export class Collection<ModelClass extends typeof Model> {
  model: ModelClass;
  instances: Record<string, InstanceType<ModelClass>> = {};

  constructor(model: ModelClass) {
    this.model = model;
    makeObservable(this, {
      instances: observable.shallow,
      loadJSON: action,
      loadPatch: action,
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
        delete this.instances[id];
      }
    });
  }

  loadPatch(
    data: Record<string, ReturnType<InstanceType<ModelClass>["toJSON"]> | null>
  ) {
    for (const [id, val] of Object.entries(data)) {
      // Handle deletion
      if (val === null) {
        delete this.instances[id];
        continue;
      }

      // Handle update or creation
      if (this.instances[id]) {
        this.instances[id].loadJSON(val);
      } else {
        this.instances[id] = this.model.create(val) as any;
      }
    }
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
    data = dereference(data);
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
    makeObservable(this, {
      isDeleted: computed,
      isDetached: computed,
      delete: action,
      loadJSON: action,
    });
    // TODO: try to figure out a way to call loadJSON on initialization
    // from Model constructor rather than in each child. Sadly, calling
    // loadJSON here does not work.
    // this.loadJSON(data);
  }

  delete() {
    this._deleted = true;
    delete this.getClass()._collection.instances[this.id];
    return this;
  }

  get isDeleted() {
    return this._deleted;
  }

  /** An instance is detached when it is removed from the collection.
   * This usually happens as a result of undo/redo. */
  get isDetached() {
    return !!this.getClass()._collection.instances[this.id];
  }

  toJSON(): DefaultData {
    return {};
  }

  loadJSON(_data: DefaultData) {}

  static withType<
    NewData extends DefaultData = DefaultData,
    BaseClass extends typeof Model = typeof Model
  >(this: BaseClass, _data?: NewData) {
    return this as unknown as RetypedModelClass<BaseClass, NewData>;
  }
}
