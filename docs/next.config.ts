import type { NextConfig } from "next";
import createMDX from "@next/mdx";

const nextConfig: NextConfig = {
  pageExtensions: ["js", "jsx", "md", "mdx", "ts", "tsx"],
  async redirects() {
    return [
      {
        source: "/",
        destination: "/docs",
        permanent: false,
      },
    ];
  },
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // !! WARN !!
    ignoreBuildErrors: true,
  },
};

/** @type {import('next').NextConfig} */
const withMDX = createMDX({
  // Add markdown plugins here, as desired
  options: {
    rehypePlugins: [
      [
        // @ts-ignore
        "rehype-mdx-code-props",
        {
          tagName: "code",
        },
      ],
    ],
  },
});

// Merge MDX config with Next.js config
export default withMDX(nextConfig);
