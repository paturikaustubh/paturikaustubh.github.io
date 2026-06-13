import { useRef, useEffect, useCallback } from "react";
import { useLocation } from "react-router-dom";
import "./style.css";
import { useConsole } from "./useConsole";

const getCommandParts = (command: string, isCommand: boolean) => {
  const parts: { text: string; className: string }[] = [];
  let currentPart = "";
  let inQuote: '"' | "'" | null = null;

  const pushCurrentPart = (isQuoted: boolean) => {
    if (currentPart) {
      parts.push({
        text: currentPart,
        className: isCommand && isQuoted ? "console-quoted" : "",
      });
      currentPart = "";
    }
  };

  for (let i = 0; i < command.length; i++) {
    const char = command[i];

    if (inQuote) {
      currentPart += char;
      if (char === inQuote) {
        pushCurrentPart(true);
        inQuote = null;
      }
    } else {
      if (char === '"' || char === "'") {
        pushCurrentPart(false);
        inQuote = char;
        currentPart += char;
      } else if (char === " ") {
        pushCurrentPart(false);
        parts.push({ text: " ", className: "" });
      } else {
        currentPart += char;
      }
    }
  }
  pushCurrentPart(!!inQuote);

  if (isCommand) {
    let isFirst = true;
    for (const part of parts) {
      if (part.text.trim() === "") continue;
      if (isFirst && !part.className) {
        part.className = "command-first-word";
        isFirst = false;
      }
      if (part.text.startsWith("-") && !part.className) {
        part.className = "console-flag";
      }
    }
  }

  return parts;
};

export default function Console() {
  const consoleRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const consoleToggle = useRef<HTMLButtonElement>(null);
  const location = useLocation();
  const currentPath = location.pathname || "/";
  const displayPath = currentPath === "/" ? "~" : currentPath;

  const toggleTerminalVisible = useCallback(() => {
    const isCurrentlyInvisible =
      consoleRef.current?.classList.contains("invisible");

    consoleRef.current?.classList.toggle("invisible");
    consoleToggle.current?.classList.toggle("invisible");

    if (isCurrentlyInvisible) {
      activateConsole();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === "`") {
        toggleTerminalVisible();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [toggleTerminalVisible]);

  const {
    command,
    cursorPosition,
    activateConsole,
    output,
    killTerminal,
    interactivePrompt,
  } = useConsole(consoleRef, contentRef, toggleTerminalVisible);

  const renderCommand = (
    cmd: string,
    withCursor: boolean,
    isCommand: boolean
  ) => {
    const parts = getCommandParts(cmd, isCommand);
    let renderedChars = 0;
    let cursorPlaced = false;

    const renderedParts = parts.map((part, index) => {
      if (!withCursor || cursorPlaced) {
        return (
          <span key={index} className={part.className}>
            {part.text}
          </span>
        );
      }

      const partStart = renderedChars;
      const partEnd = partStart + part.text.length;

      if (cursorPosition >= partStart && cursorPosition <= partEnd) {
        const localCursorPos = cursorPosition - partStart;
        const before = part.text.slice(0, localCursorPos);
        const at = part.text.charAt(localCursorPos) || " ";
        const after = part.text.slice(localCursorPos + 1);
        cursorPlaced = true;

        return (
          <span key={index} className={part.className}>
            {before}
            <span className="caret">{at}</span>
            {after}
          </span>
        );
      } else {
        renderedChars += part.text.length;
        return (
          <span key={index} className={part.className}>
            {part.text}
          </span>
        );
      }
    });

    if (withCursor && !cursorPlaced && cursorPosition === cmd.length) {
      renderedParts.push(
        <span key="caret-end" className="caret">
          {" "}
        </span>
      );
    }

    return <>{renderedParts}</>;
  };

  return (
    <>
      <button
        id="console-toggle"
        ref={consoleToggle}
        onClick={toggleTerminalVisible}
        title="Open terminal (Ctrl + `)"
      >
        <span className="material-symbols-outlined">code</span>
      </button>
      <section
        id="console"
        className="invisible"
        ref={consoleRef}
        onClick={activateConsole}
      >
        <div className="console-dragger"></div>
        <div className="console-header">
          <span>Terminal</span>
          <div className="actions">
            <span className="material-symbols-outlined" onClick={killTerminal}>
              delete
            </span>
            <span
              className="material-symbols-outlined"
              onClick={toggleTerminalVisible}
            >
              close
            </span>
          </div>
        </div>
        <div className="console-content" ref={contentRef}>
          <PKBanner></PKBanner>
          <div className="helper-text">
            ⚡Welcome to KPCLI! Type <code>help</code> to get started.
          </div>
          <div className="output-container">
            {output.map((entry, index) => {
              const entryDisplayPath = entry.path === "/" ? "~" : entry.path;
              const entryClass = entry.isInteractivePrompt
                ? "history-entry interactive-entry"
                : "history-entry";

              if (entry.isInteractivePrompt) {
                return (
                  <div key={index} className={entryClass}>
                    <p
                      className="response"
                      dangerouslySetInnerHTML={{ __html: entry.response }}
                    ></p>
                  </div>
                );
              }
              return (
                <div key={index} className={entryClass}>
                  {entry.command && (
                    <p className="command-container">
                      <span className="prompt">
                        kaustubhpaturi@portfolio{" "}
                        <span>{entryDisplayPath} $</span>
                      </span>
                      <span className="command">
                        {renderCommand(entry.command, false, true)}
                      </span>
                    </p>
                  )}
                  {entry.response && (
                    <p
                      className="response"
                      dangerouslySetInnerHTML={{ __html: entry.response }}
                    ></p>
                  )}
                </div>
              );
            })}
          </div>
          {interactivePrompt ? (
            <p className="command-container">
              <span className="prompt">{interactivePrompt}</span>
              <span className="command">
                {renderCommand(command, true, false)}
              </span>
            </p>
          ) : (
            <p className="command-container">
              <span className="prompt">
                kaustubhpaturi@portfolio <span>{displayPath} $</span>
              </span>
              <span className="command">
                {renderCommand(command, true, true)}
              </span>
            </p>
          )}
        </div>
      </section>
    </>
  );
}

function PKBanner() {
  return (
    <pre
      style={{
        fontSize: "1.2em",
        color: "#ede8e0",
        lineHeight: "1.2",
        whiteSpace: "pre",
        marginBottom: "0.75em",
        fontFamily: '"JetBrains Mono", monospace',
      }}
    >
      {String.raw`
██╗  ██╗ ██████╗
██║ ██╔╝ ██╔══██╗
█████╔╝  ██████╔╝
██╔═██╗  ██╔═══╝
██║ ╚██╗ ██║
╚═╝  ╚═╝ ╚═╝
`}
    </pre>
  );
}
