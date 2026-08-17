import { parseSWMarkdownBlocks } from "../src/swpackage/swcomponent/display/SWMarkdownText";

const sample = `# Heading 1
## Heading 2
### Heading 3

This is a paragraph with **bold** and *italic* text.

Here is \`inline code\` in a sentence.

\`\`\`swift
func greet() {
    print("Hello, world!")
}
\`\`\`

- First item
- Second item with **bold**
- Third item

1. Ordered item one
2. Ordered item two

---

Another paragraph after the divider.
`;

const blocks = parseSWMarkdownBlocks(sample);
const kinds = blocks.map((block) => block.kind);
const expected = [
  "heading",
  "heading",
  "heading",
  "paragraph",
  "paragraph",
  "codeBlock",
  "listItem",
  "listItem",
  "listItem",
  "listItem",
  "listItem",
  "divider",
  "paragraph",
];

function fail(message: string): never {
  console.error(message);
  console.error("kinds:", kinds);
  process.exit(1);
}

if (kinds.length !== expected.length) {
  fail(`expected ${expected.length} blocks, got ${kinds.length}`);
}

for (let i = 0; i < expected.length; i += 1) {
  if (kinds[i] !== expected[i]) {
    fail(`block ${i}: expected ${expected[i]}, got ${kinds[i]}`);
  }
}

const code = blocks.find((block) => block.kind === "codeBlock");
if (!code || code.kind !== "codeBlock" || code.language !== "swift") {
  fail("missing swift code block");
}

const ordered = blocks.filter(
  (block) => block.kind === "listItem" && block.ordered,
);
if (ordered.length !== 2) {
  fail(`expected 2 ordered items, got ${ordered.length}`);
}

console.log("SWMarkdownText parser: ok");
console.log(kinds.join(" -> "));
