import { DataType, Model, Store } from "defrost";
import { computed, makeObservable, observable } from "mobx";

export const initModels = () => {
  type User = {
    id: string;
    first_name: string;
    last_name: string;
  };

  type Project = {
    id: string;
    name: string;
  };

  type Task = {
    id: string;
    name: string;
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

  class UserModel extends BaseModel.withType(DataType<User>()) {
    firstName: string;
    lastName: string;

    constructor(data: User) {
      super(data);
      this.loadJSON(data);
      makeObservable(this, {
        firstName: observable,
        lastName: observable,
        name: computed,
        createdTasks: computed,
        assignedTasks: computed,
      });
    }

    get name(): string {
      return `${this.firstName} ${this.lastName}`;
    }

    get createdTasks(): TaskModel[] {
      return TaskModel.getAll().filter((task) => task.creatorId === this.id);
    }

    get assignedTasks(): TaskModel[] {
      return TaskModel.getAll().filter((task) => task.assigneeId === this.id);
    }

    loadJSON(data: User) {
      this.firstName = data.first_name;
      this.lastName = data.last_name;
    }

    toJSON(): User {
      return {
        id: this.id,
        first_name: this.firstName,
        last_name: this.lastName,
      };
    }
  }

  class ProjectModel extends BaseModel.withType(DataType<Project>()) {
    name: string;

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

  class TaskModel extends BaseModel.withType(DataType<Task>()) {
    name: string;
    projectId: string;
    creatorId: string;
    assigneeId: string | null;
    createdAt: number;

    constructor(data: Task) {
      super(data);
      this.loadJSON(data);
      makeObservable(this, {
        name: observable,
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
        name: this.name,
        project_id: this.projectId,
        creator_id: this.creatorId,
        assignee_id: this.assigneeId,
        created_at: this.createdAt,
      };
    }

    loadJSON(data: Task) {
      this.name = data.name;
      this.projectId = data.project_id;
      this.creatorId = data.creator_id;
      this.assigneeId = data.assignee_id;
      this.createdAt = data.created_at;
    }
  }

  const store = new Store({
    schemaVersion: 0,
    models: {
      BaseModel,
      ProjectModel,
      UserModel,
      TaskModel,
    },
  });

  return {
    store,
    BaseModel,
    ProjectModel,
    UserModel,
    TaskModel,
  };
};
