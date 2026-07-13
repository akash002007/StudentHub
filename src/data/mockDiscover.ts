export interface TrendingCommunity {
  id: string;
  name: string;
  description: string;
  memberCount: number;
  tags: string[];
  avatars: string[];
  activeDiscussion: string;
}

export interface UpcomingEvent {
  id: string;
  title: string;
  speaker: string;
  speakerRole: string;
  speakerAvatar: string;
  date: string;
  time: string;
  attendees: number;
  tags: string[];
}

export interface Recommendation {
  id: string;
  type: 'internship' | 'alumni' | 'community' | 'event';
  title: string;
  subtitle: string;
  description: string;
  imageUrl?: string;
  matchScore: number; // based on Career DNA
  matchReason: string;
  tags: string[];
  actionText: string;
}

export const mockTrendingCommunities: TrendingCommunity[] = [
  {
    id: "com_1",
    name: "AI & ML Enthusiasts",
    description: "Discussing the latest in generative AI, neural networks, and prompt engineering.",
    memberCount: 1420,
    tags: ["Artificial Intelligence", "Machine Learning", "Python"],
    avatars: [
      "https://api.dicebear.com/9.x/avataaars/svg?seed=ai1",
      "https://api.dicebear.com/9.x/avataaars/svg?seed=ai2",
      "https://api.dicebear.com/9.x/avataaars/svg?seed=ai3"
    ],
    activeDiscussion: "How are you using Copilot for your assignments?"
  },
  {
    id: "com_2",
    name: "2026 Grad PMs",
    description: "A space for aspiring Product Managers graduating in 2026. Resume reviews and interview prep.",
    memberCount: 850,
    tags: ["Product Management", "Class of 2026", "Interviews"],
    avatars: [
      "https://api.dicebear.com/9.x/avataaars/svg?seed=pm1",
      "https://api.dicebear.com/9.x/avataaars/svg?seed=pm2",
      "https://api.dicebear.com/9.x/avataaars/svg?seed=pm3"
    ],
    activeDiscussion: "Favorite PM frameworks?"
  },
  {
    id: "com_3",
    name: "Frontend Innovators",
    description: "Pushing the boundaries of web UI with React, Tailwind, and Three.js.",
    memberCount: 2100,
    tags: ["Frontend", "React", "Design"],
    avatars: [
      "https://api.dicebear.com/9.x/avataaars/svg?seed=fe1",
      "https://api.dicebear.com/9.x/avataaars/svg?seed=fe2",
      "https://api.dicebear.com/9.x/avataaars/svg?seed=fe3"
    ],
    activeDiscussion: "Thoughts on React Server Components?"
  }
];

export const mockUpcomingEvents: UpcomingEvent[] = [
  {
    id: "evt_1",
    title: "Breaking into Big Tech as a Junior",
    speaker: "Sarah Chen",
    speakerRole: "Senior Software Engineer @ Google",
    speakerAvatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=Sarah",
    date: "Oct 15",
    time: "5:00 PM EST",
    attendees: 342,
    tags: ["Engineering", "Career Advice", "Q&A"]
  },
  {
    id: "evt_2",
    title: "Portfolio Review Workshop",
    speaker: "David Kim",
    speakerRole: "Product Design Lead @ Figma",
    speakerAvatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=David",
    date: "Oct 18",
    time: "2:00 PM EST",
    attendees: 128,
    tags: ["Design", "Workshop", "Portfolio"]
  },
  {
    id: "evt_3",
    title: "Mastering the PM Case Interview",
    speaker: "Elena Rodriguez",
    speakerRole: "Product Manager @ Stripe",
    speakerAvatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=Elena",
    date: "Oct 22",
    time: "6:30 PM EST",
    attendees: 215,
    tags: ["Product", "Interview Prep"]
  }
];

export const mockRecommendations: Recommendation[] = [
  {
    id: "rec_1",
    type: "internship",
    title: "Frontend Engineering Intern",
    subtitle: "Vercel • San Francisco (Hybrid)",
    description: "Build the future of the web with Next.js and React. Looking for students with a strong grasp of modern web technologies.",
    matchScore: 94,
    matchReason: "Matches your high proficiency in React and interest in frontend infrastructure.",
    tags: ["React", "Next.js", "Summer 2026"],
    actionText: "View Internship"
  },
  {
    id: "rec_2",
    type: "alumni",
    title: "Alex Johnson",
    subtitle: "Frontend Engineer @ Vercel",
    description: "Alex is an alumni who transitioned from a similar major and is currently offering mentorship for frontend roles.",
    imageUrl: "https://api.dicebear.com/9.x/avataaars/svg?seed=Alex",
    matchScore: 88,
    matchReason: "Works at a company you're matched with and shares your React skill set.",
    tags: ["Mentorship Available", "Frontend"],
    actionText: "Connect"
  },
  {
    id: "rec_3",
    type: "community",
    title: "Design Systems Hub",
    subtitle: "450 Active Members",
    description: "A community focused on building, scaling, and maintaining robust design systems in React and Figma.",
    matchScore: 85,
    matchReason: "Based on your recent portfolio project 'Dynamic Design Studio'.",
    tags: ["Design Systems", "UI/UX"],
    actionText: "Join Community"
  },
  {
    id: "rec_4",
    type: "event",
    title: "React Server Components AMA",
    subtitle: "Hosted by Next.js Core Team",
    description: "Join us for an open AMA discussing the new paradigms of RSC and how they impact application architecture.",
    matchScore: 91,
    matchReason: "Highly relevant to your React skills and career goals.",
    tags: ["AMA", "React", "Architecture"],
    actionText: "Register"
  }
];
