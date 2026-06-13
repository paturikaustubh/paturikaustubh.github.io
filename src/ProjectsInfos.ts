export interface ProjectDetailsType {
  readonly title: string;
  readonly desc: string;
  readonly img: string;
  readonly responsive: boolean;
  readonly to: string;
  repo: string | null;
  readonly live?: string;
  /** GitHub "owner/repo" slug — when set, project page fetches and renders
   *  the repo README instead of `desc`. Photos + video are unchanged. */
  readonly readmeRepo?: string;
}

export const projectsInfos: ProjectDetailsType[] = [
  {
    title: "PyScope",
    desc: "PyScope is your new best friend for writing Python code in VS Code. It highlights code blocks (like functions, loops, and conditionals) with beautiful background colors, making it super easy to see where each block starts and ends. No more squinting at indentation! 👀",
    img: "PyScope",
    responsive: false,
    repo: "https://github.com/paturikaustubh/py-scope",
    to: "pyscope",
    readmeRepo: "paturikaustubh/py-scope",
  },
  {
    title: "VBOSS",
    desc: `VBOSS (Veratroniks Back Office Support System) is a web application for Veratroniks which helps them to keep a track of their projects from the Enquiry stage to final stage. This was built to reduce the manual effort and have a structured format to store the data and have a much simpler approach to view the status of each project.`,
    img: "VBOSS",
    responsive: true,
    repo: null,
    to: "vboss",
  },
  {
    title: "Exam Branch Portal",
    desc: `Built for my college's exam branch, this web app helps exam branch staff and students by making payment for exam fee much easier and simpler. This significantly reduced the total time from minimum of 15 min to maximum of 5 min. This application even records the data of the student's academic performances and the exams that they have registered for. All the information can be accessed right from the application itself.`,
    img: "Exam Branch Portal",
    responsive: true,
    repo: "https://github.com/paturikaustubh/ExamBranch2.0-Client",
    to: "exam-branch-portal",
  },
  {
    title: "FlikiPedia",
    desc: "FlikiPedia is an IMDb clone app where the users can view details about their favourite movie(s)/web series all at one place. All the data is fetched from TMDB (using their API endpoints) for a reliable and genuine information.",
    img: "FlikiPedia",
    responsive: true,
    repo: "https://github.com/paturikaustubh/flikipedia",
    to: "flikipedia",
    live: "https://paturikaustubh.github.io/flikipedia/",
  },
  {
    title: "Wok of Fame",
    desc: "This is a website idea built for a restraunt Wok of Fame. Here the customers can order their favourite food item from the restraunt directly from the app, which will be home delivered to them. This application also allows the customers to reserve/pre-book a table for a specific date and time. They can also place an order for the items they'd want to have when they arrive at the restraunt.",
    img: "Wok of Fame",
    responsive: true,
    repo: "https://github.com/paturikaustubh/wok-of-fame",
    to: "wok-of-fame",
    live: "https://paturikaustubh.github.io/wok-of-fame/",
  },
  {
    title: "React Carousel",
    desc: "This is a simple yet unique carousel built in React for showing off your images in your/any website. It's unique UX differentiates it from most of the carousels out there.",
    img: "Carousel",
    responsive: true,
    repo: "https://github.com/paturikaustubh/react-carousel",
    to: "react-carousel",
    live: "https://paturikaustubh.github.io/react-carousel/",
  },
];
