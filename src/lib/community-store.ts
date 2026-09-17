import {
  Community,
  CommunityEvent,
  CommunityAnnouncement,
  CommunityOpportunity,
  CommunityAchievement,
  CommunityJoinRequest,
  CommunityAuditLog,
  CommunityPost,
  StudentProfile,
} from "@/types";

/* -------------------------------------------------------------------------- */
/* Structured Initial Communities Dataset                                    */
/* -------------------------------------------------------------------------- */

export const structuredMockCommunities: Community[] = [
  {
    id: "comm_stanford_ai",
    name: "Stanford AI & Machine Learning Society",
    slug: "stanford-ai-society",
    category: "AI & ML",
    type: "Student Society",
    domain: "AI / ML",
    institution: "Stanford University",
    university: "Stanford University",
    location: "Stanford, CA (Hybrid)",
    city: "Stanford",
    state: "California",
    foundedYear: 2021,
    status: "ACTIVE",
    isVerified: true,
    verificationDetails: {
      verifiedBy: "StudentHub Institutional Registrar",
      verifiedAt: "2026-01-15T10:00:00Z",
      verificationReason: "Official recognized student technical society chartered by Stanford School of Engineering.",
    },
    membershipType: "APPLICATION_REQUIRED",
    myMembershipStatus: "MEMBER",
    myRole: "MEMBER",
    description:
      "Premier university society focusing on frontier foundation models, mechanistic interpretability, Kaggle grandmaster tracks, and applied machine learning research.",
    icon: "Brain",
    bannerColor: "from-blue-600/30 to-indigo-600/30",
    membersCount: 1420,
    activeDiscussions: 84,
    isJoined: true,
    eligibilityCriteria: {
      allowedDegrees: ["B.Tech", "B.S.", "B.E.", "M.S.", "M.Tech", "Ph.D."],
      allowedBranches: ["Computer Science", "Artificial Intelligence", "Data Science", "Electrical Engineering", "Mathematics"],
      allowedYears: ["1st Year", "2nd Year", "3rd Year", "4th Year", "Graduate"],
      minCgpa: 3.2,
      requiresInstitutionalVerification: true,
      allowedUniversities: ["Stanford University", "UC Berkeley", "MIT", "Any Verified University"],
      requiredSkills: ["Python", "Machine Learning Basics"],
      summary: "Open to verified undergraduate and graduate students in CS, AI, Math, and allied engineering with Python proficiency.",
    },
    activityMetrics: {
      activityLevel: "VERY_ACTIVE",
      projectsThisMonth: 8,
      eventsThisMonth: 4,
      activeMembersCount: 420,
      opportunitiesCount: 5,
    },
    events: [
      {
        id: "evt_ai_1",
        communityId: "comm_stanford_ai",
        communityName: "Stanford AI & Machine Learning Society",
        title: "Frontier LLM Fine-Tuning & Quantization Workshop",
        description:
          "Hands-on lab deploying LoRA, QLoRA, and vLLM on local H100 clusters with distributed checkpoint synchronization.",
        eventType: "Workshop",
        date: "Sept 28, 2026",
        time: "18:00 - 21:00 PST",
        mode: "Hybrid",
        location: "Gates Computer Science Building, Room 104",
        eligibility: "Verified Society Members",
        capacity: 120,
        registeredCount: 98,
        isRegistered: true,
      },
      {
        id: "evt_ai_2",
        communityId: "comm_stanford_ai",
        communityName: "Stanford AI & Machine Learning Society",
        title: "Bay Area Autumn Student AI Hackathon 2026",
        description:
          "48-hour hardware-accelerated hackathon focusing on autonomous multimodal agents and verifiable reasoning pipelines.",
        eventType: "Hackathon",
        date: "Oct 12-14, 2026",
        time: "All Weekend",
        mode: "Hybrid",
        location: "Huang Engineering Center",
        eligibility: "Open to Verified College Students",
        capacity: 350,
        registeredCount: 284,
        isRegistered: false,
      },
    ],
    announcements: [
      {
        id: "ann_ai_1",
        communityId: "comm_stanford_ai",
        title: "Applications Open: Fall 2026 AI Research Cohort",
        content:
          "We are shortlisting 20 students to collaborate with faculty labs on neural retrieval benchmarks. Submissions close Oct 5.",
        type: "OPPORTUNITY",
        postedAt: "3 hours ago",
        postedBy: "Dr. Evelyn Vance (Faculty Advisor)",
        pinned: true,
      },
      {
        id: "ann_ai_2",
        communityId: "comm_stanford_ai",
        title: "Compute Cluster Allocation Upgrade (vLLM Nodes Available)",
        content:
          "All verified members now have 40 hours of shared compute on the society's server rack. Access keys in member settings.",
        type: "IMPORTANT",
        postedAt: "Yesterday",
        postedBy: "Kavya Patel (Technical Lead)",
      },
    ],
    opportunities: [
      {
        id: "opp_ai_1",
        communityId: "comm_stanford_ai",
        communityName: "Stanford AI & Machine Learning Society",
        title: "Autonomous Agent Research Fellow (Direct Lab Referral)",
        type: "PROJECT",
        openPositions: 4,
        deadline: "Oct 10, 2026",
        company: "Stanford AI Lab / HAI",
        description: "Contribute to open benchmark suites evaluating tool-use reliability in open-weights reasoning LLMs.",
        eligibility: "Member with PyTorch & Python evidence",
      },
    ],
    leadership: [
      {
        id: "ldr_1",
        name: "Arjun Mehta",
        role: "President",
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
        headline: "CS Senior • Generative Reasoning Researcher",
      },
      {
        id: "ldr_2",
        name: "Kavya Patel",
        role: "Technical Lead",
        avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80",
        headline: "M.S. AI • Former SWE Intern @ Anthropic",
      },
    ],
    achievements: [
      {
        id: "ach_ai_1",
        communityId: "comm_stanford_ai",
        communityName: "Stanford AI & Machine Learning Society",
        title: "NeurIPS Student Challenge 1st Place",
        type: "HACKATHON_WINNER",
        recipientName: "Alex Rivera",
        awardedAt: "Aug 2026",
        evidenceSignal: "Verified Competitive AI Award (Top 1%)",
        isClaimedToCareerDNA: true,
      },
    ],
    joinRequests: [],
    auditTrail: [
      {
        id: "aud_ai_1",
        communityId: "comm_stanford_ai",
        actor: "StudentHub Institutional Registrar",
        action: "Community Verified & Chartered",
        timestamp: "2026-01-15T10:00:00Z",
        details: "Verified faculty charter and university authorization.",
      },
    ],
    posts: [],
  },
  {
    id: "comm_berkeley_web",
    name: "Berkeley Full-Stack & Systems Guild",
    slug: "berkeley-fullstack-systems",
    category: "Web Development",
    type: "Developer Community",
    domain: "Software Development",
    institution: "UC Berkeley",
    university: "UC Berkeley",
    location: "Berkeley, CA",
    city: "Berkeley",
    state: "California",
    foundedYear: 2020,
    status: "ACTIVE",
    isVerified: true,
    verificationDetails: {
      verifiedBy: "StudentHub Engineering Verification",
      verifiedAt: "2026-01-20T14:30:00Z",
      verificationReason: "Associated with ASUC and student engineering governance.",
    },
    membershipType: "OPEN",
    myMembershipStatus: "MEMBER",
    myRole: "MEMBER",
    description:
      "Focusing on high-throughput backend architecture, TypeScript ecosystems, Next.js, Rust microservices, and modern cloud deployment patterns.",
    icon: "Code2",
    bannerColor: "from-cyan-600/30 to-blue-600/30",
    membersCount: 2150,
    activeDiscussions: 130,
    isJoined: true,
    eligibilityCriteria: {
      allowedDegrees: ["Any"],
      allowedBranches: ["Any"],
      allowedYears: ["Any"],
      requiresInstitutionalVerification: true,
      summary: "Open to all verified college students with an active GitHub portfolio or engineering background.",
    },
    activityMetrics: {
      activityLevel: "VERY_ACTIVE",
      projectsThisMonth: 12,
      eventsThisMonth: 3,
      activeMembersCount: 650,
      opportunitiesCount: 6,
    },
    events: [
      {
        id: "evt_web_1",
        communityId: "comm_berkeley_web",
        communityName: "Berkeley Full-Stack & Systems Guild",
        title: "Distributed Web Systems Architecture & Load Benchmarking",
        description: "Simulating 50k requests/sec across clustered Kubernetes nodes and analyzing caching bottlenecks.",
        eventType: "Technical Session",
        date: "Oct 02, 2026",
        time: "17:00 - 19:30 PST",
        mode: "Virtual",
        location: "Zoom & Discord Live Stream",
        eligibility: "All Members",
        capacity: 500,
        registeredCount: 312,
        isRegistered: true,
      },
    ],
    announcements: [
      {
        id: "ann_web_1",
        communityId: "comm_berkeley_web",
        title: "Open Source Contributor Sprint: 8 Production Repositories",
        content: "Join our weekend sprint triaging issues and submitting PRs to high-profile developer tools.",
        type: "EVENT",
        postedAt: "Yesterday",
        postedBy: "Marcus Thorne (Guild Lead)",
      },
    ],
    opportunities: [
      {
        id: "opp_web_1",
        communityId: "comm_berkeley_web",
        communityName: "Berkeley Full-Stack & Systems Guild",
        title: "Frontend Engineering Intern (Sponsored Referral Track)",
        type: "INTERNSHIP",
        openPositions: 3,
        deadline: "Oct 15, 2026",
        company: "Vercel / Supabase Ecosystem",
        description: "Fast-tracked interview slot for top contributors to guild open-source projects.",
        eligibility: "Verified StudentHub student with Next.js skills",
      },
    ],
    leadership: [
      {
        id: "ldr_web_1",
        name: "Marcus Thorne",
        role: "President",
        avatar: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80",
        headline: "Berkeley EECS Senior • Open Source Maintainer",
      },
    ],
    achievements: [
      {
        id: "ach_web_1",
        communityId: "comm_berkeley_web",
        communityName: "Berkeley Full-Stack & Systems Guild",
        title: "Core Infrastructure Contributor",
        type: "COMMUNITY_CONTRIBUTOR",
        recipientName: "Alex Rivera",
        awardedAt: "July 2026",
        evidenceSignal: "Production Pull Request Merged to Community Monorepo",
        isClaimedToCareerDNA: false,
      },
    ],
    joinRequests: [],
    auditTrail: [],
    posts: [],
  },
  {
    id: "comm_mit_algo",
    name: "MIT Competitive Programming & Algorithms Circle",
    slug: "mit-algorithms-cp",
    category: "DSA & Prep",
    type: "Competition Team",
    domain: "Competitive Programming",
    institution: "MIT",
    university: "Massachusetts Institute of Technology",
    location: "Cambridge, MA (Hybrid)",
    city: "Cambridge",
    state: "Massachusetts",
    foundedYear: 2019,
    status: "ACTIVE",
    isVerified: true,
    verificationDetails: {
      verifiedBy: "StudentHub Competitive Division",
      verifiedAt: "2026-02-01T09:00:00Z",
      verificationReason: "Official ICPC Regional training society.",
    },
    membershipType: "APPLICATION_REQUIRED",
    myMembershipStatus: "PENDING_APPROVAL",
    myRole: "MEMBER",
    description:
      "Advanced algorithmic problem solving, ICPC training camps, Codeforces Div 1 strategy, graph theory, and mathematical optimization.",
    icon: "Terminal",
    bannerColor: "from-emerald-600/30 to-teal-600/30",
    membersCount: 890,
    activeDiscussions: 62,
    isJoined: false,
    eligibilityCriteria: {
      allowedDegrees: ["B.S.", "B.Tech", "B.E.", "M.S.", "M.Tech", "Ph.D."],
      allowedBranches: ["Computer Science", "Mathematics", "Electrical Engineering & CS", "Physics"],
      allowedYears: ["1st Year", "2nd Year", "3rd Year", "4th Year", "Graduate"],
      minCgpa: 3.5,
      requiresInstitutionalVerification: true,
      requiredSkills: ["C++", "Data Structures", "Graph Algorithms"],
      summary: "Requires rating above 1600 on Codeforces/LeetCode or proven ICPC preliminary placement.",
    },
    activityMetrics: {
      activityLevel: "VERY_ACTIVE",
      projectsThisMonth: 4,
      eventsThisMonth: 6,
      activeMembersCount: 310,
      opportunitiesCount: 3,
    },
    events: [
      {
        id: "evt_algo_1",
        communityId: "comm_mit_algo",
        communityName: "MIT Competitive Programming & Algorithms Circle",
        title: "North American ICPC Practice Mirror Contest 2026",
        description: "5-hour timed algorithmic contest under strict ICPC rules with automated test suites.",
        eventType: "Coding Contest",
        date: "Oct 05, 2026",
        time: "13:00 - 18:00 EST",
        mode: "Virtual",
        location: "Kattis & Codeforces Gym",
        eligibility: "Active Society Members & Registered Teams",
        capacity: 200,
        registeredCount: 146,
        isRegistered: false,
      },
    ],
    announcements: [
      {
        id: "ann_algo_1",
        communityId: "comm_mit_algo",
        title: "Interview Problem Archive: Google / Citadel Onsite Questions",
        content: "New curated archive with 45 hard graph and dynamic programming questions with proofs.",
        type: "IMPORTANT",
        postedAt: "2 days ago",
        postedBy: "Leon Zhao (Head Coach)",
      },
    ],
    opportunities: [],
    leadership: [
      {
        id: "ldr_algo_1",
        name: "Leon Zhao",
        role: "Technical Lead",
        avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
        headline: "ICPC World Finalist • Codeforces Grandmaster",
      },
    ],
    achievements: [],
    joinRequests: [
      {
        id: "req_algo_1",
        communityId: "comm_mit_algo",
        communityName: "MIT Competitive Programming & Algorithms Circle",
        studentId: "usr_alex_rivera",
        studentName: "Alex Rivera",
        studentEmail: "alex.rivera@stanford.edu",
        university: "Stanford University",
        degree: "B.S. Computer Science",
        branch: "Computer Science",
        year: "3rd Year",
        cgpa: "3.92",
        message: "Passionate about dynamic programming on trees and competitive problem design. Seeking to prepare for ICPC regionals.",
        skills: ["C++", "Algorithms", "Python"],
        portfolioUrl: "https://github.com/alexrivera",
        status: "PENDING",
        createdAt: "2026-09-14T08:30:00Z",
      },
    ],
    auditTrail: [],
    posts: [],
  },
  {
    id: "comm_iit_robotics",
    name: "IIT Bombay Autonomous Robotics & Hardware Lab",
    slug: "iit-bombay-robotics",
    category: "Robotics",
    type: "Research Group",
    domain: "Robotics",
    institution: "IIT Bombay",
    university: "Indian Institute of Technology Bombay",
    location: "Mumbai, India (On-Campus)",
    city: "Mumbai",
    state: "Maharashtra",
    foundedYear: 2018,
    status: "ACTIVE",
    isVerified: true,
    verificationDetails: {
      verifiedBy: "StudentHub Regional Academic Council",
      verifiedAt: "2026-01-10T12:00:00Z",
      verificationReason: "Institute verified laboratory with sponsored industry testing projects.",
    },
    membershipType: "APPLICATION_REQUIRED",
    myMembershipStatus: "NOT_JOINED",
    myRole: "MEMBER",
    description:
      "Pioneering autonomous ground vehicles, ROS 2 pipelines, embedded microcontrollers, SLAM navigation, and robotic perception.",
    icon: "Rocket",
    bannerColor: "from-amber-600/30 to-red-600/30",
    membersCount: 650,
    activeDiscussions: 38,
    isJoined: false,
    eligibilityCriteria: {
      allowedDegrees: ["B.Tech", "Dual Degree", "M.Tech", "Ph.D."],
      allowedBranches: ["Mechanical Engineering", "Electrical Engineering", "Computer Science", "Aerospace Engineering"],
      allowedYears: ["2nd Year", "3rd Year", "4th Year", "Graduate"],
      requiresInstitutionalVerification: true,
      allowedUniversities: ["Indian Institute of Technology Bombay", "IITs / NITs / BITS"],
      summary: "Strictly open to engineering students with ROS/C++ or embedded circuits background.",
    },
    activityMetrics: {
      activityLevel: "ACTIVE",
      projectsThisMonth: 6,
      eventsThisMonth: 2,
      activeMembersCount: 180,
      opportunitiesCount: 2,
    },
    events: [
      {
        id: "evt_rob_1",
        communityId: "comm_iit_robotics",
        communityName: "IIT Bombay Autonomous Robotics & Hardware Lab",
        title: "ROS 2 Humble & Gazebo Simulation Masterclass",
        description: "Designing realistic URDF models and configuring Nav2 navigation stack for differential drive robots.",
        eventType: "Workshop",
        date: "Oct 18, 2026",
        time: "14:00 - 18:00 IST",
        mode: "In-Person",
        location: "Department of Mechanical Engineering, Robotics Annex",
        eligibility: "Verified Enrolled Engineering Students",
        capacity: 80,
        registeredCount: 64,
        isRegistered: false,
      },
    ],
    announcements: [
      {
        id: "ann_rob_1",
        communityId: "comm_iit_robotics",
        title: "RoboSub 2027 Vehicle Sub-team Recruitment",
        content: "Recruiting mechanical CAD designers and computer vision engineers for the autonomous submarine team.",
        type: "OPPORTUNITY",
        postedAt: "3 days ago",
        postedBy: "Siddharth Rao (Team Captain)",
      },
    ],
    opportunities: [],
    leadership: [
      {
        id: "ldr_rob_1",
        name: "Siddharth Rao",
        role: "President",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
        headline: "Final Year B.Tech Mech • Autonomous Vehicles Lead",
      },
    ],
    achievements: [],
    joinRequests: [],
    auditTrail: [],
    posts: [],
  },
  {
    id: "comm_abc_cyber",
    name: "ABC University Cyber Security & Ethical Hacking Guild",
    slug: "abc-cyber-guild",
    category: "Cybersecurity",
    type: "Technical Club",
    domain: "Cybersecurity",
    institution: "ABC University",
    university: "ABC University",
    location: "San Jose, CA (Hybrid)",
    city: "San Jose",
    state: "California",
    foundedYear: 2022,
    status: "ACTIVE",
    isVerified: true,
    verificationDetails: {
      verifiedBy: "StudentHub Security Council",
      verifiedAt: "2026-03-01T11:00:00Z",
      verificationReason: "Affiliated with university computing department and National Cyber League.",
    },
    membershipType: "OPEN",
    myMembershipStatus: "NOT_JOINED",
    myRole: "MEMBER",
    description:
      "CTF competitions, binary exploitation, penetration testing clinics, web security, and vulnerability research for ambitious ethical hackers.",
    icon: "ShieldAlert",
    bannerColor: "from-purple-600/30 to-violet-600/30",
    membersCount: 1120,
    activeDiscussions: 55,
    isJoined: false,
    eligibilityCriteria: {
      allowedDegrees: ["Any"],
      allowedBranches: ["Any"],
      allowedYears: ["Any"],
      requiresInstitutionalVerification: true,
      summary: "Open to all verified students. Requires adhering to responsible disclosure and ethical guidelines.",
    },
    activityMetrics: {
      activityLevel: "ACTIVE",
      projectsThisMonth: 5,
      eventsThisMonth: 3,
      activeMembersCount: 290,
      opportunitiesCount: 4,
    },
    events: [
      {
        id: "evt_cyb_1",
        communityId: "comm_abc_cyber",
        communityName: "ABC University Cyber Security & Ethical Hacking Guild",
        title: "Campus CTF Qualifier 2026 (Web & Pwn)",
        description: "12-hour Capture The Flag challenge covering cryptography, reverse engineering, and web vulnerabilities.",
        eventType: "Coding Contest",
        date: "Oct 24, 2026",
        time: "09:00 - 21:00 PST",
        mode: "Virtual",
        location: "CTFd Platform & Discord War Room",
        eligibility: "Open to all verified college students",
        capacity: 400,
        registeredCount: 220,
        isRegistered: false,
      },
    ],
    announcements: [
      {
        id: "ann_cyb_1",
        communityId: "comm_abc_cyber",
        title: "Bug Bounty Mentorship Program (Fall Batch)",
        content: "Senior security researchers will mentor 15 students in finding their first valid CVE/bounty.",
        type: "OPPORTUNITY",
        postedAt: "4 days ago",
        postedBy: "Priya Sharma (Security Lead)",
      },
    ],
    opportunities: [
      {
        id: "opp_cyb_1",
        communityId: "comm_abc_cyber",
        communityName: "ABC University Cyber Security & Ethical Hacking Guild",
        title: "Application Security Analyst Intern (Direct Campus Partner)",
        type: "INTERNSHIP",
        openPositions: 2,
        deadline: "Oct 20, 2026",
        company: "Cloudflare / CrowdStrike Partner Program",
        description: "Evaluate web applications and draft threat models for modern microservices.",
        eligibility: "Member of Cyber Security Guild with verified CTF score",
      },
    ],
    leadership: [
      {
        id: "ldr_cyb_1",
        name: "Priya Sharma",
        role: "President",
        avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
        headline: "OSCP Certified • Incoming Security Engineer",
      },
    ],
    achievements: [],
    joinRequests: [],
    auditTrail: [],
    posts: [],
  },
  {
    id: "comm_founders_venture",
    name: "National Student Founders & Venture Fellowship",
    slug: "student-founders-venture",
    category: "Startups",
    type: "Founder Community",
    domain: "Entrepreneurship",
    institution: "Inter-University Student Consortium",
    university: "Pan-University Network",
    location: "San Francisco, CA & Remote",
    city: "San Francisco",
    state: "California",
    foundedYear: 2023,
    status: "ACTIVE",
    isVerified: true,
    verificationDetails: {
      verifiedBy: "StudentHub Venture Partners",
      verifiedAt: "2026-01-05T08:00:00Z",
      verificationReason: "Backed by university incubator programs and student alumni angel investors.",
    },
    membershipType: "APPLICATION_REQUIRED",
    myMembershipStatus: "NOT_JOINED",
    myRole: "MEMBER",
    description:
      "Vetted fellowship for university founders building venture-backed tech startups. Founder mastermind dinners, pitch feedback, and seed network access.",
    icon: "Rocket",
    bannerColor: "from-rose-600/30 to-orange-600/30",
    membersCount: 540,
    activeDiscussions: 42,
    isJoined: false,
    eligibilityCriteria: {
      allowedDegrees: ["Any"],
      allowedBranches: ["Any"],
      allowedYears: ["Any"],
      requiresInstitutionalVerification: true,
      summary: "Must have a working prototype, active beta users, or verified hackathon winning project.",
    },
    activityMetrics: {
      activityLevel: "ACTIVE",
      projectsThisMonth: 15,
      eventsThisMonth: 2,
      activeMembersCount: 220,
      opportunitiesCount: 8,
    },
    events: [
      {
        id: "evt_fnd_1",
        communityId: "comm_founders_venture",
        communityName: "National Student Founders & Venture Fellowship",
        title: "Demo Day & Pre-Seed Investor Showcase 2026",
        description: "10 student startups pitch live to 25 leading seed funds and angel operators.",
        eventType: "Project Showcase",
        date: "Nov 14, 2026",
        time: "15:00 - 19:00 PST",
        mode: "Hybrid",
        location: "South Park Commons & Live Stream",
        eligibility: "Approved Fellowship Founders & Accredited Investors",
        capacity: 150,
        registeredCount: 112,
        isRegistered: false,
      },
    ],
    announcements: [
      {
        id: "ann_fnd_1",
        communityId: "comm_founders_venture",
        title: "AWS & GCP Activate Cloud Credits ($100k Cohort Grant)",
        content: "Fellowship members can now redeem up to $100k in non-dilutive cloud computing infrastructure.",
        type: "IMPORTANT",
        postedAt: "5 days ago",
        postedBy: "Elena Rostova (Fellowship Director)",
        pinned: true,
      },
    ],
    opportunities: [
      {
        id: "opp_fnd_1",
        communityId: "comm_founders_venture",
        communityName: "National Student Founders & Venture Fellowship",
        title: "Student Co-Founder / Founding Engineer (FinTech AI)",
        type: "PROJECT",
        openPositions: 2,
        deadline: "Oct 30, 2026",
        company: "Stealth FinTech (Backed by YC Alumni)",
        description: "Equity-compensated founding engineer role building low-latency automated portfolio auditing agents.",
        eligibility: "Verified StudentHub student with Next.js/Python experience",
      },
    ],
    leadership: [
      {
        id: "ldr_fnd_1",
        name: "Elena Rostova",
        role: "President",
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
        headline: "Founder @ Synapse • Thiel Fellowship Finalist",
      },
    ],
    achievements: [],
    joinRequests: [],
    auditTrail: [],
    posts: [],
  },
];

