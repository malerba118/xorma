import Image from "next/image";
import { Button } from "@/components/ui/button";
import wallpaper from "@/public/wallpaper.png";
import { DataType, Model, Store } from "xorm";

interface Node {
  id: string;
  type: "file" | "folder";
  parent_id: string | null;
  name: string;
}

interface FileNode extends Node {
  type: "file";
}

interface FolderNode extends Node {
  type: "folder";
}

// interface AppWindow {
//   app_id: string;
// }

interface OperatingSystem {
  nodes: Node[];
  // windows: AppWindow[];
}

class OperatingSystemModel extends Model.withType(DataType<OperatingSystem>()) {
  constructor(data: OperatingSystem) {
    super(data);
    this.id = "operating-system";
    this.loadJSON(data);
  }

  get nodes() {
    return NodeModel.getAll();
  }

  get apps() {
    return NodeModel.getAll();
  }

  toJSON(): OperatingSystem {
    return {
      nodes: this.nodes.map((node) => node.toJSON()),
    };
  }

  loadJSON(data: OperatingSystem) {
    data.nodes.forEach((node) => {
      if (node.type === "file") {
        FileNodeModel.create(node as FileNode);
      } else if (node.type === "folder") {
        FolderNodeModel.create(node as FolderNode);
      }
    });
  }
}

class NodeModel extends Model.withType({} as Node) {
  type: "file" | "folder";
  name: string;
  parent_id: string | null;
  constructor(data: Node) {
    super(data);
    this.type = data.type;
    this.name = data.name;
    this.parent_id = data.parent_id;
  }

  toJSON(): Node {
    return {
      ...super.toJSON(),
      id: this.id,
      type: this.type,
      parent_id: this.parent_id,
      name: this.name,
    };
  }
}

class FileNodeModel extends NodeModel.withType({} as FileNode) {
  type: "file";

  constructor(data: FileNode) {
    super(data);
    this.type = data.type;
  }
}

class FolderNodeModel extends NodeModel.withType({} as FolderNode) {
  type: "folder";

  constructor(data: FolderNode) {
    super(data);
    this.type = data.type;
  }
}

const store = new Store({
  schemaVersion: 0,
  models: { OperatingSystemModel, NodeModel, FileNodeModel, FolderNodeModel },
});

export default function Home() {
  return (
    <div>
      <Image src={wallpaper} className="fixed w-full h-full" alt="Wallpaper" />
      <Button>foo</Button>
    </div>
  );
}
