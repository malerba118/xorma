"use client";

import { observer } from "mobx-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { DataType, Model, Store } from "xorm";
import { makeObservable, observable, computed, action } from "mobx";
import { Input } from "@/components/ui/input";

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

class UserModel extends BaseModel.withType(DataType<User>()) {
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

const store = new Store({
  schemaVersion: 0,
  models: {
    BaseModel,
    UserModel,
    TaskModel,
  },
});

// Initialize some sample data
const initializeProject = () => {
  const user1 = UserModel.create({
    id: "user1",
    name: "John Doe",
  });

  const user2 = UserModel.create({
    id: "user2",
    name: "Jane Smith",
  });

  const project = ProjectModel.create({
    id: "project1",
    name: "My project",
  });

  TaskModel.create({
    id: "task1",
    title: "Complete Project Proposal",
    project_id: project.id,
    creator_id: user1.id,
    assignee_id: user2.id,
    created_at: Date.now(),
  });

  TaskModel.create({
    id: "task2",
    title: "Review Code",
    project_id: project.id,
    creator_id: user2.id,
    assignee_id: user1.id,
    created_at: Date.now(),
  });

  return project;
};

const project = initializeProject();

const Tasks = observer(() => {
  return (
    <div className="max-w-4xl mx-auto py-24">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          TaskModel.create({
            id: Math.random().toString(36).slice(2),
            title: "foo",
            project_id: project.id,
            creator_id: "user1",
            assignee_id: null,
            created_at: Date.now(),
          });
        }}
        className="flex justify-between items-center mb-8"
      >
        <Input placeholder="Task..." />
        <Button>Create</Button>
      </form>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Task</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-48 text-right px-5">Assignee</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {project.tasks.map((task) => (
            <TableRow className="hover:!bg-transparent">
              <TableCell className="font-medium">{task.title}</TableCell>
              <TableCell>{null}</TableCell>
              <TableCell className="flex justify-end">
                {task.assignee?.name}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
});

export default function App() {
  return <Tasks />;
}
