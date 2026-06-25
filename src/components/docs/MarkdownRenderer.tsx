import React, { useEffect, useState } from "react";
import { Check, Copy } from "lucide-react";

// Slugify helper to create URL-friendly IDs for headings
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove accent marks
    .replace(/[^a-z0-9\s-]/g, "") // Keep only letters, digits, spaces, and hyphens
    .trim()
    .replace(/\s+/g, "-") // Spaces to hyphens
    .replace(/-+/g, "-"); // Merge double hyphens
}

export function renderInline(text: string): React.ReactNode[] {
  let tokens: Array<{ type: "text" | "bold" | "italic" | "code" | "link"; text: string; url?: string }> = [
    { type: "text", text }
  ];

  // Pass 1: Code blocks (`inline code`)
  tokens = tokens.flatMap(token => {
    if (token.type !== "text") return [token];
    const parts = token.text.split(/(`[^`]+`)/g);
    return parts.map(part => {
      if (part.startsWith("`") && part.endsWith("`")) {
        return { type: "code" as const, text: part.slice(1, -1) };
      }
      return { type: "text" as const, text: part };
    });
  });

  // Pass 2: Links ([label](url))
  tokens = tokens.flatMap(token => {
    if (token.type !== "text") return [token];
    const regex = /(\[[^\]]+\]\([^)]+\))/g;
    const parts = token.text.split(regex);
    return parts.map(part => {
      if (part.startsWith("[") && part.includes("](") && part.endsWith(")")) {
        const linkMatch = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
        if (linkMatch) {
          return { type: "link" as const, text: linkMatch[1], url: linkMatch[2] };
        }
      }
      return { type: "text" as const, text: part };
    });
  });

  // Pass 3: Bold (**text** or __text__)
  tokens = tokens.flatMap(token => {
    if (token.type !== "text") return [token];
    const parts = token.text.split(/(\*\*[^*]+\*\*|__[^*]+__)/g);
    return parts.map(part => {
      if ((part.startsWith("**") && part.endsWith("**")) || (part.startsWith("__") && part.endsWith("__"))) {
        return { type: "bold" as const, text: part.slice(2, -2) };
      }
      return { type: "text" as const, text: part };
    });
  });

  // Pass 4: Italic (*text* or _text_)
  tokens = tokens.flatMap(token => {
    if (token.type !== "text") return [token];
    const parts = token.text.split(/(\*[^*]+\*|_[^*]+_)/g);
    return parts.map(part => {
      if ((part.startsWith("*") && part.endsWith("*")) || (part.startsWith("_") && part.endsWith("_"))) {
        return { type: "italic" as const, text: part.slice(1, -1) };
      }
      return { type: "text" as const, text: part };
    });
  });

  return tokens.map((token, idx) => {
    switch (token.type) {
      case "code":
        return (
          <code key={idx} className="px-1.5 py-0.5 bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200/60 dark:border-zinc-700/50 rounded text-[13px] font-mono text-cyan-600 dark:text-cyan-400">
            {token.text}
          </code>
        );
      case "bold":
        return <strong key={idx} className="font-semibold text-zinc-900 dark:text-white">{token.text}</strong>;
      case "italic":
        return <em key={idx} className="italic text-zinc-800 dark:text-zinc-200">{token.text}</em>;
      case "link":
        const isExternal = token.url?.startsWith("http");
        return (
          <a
            key={idx}
            href={token.url}
            target={isExternal ? "_blank" : undefined}
            rel={isExternal ? "noopener noreferrer" : undefined}
            className="text-cyan-600 dark:text-cyan-400 hover:underline hover:text-cyan-700 dark:hover:text-cyan-300 font-medium transition-all duration-150"
          >
            {token.text}
          </a>
        );
      default:
        return <span key={idx}>{token.text}</span>;
    }
  });
}

export function parseMarkdown(content: string) {
  const lines = content.split("\n");
  const blocks: any[] = [];
  
  let inCodeBlock = false;
  let codeBlockLines: string[] = [];
  let codeBlockLang = "";
  
  let inTable = false;
  let tableLines: string[] = [];

  let inList = false;
  let listItems: string[] = [];
  let isOrderedList = false;

  let inQuote = false;
  let quoteLines: string[] = [];

  const commitList = () => {
    if (listItems.length > 0) {
      blocks.push({
        type: isOrderedList ? "ol" : "ul",
        items: [...listItems]
      });
      listItems = [];
      inList = false;
    }
  };

  const commitTable = () => {
    if (tableLines.length > 0) {
      blocks.push({
        type: "table",
        lines: [...tableLines]
      });
      tableLines = [];
      inTable = false;
    }
  };

  const commitQuote = () => {
    if (quoteLines.length > 0) {
      blocks.push({
        type: "blockquote",
        content: quoteLines.join("\n")
      });
      quoteLines = [];
      inQuote = false;
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // 1. Code block handling
    if (trimmed.startsWith("```")) {
      if (inCodeBlock) {
        blocks.push({
          type: "code",
          lang: codeBlockLang,
          content: codeBlockLines.join("\n")
        });
        codeBlockLines = [];
        codeBlockLang = "";
        inCodeBlock = false;
      } else {
        commitList();
        commitTable();
        commitQuote();
        inCodeBlock = true;
        codeBlockLang = trimmed.slice(3).trim();
      }
      continue;
    }

    if (inCodeBlock) {
      codeBlockLines.push(line);
      continue;
    }

    // 2. Table handling
    if (trimmed.startsWith("|")) {
      commitList();
      commitQuote();
      inTable = true;
      tableLines.push(trimmed);
      continue;
    } else if (inTable) {
      commitTable();
    }

    // 3. Blockquote handling
    if (trimmed.startsWith(">")) {
      commitList();
      commitTable();
      inQuote = true;
      const content = line.replace(/^\s*>\s?/, "");
      quoteLines.push(content);
      continue;
    } else if (inQuote) {
      if (trimmed === "" || !line.startsWith(">")) {
        commitQuote();
      } else {
        const content = line.replace(/^\s*>\s?/, "");
        quoteLines.push(content);
        continue;
      }
    }

    // 4. Horizontal rules
    if (trimmed === "---" || trimmed === "***" || trimmed === "___") {
      commitList();
      commitTable();
      commitQuote();
      blocks.push({ type: "hr" });
      continue;
    }

    // 5. Header handling
    if (trimmed.startsWith("#")) {
      commitList();
      commitTable();
      commitQuote();
      const match = trimmed.match(/^(#{1,6})\s+(.*)$/);
      if (match) {
        const level = match[1].length;
        const text = match[2].trim();
        blocks.push({
          type: "header",
          level,
          text
        });
        continue;
      }
    }

    // 6. List items handling
    const ulMatch = line.match(/^(\s*)([-*+])\s+(.*)$/);
    const olMatch = line.match(/^(\s*)(\d+)\.\s+(.*)$/);

    if (ulMatch) {
      if (inList && isOrderedList) {
        commitList();
      }
      inList = true;
      isOrderedList = false;
      listItems.push(ulMatch[3]);
      continue;
    } else if (olMatch) {
      if (inList && !isOrderedList) {
        commitList();
      }
      inList = true;
      isOrderedList = true;
      listItems.push(olMatch[3]);
      continue;
    } else if (trimmed === "" && inList) {
      commitList();
      continue;
    }

    // 7. Normal paragraphs / text lines
    if (trimmed === "") {
      commitList();
      commitTable();
      commitQuote();
      blocks.push({ type: "empty" });
    } else {
      commitList();
      commitTable();
      commitQuote();
      
      const lastBlock = blocks[blocks.length - 1];
      if (lastBlock && lastBlock.type === "paragraph") {
        lastBlock.content += "\n" + line;
      } else {
        blocks.push({
          type: "paragraph",
          content: line
        });
      }
    }
  }

  commitList();
  commitTable();
  commitQuote();

  return blocks.filter(b => b.type !== "empty");
}

function CodeBlock({ lang, content }: { lang: string; content: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Clipboard copy failed:", err);
    }
  };

  return (
    <div className="group relative my-5 overflow-hidden rounded-xl border border-zinc-200/80 dark:border-zinc-800 bg-zinc-50 dark:bg-[#0d0d0d] font-mono text-xs shadow-sm">
      <div className="flex items-center justify-between px-4 py-2 border-b border-zinc-200/60 dark:border-zinc-800 bg-zinc-100/50 dark:bg-[#121212] text-zinc-400 font-sans text-xs">
        <span className="uppercase tracking-wider font-semibold text-cyan-600/80 dark:text-cyan-400/80">{lang || "code"}</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-2 py-1 rounded bg-white dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-750 text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-100 border border-zinc-200/50 dark:border-zinc-700/50 transition-all cursor-pointer shadow-sm"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-green-500" />
              <span className="text-[11px] text-green-500">Copié</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span className="text-[11px]">Copier</span>
            </>
          )}
        </button>
      </div>
      <div className="p-4 overflow-x-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-zinc-300 dark:scrollbar-thumb-zinc-800 leading-relaxed text-zinc-700 dark:text-zinc-300">
        <pre className="m-0 whitespace-pre">
          <code>{content}</code>
        </pre>
      </div>
    </div>
  );
}

