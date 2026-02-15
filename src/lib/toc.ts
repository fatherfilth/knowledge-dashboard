import { unified } from "unified";
import remarkParse from "remark-parse";
import { visit } from "unist-util-visit";

export interface TocHeading {
  depth: number;
  text: string;
  slug: string;
}

/**
 * Extract h2 and h3 headings from markdown content for table of contents
 */
export function extractToc(markdown: string): TocHeading[] {
  const headings: TocHeading[] = [];

  const tree = unified().use(remarkParse).parse(markdown);

  visit(tree, "heading", (node: any) => {
    if (node.depth >= 2 && node.depth <= 3) {
      // Extract text from all child text/inlineCode nodes
      const text = node.children
        .map((child: any) => {
          if (child.type === "text") return child.value;
          if (child.type === "inlineCode") return child.value;
          return "";
        })
        .join("");

      // Generate slug (must match rehype-slug output)
      const slug = text
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");

      if (text && slug) {
        headings.push({ depth: node.depth, text, slug });
      }
    }
  });

  return headings;
}
