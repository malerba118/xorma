import { DataType, Model, Store } from "xorm";
import { makeObservable, observable, computed, action } from "mobx";

type User = {
  id: string;
  name: string;
};

type Project = {
  id: string;
  name: string;
};

type Task = {
  id: string;
  title: string;
  project_id: string;
  creator_id: string;
  assignee_id: string | null;
  created_at: number;
};

class BaseModel extends Model.withType(DataType<{ id: string }>()) {
  static idSelector(data: { id: string }) {
    return data.id;
  }
}

export class UserModel extends BaseModel.withType(DataType<User>()) {
  name: string;

  constructor(data: User) {
    super(data);
    this.loadJSON(data);
    makeObservable(this, {
      name: observable,
      createdTasks: computed,
      assignedTasks: computed,
    });
  }

  get createdTasks(): TaskModel[] {
    return TaskModel.getAll().filter((task) => task.creatorId === this.id);
  }

  get assignedTasks(): TaskModel[] {
    return TaskModel.getAll().filter((task) => task.assigneeId === this.id);
  }

  toJSON(): User {
    return {
      id: this.id,
      name: this.name,
    };
  }

  loadJSON(data: User) {
    this.name = data.name;
  }
}

class TaskCreationFormManager {
  open: boolean;
  task: string;
  assigneeId: string | null;

  constructor() {
    makeObservable(this, {
      open: observable.ref,
      task: observable.ref,
      assigneeId: observable.ref,
      setOpen: action,
      setTask: action,
      setAssigneeId: action,
    });
  }

  setOpen(open: boolean) {
    this.open = open;
  }

  setTask(task: string) {
    this.task = task;
  }

  setAssigneeId(assigneeId: string | null) {
    this.assigneeId = assigneeId;
  }
}

export class ProjectModel extends BaseModel.withType(DataType<Project>()) {
  name: string;
  forms = {
    taskCreation: new TaskCreationFormManager(),
  };

  constructor(data: Project) {
    super(data);
    this.loadJSON(data);
    makeObservable(this, {
      name: observable,
      tasks: computed,
    });
  }

  get tasks(): TaskModel[] {
    return TaskModel.getAll().filter((task) => task.projectId === this.id);
  }

  toJSON(): Project {
    return {
      id: this.id,
      name: this.name,
    };
  }

  loadJSON(data: Project) {
    this.name = data.name;
  }
}

export class TaskModel extends BaseModel.withType(DataType<Task>()) {
  title: string;
  projectId: string;
  creatorId: string;
  assigneeId: string | null;
  createdAt: number;

  constructor(data: Task) {
    super(data);
    this.loadJSON(data);
    makeObservable(this, {
      title: observable,
      assigneeId: observable,
      creator: computed,
      assignee: computed,
    });
  }

  get creator(): UserModel {
    return UserModel.getById(this.creatorId)!;
  }

  get assignee(): UserModel | null {
    return this.assigneeId ? UserModel.getById(this.assigneeId)! : null;
  }

  toJSON(): Task {
    return {
      id: this.id,
      title: this.title,
      project_id: this.projectId,
      creator_id: this.creatorId,
      assignee_id: this.assigneeId,
      created_at: this.createdAt,
    };
  }

  loadJSON(data: Task) {
    this.title = data.title;
    this.projectId = data.project_id;
    this.creatorId = data.creator_id;
    this.assigneeId = data.assignee_id;
    this.createdAt = data.created_at;
  }
}

export const store = new Store({
  schemaVersion: 0,
  models: {
    BaseModel,
    UserModel,
    TaskModel,
  },
});
