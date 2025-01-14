import { DocsSection } from "./layout";
import { sections } from "./sections";

export const DocsPage = () => {
  return (
    <div>
      {sections.map((section) => (
        <DocsSection key={section.id} id={section.id}>
          <section.Markdown />
        </DocsSection>
      ))}
    </div>
  );
};

export default DocsPage;
