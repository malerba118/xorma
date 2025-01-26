import IntroMdx from "./intro.mdx";
import GettingStartedMdx from "./getting-started.mdx";
import StoreMdx from "./store.mdx";
import RelationshipsMdx from "./relationships.mdx";
import InheritanceMdx from "./inheritance.mdx";
import ReactivityMdx from "./reactivity.mdx";
import ExamplesMdx from "./examples.mdx";
import PersistenceMdx from "./persistence.mdx";

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
    id: "reactivity",
    label: "Reactivity",
    Markdown: ReactivityMdx,
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
  {
    id: "inheritance",
    label: "Inheritance",
    Markdown: InheritanceMdx,
  },
  {
    id: "persistence",
    label: "Persistence",
    Markdown: PersistenceMdx,
  },
  {
    id: "examples",
    label: "Examples",
    Markdown: ExamplesMdx,
  },
];
