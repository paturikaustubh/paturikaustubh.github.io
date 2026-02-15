import { projectsInfos } from "../../ProjectsInfos";
import { socialLinks } from "../../socialLinks";

const angLt = "&lt;";
const angGt = "&gt;";

const globalCommands = [
  "help",
  "clear",
  "ls",
  "cd",
  "nav",
  "socials",
  "write",
  "exit",
];

const helpString = `Hello there! Using this CLI, you can controll this site. You can navigate through pages and do some other cool stuff...
Now, here are the list of available commands you can use:
${globalCommands.map((cmd) => `- ${cmd}`).join("\n")}`;

type CommandAction = (
  args: string[],
  navigate?: (path: string) => void,
  scrollIntoView?: (id: string) => void,
  toggleTerminalVisible?: () => void,
  killTerminal?: () => void
) => string | null;

export interface LsDirEntry {
  name: string;
  type: "dir";
  path: string;
}

export interface LsFileEntry {
  name: string;
  type: "file";
  scrollId?: string;
  clickSelector?: string;
}

export type LsEntry = LsDirEntry | LsFileEntry;

export function isLsFileEntry(item: LsEntry): item is LsFileEntry {
  return item.type === "file" && "scrollId" in item;
}

export function isLsDirEntry(item: LsEntry): item is LsDirEntry {
  return item.type === "dir" && "path" in item;
}

const helpCmd: CommandAction = (args) => {
  if (args.includes("--help")) {
    return "Seriously? You need help with the 'help' command? It's like asking for instructions on how to breathe.";
  }
  return helpString;
};

const clearCmd: CommandAction = (args) => {
  if (args.includes("--help")) {
    return "You want to clear the screen? Just close your eyes. It's not that hard.";
  }
  return null;
};

const lsCmd: CommandAction = (args) => {
  if (args.includes("--help")) {
    return "`ls`... for when you can't be bothered to remember what you just saw. Go on, type it.";
  }
  const currentPath = window.location.pathname;
  let itemsToDisplay: LsEntry[] = [];

  let routeContent =
    pageLs["root"][currentPath as keyof (typeof pageLs)["root"]];

  if (!routeContent && currentPath.startsWith("/projects/")) {
    routeContent = pageLs["root"]["/projects/:name"];
  }

  if (routeContent) {
    itemsToDisplay = Array.isArray(routeContent)
      ? routeContent
      : [routeContent];
  }

  let content = "";
  itemsToDisplay.forEach((item) => {
    if (item.type === "dir") {
      content += `<span class="ls-dir">${item.name}</span>  `;
    } else if (item.type === "file") {
      content += `<span class="ls-file">${item.name}</span>  `;
    }
  });

  return content;
};

const cdCmd: CommandAction = (args, navigate) => {
  if (args.includes("--help")) {
    return "Ah, `cd`. The command for people who are never happy where they are. Just pick a directory and go.";
  }
  if (!navigate) return "Navigation not available.";
  if (args.length === 0)
    return `I wonder where a directory takes me...\n\nUsage: cd ${angLt}directory${angGt}`;

  const target = args[0];
  const currentPath = window.location.pathname || "/";

  if (target.startsWith("..")) {
    if (currentPath === "/")
      return `<span class="error-message">cd: No such directory: ${target}</span>`;

    const pathSegments = currentPath.split("/").filter((segment) => segment);
    const upLevels = (target.match(/\.\./g) || []).length;

    if (upLevels > pathSegments.length) {
      return `<span class="error-message">cd: No such directory: ${target}</span>`;
    }

    const newPathSegments = pathSegments.slice(0, -upLevels);
    const newPath = `/${newPathSegments.join("/")}`;
    navigate(`${newPath}`);
    return `Navigating to ${newPath}`;
  }

  const currentDirContent =
    pageLs["root"][currentPath as keyof (typeof pageLs)["root"]];

  if (Array.isArray(currentDirContent)) {
    const targetItem = currentDirContent.find(
      (item): item is LsDirEntry => item.name === target && item.type === "dir"
    );
    if (targetItem && isLsDirEntry(targetItem) && targetItem.path) {
      navigate(`${targetItem.path}`);
      return `Navigating to ${targetItem.path}`;
    }
  }
  return `<span class="error-message">cd: No such directory: ${target}</span>`;
};

const exitCmd: CommandAction = (
  args,
  _navigate,
  _scrollIntoView,
  killTerminal
) => {
  if (args.includes("--help")) {
    return "Want to 'exit'? Just press the big 'X'. Or are you too good for that?";
  }
  if (killTerminal) {
    killTerminal();
  }
  return null;
};

