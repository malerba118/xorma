import EventEmitter from "eventemitter3";

interface ChangeEvent<Item> {
  action: "undo" | "redo" | "push";
  item: Item | undefined;
  index: number;
}

export class HistoryManager<Item = any> {
  stack: Item[];
  activeIndex: number;
  limit: number;
  events: EventEmitter;

  constructor(defaultItems: Item[] = [], limit = 50) {
    this.stack = defaultItems;
    this.activeIndex = defaultItems.length - 1;
    this.limit = limit;
    this.events = new EventEmitter();
  }

  get activeItem(): Item | undefined {
    return this.stack[this.activeIndex];
  }

  push(item: Item) {
    if (JSON.stringify(item) === JSON.stringify(this.activeItem)) {
      return;
    }
    if (this.stack.length === this.limit) {
      this.stack.shift(); // remove first item
      this.stack.push(item); // add new item
    } else {
      this.activeIndex += 1;
      this.stack.splice(this.activeIndex, this.stack.length);
      this.stack[this.activeIndex] = item;
      this.notifyListeners("push");
    }
  }

  replace(item: Item) {
    if (JSON.stringify(item) === JSON.stringify(this.activeItem)) {
      return;
    }
    this.stack.splice(this.activeIndex, this.stack.length);
    this.stack[this.activeIndex] = item;
    this.notifyListeners("replace");
  }

  undo() {
    this.activeIndex = Math.max(this.activeIndex - 1, 0);
    this.notifyListeners("undo");
  }

  redo() {
    this.activeIndex = Math.min(this.activeIndex + 1, this.stack.length - 1);
    this.notifyListeners("redo");
  }

  notifyListeners(action: string) {
    this.events.emit("change", {
      action,
      item: this.activeItem,
      index: this.activeIndex,
    });
  }

  onChange(listener: (event: ChangeEvent<Item>) => void) {
    this.events.on("change", listener);
    return () => {
      this.events.off("change", listener);
    };
  }
}
