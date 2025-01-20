import IntroMdx from "./intro.mdx";
import GettingStartedMdx from "./getting-started.mdx";
import StoreMdx from "./store.mdx";
import RelationshipsMdx from "./relationships.mdx";

export const sections = [
  {
    id: "intro",
    label: "Intro",
    Markdown: IntroMdx,
  },
  {
    id: "getting-started",
    label: "Getting Started",
    Markdown: GettingStartedMdx,
  },
  {
    id: "store",
    label: "Store",
    Markdown: StoreMdx,
  },
  {
    id: "relationships",
    label: "Relationships",
    Markdown: RelationshipsMdx,
  },
];
