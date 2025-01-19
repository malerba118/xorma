"use client";

import { createContext, memo, Suspense, useContext, useState } from "react";
// import Models from "./models.mdx";
import Link from "next/link";
import { motion } from "framer-motion";
import { sections } from "./sections";

const MotionLink = motion(Link);

export const DocsContext = createContext<any>(null);

import { HTMLMotionProps } from "framer-motion";
import { LineMask } from "../../components/frostin-ui/components/line-mask";

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
      <div className="relative py-24 px-4 max-w-3xl mx-auto">
        <div className="sticky top-24 w-full h-0">
          <div className="absolute -left-12 top-6 -translate-x-full stack gap-1.5 font-medium">
            <h3 className="font-heading font-semibold text-3xl">xorma</h3>
            <div className="relative -ml-3">
              <LineMask
                className="absolute h-auto -top-0.5 -bottom-0.5 left-[-1px] bg-border w-[1px]"
                positions={[0, 0.2, 0.8, 1]}
                opacities={[0, 1, 1, 0]}
                direction="to-bottom"
              />
              {sections.map((section) => (
                <MotionLink
                  key={section.id}
                  href={`/docs#${section.id}`}
                  shallow
                  className="relative h-7 flex items-center pl-3"
                >
                  {activeSectionId === section.id && (
                    <LineMask
                      layoutId="main-light"
                      layout
                      className="absolute left-[-1px] -top-0.5 -bottom-0.5 h-auto w-[1px] bg-white"
                      direction="to-bottom"
                    />
                  )}
                  {activeSectionId === section.id && (
                    <motion.div
                      layoutId="ambient-light"
                      layout
                      className="absolute left-[-3px] -top-3 -bottom-3 h-auto w-[6px] blur-[12px] z-10"
                      style={{
                        background: `radial-gradient(closest-side ellipse at center, white 0, transparent 100%)`,
                      }}
                    />
                  )}
                  <motion.span
                    animate={{
                      opacity: activeSectionId === section.id ? 0.9 : 0.5,
                    }}
                  >
                    {section.label}
                  </motion.span>
                </MotionLink>
              ))}
            </div>
          </div>
        </div>
        {children}
      </div>
    </DocsContext.Provider>
  );
};

export default Docs;
