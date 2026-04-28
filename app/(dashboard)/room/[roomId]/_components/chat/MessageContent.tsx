"use client";

import type { ComponentPropsWithoutRef, ReactNode } from "react";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import remarkGfm from "remark-gfm";

type MessageContentProps = {
  messageContent: string;
  isAi: boolean;
  isMine?: boolean;
};

type MarkdownCodeProps = ComponentPropsWithoutRef<"code"> & {
  className?: string;
  children?: ReactNode;
};

export function MessageContent({ messageContent, isAi }: MessageContentProps) {
  // Plain user messages — no markdown
  if (!isAi) {
    return (
      <p className="m-0 whitespace-pre-wrap break-words text-[14px] leading-[1.65] text-inherit">
        {messageContent}
      </p>
    );
  }

  // AI messages — use text-inherit so color always matches the bubble's text-background
  // which flips correctly between light/dark mode.
  // Distinction between body vs bold is done via opacity, not hardcoded color.
  return (
    <div className="ai-prose min-w-0">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          p: ({ children }) => (
            <p className="my-1.5 text-[13.5px] leading-[1.75] text-inherit opacity-85">
              {children}
            </p>
          ),

          h1: ({ children }) => (
            <h1 className="mb-1 mt-4 text-[15.5px] font-bold text-inherit opacity-100">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="mb-1 mt-3 text-[14px] font-bold text-inherit opacity-100">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="mb-0.5 mt-2.5 text-[13.5px] font-semibold text-inherit opacity-100">
              {children}
            </h3>
          ),

          // Bold: full opacity + heavier weight → visually distinct from body (opacity-85)
          strong: ({ children }) => (
            <strong className="font-bold text-inherit opacity-100">
              {children}
            </strong>
          ),

          em: ({ children }) => (
            <em className="italic text-inherit opacity-70">{children}</em>
          ),

          ul: ({ children }) => (
            <ul className="my-1.5 list-disc space-y-0.5 pl-5 text-[13.5px] text-inherit opacity-85">
              {children}
            </ul>
          ),

          ol: ({ children }) => (
            <ol className="my-1.5 list-decimal space-y-0.5 pl-5 text-[13.5px] text-inherit opacity-85">
              {children}
            </ol>
          ),

          li: ({ children }) => (
            <li className="leading-[1.65] text-inherit">{children}</li>
          ),

          hr: () => (
            <hr className="my-3 border-current opacity-20" />
          ),

          blockquote: ({ children }) => (
            <blockquote className="my-2 rounded-r-md border-l-[3px] border-current py-2 pl-3 pr-2 text-[13px] text-inherit not-italic opacity-75"
              style={{ background: "color-mix(in srgb, currentColor 10%, transparent)" }}
            >
              {children}
            </blockquote>
          ),

          table: ({ children }) => (
            <table className="my-2 w-full border-collapse text-[12.5px]">
              {children}
            </table>
          ),
          th: ({ children }) => (
            <th
              className="border border-current px-2.5 py-1.5 text-left text-[11.5px] font-semibold text-inherit opacity-90"
              style={{ background: "color-mix(in srgb, currentColor 12%, transparent)" }}
            >
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="border border-current px-2.5 py-1.5 text-inherit opacity-80">
              {children}
            </td>
          ),

          code: ({ className, children, ...props }: MarkdownCodeProps) => {
            const match = /language-(\w+)/.exec(className || "");
            const code = String(children).replace(/\n$/, "");

            if (match) {
              return (
                <div className="my-2.5 overflow-hidden rounded-xl shadow-md"
                  style={{ border: "1px solid color-mix(in srgb, currentColor 20%, transparent)" }}
                >
                  <div className="flex items-center border-b border-slate-700/80 bg-slate-800/90 px-4 py-1.5">
                    <span className="font-mono text-[10px] uppercase tracking-widest text-slate-400">
                      {match[1]}
                    </span>
                  </div>
                  <SyntaxHighlighter
                    style={oneDark}
                    language={match[1]}
                    PreTag="div"
                    customStyle={{
                      margin: 0,
                      padding: "12px 16px",
                      background: "#0d1117",
                      fontSize: "12px",
                      lineHeight: "1.65",
                    }}
                  >
                    {code}
                  </SyntaxHighlighter>
                </div>
              );
            }

            if (className) {
              return (
                <pre className="my-2.5 overflow-x-auto rounded-xl bg-[#0d1117] p-4 text-[12px] leading-relaxed text-[#c9d1d9]"
                  style={{ border: "1px solid color-mix(in srgb, currentColor 15%, transparent)" }}
                >
                  <code {...props}>{children}</code>
                </pre>
              );
            }

            // Inline code — semi-transparent chip using currentColor
            return (
              <code
                className="rounded px-1.5 py-0.5 font-mono text-[12px] font-semibold text-inherit"
                style={{ background: "color-mix(in srgb, currentColor 18%, transparent)" }}
                {...props}
              >
                {children}
              </code>
            );
          },
        }}
      >
        {messageContent}
      </ReactMarkdown>
    </div>
  );
}