/* -------------------------------------------------------------------------- */
/* RPSC Eligibility Evaluator for Communities                                 */
/* -------------------------------------------------------------------------- */

export interface CommunityEligibilityResult {
  status: "ELIGIBLE" | "PARTIALLY_ELIGIBLE" | "NOT_ELIGIBLE";
  score: number; // 0 - 100 percentage
  reason: string;
  checklist: {
    label: string;
    passed: boolean;
    required: string;
    candidateValue: string;
    details?: string;
  }[];
}

export function evaluateCommunityEligibility(
  community: Community,
  student: StudentProfile | null | undefined
): CommunityEligibilityResult {
  // If no criteria specified, open to everyone
  if (!community.eligibilityCriteria) {
    return {
      status: "ELIGIBLE",
      score: 100,
      reason: "Open to all verified student talent without academic program restrictions.",
      checklist: [
        {
          label: "General Membership",
          passed: true,
          required: "Active Student Profile",
          candidateValue: student?.name || "Student Talent",
          details: "No program constraints configured for this hub.",
        },
      ],
    };
  }

  const crit = community.eligibilityCriteria;
  const checklist: CommunityEligibilityResult["checklist"] = [];

  // Default mock student values if not signed in or missing fields
  const studentDegree = student?.degree || "B.S. Computer Science";
  const studentBranch = student?.branch || "Computer Science";
  const studentYear = student?.yearOfStudy || "3rd Year";
  const studentUniv = student?.university || "Stanford University";
  const studentCgpa = parseFloat(student?.cgpa || "3.92");
  const isVerified = student?.verificationStatus === "VERIFIED";

  let passedItems = 0;
  let totalItems = 0;

  // 1. Institutional Verification Check
  if (crit.requiresInstitutionalVerification) {
    totalItems++;
    const passed = isVerified;
    if (passed) passedItems++;
    checklist.push({
      label: "Institutional Identity",
      passed,
      required: "StudentHub Verified Student ✓",
      candidateValue: isVerified ? "Verified Student" : "Unverified / Pending",
      details: passed ? "Academic email & credentials verified" : "Student account verification required",
    });
  }

  // 2. Degree Requirement
  if (crit.allowedDegrees && !crit.allowedDegrees.includes("Any")) {
    totalItems++;
    const passed = crit.allowedDegrees.some((d) =>
      studentDegree.toLowerCase().includes(d.toLowerCase())
    );
    if (passed) passedItems++;
    checklist.push({
      label: "Degree Program",
      passed,
      required: crit.allowedDegrees.join(" / "),
      candidateValue: studentDegree,
      details: passed ? "Program matches eligibility criteria" : "Degree does not match required programs",
    });
  }

  // 3. Branch / Major Requirement
  if (crit.allowedBranches && !crit.allowedBranches.includes("Any")) {
    totalItems++;
    const passed = crit.allowedBranches.some((b) =>
      studentBranch.toLowerCase().includes(b.toLowerCase())
    );
    if (passed) passedItems++;
    checklist.push({
      label: "Academic Branch / Major",
      passed,
      required: crit.allowedBranches.slice(0, 3).join(", ") + (crit.allowedBranches.length > 3 ? "..." : ""),
      candidateValue: studentBranch,
      details: passed ? "Branch meets technical prerequisite" : "Branch is outside eligible cohort",
    });
  }

  // 4. University Restriction
  if (
    crit.allowedUniversities &&
    crit.allowedUniversities.length > 0 &&
    !crit.allowedUniversities.includes("Any Verified University") &&
    !crit.allowedUniversities.includes("All Verified Universities")
  ) {
    totalItems++;
    const passed = crit.allowedUniversities.some(
      (u) =>
        u.toLowerCase().includes(studentUniv.toLowerCase()) ||
        studentUniv.toLowerCase().includes(u.toLowerCase())
    );
    if (passed) passedItems++;
    checklist.push({
      label: "University Affiliation",
      passed,
      required: crit.allowedUniversities.join(", "),
      candidateValue: studentUniv,
      details: passed ? "University matches charter scope" : "Restricted to partnered institution members",
    });
  }

  // 5. Minimum CGPA
  if (crit.minCgpa !== undefined && crit.minCgpa > 0) {
    totalItems++;
    const passed = studentCgpa >= crit.minCgpa;
    if (passed) passedItems++;
    checklist.push({
      label: "Academic Standing (CGPA)",
      passed,
      required: `Min ${crit.minCgpa.toFixed(2)} CGPA`,
      candidateValue: `${studentCgpa.toFixed(2)} CGPA`,
      details: passed ? "Meets minimum merit threshold" : "Below community minimum criteria",
    });
  }

  // 6. Year of Study
  if (crit.allowedYears && !crit.allowedYears.includes("Any")) {
    totalItems++;
    const passed = crit.allowedYears.some((y) =>
      studentYear.toLowerCase().includes(y.toLowerCase())
    );
    if (passed) passedItems++;
    checklist.push({
      label: "Year of Study",
      passed,
      required: crit.allowedYears.join(", "),
      candidateValue: studentYear,
      details: passed ? "Enrolled in targeted academic cohort" : "Cohort not open for this cycle",
    });
  }

  // Calculate score & final status
  const score = totalItems > 0 ? Math.round((passedItems / totalItems) * 100) : 100;

  let status: CommunityEligibilityResult["status"] = "ELIGIBLE";
  let reason = "You meet all configured institutional eligibility criteria for this community.";

  if (passedItems === totalItems) {
    status = "ELIGIBLE";
  } else if (passedItems >= Math.ceil(totalItems * 0.6)) {
    status = "PARTIALLY_ELIGIBLE";
    reason = "You meet core technical requirements, but some institutional criteria may require administrator waiver.";
  } else {
    status = "NOT_ELIGIBLE";
    reason = "Your current academic profile does not meet the specified charter criteria for this community.";
  }

  return {
    status,
    score,
    reason,
    checklist,
  };
}

