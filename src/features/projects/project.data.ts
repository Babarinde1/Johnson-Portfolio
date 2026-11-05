export type ProjectStatus = "Live" | "Completed" | "Research" | "In Progress";
export type Project = {
  slug: string;
  title: string;
  category: string;
  status: ProjectStatus;
  summary: string;
  description: string;
  technologies: string[];
  featured: boolean;
  liveUrl?: string;
  note?: string;
  repositoryUrl?: string;
  coverImageUrl?: string;
};

export const projects: Project[] = [
  {
    slug: "oduduwa-ai",
    title: "Odùduwà AI",
    category: "Language AI",
    status: "Live",
    summary: "Language technology designed to make Yorùbá more accessible in digital spaces.",
    description: "A Yorùbá-focused language platform exploring conversational AI, translation, and tone-mark restoration while respecting cultural context.",
    technologies: ["NLP", "LLM APIs", "React"],
    featured: true,
    liveUrl: "https://oduduwaai.netlify.app",
    note: "Live at the link above. The product is still evolving, so the live site is the best guide to what is currently available."
  },
  {
    slug: "readly-ai",
    title: "READLY AI",
    category: "RAG & Knowledge Systems",
    status: "Completed",
    summary: "Ask questions about uploaded documents and trace answers back to source passages.",
    description: "A retrieval-augmented document assistant with an ingestion and retrieval pipeline for personal documents.",
    technologies: ["Python", "FastAPI", "FAISS", "RAG"],
    featured: true,
    note: "Project implementation includes document upload, vector retrieval, and citation-oriented answers. Public demo/repository links can be added when confirmed."
  },
  {
    slug: "automated-omr-evaluation",
    title: "Automated OMR Evaluation",
    category: "Computer Vision",
    status: "Research",
    summary: "A computer-vision workflow for detecting and evaluating marked answer sheets.",
    description: "An optical mark recognition project combining YOLO-based detection and image-processing techniques for answer-sheet evaluation.",
    technologies: ["YOLO", "OpenCV", "Image Processing"],
    featured: true,
    note: "Related publication: A Web-Based Automated OMR Evaluation System Using YOLO and Image Processing Techniques, International Journal of Engineering Research & Technology (IJERT), Vol. 14, Issue 12, December 2025."
  },
  {
    slug: "yoruba-tone-restoration",
    title: "Yorùbá Tone Restoration",
    category: "Natural Language Processing",
    status: "Research",
    summary: "Sequence-to-sequence experiments for restoring Yorùbá tone marks and diacritics.",
    description: "Research into restoring orthographic information that can be lost when Yorùbá text is written without tone marks and diacritics.",
    technologies: ["mT5", "Transformers", "Evaluation"],
    featured: true,
    note: "Experimental metrics should be published only with their evaluation split, metric definitions, and dataset context."
  },
  {
    slug: "jarvis-windows-assistant",
    title: "Jarvis Windows Assistant",
    category: "Developer Tools",
    status: "In Progress",
    summary: "A local-first voice assistant for speech input, approved desktop commands, and AI fallback.",
    description: "A Windows assistant architecture combining local speech recognition, text-to-speech, command routing, and an AI fallback for flexible requests.",
    technologies: ["Python", "Whisper", "Groq API", "Windows"],
    featured: false,
    note: "In development. Broad application launching and reliable arbitrary typing are not yet complete; this project is intentionally labelled as in progress."
  }
];
