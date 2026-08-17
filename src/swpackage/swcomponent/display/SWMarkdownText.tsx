/**
 * Custom Markdown rendering view for common LLM output formats.
 * Supports headings, bold, italic, inline code, fenced code blocks,
 * unordered/ordered lists, and horizontal dividers. No extra dependencies.
 *
 * Usage:
 *   <SWMarkdownText text={"# Hello\nSome **bold** and *italic* text."} />
 */
import type { CSSProperties, ReactNode } from "react";

export type SWMarkdownBlock =
  | { kind: "heading"; level: number; content: string }
  | { kind: "codeBlock"; language: string; code: string }
  | { kind: "divider" }
  | { kind: "listItem"; content: string; ordered: boolean; index: number }
  | { kind: "paragraph"; content: string };

export function parseSWMarkdownBlocks(text: string): SWMarkdownBlock[] {
  const blocks: SWMarkdownBlock[] = [];
  const lines = text.split("\n");
  let i = 0;

  while (i < lines.length) {
    const line = lines[i] ?? "";
    const trimmed = line.trim();

    if (trimmed.startsWith("```")) {
      const language = trimmed.slice(3).trim();
      const codeLines: string[] = [];
      i += 1;
      while (i < lines.length) {
        const codeLine = lines[i] ?? "";
        if (codeLine.trim().startsWith("```")) {
          i += 1;
          break;
        }
        codeLines.push(codeLine);
        i += 1;
      }
      blocks.push({
        kind: "codeBlock",
        language,
        code: codeLines.join("\n"),
      });
      continue;
    }

    if (isDivider(trimmed)) {
      blocks.push({ kind: "divider" });
      i += 1;
      continue;
    }

    const heading = parseHeading(trimmed);
    if (heading) {
      blocks.push({ kind: "heading", level: heading.level, content: heading.content });
      i += 1;
      continue;
    }

    const unordered = parseUnorderedListItem(trimmed);
    if (unordered) {
      blocks.push({ kind: "listItem", content: unordered, ordered: false, index: 0 });
      i += 1;
      continue;
    }

    const ordered = parseOrderedListItem(trimmed);
    if (ordered) {
      blocks.push({
        kind: "listItem",
        content: ordered.content,
        ordered: true,
        index: ordered.index,
      });
      i += 1;
      continue;
    }

    if (trimmed.length === 0) {
      i += 1;
      continue;
    }

    const paragraphLines: string[] = [line];
    i += 1;
    while (i < lines.length) {
      const nextLine = lines[i] ?? "";
      const nextTrimmed = nextLine.trim();
      if (
        nextTrimmed.length === 0 ||
        parseHeading(nextTrimmed) ||
        nextTrimmed.startsWith("```") ||
        parseUnorderedListItem(nextTrimmed) ||
        parseOrderedListItem(nextTrimmed) ||
        isDivider(nextTrimmed)
      ) {
        break;
      }
      paragraphLines.push(nextLine);
      i += 1;
    }
    blocks.push({ kind: "paragraph", content: paragraphLines.join("\n") });
  }

  return blocks;
}

function parseHeading(line: string): { level: number; content: string } | null {
  let level = 0;
  while (level < 4 && line[level] === "#") level += 1;
  if (level === 0 || line[level] !== " ") return null;
  const content = line.slice(level + 1).trim();
  if (!content) return null;
  return { level, content };
}

function parseUnorderedListItem(line: string): string | null {
  const first = line[0];
  if (!first || !"-*+".includes(first) || line.length < 2 || line[1] !== " ") {
    return null;
  }
  const content = line.slice(2).trim();
  return content.length === 0 ? null : content;
}

function parseOrderedListItem(
  line: string,
): { index: number; content: string } | null {
  const dot = line.indexOf(".");
  if (dot <= 0) return null;
  const prefix = line.slice(0, dot);
  if (!/^\d+$/.test(prefix)) return null;
  if (line[dot + 1] !== " ") return null;
  const content = line.slice(dot + 2).trim();
  if (!content) return null;
  return { index: Number(prefix), content };
}

function isDivider(line: string): boolean {
  if (line.length < 3) return false;
  return (
    [...line].every((ch) => ch === "-") ||
    [...line].every((ch) => ch === "*") ||
    [...line].every((ch) => ch === "_")
  );
}

