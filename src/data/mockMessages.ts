export type ParticipantType = 'student' | 'recruiter' | 'alumni';

export interface ParticipantProfile {
  id: string;
  name: string;
  avatar: string;
  type: ParticipantType;
  headline?: string;
  company?: string;
  university?: string;
  gradYear?: string;
  online: boolean;
  lastSeen?: string;
  // Student specific
  careerDNA?: string;
  skills?: string[];
  projects?: { title: string; url?: string }[];
  // Recruiter specific
  hiringStage?: string;
  internships?: string[];
  // Alumni specific
  mentorshipInfo?: string;
}

export type MessageType = 'text' | 'image' | 'pdf' | 'resume' | 'portfolio' | 'github' | 'code' | 'invite' | 'voice';

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  type: MessageType;
  timestamp: string;
  status: 'sent' | 'delivered' | 'read';
  metadata?: Record<string, unknown>;
}

export interface Conversation {
  id: string;
  participants: ParticipantProfile[];
  lastMessage?: Message;
  unreadCount: number;
  pinned: boolean;
  archived: boolean;
  updatedAt: string;
}

export const mockParticipants: Record<string, ParticipantProfile> = {
  'u1': {
    id: 'u1',
    name: 'Alex Johnson',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
    type: 'student',
    headline: 'Computer Science @ Stanford',
    university: 'Stanford University',
    gradYear: '2025',
    online: true,
    careerDNA: 'Frontend Innovator',
    skills: ['React', 'TypeScript', 'Framer Motion'],
    projects: [{ title: 'StudentHub Mobile' }, { title: 'React UI Library' }]
  },
  'u2': {
    id: 'u2',
    name: 'Sarah Chen',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
    type: 'recruiter',
    headline: 'Technical Recruiter @ Google',
    company: 'Google',
    online: false,
    lastSeen: '2 hours ago',
    hiringStage: 'Interviewing for Summer 2026',
    internships: ['Software Engineering Intern', 'UX Design Intern']
  },
  'u3': {
    id: 'u3',
    name: 'David Kim',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=David',
    type: 'alumni',
    headline: 'Senior Engineer @ Stripe',
    company: 'Stripe',
    university: 'MIT',
    gradYear: '2020',
    online: true,
    mentorshipInfo: 'Available for resume reviews and mock interviews.'
  }
};

export const currentUser: ParticipantProfile = {
  id: 'me',
  name: 'Jane Doe',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jane',
  type: 'student',
  online: true
};

export const mockConversations: Conversation[] = [
  {
    id: 'c1',
    participants: [mockParticipants['u2']],
    unreadCount: 2,
    pinned: true,
    archived: false,
    updatedAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    lastMessage: {
      id: 'm1',
      conversationId: 'c1',
      senderId: 'u2',
      content: 'We would love to schedule an interview with you next week.',
      type: 'text',
      timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
      status: 'delivered'
    }
  },
  {
    id: 'c2',
    participants: [mockParticipants['u3']],
    unreadCount: 0,
    pinned: false,
    archived: false,
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    lastMessage: {
      id: 'm2',
      conversationId: 'c2',
      senderId: 'me',
      content: 'Thanks for the resume review, David!',
      type: 'text',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
      status: 'read'
    }
  },
  {
    id: 'c3',
    participants: [mockParticipants['u1']],
    unreadCount: 0,
    pinned: false,
    archived: false,
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    lastMessage: {
      id: 'm3',
      conversationId: 'c3',
      senderId: 'u1',
      content: 'Did you check out the new Next.js features?',
      type: 'text',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
      status: 'read'
    }
  }
];

export const mockMessageHistory: Record<string, Message[]> = {
  'c1': [
    {
      id: 'm1_0',
      conversationId: 'c1',
      senderId: 'u2',
      content: 'Hi Jane, we loved your recent project on GitHub.',
      type: 'text',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
      status: 'read'
    },
    {
      id: 'm1_1',
      conversationId: 'c1',
      senderId: 'me',
      content: 'Thank you Sarah! I really enjoyed building it.',
      type: 'text',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 23).toISOString(),
      status: 'read'
    },
    {
      id: 'm1',
      conversationId: 'c1',
      senderId: 'u2',
      content: 'We would love to schedule an interview with you next week.',
      type: 'text',
      timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
      status: 'delivered'
    }
  ],
  'c2': [
    {
      id: 'm2_0',
      conversationId: 'c2',
      senderId: 'me',
      content: 'Hi David, could you review my updated resume?',
      type: 'text',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
      status: 'read'
    },
    {
      id: 'm2_1',
      conversationId: 'c2',
      senderId: 'me',
      content: 'resume_v2.pdf',
      type: 'resume',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48 + 1000).toISOString(),
      status: 'read',
      metadata: { fileSize: '1.2MB' }
    },
    {
      id: 'm2_2',
      conversationId: 'c2',
      senderId: 'u3',
      content: 'Looks solid! Maybe highlight your React experience more.',
      type: 'text',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 25).toISOString(),
      status: 'read'
    },
    {
      id: 'm2',
      conversationId: 'c2',
      senderId: 'me',
      content: 'Thanks for the resume review, David!',
      type: 'text',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
      status: 'read'
    }
  ],
  'c3': [
    {
      id: 'm3_0',
      conversationId: 'c3',
      senderId: 'me',
      content: 'Hey Alex, are we still meeting for the hackathon planning?',
      type: 'text',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 50).toISOString(),
      status: 'read'
    },
    {
      id: 'm3',
      conversationId: 'c3',
      senderId: 'u1',
      content: 'Did you check out the new Next.js features?',
      type: 'text',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
      status: 'read'
    }
  ]
};
