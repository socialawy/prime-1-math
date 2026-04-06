import type { Chapter } from "../types/curriculum";

// Placeholder chapter metadata — activity data will be populated
// from textbook extraction (via NotebookLM). Only structure matters for now.

export const chapters: Chapter[] = [
  {
    id: "ch10",
    titleAr: "أشكال مختلفة",
    titleEn: "Different Shapes",
    icon: "🔷",
    color: "#9C27B0",
    lessons: [],
  },
  {
    id: "ch11",
    titleAr: "كيف نقارن؟",
    titleEn: "How to Compare?",
    icon: "⚖️",
    color: "#00BCD4",
    lessons: [],
    unlockAfter: "ch10",
  },
  {
    id: "ch12",
    titleAr: "الجمع بتكوين ١٠",
    titleEn: "Addition by making 10",
    icon: "➕",
    color: "#4CAF50",
    lessons: [],
    unlockAfter: "ch11",
  },
  {
    id: "ch13",
    titleAr: "الطرح باستخدام ١٠",
    titleEn: "Subtraction by using 10",
    icon: "➖",
    color: "#FF9800",
    lessons: [],
    unlockAfter: "ch12",
  },
  {
    id: "ch14",
    titleAr: "الآحاد والعشرات والمئات",
    titleEn: "Ones, Tens, and Hundreds",
    icon: "🔢",
    color: "#2196F3",
    lessons: [],
    unlockAfter: "ch13",
  },
  {
    id: "ch15",
    titleAr: "تكوين الأشكال",
    titleEn: "Making Shapes",
    icon: "🔺",
    color: "#E91E63",
    lessons: [],
    unlockAfter: "ch14",
  },
  {
    id: "ch16",
    titleAr: "كم الساعة؟",
    titleEn: "What Time is it?",
    icon: "🕐",
    color: "#795548",
    lessons: [],
    unlockAfter: "ch15",
  },
  {
    id: "ch17",
    titleAr: "الجمع والطرح",
    titleEn: "Addition and Subtraction",
    icon: "🧮",
    color: "#607D8B",
    lessons: [],
    unlockAfter: "ch16",
  },
];
