export type Video = {
  id: string;
  title: string;
  channel: string;
  levelId: "b0" | "b1" | "i1" | "i2" | "adv" | "native";
  levelLabel: string;
  published: string; // YYYY-MM-DD
  premium?: boolean;
  thumbnail: string;
  tags?: string[];
  description?: string;
  youtubeId?: string;
};

export const videos: Video[] = [
  {
    id: "1",
    title: "Meet Elvira: 15 Weird Facts to Break the Ice",
    channel: "Comprehensible Russian",
    levelId: "i2",
    levelLabel: "Intermediate 2",
    published: "2025-07-29",
    premium: false,
    thumbnail:
      "https://images.unsplash.com/photo-1526318472351-c75fcf070305?q=80&w=1200&auto=format&fit=crop",
    tags: ["Society", "School", "Conversations"],
    description:
      "Natalia and Agustina explore Latin America's top universities—and how accessible they really are.",
    youtubeId: "UFPKTPsHBKk",
  },
  {
    id: "2",
    title: "Meet Elvira: 15 Weird Facts to Break the Ice",
    channel: "Comprehensible Russian",
    levelId: "i2",
    levelLabel: "Intermediate 2",
    published: "2025-07-29",
    premium: true,
    thumbnail:
      "https://images.unsplash.com/photo-1526318472351-c75fcf070305?q=80&w=1200&auto=format&fit=crop",
    youtubeId: "UFPKTPsHBKk",
  },
  {
    id: "3",
    title: "Meet Elvira: 15 Weird Facts to Break the Ice",
    channel: "Comprehensible Russian",
    levelId: "b1",
    levelLabel: "Beginner 1",
    published: "2025-07-29",
    premium: false,
    thumbnail:
      "https://images.unsplash.com/photo-1526318472351-c75fcf070305?q=80&w=1200&auto=format&fit=crop",
  },
  {
    id: "4",
    title: "Meet Elvira: 15 Weird Facts to Break the Ice",
    channel: "Comprehensible Russian",
    levelId: "adv",
    levelLabel: "Advanced",
    published: "2025-07-29",
    premium: true,
    thumbnail:
      "https://images.unsplash.com/photo-1526318472351-c75fcf070305?q=80&w=1200&auto=format&fit=crop",
  },
  {
    id: "5",
    title: "Meet Elvira: 15 Weird Facts to Break the Ice",
    channel: "Comprehensible Russian",
    levelId: "b0",
    levelLabel: "Beginner 0",
    published: "2025-07-29",
    premium: false,
    thumbnail:
      "https://images.unsplash.com/photo-1526318472351-c75fcf070305?q=80&w=1200&auto=format&fit=crop",
  },
  {
    id: "6",
    title: "Meet Elvira: 15 Weird Facts to Break the Ice",
    channel: "Comprehensible Russian",
    levelId: "native",
    levelLabel: "Native Content",
    published: "2025-07-29",
    premium: false,
    thumbnail:
      "https://images.unsplash.com/photo-1526318472351-c75fcf070305?q=80&w=1200&auto=format&fit=crop",
  },
];
