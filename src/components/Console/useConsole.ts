import { useState, useEffect, useCallback, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { cmdActions, pageLs, LsFileEntry, LsEntry } from "./commands";
import { submitMessageFromConsole } from "./submitMessage";

export interface ConsoleOutput {
  command: string;
  response: string;
  path: string;
  isInteractivePrompt?: boolean;
}

interface InteractiveCommandState {
  commandName: "write";
  currentStep: number;
  steps: string[];
  formData: { [key: string]: string };
}

const parseCommand = (command: string): string[] | { error: string } => {
  const args: string[] = [];
  let i = 0;
  while (i < command.length) {
    while (i < command.length && /\s/.test(command[i])) {
      i++;
    }
    if (i >= command.length) break;

    let currentArg = "";
    const quote = command[i];

    if (quote === '"' || quote === "'") {
      i++;
      let j = i;
      while (j < command.length && command[j] !== quote) {
        j++;
      }
      if (j >= command.length) {
        return { error: `Unclosed quote: Please close the starting ${quote}.` };
      }
      currentArg = command.substring(i, j);
      i = j + 1;
    } else {
      let j = i;
      while (j < command.length && !/\s/.test(command[j])) {
        if (command[j] === '"' || command[j] === "'") {
          return {
            error: `Invalid syntax: Quote character found inside an unquoted argument.`,
          };
        }
        j++;
      }
      currentArg = command.substring(i, j);
      i = j;
    }
    args.push(currentArg);
  }
  return args;
};

export const useConsole = (
  consoleRef: React.RefObject<HTMLElement>,
  contentRef: React.RefObject<HTMLElement>,
  toggleTerminalVisible: () => void
) => {
  const [command, setCommand] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [output, setOutput] = useState<ConsoleOutput[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [cursorPosition, setCursorPosition] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [suggestionIndex, setSuggestionIndex] = useState(0);
  const [isTabbing, setIsTabbing] = useState(false);
  const [interactiveCommand, setInteractiveCommand] =
    useState<InteractiveCommandState | null>(null);
  const [interactivePrompt, setInteractivePrompt] = useState<string | null>(
    null
  );
  const isAtBottom = useRef(true);
  const navigate = useNavigate();
  const location = useLocation();

  const scrollIntoView = useCallback((id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const navbar = document.querySelector(".navbar");
      const navbarHeight = navbar ? navbar.clientHeight : 0;
      const elementPosition =
        element.getBoundingClientRect().top + window.pageYOffset;
      const offsetPosition = elementPosition - navbarHeight;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
  }, []);

  const killTerminal = useCallback(() => {
    toggleTerminalVisible();
    setCommand("");
    setHistory([]);
    setOutput([]);
    setHistoryIndex(-1);
    setCursorPosition(0);
    setIsActive(false);
    setSuggestions([]);
    setSuggestionIndex(0);
    setIsTabbing(false);
    setInteractiveCommand(null);
    setInteractivePrompt(null);
  }, [toggleTerminalVisible]);

  const getDisplayFieldName = (fieldName: string): string => {
    switch (fieldName) {
      case "firstName":
        return "First Name";
      case "lastName":
        return "Last Name";
      case "email":
        return "E-Mail";
      case "message":
        return "Message";
      default:
        return fieldName;
    }
  };

  const validateField = (fieldName: string, value: string): string | null => {
    const displayName = getDisplayFieldName(fieldName);
    if (!value.trim()) return `${displayName} cannot be empty.`;
    if (fieldName === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      return "Invalid email format.";
    }
    if (fieldName === "message" && value.length > 500) {
      return `Message cannot exceed 500 characters. (${value.length}/500)`;
    }
    return null;
  };

  const executeCommand = useCallback(
    (cmd: string) => {
      const currentPath = location.pathname || "/";
      const parsedResult = parseCommand(cmd);

      if (Array.isArray(parsedResult)) {
        const [commandName, ...restArgs] = parsedResult;

        if (isAtBottom.current) {
          setTimeout(() => {
            const contentEl = contentRef.current;
            if (contentEl) {
              contentEl.scrollTop = contentEl.scrollHeight;
            }
          }, 0);
        }

        if (commandName === "write") {
          if (restArgs.includes("--help")) {
            const helpText = cmdActions.write(restArgs);
            setOutput((prev) => [
              ...prev,
              { command: cmd, response: helpText || "", path: currentPath },
            ]);
            return;
          }

          const parsedArgs: { [key: string]: string } = {};
          for (let i = 0; i < restArgs.length; i++) {
            const flag = restArgs[i];
            const value =
              restArgs[i + 1] && !restArgs[i + 1].startsWith("-")
                ? restArgs[i + 1]
                : "";
            if (!value) continue;

            let key: string | null = null;

            if (flag.startsWith("--")) {
              const longFlag = flag.substring(2);
              switch (longFlag) {
                case "first-name":
                  key = "firstName";
                  break;
                case "last-name":
                  key = "lastName";
                  break;
                case "email":
                  key = "email";
                  break;
                case "message":
                  key = "message";
                  break;
              }
            } else if (flag.startsWith("-")) {
              const shortFlag = flag.substring(1);
              switch (shortFlag) {
                case "f":
                  key = "firstName";
                  break;
                case "l":
                  key = "lastName";
                  break;
                case "e":
                  key = "email";
                  break;
                case "m":
                  key = "message";
                  break;
              }
            }

            if (key) {
              parsedArgs[key] = value;
              i++;
            }
          }

          const allFields = ["firstName", "lastName", "email", "message"];
          const formData: { [key: string]: string } = {};
          allFields.forEach((field) => {
            formData[field] = "";
          });
          Object.assign(formData, parsedArgs);

          const steps = allFields.filter((field) => !parsedArgs[field]);

          setOutput((prev) => [
            ...prev,
            { command: cmd, response: "", path: currentPath },
          ]);

          if (steps.length === 0) {
            const submit = async () => {
              const result = await submitMessageFromConsole(
                formData as unknown as Parameters<
                  typeof submitMessageFromConsole
                >[0],
              );
              setOutput((prev) => [
                ...prev,
                { command: "", response: result, path: currentPath },
              ]);
            };
            submit();
          } else {
            setInteractiveCommand({
              commandName: "write",
              currentStep: 0,
              steps,
              formData,
            });
            setInteractivePrompt(`Enter ${getDisplayFieldName(steps[0])}:`);
          }
          return;
        }

        if (commandName in cmdActions) {
          if (restArgs.includes("--help")) {
            const helpText = cmdActions[commandName](restArgs);
            setOutput((prev) => [
              ...prev,
              { command: cmd, response: helpText || "", path: currentPath },
            ]);
            return;
          }

          const action = cmdActions[commandName];
          const result = action(
            restArgs,
            navigate,
            scrollIntoView,
            toggleTerminalVisible,
            killTerminal
          );

          if (result) {
            setOutput((prev) => [
              ...prev,
              { command: cmd, response: result, path: currentPath },
            ]);
          } else if (commandName === "clear") {
            setOutput([]);
          }
        } else {
          const pageContent =
            pageLs["root"][
            currentPath as keyof (typeof pageLs)["root"]
            ] || pageLs["root"]["/projects/:name"];

          if (Array.isArray(pageContent)) {
            const targetFile = pageContent.find(
              (item): item is LsFileEntry =>
                item.name === commandName && item.type === "file"
            );

            if (targetFile) {
              if ("scrollId" in targetFile && targetFile.scrollId) {
                scrollIntoView(targetFile.scrollId);
                setOutput((prev) => [
                  ...prev,
                  {
                    command: cmd,
                    response: `Executing ${commandName}...`,
                    path: currentPath,
                  },
                ]);
              } else if (
                "clickSelector" in targetFile &&
                targetFile.clickSelector
              ) {
                const element = document.querySelector(
                  targetFile.clickSelector
                ) as HTMLElement;
                if (element) {
                  element.click();
                  setOutput((prev) => [
                    ...prev,
                    {
                      command: cmd,
                      response: `Executing ${commandName}...`,
                      path: currentPath,
                    },
                  ]);
                } else {
                  setOutput((prev) => [
                    ...prev,
                    {
                      command: cmd,
                      response: `<span class="error-message">Could not find element with selector: ${targetFile.clickSelector}</span>`,
                      path: currentPath,
                    },
                  ]);
                }
              }
              return;
            }
          }

          setOutput((prev) => [
            ...prev,
            {
              command: cmd,
              response: `<span class="error-message">Command not found: ${commandName}</span>`,
              path: currentPath,
            },
          ]);
        }
      } else {
        setOutput((prev) => [
          ...prev,
          {
            command: cmd,
            response: `<span class="error-message">${parsedResult.error}</span>`,
            path: currentPath,
          },
        ]);
      }
    },
    [
      contentRef,
      isAtBottom,
      killTerminal,
      location.pathname,
      navigate,
      scrollIntoView,
      toggleTerminalVisible,
    ]
  );

  const handleTabCompletion = useCallback(() => {
    const isFirstTab = !isTabbing;
    let currentSuggestions = suggestions;

    if (isFirstTab) {
      const [commandName, ...args] = command.trim().split(" ");
      const currentPath = location.pathname || "/";
      let pageContent =
        pageLs["root"][
        currentPath as keyof (typeof pageLs)["root"]
        ] || [];

      if (pageContent.length === 0 && currentPath.startsWith("/projects/")) {
        pageContent = pageLs["root"]["/projects/:name"];
      }

      let newSuggestions: string[] = [];
      const commandPart = commandName === "cd" ? args[0] || "" : command.trim();

      if (commandName === "cd") {
        newSuggestions = (pageContent as LsEntry[])
          .filter(
            (item) => item.type === "dir" && item.name.startsWith(commandPart)
          )
          .map((item) => item.name);
      } else {
        newSuggestions = (pageContent as LsEntry[])
          .filter(
            (item) => item.type === "file" && item.name.startsWith(commandPart)
          )
          .map((item) => item.name);
      }

      setSuggestions(newSuggestions);
      currentSuggestions = newSuggestions;
      setIsTabbing(true);
    }

    if (currentSuggestions.length === 0) return;

    const newIndex = isFirstTab
      ? 0
      : (suggestionIndex + 1) % currentSuggestions.length;

    const suggestion = currentSuggestions[newIndex];
    const [commandName] = command.trim().split(" ");

    let newCommand = suggestion;
    if (commandName === "cd") {
      newCommand = `cd ${suggestion}`;
    }

    setCommand(newCommand);
    setCursorPosition(newCommand.length);
    setSuggestionIndex(newIndex);
  }, [command, isTabbing, location.pathname, suggestionIndex, suggestions]);

  const handleInteractiveCommand = useCallback(async () => {
    if (!interactiveCommand || !interactivePrompt) return;

    const currentPath = location.pathname || "/";
    const { steps, formData, currentStep } = interactiveCommand;
    const currentField = steps[currentStep];
    const currentValue = command;

    setOutput((prev) => [
      ...prev,
      {
        command: "",
        response: `${interactivePrompt} ${currentValue}`,
        path: currentPath,
        isInteractivePrompt: true,
      },
    ]);

    const validationError = validateField(currentField, currentValue);

    if (validationError) {
      setOutput((prev) => [
        ...prev,
        {
          command: "",
          response: `<span class="error-message">${validationError}</span>`,
          path: currentPath,
          isInteractivePrompt: true,
        },
      ]);
      setInteractivePrompt(`Enter ${getDisplayFieldName(currentField)}:`);
      setCommand("");
      setCursorPosition(0);
      return;
    }

    const newFormData = { ...formData, [currentField]: currentValue };
    const nextStep = currentStep + 1;

    if (nextStep < steps.length) {
      const nextField = steps[nextStep];
      setInteractiveCommand({
        ...interactiveCommand,
        formData: newFormData,
        currentStep: nextStep,
      });
      setInteractivePrompt(`Enter ${getDisplayFieldName(nextField)}:`);
    } else {
      const finalFormData = {
        ...newFormData,
      } as unknown as Parameters<typeof submitMessageFromConsole>[0];
      const result = await submitMessageFromConsole(finalFormData);
      setOutput((prev) => [
        ...prev,
        {
          command: "",
          response: result,
          path: currentPath,
          isInteractivePrompt: true,
        },
      ]);
      setInteractiveCommand(null);
      setInteractivePrompt(null);
    }

    setCommand("");
    setCursorPosition(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [interactiveCommand, command, location.pathname, interactivePrompt]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!isActive) return;

      if (e.key !== "Tab") {
        setIsTabbing(false);
      }

      if (e.ctrlKey || e.metaKey) {
        if (
          e.key.toLowerCase() === "c" &&
          window.getSelection() &&
          window.getSelection()!.toString().length > 0
        ) {
          return;
        }
        if (e.key.toLowerCase() === "v") {
          return;
        }
        if (e.key.toLowerCase() === "a") {
          return;
        }
      }

      if (!e.key.startsWith("F")) {
        e.preventDefault();
      } else {
        return;
      }

      if (e.ctrlKey) {
        switch (e.key.toLowerCase()) {
          case "c":
            if (interactiveCommand) {
              setOutput((prev) => [
                ...prev,
                {
                  command: "",
                  response: `${interactivePrompt} ${command}^C`,
                  path: location.pathname || "/",
                  isInteractivePrompt: true,
                },
                {
                  command: "",
                  response: "write command cancelled.",
                  path: location.pathname || "/",
                  isInteractivePrompt: false,
                },
              ]);
              setInteractiveCommand(null);
              setInteractivePrompt(null);
              setCommand("");
              setCursorPosition(0);
            } else {
              setCommand("");
              setCursorPosition(0);
            }
            return;
          case "arrowleft": {
            const prevWordIndex = command
              .slice(0, cursorPosition)
              .trimEnd()
              .lastIndexOf(" ");
            setCursorPosition(prevWordIndex === -1 ? 0 : prevWordIndex + 1);
            return;
          }
          case "arrowright": {
            const nextWordIndex = command.indexOf(" ", cursorPosition + 1);
            setCursorPosition(
              nextWordIndex === -1 ? command.length : nextWordIndex + 1
            );
            return;
          }
          case "backspace":
            if (cursorPosition > 0) {
              const textBeforeCursor = command.slice(0, cursorPosition);
              const trimmedText = textBeforeCursor.trimEnd();
              const lastSpaceIndex = trimmedText.lastIndexOf(" ");
              const from = lastSpaceIndex === -1 ? 0 : lastSpaceIndex + 1;
              const newCommand =
                command.slice(0, from) + command.slice(cursorPosition);
              setCommand(newCommand);
              setCursorPosition(from);
            }
            return;
          case "delete": {
            const nextSpaceIndex = command.indexOf(" ", cursorPosition);
            const to = nextSpaceIndex === -1 ? command.length : nextSpaceIndex;
            const newCmd = command.slice(0, cursorPosition) + command.slice(to);
            setCommand(newCmd);
            return;
          }
          case "u":
            setCommand(command.slice(cursorPosition));
            setCursorPosition(0);
            return;
          case "k":
            setCommand(command.slice(0, cursorPosition));
            return;
          case "l":
            setOutput([]);
            return;
          case "e":
            setCursorPosition(command.length);
            return;
        }
      }

      switch (e.key) {
        case "Tab":
          e.preventDefault();
          if (!interactiveCommand) handleTabCompletion();
          break;
        case "ArrowUp":
          if (!interactiveCommand && historyIndex < history.length - 1) {
            const newHistoryIndex = historyIndex + 1;
            setHistoryIndex(newHistoryIndex);
            setCommand(history[newHistoryIndex]);
            setCursorPosition(history[newHistoryIndex].length);
          }
          break;
        case "ArrowDown":
          if (!interactiveCommand && historyIndex > 0) {
            const newHistoryIndex = historyIndex - 1;
            setHistoryIndex(newHistoryIndex);
            setCommand(history[newHistoryIndex]);
            setCursorPosition(history[newHistoryIndex].length);
          } else if (!interactiveCommand) {
            setHistoryIndex(-1);
            setCommand("");
            setCursorPosition(0);
          }
          break;
        case "ArrowLeft":
          if (cursorPosition > 0) {
            setCursorPosition(cursorPosition - 1);
          }
          break;
        case "ArrowRight":
          if (cursorPosition < command.length) {
            setCursorPosition(cursorPosition + 1);
          }
          break;
        case "Backspace":
          if (cursorPosition > 0) {
            const newCommand =
              command.slice(0, cursorPosition - 1) +
              command.slice(cursorPosition);
            setCommand(newCommand);
            setCursorPosition(cursorPosition - 1);
          }
          break;
        case "Delete":
          if (cursorPosition < command.length) {
            const newCommand =
              command.slice(0, cursorPosition) +
              command.slice(cursorPosition + 1);
            setCommand(newCommand);
          }
          break;
        case "Home":
          setCursorPosition(0);
          break;
        case "End":
          setCursorPosition(command.length);
          break;
        case "Enter":
          if (interactiveCommand) {
            handleInteractiveCommand();
          } else {
            if (command.trim() !== "") {
              if (history[0] !== command) {
                setHistory([command, ...history]);
              }
              executeCommand(command);
            }
            setCommand("");
            setCursorPosition(0);
            setHistoryIndex(-1);
          }
          break;
        default:
          if (e.key.length === 1 && !e.ctrlKey && !e.altKey && !e.metaKey) {
            const newCommand =
              command.slice(0, cursorPosition) +
              e.key +
              command.slice(cursorPosition);
            setCommand(newCommand);
            setCursorPosition(cursorPosition + 1);
          }
          break;
      }
    },
    [
      isActive,
      command,
      history,
      historyIndex,
      cursorPosition,
      executeCommand,
      handleTabCompletion,
      interactiveCommand,
      handleInteractiveCommand,
      location.pathname,
      interactivePrompt,
    ]
  );

  const activateConsole = () => setIsActive(true);

  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      if (!isActive) return;
      e.preventDefault();
      const pastedText = e.clipboardData?.getData("text") || "";
      if (pastedText) {
        const newCommand =
          command.slice(0, cursorPosition) +
          pastedText +
          command.slice(cursorPosition);
        setCommand(newCommand);
        setCursorPosition(cursorPosition + pastedText.length);
      }
    };

    window.addEventListener("paste", handlePaste);
    return () => {
      window.removeEventListener("paste", handlePaste);
    };
  }, [isActive, command, cursorPosition]);

  useEffect(() => {
    const contentEl = contentRef.current;
    if (!contentEl) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = contentEl;
      isAtBottom.current = scrollHeight - scrollTop <= clientHeight + 1;
    };

    const handleWheel = (e: WheelEvent) => {
      if (contentEl.contains(e.target as Node)) {
        e.stopPropagation();
      }
    };

    contentEl.addEventListener("scroll", handleScroll);
    contentEl.addEventListener("wheel", handleWheel);

    return () => {
      contentEl.removeEventListener("scroll", handleScroll);
      contentEl.removeEventListener("wheel", handleWheel);
    };
  }, [contentRef]);

  useEffect(() => {
    if (isAtBottom.current) {
      const contentEl = contentRef.current;
      if (contentEl) {
        contentEl.scrollTop = contentEl.scrollHeight;
      }
    }
  }, [output, contentRef]);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);

    const handleClickOutside = (event: MouseEvent) => {
      const consoleElement = document.getElementById("console");
      if (consoleElement && !consoleElement.contains(event.target as Node)) {
        setIsActive(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [handleKeyDown]);

  useEffect(() => {
    const consoleEl = consoleRef.current;
    if (!consoleEl) return;

    const dragger = consoleEl.querySelector(".console-dragger") as HTMLElement;
    if (!dragger) return;

    const handleMouseDown = (e: MouseEvent) => {
      e.preventDefault();
      const startY = e.clientY;
      const startHeight = consoleEl.offsetHeight;

      const handleMouseMove = (e: MouseEvent) => {
        const newHeight = startHeight - (e.clientY - startY);
        const maxHeight = window.innerHeight;
        const minHeight = 0;
        if (newHeight > minHeight && newHeight < maxHeight) {
          consoleEl.style.height = `${newHeight}px`;
        }
      };

      const handleMouseUp = () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };

      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    };

    dragger.addEventListener("mousedown", handleMouseDown);

    return () => {
      dragger.removeEventListener("mousedown", handleMouseDown);
    };
  }, [consoleRef]);

  return {
    command,
    cursorPosition,
    isActive,
    activateConsole,
    output,
    killTerminal,
    interactivePrompt,
  };
};
