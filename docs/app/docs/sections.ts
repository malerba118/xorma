import OverviewMdx from "./overview.mdx";
import GettingStartedMdx from "./getting-started.mdx";
import StoreMdx from "./store.mdx";
import RelationshipsMdx from "./relationships.mdx";
import InheritanceMdx from "./inheritance.mdx";
import ReactivityMdx from "./reactivity.mdx";
import ExamplesMdx from "./examples.mdx";
import PersistenceMdx from "./persistence.mdx";
import ApiReferenceMdx from "./api-reference.mdx";

export const sections = [
  {
    id: "overview",
    label: "Overview",
    Markdown: OverviewMdx,
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
    id: "api-reference",
    label: "Reference",
    Markdown: ApiReferenceMdx,
  },
  {
    id: "examples",
    label: "Examples",
    Markdown: ExamplesMdx,
  },
];
