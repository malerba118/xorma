import type { MDXComponents } from "mdx/types";
import ServerCodeBlock from "./components/code-block.server";
import { Sandbox } from "./components/sandbox/sandbox";

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    ...components,
    h1: (props: any) => (
      <h1
        className="mt-6 mb-6 text-6xl font-semibold font-heading"
        {...props}
      />
    ),
    h2: (props: any) => (
      <h2
        className="mt-6 mb-4 text-5xl font-semibold font-heading"
        {...props}
      />
    ),
    h3: (props: any) => (
      <h3
        className="mt-6 mb-4 text-4xl font-semibold font-heading"
        {...props}
      />
    ),
    h4: (props: any) => (
      <h3
        className="mt-6 mb-4 text-3xl font-semibold font-heading"
        {...props}
      />
    ),
    h5: (props: any) => (
      <h3
        className="mt-6 mb-4 text-2xl font-semibold font-heading"
        {...props}
      />
    ),
    h6: (props: any) => (
      <h3 className="mt-6 mb-4 text-xl font-semibold font-heading" {...props} />
    ),
    p: (props: any) => (
      <p className="mb-5 leading-7 font-normal text-white/60" {...props} />
    ),
    a: (props: any) => <a className="underline" target="_blank" {...props} />,
    // code: (props) => {
    //   console.log(props);
    //   return <p>hello</p>;
    // },
    code: ({ className, children, live, ...otherProps }: any) => {
      const language = /language-(\w+)/.exec(className || "")?.[1];
      if (!language) {
        return (
          <span
            className="inline-block text-[rgb(187,161,200)] text-[14.5px] bg-white/10 rounded-md px-[6px] mx-1 py-[0px] leading-7"
            style={{ fontFamily: "monospace" }}
          >
            {children}
          </span>
        );
      } else if (language === "tsx" && live) {
        return (
          <div className="relative my-6 w-full h-[580px]">
            <Sandbox
              className="w-full max-w-full h-full"
              defaultCode={children}
            />
          </div>
        );
      } else {
        return (
          <ServerCodeBlock
            className="my-6"
            language={language || "text"}
            value={children?.trim()}
          />
        );
      }
    },
    Sandbox,
  };
}