interface MarkdownRendererProps {
  content: string;
  onHeadingsDetected?: (headings: { id: string; text: string; level: number }[]) => void;
}

export default function MarkdownRenderer({ content, onHeadingsDetected }: MarkdownRendererProps) {
  const [blocks, setBlocks] = useState<any[]>([]);

  useEffect(() => {
    const parsedBlocks = parseMarkdown(content);
    setBlocks(parsedBlocks);

    // Filter headings and lift them up
    if (onHeadingsDetected) {
      const headings = parsedBlocks
        .filter(b => b.type === "header")
        .map(b => ({
          id: slugify(b.text),
          text: b.text,
          level: b.level
        }));
      onHeadingsDetected(headings);
    }
  }, [content]);

  return (
    <div className="prose prose-zinc dark:prose-invert max-w-none text-zinc-700 dark:text-zinc-300 leading-relaxed">
      {blocks.map((block, idx) => {
        switch (block.type) {
          case "header": {
            const id = slugify(block.text);
            const inlineText = renderInline(block.text);
            switch (block.level) {
              case 1:
                return (
                  <h1 id={id} key={idx} className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white mt-8 mb-4 border-b border-zinc-200/60 dark:border-zinc-800/80 pb-3 font-sans">
                    {inlineText}
                  </h1>
                );
              case 2:
                return (
                  <h2 id={id} key={idx} className="text-xl font-semibold tracking-tight text-zinc-900 dark:text-white mt-8 mb-3.5 border-b border-zinc-100 dark:border-zinc-900 pb-2 font-sans flex items-center group">
                    <span className="mr-2 text-cyan-500/80 font-mono text-lg font-normal opacity-0 group-hover:opacity-100 transition-opacity duration-150 select-none">#</span>
                    {inlineText}
                  </h2>
                );
              case 3:
                return (
                  <h3 id={id} key={idx} className="text-lg font-semibold tracking-tight text-zinc-850 dark:text-zinc-100 mt-6 mb-2.5 font-sans">
                    {inlineText}
                  </h3>
                );
              default:
                return (
                  <h4 id={id} key={idx} className="text-base font-semibold text-zinc-800 dark:text-zinc-200 mt-5 mb-2 font-sans">
                    {inlineText}
                  </h4>
                );
            }
          }
          case "paragraph":
            return (
              <p key={idx} className="my-3.5 text-zinc-650 dark:text-zinc-300/90 leading-relaxed text-[15px]">
                {renderInline(block.content)}
              </p>
            );
          case "ul":
            return (
              <ul key={idx} className="my-4 pl-6 list-disc space-y-2 text-[15px] text-zinc-650 dark:text-zinc-300/90">
                {block.items.map((item: string, i: number) => (
                  <li key={i}>{renderInline(item)}</li>
                ))}
              </ul>
            );
          case "ol":
            return (
              <ol key={idx} className="my-4 pl-6 list-decimal space-y-2 text-[15px] text-zinc-650 dark:text-zinc-300/90">
                {block.items.map((item: string, i: number) => (
                  <li key={i}>{renderInline(item)}</li>
                ))}
              </ol>
            );
          case "blockquote":
            return (
              <blockquote key={idx} className="my-5 pl-4 border-l-4 border-cyan-500 bg-zinc-50 dark:bg-zinc-900/40 py-3 pr-4 rounded-r-lg text-zinc-650 dark:text-zinc-300 italic text-sm">
                {block.content.split("\n").map((line: string, i: number) => (
                  <p key={i} className="my-1">{renderInline(line)}</p>
                ))}
              </blockquote>
            );
          case "code":
            return (
              <div key={idx}>
                <CodeBlock lang={block.lang} content={block.content} />
              </div>
            );
          case "table": {
            const tableData = parseTableBlock(block.lines);
            if (!tableData) return null;
            return (
              <div key={idx} className="my-6 overflow-x-auto rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 shadow-sm">
                <table className="w-full border-collapse text-left text-sm">
                  <thead className="bg-zinc-100/50 dark:bg-[#121212] text-zinc-750 dark:text-zinc-200 font-semibold border-b border-zinc-200/80 dark:border-zinc-800/80">
                    <tr>
                      {tableData.headers.map((header, i) => {
                        const align = tableData.alignments[i] || "left";
                        return (
                          <th key={i} className="px-4 py-3 font-medium text-xs tracking-wider uppercase border-r border-zinc-200/40 dark:border-zinc-800/40 last:border-0" style={{ textAlign: align }}>
                            {renderInline(header)}
                          </th>
                        );
                      })}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200/60 dark:divide-zinc-800/80 bg-white dark:bg-[#090909]">
                    {tableData.rows.map((row, rIdx) => (
                      <tr key={rIdx} className="hover:bg-zinc-50/40 dark:hover:bg-zinc-900/30 transition-all duration-150 odd:bg-zinc-50/10 dark:odd:bg-zinc-950/10">
                        {row.map((cell, cIdx) => {
                          const align = tableData.alignments[cIdx] || "left";
                          return (
                            <td key={cIdx} className="px-4 py-2.5 border-r border-zinc-200/40 dark:border-zinc-800/40 last:border-0 text-zinc-650 dark:text-zinc-300 text-[14px]" style={{ textAlign: align }}>
                              {renderInline(cell)}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          }
          case "hr":
            return <hr key={idx} className="my-8 border-t border-zinc-200 dark:border-zinc-800" />;
          default:
            return null;
        }
      })}
    </div>
  );
}

// Simple local table lines parser
function parseTableBlock(lines: string[]) {
  const cleanLines = lines.map(l => l.trim()).filter(l => l.length > 0);
  if (cleanLines.length === 0) return null;

  const headers = cleanLines[0]
    .split("|")
    .map(cell => cell.trim())
    .filter((_, idx, arr) => idx > 0 && idx < arr.length - 1);

  let alignments: Array<"left" | "center" | "right"> = [];
  if (cleanLines.length > 1) {
    alignments = cleanLines[1]
      .split("|")
      .map(cell => cell.trim())
      .filter((_, idx, arr) => idx > 0 && idx < arr.length - 1)
      .map(cell => {
        const left = cell.startsWith(":");
        const right = cell.endsWith(":");
        if (left && right) return "center";
        if (right) return "right";
        return "left";
      });
  }

  const rows = cleanLines.slice(2).map(row => {
    return row
      .split("|")
      .map(cell => cell.trim())
      .filter((_, idx, arr) => idx > 0 && idx < arr.length - 1);
  });

  return { headers, alignments, rows };
}
