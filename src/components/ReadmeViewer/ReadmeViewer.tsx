import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import "./styles.css";

/** Rewrites relative image/link URLs in the raw markdown so they resolve
 *  correctly when served from raw.githubusercontent.com. */
function absolutifyUrls(md: string, repo: string, branch: string): string {
  const base = `https://raw.githubusercontent.com/${repo}/${branch}`;
  // relative img src and link href — anything not starting with http/https/# or data:
  return md.replace(
    /!\[([^\]]*)\]\((?!https?:\/\/|data:|#)([^)]+)\)/g,
    (_match, alt, src) => `![${alt}](${base}/${src.replace(/^\.\//, "")})`,
  );
}

type Status = "loading" | "error" | "done";

export default function ReadmeViewer({ repo }: { repo: string }) {
  const [markdown, setMarkdown] = useState("");
  const [status, setStatus] = useState<Status>("loading");

  useEffect(() => {
    let cancelled = false;
    setStatus("loading");

    const tryFetch = async (branch: string) => {
      const url = `https://raw.githubusercontent.com/${repo}/${branch}/README.md`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`${res.status}`);
      return { text: await res.text(), branch };
    };

    tryFetch("main")
      .catch(() => tryFetch("master"))
      .then(({ text, branch }) => {
        if (cancelled) return;
        setMarkdown(absolutifyUrls(text, repo, branch));
        setStatus("done");
      })
      .catch(() => {
        if (!cancelled) setStatus("error");
      });

    return () => {
      cancelled = true;
    };
  }, [repo]);

  if (status === "loading") {
    return (
      <div className="readme-skeleton">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="readme-skeleton__line"
            style={{ width: `${70 + (i % 3) * 10}%` }}
          />
        ))}
      </div>
    );
  }

  if (status === "error") {
    return (
      <p className="font-mono text-sm opacity-50">
        [ readme not available ]
      </p>
    );
  }

  return (
    <div className="readme-body">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // open external links in new tab
          a: ({ href, children, ...rest }) => (
            <a
              href={href}
              target={href?.startsWith("http") ? "_blank" : undefined}
              rel={href?.startsWith("http") ? "noopener noreferrer" : undefined}
              {...rest}
            >
              {children}
            </a>
          ),
          // lazy-load images inside the readme
          img: ({ src, alt, ...rest }) => (
            <img src={src} alt={alt} loading="lazy" {...rest} />
          ),
        }}
      >
        {markdown}
      </ReactMarkdown>
    </div>
  );
}
