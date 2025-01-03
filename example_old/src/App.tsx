import { useState } from "react";
import { DataType, Model, Store } from "xorm";
import { Button } from "@/components/ui/button";

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

interface OperatingSystem {
  nodes: Node[];
  windows: AppWindow[];
}

Model.create({});

class NodeModel extends Model.withType(DataType<{ blah: string }>()) {}
class FileNodeModel extends NodeModel.withType(DataType<{ blah: string }>()) {}

FileNodeModel;

function App() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <Button>foo</Button>
    </div>
  );
}

export default App;
