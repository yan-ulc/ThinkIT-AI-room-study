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
      <p className="m-0 whitespace-pre-wrap wrap-break-word text-inherit">
        {messageContent}
      </p>
    );
  }

  return (
    <div
      className="prose prose-sm max-w-none wrap-break-word text-slate-800
      prose-headings:mb-2 prose-headings:mt-4 prose-headings:font-semibold prose-headings:text-slate-900
      prose-p:my-2 prose-p:leading-7
      prose-ul:my-2 prose-ol:my-2 prose-li:my-0.5
      prose-strong:text-slate-900
      prose-a:text-primary prose-a:no-underline hover:prose-a:underline
      prose-blockquote:my-3 prose-blockquote:border-l-4 prose-blockquote:border-primary/40 prose-blockquote:bg-primary/5 prose-blockquote:py-2 prose-blockquote:pl-3 prose-blockquote:pr-2 prose-blockquote:text-slate-700
      prose-hr:my-4 prose-hr:border-border
      prose-table:my-3 prose-table:w-full
      prose-th:border prose-th:border-border prose-th:bg-slate-100 prose-th:px-2 prose-th:py-1 prose-th:text-left prose-th:text-[12px]
      prose-td:border prose-td:border-border prose-td:px-2 prose-td:py-1 prose-td:text-[12px]
      prose-code:rounded prose-code:bg-primary/10 prose-code:px-1.5 prose-code:py-0.5 prose-code:font-mono prose-code:text-[12px] prose-code:text-primary
      prose-pre:my-3 prose-pre:overflow-x-auto prose-pre:rounded-xl prose-pre:border prose-pre:border-slate-700 prose-pre:bg-[#0d1117] prose-pre:p-0"
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          strong: ({ ...props }) => (
            <span className="font-semibold text-slate-900" {...props} />
          ),
          code: ({ className, children, ...props }: any) => {
            const match = /language-(\w+)/.exec(className || "");
            const code = String(children).replace(/\n$/, "");

            if (match) {
              return (
                <div className="my-3 overflow-hidden rounded-xl border border-slate-700">
                  <SyntaxHighlighter
                    style={oneDark}
                    language={match[1]}
                    PreTag="div"
                    customStyle={{
                      margin: 0,
                      padding: "14px",
                      background: "#0d1117",
                      fontSize: "13px",
                      lineHeight: "1.5",
                    }}
                  >
                    {code}
                  </SyntaxHighlighter>
                </div>
              );
            }

            // Fallback for both inline and fenced code without language hints.
            return className ? (
              <pre className="my-3 overflow-x-auto rounded-xl border border-slate-700 bg-[#0d1117] p-3 text-[13px] text-[#c9d1d9]">
                <code {...props}>{children}</code>
              </pre>
            ) : (
              <code {...props}>{children}</code>
            );
          },
        }}
      >
        {messageContent}
      </ReactMarkdown>
    </div>
  );
}
