import { expect, test } from "vitest";
import { Model, Store, DataType } from "xorma";
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

test("Create an instance", () => {
  const store = new Store({ models: { CounterModel } });

  const getAllReaction = vi.fn();
  const getByIdReaction = vi.fn();

  reaction(() => CounterModel.getAll(), getAllReaction, {
    fireImmediately: false,
  });

  reaction(() => CounterModel.getById("123"), getByIdReaction, {
    fireImmediately: false,
  });

  const counter = CounterModel.create({ id: "123", count: 1 });

  expect(counter.toJSON()).toEqual({ id: "123", count: 1 });
  expect(getAllReaction).toHaveBeenCalledTimes(1);
  expect(getByIdReaction).toHaveBeenCalledTimes(1);
  expect(CounterModel.getAll().length).toEqual(1);
  expect(CounterModel.getById("123") === counter).toBeTruthy();
});

test("Instances should be singleton", () => {
  const store = new Store({ models: { CounterModel } });

  const getAllReaction = vi.fn();
  const getByIdReaction = vi.fn();

  reaction(() => CounterModel.getAll(), getAllReaction, {
    fireImmediately: false,
  });

  reaction(() => CounterModel.getById("123"), getByIdReaction, {
    fireImmediately: false,
  });

  const counter1 = CounterModel.create({ id: "123", count: 0 });
  const counter2 = CounterModel.create({ id: "123", count: 10 });
  const counter3 = CounterModel.create({ id: "456", count: 20 });

  expect(counter1 === counter2).toBeTruthy();
  expect(counter1 === counter3).toBeFalsy();
  expect(counter1.count).toBe(10);
  expect(counter3.count).toBe(20);
  expect(CounterModel.getAll().length).toBe(2);
});

test("Delete an instance", () => {
  const store = new Store({ models: { CounterModel } });

  const getAllReaction = vi.fn();
  const getByIdReaction = vi.fn();

  reaction(() => CounterModel.getAll(), getAllReaction, {
    fireImmediately: false,
  });

  reaction(() => CounterModel.getById("123"), getByIdReaction, {
    fireImmediately: false,
  });

  const counter = CounterModel.create({ id: "123", count: 1 });
  counter.delete();

  expect(counter.toJSON()).toEqual({ id: "123", count: 1 });
  expect(getAllReaction).toHaveBeenCalledTimes(2);
  expect(getByIdReaction).toHaveBeenCalledTimes(2);
  expect(CounterModel.getAll().length).toEqual(0);
  expect(CounterModel.getById("123")).toBeUndefined();
});

test("Store history", () => {
  const store = new Store({ models: { CounterModel } });

  const getAllReaction = vi.fn();
  const getByIdReaction = vi.fn();

  reaction(() => CounterModel.getAll(), getAllReaction, {
    fireImmediately: false,
  });

  reaction(() => CounterModel.getById("123"), getByIdReaction, {
    fireImmediately: false,
  });

  const snap1 = store.toJSON();
  store.history.commit();
  const counter1 = CounterModel.create({ id: "123", count: 1 });
  const snap2 = store.toJSON();
  store.history.commit();
  const counter2 = CounterModel.create({ id: "456", count: 1 });
  const snap3 = store.toJSON();
  store.history.commit();

  expect(snap3).toEqual(store.toJSON());
  store.history.undo();
  expect(snap2).toEqual(store.toJSON());
  store.history.undo();
  expect(snap1).toEqual(store.toJSON());
  store.history.undo(); // stack is empty so nothing changes
  expect(snap1).toEqual(store.toJSON());
  store.history.redo();
  expect(snap2).toEqual(store.toJSON());
});
