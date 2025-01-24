"use client";

import { observer } from "mobx-react-lite";
import { UserModel, TaskModel, store, ProjectModel } from "./models";
import { useEffect, useState } from "react";
import { cn } from "@/utils/css";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { Button } from "../../components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../components/ui/dialog";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";

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

const NULL_TOKEN = "__null__";

const AssigneeSelector = observer(
  ({
    value,
    onValueChange,
    className,
  }: {
    value: string | null;
    onValueChange: (value: string | null) => void;
    className?: string;
  }) => {
    return (
      <Select
        value={value || NULL_TOKEN}
        onValueChange={(val) => onValueChange(val === NULL_TOKEN ? null : val)}
      >
        <SelectTrigger className={className} asChild>
          <Button variant="secondary">
            <SelectValue />
          </Button>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={NULL_TOKEN}>None</SelectItem>
          {UserModel.getAll().map((user) => (
            <SelectItem key={user.id} value={user.id}>
              {user.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  }
);

const TodoApp = observer(() => {
  const handleCreateTask = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    TaskModel.create({
      id: Math.random().toString(36).slice(2),
      title: project.forms.taskCreation.task,
      project_id: project.id,
      creator_id: "user1",
      assignee_id: project.forms.taskCreation.assigneeId,
      created_at: Date.now(),
    });
    project.forms.taskCreation.setOpen(false);
  };

  return (
    <div className="max-w-4xl mx-auto py-24">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Tasks</h1>
        <Dialog
          open={project.forms.taskCreation.open}
          onOpenChange={(val) => project.forms.taskCreation.setOpen(val)}
        >
          <DialogTrigger asChild>
            <Button>Create Task</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>New Task</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateTask} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  name="title"
                  value={project.forms.taskCreation.task}
                  onChange={(e) => {
                    project.forms.taskCreation.setTask(e.target.value);
                  }}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="assignee">Assignee</Label>
                <AssigneeSelector
                  value={project.forms.taskCreation.assigneeId}
                  onValueChange={(val) =>
                    project.forms.taskCreation.setAssigneeId(val)
                  }
                />
              </div>
              <div className="flex justify-end">
                <Button type="submit">Create</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
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
                <AssigneeSelector
                  value={task.assigneeId}
                  onValueChange={(val) => (task.assigneeId = val)}
                  className="w-fit border-none"
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
});

export default TodoApp;