/* -------------------------------------------------------------------------- */
/* Recommendation Engine for Communities                                      */
/* -------------------------------------------------------------------------- */

export interface CommunityRecommendation {
  community: Community;
  matchScore: number;
  matchReason: string;
  matchedSkills: string[];
}

export function getRecommendedCommunities(
  communities: Community[],
  student: StudentProfile | null | undefined
): CommunityRecommendation[] {
  const userSkills = student?.skills || ["React", "TypeScript", "Python", "Machine Learning", "Next.js"];
  const userUniv = student?.university || "Stanford University";
  const userDegree = student?.degree || "B.S. Computer Science";

  const recommendations: CommunityRecommendation[] = [];

  for (const comm of communities) {
    let score = 50;
    const matchedSkills: string[] = [];

    // Check skill synergy
    if (comm.domain === "AI / ML" && userSkills.some((s) => s.includes("Python") || s.includes("Machine Learning"))) {
      score += 25;
      matchedSkills.push("Python", "Machine Learning");
    }
    if (comm.domain === "Software Development" && userSkills.some((s) => s.includes("React") || s.includes("TypeScript") || s.includes("Next.js"))) {
      score += 25;
      matchedSkills.push("React", "TypeScript");
    }
    if (comm.domain === "Competitive Programming" && userSkills.some((s) => s.includes("Algorithms") || s.includes("C++"))) {
      score += 20;
      matchedSkills.push("Algorithms");
    }

    // Check university synergy
    if (comm.university && userUniv.toLowerCase().includes(comm.university.toLowerCase())) {
      score += 20;
    }

    // Check eligibility
    const elig = evaluateCommunityEligibility(comm, student);
    if (elig.status === "ELIGIBLE") {
      score += 10;
    } else if (elig.status === "NOT_ELIGIBLE") {
      score -= 30;
    }

    let matchReason = `Matches your academic background in ${userDegree}.`;
    if (matchedSkills.length > 0) {
      matchReason = `High synergy with your verified skills (${matchedSkills.slice(0, 2).join(", ")}) and ${comm.institution}.`;
    }

    if (score >= 60) {
      recommendations.push({
        community: comm,
        matchScore: Math.min(score, 98),
        matchReason,
        matchedSkills,
      });
    }
  }

  return recommendations.sort((a, b) => b.matchScore - a.matchScore);
}

