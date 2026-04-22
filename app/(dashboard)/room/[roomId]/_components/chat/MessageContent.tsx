"use client";

import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import remarkGfm from "remark-gfm";

type MessageContentProps = {
  messageContent: string;
  isAi: boolean;
};

export function MessageContent({ messageContent, isAi }: MessageContentProps) {
  if (!isAi) {
    return (
      <p className="m-0 whitespace-pre-wrap wrap-break-words text-[14px] leading-[1.65] text-inherit">
        {messageContent}
      </p>
    );
  }

  return (
    <div
      className="
        prose prose-sm max-w-none wrap-break-words
        text-inherit

        prose-headings:font-semibold
        prose-headings:text-inherit
        prose-headings:tracking-tight
        prose-headings:mt-5
        prose-headings:mb-2

        prose-h1:text-[17px]
        prose-h2:text-[15px]
        prose-h3:text-[14px]

        prose-p:my-2.5
        prose-p:leading-[1.75]
        prose-p:text-[14px]
        prose-p:text-inherit

        prose-ul:my-2 prose-ol:my-2
        prose-li:my-1 prose-li:text-[14px] prose-li:leading-[1.7] prose-li:text-inherit

        prose-strong:font-semibold prose-strong:text-inherit

        prose-a:text-primary prose-a:font-medium prose-a:no-underline prose-a:border-b prose-a:border-primary/30
        hover:prose-a:border-primary

        prose-blockquote:my-4
        prose-blockquote:border-l-[3px]
        prose-blockquote:border-primary/30
        prose-blockquote:bg-primary/4
        prose-blockquote:py-2
        prose-blockquote:pl-4
        prose-blockquote:pr-3
        prose-blockquote:text-inherit
        prose-blockquote:rounded-r-md
        prose-blockquote:not-italic

        prose-hr:my-5 prose-hr:border-border

        prose-table:my-4 prose-table:w-full prose-table:text-[13px]
        prose-th:border prose-th:border-border prose-th:bg-black/10 prose-th:px-3 prose-th:py-1.5 prose-th:text-left prose-th:text-[12px] prose-th:font-semibold prose-th:text-inherit
        prose-td:border prose-td:border-border prose-td:px-3 prose-td:py-1.5 prose-td:text-inherit

        prose-code:rounded-md prose-code:bg-black/15 prose-code:px-1.5 prose-code:py-0.5
        prose-code:font-mono prose-code:text-[12px] prose-code:text-inherit
        prose-code:border prose-code:border-current/20

        prose-pre:my-4 prose-pre:overflow-x-auto prose-pre:rounded-xl prose-pre:border prose-pre:border-slate-700 prose-pre:bg-[#0d1117] prose-pre:p-0
      "
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          strong: ({ ...props }) => (
            <span className="font-semibold text-inherit" {...props} />
          ),
          code: ({ className, children, ...props }: any) => {
            const match = /language-(\w+)/.exec(className || "");
            const code = String(children).replace(/\n$/, "");

            if (match) {
              return (
                <div className="my-4 overflow-hidden rounded-xl border border-slate-700 shadow-sm">
                  {/* Language label bar */}
                  <div className="flex items-center justify-between border-b border-slate-700 bg-slate-800/80 px-4 py-1.5">
                    <span className="font-mono text-[11px] tracking-wide text-slate-400 uppercase">
                      {match[1]}
                    </span>
                  </div>
                  <SyntaxHighlighter
                    style={oneDark}
                    language={match[1]}
                    PreTag="div"
                    customStyle={{
                      margin: 0,
                      padding: "14px 16px",
                      background: "#0d1117",
                      fontSize: "13px",
                      lineHeight: "1.6",
                    }}
                  >
                    {code}
                  </SyntaxHighlighter>
                </div>
              );
            }

            return className ? (
              <pre className="my-3 overflow-x-auto rounded-xl border border-slate-700 bg-[#0d1117] p-4 text-[13px] leading-relaxed text-[#c9d1d9]">
                <code {...props}>{children}</code>
              </pre>
            ) : (
              <code
                className="rounded-md border border-current/20 bg-black/15 px-1.5 py-0.5 font-mono text-[12px] text-inherit"
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
