import { action, makeObservable, observable } from "mobx";

export class PromiseManager<T extends (...args: any[]) => Promise<any>> {
  status: "idle" | "pending" | "fulfilled" | "rejected" = "idle";
  executionCount = 0;
  asyncFunction: T;

  constructor(asyncFunction: T) {
    makeObservable(this, {
      status: observable.ref,
      setStatus: action,
    });
    this.asyncFunction = asyncFunction;
  }

  setStatus(status: "idle" | "pending" | "fulfilled" | "rejected") {
    this.status = status;
  }

  get isPending() {
    return this.status === "pending";
  }

  get isFulfilled() {
    return this.status === "fulfilled";
  }

  get isRejected() {
    return this.status === "rejected";
  }

  execute = async (...args: Parameters<T>): Promise<Awaited<ReturnType<T>>> => {
    const currentExecutionCount = this.executionCount + 1;
    this.executionCount = currentExecutionCount;
    this.setStatus("pending");

    try {
      const result = await this.asyncFunction(...args);

      // Check if this is the latest call
      if (this.executionCount === currentExecutionCount) {
        this.setStatus("fulfilled");
        return result;
      } else {
        throw new Error("A newer call has been made");
      }
    } catch (error) {
      this.setStatus("rejected");
      throw error;
    }
  };
}
