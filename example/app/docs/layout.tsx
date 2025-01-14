"use client";

import { createContext, memo, Suspense, useContext, useState } from "react";
// import Models from "./models.mdx";
import Link from "next/link";
import { motion } from "framer-motion";
import { sections } from "./sections";

const MotionLink = motion(Link);

export const DocsContext = createContext<any>(null);

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

export const Docs = ({ children }: any) => {
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);

  return (
    <DocsContext.Provider value={{ activeSectionId, setActiveSectionId }}>
      <div className="py-24 px-4 max-w-3xl mx-auto">
        <div className="sticky top-24 w-full h-0">
          <div className="absolute -left-12 top-6 -translate-x-full stack gap-1.5 font-medium">
            <h3 className="font-heading font-semibold text-3xl">xorm</h3>
            {sections.map((section) => (
              <MotionLink
                key={section.id}
                href={`/docs#${section.id}`}
                animate={{ opacity: activeSectionId === section.id ? 1 : 0.5 }}
                shallow
              >
                {section.label}
              </MotionLink>
            ))}
          </div>
        </div>
        {children}
      </div>
    </DocsContext.Provider>
  );
};

export default Docs;
