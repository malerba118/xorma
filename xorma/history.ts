import {
  action,
  computed,
  makeObservable,
  observable,
  type IObservableArray,
} from "mobx";

function equals<T>(a: T, b: T | undefined): boolean {
  if (a === b) return true;
  if (a === undefined || b === undefined) return false;
  return JSON.stringify(a) === JSON.stringify(b);
}

export class HistoryManager<Item = any> {
  /** The timeline itself (observable, shallow). */
  readonly items: IObservableArray<Item>;
  /** Index of the active entry; ‑1 means “no entry yet”. */
  activeIndex: number;
  /** Maximum number of snapshots to keep. */
  readonly limit: number;

  constructor(defaultItems: Item[] = [], limit = 50) {
    this.items = observable.array(defaultItems, { deep: false });
    this.activeIndex = this.items.length ? this.items.length - 1 : -1;
    this.limit = limit;

    makeObservable(this, {
      items: observable.shallow,
      activeIndex: observable,
      activeItem: computed,
      push: action,
      replace: action,
      undo: action,
      redo: action,
      clear: action,
    });
  }

  /** The currently selected snapshot (or `undefined` if none). */
  get activeItem(): Item | undefined {
    return this.items[this.activeIndex];
  }

  /** Append a new snapshot and make it the active one. */
  push(item: Item) {
    if (equals(item, this.activeItem)) return;

    /* 1 — discard the redo stack (everything AFTER the caret) */
    if (this.activeIndex < this.items.length - 1) {
      this.items.splice(this.activeIndex + 1);
    }

    /* 2 — enforce the size limit */
    if (this.items.length === this.limit) {
      this.items.shift();
      this.activeIndex = Math.max(this.activeIndex - 1, 0);
    }

    /* 3 — add the new state */
    this.items.push(item);
    this.activeIndex = this.items.length - 1;
  }

  /** Replace the current snapshot (keeps history length unchanged). */
  replace(item: Item) {
    if (equals(item, this.activeItem)) return;

    /* Remove any redo entries, then overwrite the current one */
    if (this.activeIndex < this.items.length - 1) {
      this.items.splice(this.activeIndex + 1);
    }
    this.items[this.activeIndex] = item;
  }

  /** Step one entry back, if possible. */
  undo() {
    if (this.activeIndex > 0) this.activeIndex--;
  }

  /** Step one entry forward, if possible. */
  redo() {
    if (this.activeIndex < this.items.length - 1) this.activeIndex++;
  }

  /** Wipe the entire timeline and reset the caret. */
  clear() {
    this.items.clear(); // `IObservableArray` helper
    this.activeIndex = -1;
  }
}
