export interface ExperienceType {
  readonly company: string;
  readonly role: string;
  readonly type: "full-time" | "contract" | "internship" | "freelance";
  readonly startDate: string;
  readonly endDate: string;
  readonly location: string;
  readonly summary: string;
  readonly pullQuote: string;
  readonly highlights: {
    readonly title: string;
    readonly detail: string;
  }[];
  readonly stack: string[];
  readonly to: string;
  readonly current?: boolean;
}

export const experienceInfos: ExperienceType[] = [
  {
    company: "Centific",
    role: "Associate Software Engineer",
    type: "full-time",
    startDate: "Apr 2024",
    endDate: "Present",
    location: "Hyderabad, India",
    current: true,
    summary:
      "Spearheading Agentic AI Architectures and Cloud-Native Modernization. Driving adoption of LLM Ops and high-performance computing strategies.",
    pullQuote:
      "Spearheading next-gen Agentic AI Architectures that translate ambiguous challenges into production-grade systems delivering real-world value.",
    highlights: [
      {
        title: "Multimodal GenAI & LLM Ops",
        detail:
          "Engineered a High-Throughput Synthetic Data Generation (SDG) engine orchestrating Vision-Language Models (VLMs). Orchestrated distributed model inference and deployment on RunPod Serverless GPU infrastructure to generate structured neuro-symbolic datasets (ndjson) via scalable Image-to-Image / Text-to-Image synthesis.",
      },
      {
        title: "RLHF & Data Flywheels",
        detail:
          "Designed Automated HITL (Human-in-the-Loop) pipelines for Model Red-teaming and Adversarial Jailbreak robustness. Built an event-driven orchestrator to synchronize Label Studio and OneForma, enabling self-service RLHF data acquisition for SFT (Supervised Fine-Tuning).",
      },
      {
        title: "RAG & Semantic Intelligence",
        detail:
          "Developed a Context-Aware RAG system for Meeting Intelligence, utilizing Vector Embeddings and LLM orchestration to synthesize transcripts into actionable Minutes of Meeting (MoM). Authored internal Python SDKs to abstract complex inference logic, reducing developer friction.",
      },
      {
        title: "Cloud Modernization & Governance",
        detail:
          "Architected a Multi-Tenant Migration Platform (ASP.NET Core, Angular) facilitating Lift-and-Shift transformations. Embedded Policy-as-Code for SecOps compliance and real-time FinOps observability.",
      },
    ],
    stack: [
      "LangChain",
      "LangGraph",
      "RunPod",
      "Python",
      "AWS Lambda",
      "ASP.NET Core",
      "Angular",
      "Vector DBs",
    ],
    to: "centific",
  },
  {
    company: "Veratroniks",
    role: "Software Developer",
    type: "full-time",
    startDate: "Jul 2023",
    endDate: "Mar 2024",
    location: "Hyderabad, India",
    current: false,
    summary:
      "Solely architected and deployed VBOSS (Veratroniks Back Office Support System), an end-to-end ERP suite, leading the company's digital transformation.",
    pullQuote:
      "Solely architected and deployed an end-to-end ERP suite that became the backbone of daily operations — translating chaotic paper workflows into a robust, user-centric digital system.",
    highlights: [
      {
        title: "Paper-to-Digital Evolution",
        detail:
          "Systematized chaotic manual workflows (paper/Excel) into a fully automated project lifecycle tracker. Engineered the entire stack (React, Express, MySQL) to manage complex procurement and project timelines, eliminating operational bottlenecks.",
      },
      {
        title: "Air-Gapped Intranet Deployment",
        detail:
          "Designed and deployed a secure, local-first infrastructure on the company's internal network. Optimized for zero-latency performance in an offline environment, handling all DevOps responsibilities from server configuration to database maintenance.",
      },
      {
        title: "Solo-Developer Ownership",
        detail:
          "Owned the complete Software Development Lifecycle (SDLC), translating raw business requirements into a robust, user-centric interface that became the backbone of daily operations.",
      },
    ],
    stack: ["React", "Node.js", "Express", "MySQL", "CSS3"],
    to: "veratroniks",
  },
];