const navCmd: CommandAction = (args) => {
  const navMapping: { [key: string]: string } = {
    home: "nav-home",
    projects: "nav-projects",
    resume: "nav-resume",
    "contact-me": "nav-contact-me",
  };

  if (args.length === 0 || args.includes("--help")) {
    const availableDestinations = Object.keys(navMapping);
    return `Control the nav bar with this command!\n\nUsage: nav ${angLt}destination${angGt}\n\nAvailable destinations:\n${availableDestinations
      .map((dest) => `- ${dest}`)
      .join("\n")}`;
  }

  const destination = args[0].toLowerCase();
  const testId = navMapping[destination];
  if (!testId) {
    return `<span class="error-message">Invalid navigation destination: ${destination}</span>`;
  }

  const element = document.querySelector(
    `[data-testid="${testId}"]`
  ) as HTMLElement;
  if (element) {
    element.click();
    return `Navigating to ${destination}...`;
  } else {
    return `<span class="error-message">Could not find navigation element for: ${destination}</span>`;
  }
};

const socialsCmd: CommandAction = (args) => {
  if (args.length < 2 || args.includes("--help")) {
    return `Get my social links or directly redirect to them!\n\nUsage: socials [flag] ${angLt}social_name${angGt}\n\nFlags:\n  -g, --get-link    Get the social media link\n  -r, --redirect    Redirect to the social media page\n\nAvailable socials:\n${socialLinks
      .map(({ id }) => `- ${id}`)
      .join("\n")}`;
  }

  const flag = args[0];
  const socialName = args[1].toLowerCase();
  const social = socialLinks.find(({ id }) => id === socialName);

  if (!social) {
    return `<span class="error-message">Invalid social media name: ${socialName}</span>`;
  }

  if (["-g", "--get-link"].includes(flag)) {
    return `<a href="${social.url}" target="_blank" rel="noopener noreferrer" class="console-link">${social.url}</a>`;
  } else if (["-r", "--redirect"].includes(flag)) {
    const element = document.getElementById(`social-${socialName}`);
    if (element) {
      element.click();
      return `Redirecting to ${socialName}...`;
    } else {
      return `<span class="error-message">Could not find social link for: ${socialName}</span>`;
    }
  } else {
    return `<span class="error-message">Invalid flag: ${flag}. Use <span class="console-flag">-g</span> to get the link or <span class="console-flag">-r</span> to redirect.</span>`;
  }
};

const writeCmd: CommandAction = (args) => {
  if (args.includes("--help")) {
    return `Send a message to me directly from the console!\n\nUsage: write [flags]\n\nFlags:\n  -f, --first-name    Your first name\n  -l, --last-name     Your last name\n  -e, --email         Your email\n  -m, --message       Your message\n\nIf no flags are provided, you will be prompted for each field.`;
  }
  return null;
};

export const cmdActions: Record<string, CommandAction> = {
  help: helpCmd,
  clear: clearCmd,
  ls: lsCmd,
  cd: cdCmd,
  exit: exitCmd,
  nav: navCmd,
  socials: socialsCmd,
  write: writeCmd,
};

export const pageLs: {
  "root": {
    "/": (LsFileEntry | LsDirEntry)[];
    "/projects": LsDirEntry[];
    "/projects/:name": LsFileEntry[];
    "/more-about-me": LsFileEntry[];
  };
} = {
  "root": {
    "/": [
      {
        name: "about-me.sh",
        type: "file",
        scrollId: "about-me",
      },
      {
        name: "tech-stack.sh",
        type: "file",
        scrollId: "tech-stack",
      },
      {
        name: "projects.sh",
        type: "file",
        scrollId: "projects",
      },
      {
        name: "more-about-me",
        type: "dir",
        path: "/more-about-me",
      },
      ...(projectsInfos.slice(0, 4).map((project) => ({
        name: project.title.toLowerCase().split(" ").join("-"),
        type: "dir",
        path: `/projects/${project.to}`,
      })) as LsDirEntry[]),
      {
        name: "all-projects",
        type: "dir",
        path: "/projects",
      },
    ],
    "/projects": projectsInfos.map((project) => ({
      name: project.title.toLowerCase().split(" ").join("-"),
      type: "dir",
      path: `/projects/${project.to}`,
    })),
    "/projects/:name": [
      {
        name: "previous-project.sh",
        type: "file",
        clickSelector: "#prev-project-link",
      },
      {
        name: "next-project.sh",
        type: "file",
        clickSelector: "#next-project-link",
      },
    ],
    "/more-about-me": [
      {
        name: "read-more.sh",
        type: "file",
        clickSelector: "#read-more-button",
      },
    ],
  },
};
