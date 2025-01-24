"use client";

import { createContext, memo, Suspense, useContext, useState } from "react";
import { motion } from "framer-motion";

const DocsContext = createContext<any>(null);

import { HTMLMotionProps } from "framer-motion";

interface DocsSectionProps extends HTMLMotionProps<"div"> {
  id: string;
}

export const DocsSection = ({ id, ...otherProps }: DocsSectionProps) => {
  const docs = useContext(DocsContext);
  return (
    <motion.div
      id={id}
      onViewportEnter={() => docs.setActiveSectionId(id)}
      viewport={{ margin: "-50% 0px -50% 0px" }}
      {...otherProps}
    />
  );
};

export const useDocs = () => {
  return useContext(DocsContext);
};

export const DocsProvider = ({ children }: any) => {
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);

  return (
    <DocsContext.Provider value={{ activeSectionId, setActiveSectionId }}>
      {children}
    </DocsContext.Provider>
  );
};
