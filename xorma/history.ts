import { action, computed, makeObservable, observable } from "mobx";

export class HistoryManager<Item = any> {
  items: Item[];
  activeIndex: number;
  limit: number;

  constructor(defaultItems: Item[] = [], limit = 50) {
    this.items = defaultItems;
    this.activeIndex = defaultItems.length - 1;
    this.limit = limit;
    makeObservable(this, {
      items: observable.shallow,
      activeIndex: observable.ref,
      activeItem: computed,
      push: action,
      replace: action,
      undo: action,
      redo: action,
      clear: action,
    });
  }

  get activeItem(): Item | undefined {
    return this.items[this.activeIndex];
  }

  push(item: Item) {
    if (JSON.stringify(item) === JSON.stringify(this.activeItem)) {
      return;
    }
    if (this.items.length === this.limit) {
      this.items.shift(); // remove first item
      this.items.push(item); // add new item
    } else {
      this.activeIndex += 1;
      this.items.splice(this.activeIndex, this.items.length);
      this.items[this.activeIndex] = item;
    }
  }

  replace(item: Item) {
    if (JSON.stringify(item) === JSON.stringify(this.activeItem)) {
      return;
    }
    this.items.splice(this.activeIndex, this.items.length);
    this.items[this.activeIndex] = item;
  }

  undo() {
    this.activeIndex = Math.max(this.activeIndex - 1, 0);
  }

  redo() {
    this.activeIndex = Math.min(this.activeIndex + 1, this.items.length - 1);
  }

  clear() {
    // @ts-ignore
    this.items.clear();
    this.activeIndex = 0;
  }
}
