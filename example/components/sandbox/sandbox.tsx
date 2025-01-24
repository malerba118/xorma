"use client";
import React, { useState } from "react";
import { importCode, useRunner, Scope } from "react-runner";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "../ui/resizable";
import Editor from "@monaco-editor/react";
import * as react from "react";
import * as mobx from "mobx";
import * as mobxReact from "mobx-react";
import * as framerMotion from "framer-motion";
import * as tailwindColors from "tailwindcss/colors";
import * as xorma from "xorma";
import * as table from "@/components/ui/table";
import * as button from "@/components/ui/button";
import * as input from "@/components/ui/input";
import * as toaster from "@/components/ui/sonner";
import * as sonner from "sonner";
import * as demoUtils from "@/app/docs/demo-utils";
import * as nanoid from "nanoid";
import * as useInterval from "@chakra-ui/react-use-interval";

import { SandboxEditor } from "./editor";
import { cn } from "@/lib/utils";

const baseScope = {
  /* base globals */
};

const DEFAULT_SCOPE: Scope = {
  ...baseScope,
  // scope used by import statement
  import: {
    react,
    "framer-motion": framerMotion,
    mobx,
    "mobx-react": mobxReact,
    xorma,
    nanoid,
    sonner,
    "@/components/ui/table": table,
    "@/components/ui/button": button,
    "@/components/ui/input": input,
    "@/components/ui/sonner": toaster,
    "./demo-utils": demoUtils,
    "./use-interval": useInterval,
  },
};

interface SandboxProps {
  scope?: Scope;
  defaultCode?: string;
  code?: string;
  onCodeChange?: (val: string) => void;
  className?: string;
}

export const Sandbox = ({
  scope = DEFAULT_SCOPE,
  defaultCode = "",
  code,
  onCodeChange,
  className,
}: SandboxProps) => {
  const [internalCode, setInternalCode] = useState(defaultCode);
  code = code ?? internalCode;
  const { element, error } = useRunner({ code, scope });

  return (
    <ResizablePanelGroup
      direction="vertical"
      className={cn("min-h-[300px] h-full w-full rounded-xl border", className)}
    >
      <ResizablePanel defaultSize={50} minSize={20}>
        <SandboxEditor
          value={code}
          onChange={(val) => {
            setInternalCode(val || "");
            onCodeChange?.(val || "");
          }}
        />
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel className="relative" defaultSize={50} minSize={20}>
        <div className="absolute inset-0 overflow-auto">{element}</div>
        {error && (
          <div className="absolute inset-0 bg-black/80 text-white backdrop-blur-sm">
            {error}
          </div>
        )}
      </ResizablePanel>
    </ResizablePanelGroup>
  );
};