/* -------------------------------------------------------------------------- */
/* Reddit-Style Community Posts Dataset                                       */
/* -------------------------------------------------------------------------- */

export const initialRedditPosts: CommunityPost[] = [
  {
    id: "post_1",
    communityId: "comm_stanford_ai",
    communityName: "Stanford AI & Machine Learning Society",
    communitySlug: "stanford-ai-society",
    communityIcon: "Brain",
    author: {
      name: "Alex Rivera",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      headline: "CS Junior @ Stanford • HAI Researcher",
      isVerifiedStudent: true,
      university: "Stanford University",
      careerDNASkills: ["Python", "PyTorch", "LLMs"],
    },
    type: "QUESTION",
    title: "How should I prepare for an ML engineering internship interview in 2026?",
    content:
      "I'm targeting Fall/Summer ML engineering roles at frontier labs and top infrastructure companies. How much should I focus on theoretical transformer architectures (KV cache paging, RoPE, attention mechanisms) versus low-latency C++ inference & custom CUDA kernels? Also, what are interviewers specifically looking for in take-home evaluation pipelines?",
    timestamp: "2 hours ago",
    upvotes: 142,
    userVote: 1,
    commentCount: 18,
    tags: ["InterviewPrep", "MachineLearning", "PyTorch", "CareerAdvice"],
    isSaved: true,
    comments: [
      {
        id: "c_1",
        postId: "post_1",
        author: {
          name: "Daniel Kim",
          avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
          headline: "CS Grad Student @ Berkeley • Former Intern @ Anthropic",
          isVerifiedStudent: true,
          university: "UC Berkeley",
        },
        content:
          "From my experience interviewing with Anthropic and Scale: 70% of the battle is end-to-end data pipeline hygiene and distributed evaluation. Make sure you can write a clean PyTorch DDP training loop from scratch and explain why activation checkpointing saves memory at the cost of compute.",
        timestamp: "1 hour ago",
        score: 38,
        userVote: 1,
        replies: [
          {
            id: "c_1_1",
            postId: "post_1",
            author: {
              name: "Alex Rivera",
              avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
              headline: "CS Junior @ Stanford",
              isVerifiedStudent: true,
            },
            content: "Super helpful! Did they ask any Triton or custom CUDA kernel optimization questions in the technical rounds?",
            timestamp: "45 mins ago",
            score: 12,
            userVote: 0,
            replies: [
              {
                id: "c_1_1_1",
                postId: "post_1",
                author: {
                  name: "Daniel Kim",
                  avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
                  headline: "CS Grad Student @ Berkeley",
                  isVerifiedStudent: true,
                },
                content: "For undergrad internships, basic Triton knowledge is a huge differentiator but not strictly mandatory. FlashAttention intuition is definitely tested though.",
                timestamp: "30 mins ago",
                score: 19,
                userVote: 1,
              },
            ],
          },
        ],
      },
      {
        id: "c_2",
        postId: "post_1",
        author: {
          name: "Sophia Zhang",
          avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80",
          headline: "AI Research Fellow @ Stanford",
          isVerifiedStudent: true,
          university: "Stanford University",
        },
        content:
          "Also be ready to discuss failure modes of metrics. For example, why BLEU and ROUGE are poor proxies for hallucination in RAG pipelines, and how you set up LLM-as-a-judge evaluation frameworks.",
        timestamp: "50 mins ago",
        score: 24,
        userVote: 0,
      },
    ],
  },
  {
    id: "post_2",
    communityId: "comm_berkeley_web",
    communityName: "Berkeley Full-Stack & Systems Guild",
    communitySlug: "berkeley-fullstack-systems",
    communityIcon: "Code2",
    author: {
      name: "Liam O'Connor",
      avatar: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80",
      headline: "Full-Stack Dev & Open Source Maintainer • Berkeley EECS",
      isVerifiedStudent: true,
      university: "UC Berkeley",
      careerDNASkills: ["React", "TypeScript", "Next.js", "WebSockets"],
    },
    type: "PROJECT",
    title: "I built an open-source real-time canvas collaboration tool with Next.js 15 & WebSockets (1.2k GitHub Stars)",
    content:
      "Spent the semester building CanvasSync. It handles CRDT document synchronization with Yjs and sub-10ms cursor interpolation over WebSockets. Here is a technical breakdown of memory optimizations and how we avoided React re-renders with zustand selectors.\n\nKey highlights:\n• Zero-flicker infinite zoom canvas with 60 FPS transform matrix\n• Conflict-free replicated data types (Yjs) for live multi-cursor presence\n• Distributed room state managed with Redis Pub/Sub",
    timestamp: "4 hours ago",
    upvotes: 384,
    userVote: 0,
    commentCount: 42,
    tags: ["OpenSource", "NextJS", "TypeScript", "WebSockets", "CRDT"],
    isVerifiedProject: true,
    projectDetails: {
      name: "CanvasSync",
      repoUrl: "https://github.com/liamoconnor/canvassync",
      demoUrl: "https://canvassync-demo.vercel.app",
      verifiedBy: "StudentHub Evidence Engine (GitHub Commit Verified)",
    },
    comments: [
      {
        id: "c_p2_1",
        postId: "post_2",
        author: {
          name: "Marcus Thorne",
          avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
          headline: "Frontend Architect • Stanford '25",
          isVerifiedStudent: true,
        },
        content: "Starred! How did you benchmark latency across multi-region WebSocket edge nodes? Did you consider Cloudflare Durable Objects?",
        timestamp: "3 hours ago",
        score: 28,
        userVote: 1,
      },
    ],
  },
  {
    id: "post_3",
    communityId: "comm_mit_algo",
    communityName: "MIT Competitive Programming & Algorithms Circle",
    communitySlug: "mit-algorithms-cp",
    communityIcon: "Terminal",
    author: {
      name: "Aarav Patel",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
      headline: "Incoming SDE @ Google | LeetCode 2200+ | MIT '26",
      isVerifiedStudent: true,
      university: "MIT",
      careerDNASkills: ["C++", "Algorithms", "Dynamic Programming"],
    },
    type: "RESOURCE",
    title: "The 14 Fundamental Patterns to Solve 90% of LeetCode Medium/Hard Questions",
    content:
      "After solving 600+ problems and clearing Google and Stripe interview rounds, I compiled the 14 core patterns every engineer needs:\n\n1. Sliding Window (Maximum sum subarray, longest substring without repeating chars)\n2. Two Pointers (3Sum, Container with most water)\n3. Fast & Slow Pointers (Linked list cycle detection, happy number)\n4. Merge Intervals (Insert interval, meeting rooms II)\n5. Cyclic Sort (Find missing number, first missing positive)\n6. Monotonic Stack (Next greater element, largest rectangle in histogram)\n7. In-place Reversal of LinkedList\n8. Tree BFS & DFS (Level order traversal, serialize/deserialize)\n9. Two Heaps (Find median from data stream)\n10. Subsets & Backtracking (Permutations, combination sum)\n11. Modified Binary Search (Search in rotated sorted array)\n12. Top 'K' Elements with QuickSelect / Min-Heap\n13. K-way Merge (Merge k sorted lists)\n14. 0/1 Knapsack & Dynamic Programming Memoization",
    timestamp: "6 hours ago",
    upvotes: 512,
    userVote: 1,
    commentCount: 76,
    tags: ["LeetCode", "Algorithms", "FAANG", "InterviewPrep"],
    isSaved: true,
    comments: [
      {
        id: "c_p3_1",
        postId: "post_3",
        author: {
          name: "Priya Sharma",
          avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
          headline: "CS Junior • ABC University",
          isVerifiedStudent: true,
        },
        content: "Bookmarking this immediately! Monotonic Stack and Two Heaps were literally the two questions I got in my Stripe screening last week.",
        timestamp: "4 hours ago",
        score: 45,
        userVote: 1,
      },
    ],
  },
  {
    id: "post_4",
    communityId: "comm_stanford_ai",
    communityName: "Curated Internships & Referrals",
    communitySlug: "stanford-ai-society",
    communityIcon: "Briefcase",
    author: {
      name: "Elena Vance",
      avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80",
      headline: "Former SWE Intern @ Linear • Stanford CS '25",
      isVerifiedStudent: true,
      university: "Stanford University",
    },
    type: "INTERNSHIP",
    title: "Linear is hiring SWE Interns for Fall/Spring (Remote / SF) — Verified Opportunity",
    content:
      "Linear just opened applications for their engineering internship cohort. The role focuses on real-time sync engines, keyboard accessibility, and custom canvas UI components.\n\nStipend: $52/hr + housing stipend • Remote eligible\n\nI have 5 direct referral slots available for verified StudentHub engineers who have open-source evidence or high-match Career DNA projects. Drop your portfolio link or message me directly!",
    timestamp: "8 hours ago",
    upvotes: 278,
    userVote: 0,
    commentCount: 39,
    tags: ["Internship", "Hiring", "Referral", "Linear", "Remote"],
    isVerifiedOpportunity: true,
    opportunityDetails: {
      company: "Linear",
      role: "Software Engineering Intern",
      stipend: "$52 / hr",
      deadline: "Oct 15, 2026",
      applyUrl: "/dashboard/internships",
    },
    comments: [],
  },
  {
    id: "post_5",
    communityId: "comm_founders_venture",
    communityName: "National Student Founders & Venture Fellowship",
    communitySlug: "student-founders-venture",
    communityIcon: "Rocket",
    author: {
      name: "Maya Lin",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      headline: "Co-Founder @ Stealth • Thiel Fellow Finalist",
      isVerifiedStudent: true,
      university: "Stanford University",
    },
    type: "ACHIEVEMENT",
    title: "How my roommate and I raised our first $100k pre-seed round while in sophomore year",
    content:
      "A quick breakdown of what actually worked for us as 19-year-old student founders:\n\n1. Do not pitch decks in cold DMs. Build a clickable prototype, record a 60-second Loom showing real user workflow, and share it on Twitter and StudentHub.\n2. Do customer discovery interviews with 50+ real users before writing a single line of backend logic.\n3. Be careful with university IP policies: make sure you use personal laptops and personal Wi-Fi when building proprietary commercial IP.\n4. Avoid predatory SAFE notes with 2x liquidation preferences from vanity incubators.",
    timestamp: "12 hours ago",
    upvotes: 320,
    userVote: 0,
    commentCount: 58,
    tags: ["Startups", "PreSeed", "VentureCapital", "BuildingInPublic"],
    comments: [],
  },
  {
    id: "post_6",
    communityId: "comm_abc_cyber",
    communityName: "ABC University Cyber Security & Ethical Hacking Guild",
    communitySlug: "abc-cyber-guild",
    communityIcon: "ShieldAlert",
    author: {
      name: "Priya Sharma",
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
      headline: "OSCP Certified • Incoming Security Engineer @ CrowdStrike",
      isVerifiedStudent: true,
      university: "ABC University",
      careerDNASkills: ["Cybersecurity", "Binary Exploitation", "Network Security"],
    },
    type: "HACKATHON",
    title: "Looking for 2 teammates for DEF CON Student CTF Qualifier next weekend (Binary / Web)",
    content:
      "Our team currently has two reverse engineering & cryptography specialists and we need two more peers skilled in web exploitation and heap pwn. Must be comfortable with Ghidra, GDB-gef, and Burp Suite Pro. We are aiming for Top 10 finish to qualify for the on-site finals in Las Vegas!",
    timestamp: "1 day ago",
    upvotes: 95,
    userVote: 0,
    commentCount: 16,
    tags: ["CTF", "DEFCON", "Cybersecurity", "Hackathon"],
    comments: [],
  },
];

/* -------------------------------------------------------------------------- */
/* Trending Topics & Community Rules                                         */
/* -------------------------------------------------------------------------- */

export const trendingTopics = [
  { id: "tr_1", tag: "#MLInterviewPrep", title: "ML Engineering Systems Design", count: 342 },
  { id: "tr_2", tag: "#Summer2026Internships", title: "Summer 2026 SWE Applications Open", count: 287 },
  { id: "tr_3", tag: "#LeetCodeContest", title: "Biweekly Contest 148 Discussion", count: 204 },
  { id: "tr_4", tag: "#NextJS15", title: "Server Actions vs API Routes Benchmark", count: 182 },
  { id: "tr_5", tag: "#StudentFounders", title: "Pre-seed Pitch Decks Teardown", count: 145 },
];

export const communityRules = [
  { id: "r_1", rule: "Be constructive & professional", description: "Treat student peers and mentors with respect." },
  { id: "r_2", rule: "Proof-of-work matters", description: "Link real repos, papers, and demo links instead of making empty claims." },
  { id: "r_3", rule: "Zero spam or ghost opportunities", description: "Only verified campus and industry opportunities are permitted." },
  { id: "r_4", rule: "No academic dishonesty", description: "No sharing of live test questions or exam answers." },
];

