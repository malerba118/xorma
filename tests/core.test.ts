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

test("should create a model instance and trigger appropriate reactions", () => {
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

test("should ensure model instances with same ID are singleton", () => {
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

test("should delete model instance and trigger appropriate reactions", () => {
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
  expect(counter.isDeleted).toBe(true);
  expect(counter.isDetached).toBe(true);
});

test("should handle basic undo/redo operations in store history", () => {
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

test("should revert changes made in sandbox by default", () => {
  const store = new Store({ models: { CounterModel } });

  const getAllReaction = vi.fn();
  reaction(() => CounterModel.getAll(), getAllReaction, {
    fireImmediately: false,
  });

  store.sandbox(() => {
    CounterModel.create({ id: "123", count: 1 });
    CounterModel.create({ id: "456", count: 2 });
  });

  expect(CounterModel.getById("123")).toBeUndefined();
  expect(CounterModel.getAll().length).toBe(0);
});

test("should persist changes when sandbox changes are committed", () => {
  const store = new Store({ models: { CounterModel } });

  const getAllReaction = vi.fn();
  reaction(() => CounterModel.getAll(), getAllReaction, {
    fireImmediately: false,
  });

  store.sandbox(({ commit }) => {
    CounterModel.create({ id: "123", count: 1 });
    CounterModel.create({ id: "456", count: 2 });
    commit();
  });

  expect(CounterModel.getAll().length).toBe(2);
  expect(getAllReaction).toHaveBeenCalledTimes(1);
});

test("should handle complex undo/redo operations with multiple state changes", () => {
  const store = new Store({ models: { CounterModel } });

  // Initial state
  store.history.commit();

  // State 1: Add counter1
  const counter1 = CounterModel.create({ id: "123", count: 1 });
  store.history.commit();

  // State 2: Modify counter1
  counter1.count = 5;
  store.history.commit();

  // State 3: Add counter2
  const counter2 = CounterModel.create({ id: "456", count: 2 });
  store.history.commit();

  // Test complex undo/redo sequence
  expect(CounterModel.getAll().length).toBe(2);
  expect(counter1.count).toBe(5);

  store.history.undo(); // Remove counter2
  expect(CounterModel.getAll().length).toBe(1);

  store.history.undo(); // Revert counter1 count to 1
  expect(counter1.count).toBe(1);

  store.history.redo(); // Restore counter1 count to 5
  expect(counter1.count).toBe(5);

  store.history.redo(); // Restore counter2
  expect(CounterModel.getAll().length).toBe(2);
});

test("should not trigger collection reactions when modifying model properties", () => {
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
  expect(getAllReaction).toHaveBeenCalledTimes(1);
  expect(getByIdReaction).toHaveBeenCalledTimes(1);

  counter.count = 5; // Modify existing counter
  expect(getAllReaction).toHaveBeenCalledTimes(1); // Shouldn't trigger getAll
  expect(getByIdReaction).toHaveBeenCalledTimes(1); // Shouldn't trigger getById
});
