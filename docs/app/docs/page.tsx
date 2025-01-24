import { DocsSection } from "./docs-context";
import { sections } from "./sections";

const DocsPage = () => {
  return (
    <div>
      {sections.map((section) => (
        <DocsSection key={section.id} id={section.id} className="mb-16">
          <section.Markdown />
        </DocsSection>
      ))}
    </div>
  );
};

export default DocsPage;
