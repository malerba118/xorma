import { expect, test } from "vitest";
import {
  Model,
  Store,
  DataType,
  Migration,
  Migrations,
  mapValues,
} from "xorma";
import { autorun, makeObservable, observable, reaction } from "mobx";
import { vi } from "vitest";

interface Counter {
  id: string;
  count: number;
}

class CounterModel extends Model.withType(DataType<Counter>()) {
  count: number;

  constructor(data: Counter) {
    super(data);
    this.loadJSON(data);
    makeObservable(this, {
      count: observable,
    });
  }

  loadJSON(data: Counter) {
    this.count = data.count;
  }

  toJSON() {
    return {
      id: this.id,
      count: this.count,
    };
  }
}

interface Counter2 {
  id: string;
  count2: number;
}

class Counter2Model extends Model.withType(DataType<Counter2>()) {
  count2: number;

  constructor(data: Counter2) {
    super(data);
    this.loadJSON(data);
    makeObservable(this, {
      count2: observable,
    });
  }

  loadJSON(data: Counter2) {
    this.count2 = data.count2;
  }

  toJSON(): Counter2 {
    return {
      id: this.id,
      count2: this.count2,
    };
  }
}

test("Simple migration flow", () => {
  const store = new Store({ schemaVersion: 0, models: { CounterModel } });
  const store2 = new Store({ schemaVersion: 1, models: { Counter2Model } });
  const migrations = new Migrations([
    new Migration({
      toVersion: 1,
      run: (data) => {
        const instances = data["CounterModel"];
        delete data["CounterModel"];
        data["Counter2Model"] = mapValues(instances, (obj) => {
          const nextObj = {
            ...obj,
            count2: obj.count,
          };
          delete nextObj.count;
          return nextObj;
        });
        return data;
      },
    }),
  ]);

  CounterModel.create({ id: "123", count: 10 });
  const snap1 = store.toJSON();

  expect(() => {
    store2.loadJSON(snap1 as any);
  }).toThrowError(
    "The schema version of the data loaded into the store does not match the current store schema version."
  );

  const migratedData = migrations.run(snap1);
  store2.loadJSON(migratedData);
  expect(migratedData).toEqual(store2.toJSON());
});

const v0Data = {
  schemaVersion: 0,
  data: {
    DummyModel: {
      "123": {
        id: "123",
      },
    },
  },
};

const v1Data = {
  schemaVersion: 1,
  data: {
    DummyModel: {
      "123": {
        id: "123",
        field1: 1,
      },
    },
  },
};

const v2Data = {
  schemaVersion: 2,
  data: {
    DummyModel: {
      "123": {
        id: "123",
        field1: 1,
        field2: 1,
      },
    },
  },
};

const v3Data = {
  schemaVersion: 3,
  data: {
    DummyModel: {
      "123": {
        id: "123",
        field1: 1,
        field2: 1,
        field3: 1,
      },
    },
  },
};

test("Multiple migrations flow", () => {
  const migrations = new Migrations([
    new Migration({
      toVersion: 1,
      run: (data) => {
        data["DummyModel"] = mapValues(data["DummyModel"], (obj) => ({
          ...obj,
          field1: 1,
        }));
        return data;
      },
    }),
    new Migration({
      toVersion: 2,
      run: (data) => {
        data["DummyModel"] = mapValues(data["DummyModel"], (obj) => ({
          ...obj,
          field2: 1,
        }));
        return data;
      },
    }),
  ]);
  expect(migrations.run(v0Data)).toEqual(v2Data);
  expect(migrations.run(v1Data)).toEqual(v2Data);
  expect(migrations.run(v2Data)).toEqual(v2Data);
  expect(migrations.run(v3Data)).toEqual(v3Data);
});