function renderInline(text: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  let i = 0;
  let key = 0;

  const pushText = (value: string) => {
    if (value) nodes.push(value);
  };

  while (i < text.length) {
    if (text[i] === "`") {
      const end = text.indexOf("`", i + 1);
      if (end !== -1) {
        nodes.push(
          <code key={key} className="sw-md-code">
            {text.slice(i + 1, end)}
          </code>,
        );
        key += 1;
        i = end + 1;
        continue;
      }
    }

    if (text.startsWith("**", i)) {
      const end = text.indexOf("**", i + 2);
      if (end !== -1) {
        nodes.push(<strong key={key}>{text.slice(i + 2, end)}</strong>);
        key += 1;
        i = end + 2;
        continue;
      }
    }

    if (text[i] === "*" && text[i + 1] !== "*") {
      const end = text.indexOf("*", i + 1);
      if (end !== -1 && text[end + 1] !== "*") {
        nodes.push(<em key={key}>{text.slice(i + 1, end)}</em>);
        key += 1;
        i = end + 1;
        continue;
      }
    }

    if (text[i] === "_" && text[i + 1] !== "_") {
      const end = text.indexOf("_", i + 1);
      if (end !== -1) {
        nodes.push(<em key={key}>{text.slice(i + 1, end)}</em>);
        key += 1;
        i = end + 1;
        continue;
      }
    }

    const nextSpecial = nextMarkupIndex(text, i + 1);
    pushText(text.slice(i, nextSpecial));
    i = nextSpecial;
  }

  return nodes;
}

function nextMarkupIndex(text: string, from: number): number {
  for (let i = from; i < text.length; i += 1) {
    const ch = text[i];
    if (ch === "`" || ch === "*" || ch === "_") return i;
  }
  return text.length;
}

function headingClass(level: number): string {
  if (level === 1) return "sw-md-h1";
  if (level === 2) return "sw-md-h2";
  if (level === 3) return "sw-md-h3";
  return "sw-md-h4";
}

export function SWMarkdownText({
  text,
  codeBackground = "color-mix(in srgb, var(--sw-fill) 80%, transparent)",
  codeBorderColor = "var(--sw-secondary-label)",
  codeCornerRadius = 8,
  blockSpacing = 6,
}: {
  text: string;
  codeBackground?: string;
  codeBorderColor?: string;
  codeCornerRadius?: number;
  blockSpacing?: number;
}) {
  if (!text) return null;
  const blocks = parseSWMarkdownBlocks(text);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "stretch",
        gap: blockSpacing,
      }}
    >
      {blocks.map((block, index) => (
        <MarkdownBlock
          key={index}
          block={block}
          codeBackground={codeBackground}
          codeBorderColor={codeBorderColor}
          codeCornerRadius={codeCornerRadius}
        />
      ))}
    </div>
  );
}

function MarkdownBlock({
  block,
  codeBackground,
  codeBorderColor,
  codeCornerRadius,
}: {
  block: SWMarkdownBlock;
  codeBackground: string;
  codeBorderColor: string;
  codeCornerRadius: number;
}) {
  if (block.kind === "heading") {
    return (
      <div className={headingClass(block.level)}>{renderInline(block.content)}</div>
    );
  }
  if (block.kind === "codeBlock") {
    const frame: CSSProperties = {
      borderRadius: codeCornerRadius,
      background: `color-mix(in srgb, ${codeBackground} 60%, transparent)`,
      boxShadow: `inset 0 0 0 0.5px color-mix(in srgb, ${codeBorderColor} 50%, transparent)`,
      overflow: "hidden",
    };
    return (
      <div style={frame}>
        {block.language ? (
          <div
            style={{
              fontSize: 12,
              color: "var(--sw-secondary-label)",
              padding: "6px 10px 2px",
            }}
          >
            {block.language}
          </div>
        ) : null}
        <pre className="sw-md-pre">{block.code}</pre>
      </div>
    );
  }
  if (block.kind === "divider") {
    return <hr className="sw-md-hr" />;
  }
  if (block.kind === "listItem") {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          gap: 6,
          paddingLeft: 12,
        }}
      >
        <span style={{ color: "var(--sw-secondary-label)", minWidth: 16 }}>
          {block.ordered ? `${block.index}.` : "•"}
        </span>
        <span>{renderInline(block.content)}</span>
      </div>
    );
  }
  return (
    <p style={{ margin: 0, whiteSpace: "pre-wrap" }}>{renderInline(block.content)}</p>
  );
}
