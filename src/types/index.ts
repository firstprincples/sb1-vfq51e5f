export interface ChatMessage {
  id: string;
  content: string;
  sender: 'user' | 'assistant';
  timestamp: number;
  isThinking?: boolean;
}

export interface Chat {
  id: string;
  title: string;
  subtitle: string;
  messages: ChatMessage[];
  createdAt: number;
  initialMessage?: string;
}

export interface File {
  id: string;
  name: string;
  content: string;
  type: string;
  uploadedAt: number;
}

export interface Syllabus {
  id: string;
  grade: string;
  subject: string;
  instructions: string[];
  files: File[];
  chats: Chat[];
}

export interface Memory {
  id: string;
  type: 'short' | 'mid' | 'long';
  content: string;
  timestamp: number;
  source: 'syllabus' | 'general';
  context?: string;
}

export interface Skill {
  id: string;
  name: string;
  status: 'struggling' | 'strong' | 'recent';
  lastUpdated: number;
  score: number;
  attempts: number;
  successRate: number;
}

export interface MultipleChoice {
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

export interface QuizQuestion {
  questionText: string;
  options: string[];
  correctOptionIndex: number;
}

export interface Quiz {
  Type: string;
  quizType: string;
  quizTitle: string;
  questions: QuizQuestion[];
}

export interface FeedbackOption {
  label: string;
  value: string;
}

export interface Feedback {
  type: 'feedback';
  message: string;
  options: FeedbackOption[];
}

export interface OptionsChoice {
  label: string;
  value: string;
}

export interface Options {
  type: 'options';
  message: string;
  options: OptionsChoice[];
}

export interface QuizAction {
  label: string;
  value: string;
}

export interface QuizInteractive {
  type: 'quiz';
  question: string;
  options: OptionsChoice[];
  actions?: QuizAction[];
}

// Add MathJax type definitions
declare global {
  interface Window {
    MathJax: {
      typesetPromise?: (elements?: HTMLElement[]) => Promise<void>;
      typeset?: (elements?: HTMLElement[]) => void;
      typesetClear?: (elements?: HTMLElement[]) => void;
      startup?: {
        defaultPageReady: () => Promise<void>;
      };
      tex?: {
        inlineMath: string[][];
      };
      options?: {
        enableMenu: boolean;
      };
      svg?: {
        fontCache: string;
      };
    };
    renderMathInElement?: (element: HTMLElement, options: any) => void;
  }
}