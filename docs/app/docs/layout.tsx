"use client";

import { Toaster } from "@/components/ui/sonner";
// import Models from "./models.mdx";
import Link from "next/link";
import { motion } from "framer-motion";
import { sections } from "./sections";
const MotionLink = motion(Link);
import { LineMask } from "../../components/frostin-ui/components/line-mask";
import { DocsProvider, useDocs } from "./docs-context";
import { Button } from "../../components/ui/button";
import { CopyIcon } from "lucide-react";
import { useClipboard } from "@ark-ui/react/clipboard";
import { useState } from "react";
import { PromiseManager } from "xorma";
import {
  useQuery,
  useMutation,
  useQueryClient,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import axios from "axios";
// Create a client
const queryClient = new QueryClient();

const SectionLink = ({ section }: { section: any }) => {
  const { activeSectionId } = useDocs();

  return (
    <MotionLink
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
        initial={{ opacity: 0.5 }}
        whileHover={{ opacity: 0.85 }}
        animate={{
          opacity: activeSectionId === section.id ? 0.95 : 0.5,
        }}
      >
        {section.label}
      </motion.span>
    </MotionLink>
  );
};

const CopyButton = () => {
  const query = useQuery({
    queryKey: ["docs"],
    queryFn: () => axios.get("/api/docs").then((res) => res.data),
  });
  const clipboard = useClipboard({ value: query.data });

  return (
    <Button
      className="fixed top-4 right-4 pl-2.5 pr-3 rounded-lg backdrop-blur-[2px]  z-10"
      variant="outline"
      disabled={query.isLoading || query.isError}
      onClick={() => clipboard.copy()}
    >
      <CopyIcon />
      <span>{clipboard.copied ? "Docs copied!" : "Copy to LLM"}</span>
    </Button>
  );
};

const Docs = ({ children }: any) => {
  return (
    <QueryClientProvider client={queryClient}>
      <DocsProvider>
        <Toaster expand />
        <CopyButton />
        <div className="relative py-8 md:py-24 px-5 max-w-3xl mx-auto">
          <div className="sticky top-24 w-full h-0 invisible lg:visible">
            <div className="absolute -left-12 top-6 -translate-x-full stack gap-1.5 font-medium">
              <h3 className="font-heading font-semibold text-3xl">xorma</h3>
              <div className="relative -ml-3">
                <LineMask
                  className="absolute h-auto -top-0.5 -bottom-0.5 left-[-1px] bg-border w-[1px]"
                  positions={[0, 0.08, 0.92, 1]}
                  opacities={[0, 1, 1, 0]}
                  direction="to-bottom"
                />
                {sections.map((section) => (
                  <SectionLink key={section.id} section={section} />
                ))}
              </div>
            </div>
          </div>
          {children}
        </div>
      </DocsProvider>
    </QueryClientProvider>
  );
};

export default Docs;
