export interface InternshipRow {
  id: string;
  title: string;
  company: string;
  company_logo?: string;
  company_description?: string;
  location: string;
  format: "Remote" | "Hybrid" | "Onsite";
  discipline: string;
  pay: string;
  duration: string;
  skills: string[];
  deadline: string;
  match_percentage: number;
  match_reason: string;
  description?: string;
  responsibilities?: string[];
  requirements?: string[];
  perks?: string[];
  applicants_count?: number;
  isSaved?: boolean;
  hasApplied?: boolean;
}

export const SEEDED_INTERNSHIPS: InternshipRow[] = [
  {
    id: "11111111-1111-1111-1111-111111111101",
    title: "Full-Stack Web Development Intern",
    company: "Linear",
    company_logo: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&auto=format&fit=crop&q=80",
    company_description: "Linear is a purpose-built tool for modern software development teams to streamline issues, sprints, and product roadmaps.",
    location: "San Francisco, CA / Remote",
    format: "Remote",
    discipline: "Engineering & Tech",
    pay: "$48/hr",
    duration: "12 Weeks (Summer 2026)",
    skills: ["JavaScript", "HTML", "CSS", "React", "TypeScript"],
    deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    match_percentage: 96,
    match_reason: "Exceptional alignment with your modern JavaScript, HTML, and CSS frontend architecture projects and component design system experience.",
    description: "Join our core engineering squad building high-velocity web interfaces. You will ship directly to production in your first two weeks, optimizing client-side state and fluid web micro-animations.",
    responsibilities: [
      "Design and build responsive web interfaces using modern JavaScript, HTML5, and CSS3.",
      "Implement clean, reusable UI components with micro-interactions and smooth keyboard shortcuts.",
      "Collaborate closely with product designers to translate Figma tokens into performant CSS styles.",
      "Write robust automated tests for key application flows."
    ],
    requirements: [
      "Currently pursuing a B.S. or M.S. in Computer Science or related engineering field.",
      "Strong hands-on foundation in JavaScript (ES6+), semantic HTML, and modern CSS/Flexbox/Grid.",
      "Experience building projects with React, Next.js, or Vue.",
      "Familiarity with Git and collaborative developer workflows."
    ],
    perks: [
      "Competitive hourly stipend ($48/hr) + housing allowance",
      "Top-spec M3 Max MacBook Pro workstation provided",
      "1-on-1 direct mentorship with Principal Frontend Engineers",
      "High conversion rate to full-time return offers (>80%)"
    ],
    applicants_count: 142
  },
  {
    id: "11111111-1111-1111-1111-111111111102",
    title: "Systems Software Engineer Intern",
    company: "Datadog",
    company_logo: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=100&auto=format&fit=crop&q=80",
    company_description: "Datadog is the monitoring and security platform for cloud applications, processing trillions of data points daily.",
    location: "New York, NY / Hybrid",
    format: "Hybrid",
    discipline: "Engineering & Tech",
    pay: "$52/hr",
    duration: "14 Weeks (Summer 2026)",
    skills: ["C++", "Python", "Linux", "Data Structures", "Multithreading"],
    deadline: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000).toISOString(),
    match_percentage: 94,
    match_reason: "Strong match with your low-level systems programming in C++ and automated telemetry scripting in Python.",
    description: "Work alongside our Core Agent team to optimize memory-safe telemetry collectors and low-latency system daemons running across millions of production servers worldwide.",
    responsibilities: [
      "Write high-performance, multithreaded daemon code in modern C++ (C++17/20).",
      "Develop automated benchmarking, log parsing, and performance testing suites in Python.",
      "Diagnose memory bottlenecks and optimize CPU cache locality on Linux kernels.",
      "Contribute to open-source agent tooling and internal engineering documentation."
    ],
    requirements: [
      "Pursuing a Degree in Computer Science, Computer Engineering, or Electrical Engineering.",
      "Deep grasp of C++ memory management, pointers, and object-oriented architecture.",
      "Proficiency in Python for scripting, tooling, and test harness automation.",
      "Solid grounding in Linux operating system internals and concurrent programming."
    ],
    perks: [
      "Competitive compensation ($52/hr) + relocation assistance",
      "Comprehensive health insurance and wellness benefits",
      "Weekly tech talks with world-class systems architects",
      "Full-time return offer consideration for graduating seniors"
    ],
    applicants_count: 98
  },
  {
    id: "11111111-1111-1111-1111-111111111103",
    title: "AI / Machine Learning Engineering Intern",
    company: "Anthropic",
    company_logo: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&auto=format&fit=crop&q=80",
    company_description: "Anthropic is an AI safety and research company dedicated to building reliable, beneficial, and interpretable AI systems.",
    location: "San Francisco, CA",
    format: "Onsite",
    discipline: "Engineering & Tech",
    pay: "$65/hr",
    duration: "12 Weeks (Summer 2026)",
    skills: ["Python", "C++", "PyTorch", "Algorithms", "Docker"],
    deadline: new Date(Date.now() + 18 * 24 * 60 * 60 * 1000).toISOString(),
    match_percentage: 92,
    match_reason: "Direct synergy with your Python deep learning pipelines and high-performance C++ algorithmic optimization capabilities.",
    description: "Collaborate with our foundation model inference teams to build distributed training evaluation harnesses, model compression algorithms, and scalable vector serving layers.",
    responsibilities: [
      "Implement neural network evaluation benchmarks and dataset ingestion pipelines in Python.",
      "Profile and optimize GPU inference kernels utilizing C++ and CUDA extensions.",
      "Containerize and deploy model evaluation microservices using Docker and Kubernetes.",
      "Analyze model activations and interpretability patterns using NumPy and Pandas."
    ],
    requirements: [
      "Pursuing a B.S., M.S., or Ph.D. in Computer Science, AI, or Mathematics.",
      "Demonstrated fluency in Python and modern deep learning frameworks (PyTorch/JAX).",
      "Strong knowledge of C++ and algorithmic complexity analysis.",
      "Experience training or fine-tuning Transformer-based architectures is a plus."
    ],
    perks: [
      "Industry-leading compensation ($65/hr) + housing stipend",
      "Daily catered gourmet meals and commuter transit subsidies",
      "Direct mentorship from leading AI alignment researchers",
      "Access to dedicated high-compute GPU training clusters"
    ],
    applicants_count: 230
  },
  {
    id: "11111111-1111-1111-1111-111111111104",
    title: "Frontend UI/UX Engineering Intern",
    company: "Vercel",
    company_logo: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=100&auto=format&fit=crop&q=80",
    company_description: "Vercel provides the developer platform for Next.js and frontend cloud infrastructure powering the modern web.",
    location: "Remote",
    format: "Remote",
    discipline: "Engineering & Tech",
    pay: "$46/hr",
    duration: "12 Weeks (Summer 2026)",
    skills: ["HTML", "CSS", "JavaScript", "TypeScript", "Next.js"],
    deadline: new Date(Date.now() + 40 * 24 * 60 * 60 * 1000).toISOString(),
    match_percentage: 95,
    match_reason: "Top-tier match for your core proficiency in semantic HTML, modern CSS styling, and client-side JavaScript applications.",
    description: "Join our developer experience team to build delightful, accessible, and ultra-fast web dashboards, analytics visualizations, and documentation platforms for millions of web developers.",
    responsibilities: [
      "Develop responsive web pages using semantic HTML5, CSS custom properties, and modern JavaScript.",
      "Ensure WCAG 2.1 AA accessibility standards across all core web components.",
      "Build and document reusable UI library widgets with micro-interactions.",
      "Measure and optimize Core Web Vitals (LCP, FID, CLS) across international CDN edges."
    ],
    requirements: [
      "Computer Science or Software Engineering student with a passion for web technologies.",
      "Expert understanding of HTML semantics, CSS layout (Grid/Flexbox), and Vanilla JavaScript.",
      "Experience building projects with Next.js or React.",
      "Attention to detail in typography, visual hierarchy, and animation curves."
    ],
    perks: [
      "Fully remote flexibility with $1,500 home office setup stipend",
      "Competitive hourly pay ($46/hr) with bi-weekly pay cycles",
      "Mentorship with leading open-source web developers",
      "Company swag bundle and conference attendance budget"
    ],
    applicants_count: 175
  },
  {
    id: "11111111-1111-1111-1111-111111111105",
    title: "Low-Latency Backend Systems Intern",
    company: "Citadel Securities",
    company_logo: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&auto=format&fit=crop&q=80",
    company_description: "Citadel Securities is a leading global market maker, deploying cutting-edge technology to provide liquidity to institutional markets.",
    location: "Chicago, IL",
    format: "Onsite",
    discipline: "Engineering & Tech",
    pay: "$75/hr",
    duration: "11 Weeks (Summer 2026)",
    skills: ["C++", "Python", "Algorithms", "Computer Architecture", "Linux"],
    deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    match_percentage: 89,
    match_reason: "Aligns with your rigorous understanding of C++ memory layouts, high-speed data structures, and Python analytical tools.",
    description: "Engineers at Citadel Securities architect ultra-low latency execution gateways and algorithmic pricing models that process market orders in sub-microsecond timeframes.",
    responsibilities: [
      "Design and implement high-throughput, low-latency market gateways in C++20.",
      "Construct automated trade verification scripts and market simulations in Python.",
      "Profile CPU cache misses, branch mispredictions, and lock-free concurrency patterns.",
      "Collaborate with quantitative researchers to translate mathematical strategies into production code."
    ],
    requirements: [
      "B.S. or M.S. student in Computer Science, Computer Engineering, or Physics.",
      "Advanced proficiency in C++ with deep grasp of STL and modern language idioms.",
      "Strong problem-solving skills in data structures and competitive programming algorithms.",
      "Working familiarity with Python for rapid data processing and scripting."
    ],
    perks: [
      "Top-tier market maker compensation ($75/hr) + luxury corporate housing",
      "All meals provided daily by private executive chefs",
      "Social retreats, weekend sailing, and networking events",
      "Direct path to accelerated full-time quantitative engineer offer"
    ],
    applicants_count: 312
  },
  {
    id: "11111111-1111-1111-1111-111111111106",
    title: "Cloud Tools & Developer Automation Intern",
    company: "Stripe",
    company_logo: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=100&auto=format&fit=crop&q=80",
    company_description: "Stripe is a financial infrastructure platform for the internet, powering billions in transactions for businesses of all sizes.",
    location: "Seattle, WA / Hybrid",
    format: "Hybrid",
    discipline: "Engineering & Tech",
    pay: "$50/hr",
    duration: "12 Weeks (Summer 2026)",
    skills: ["Python", "JavaScript", "Linux", "CI/CD", "Docker"],
    deadline: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000).toISOString(),
    match_percentage: 86,
    match_reason: "Matches your strengths in Python automation scripting and JavaScript developer workflow integrations.",
    description: "Help build internal developer velocity tooling, automated preview environments, and continuous deployment workflows that accelerate thousands of Stripe software engineers daily.",
    responsibilities: [
      "Write Python automation tools to streamline pull request verifications and canary rollouts.",
      "Develop internal CLI utilities and web administration panels using JavaScript and Node.js.",
      "Implement automated test flakiness detectors using Python statistics libraries.",
      "Improve build cache hit rates across our distributed CI/CD pipelines."
    ],
    requirements: [
      "Pursuing a degree in Computer Science or Software Engineering.",
      "Solid programming abilities in Python and JavaScript.",
      "Familiarity with containerization (Docker) and basic Linux shell environments.",
      "Passionate about improving developer productivity and software craftsmanship."
    ],
    perks: [
      "Competitive pay ($50/hr) + monthly housing stipend ($2,000/mo)",
      "Comprehensive health coverage and wellness stipends",
      "Mentorship pairing with Staff Infrastructure Engineers",
      "High opportunity for return offer in fast-growing engineering teams"
    ],
    applicants_count: 120
  },
  {
    id: "11111111-1111-1111-1111-111111111107",
    title: "Creative Tech & Interactive Web Intern",
    company: "Figma",
    company_logo: "https://images.unsplash.com/photo-1542744094-3a3172722222?w=100&auto=format&fit=crop&q=80",
    company_description: "Figma connects everyone in the design process so teams can build better products, faster.",
    location: "San Francisco, CA / Remote",
    format: "Remote",
    discipline: "Engineering & Tech",
    pay: "$47/hr",
    duration: "12 Weeks (Summer 2026)",
    skills: ["HTML", "CSS", "JavaScript", "WebGL", "TypeScript"],
    deadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(),
    match_percentage: 82,
    match_reason: "Complements your creative frontend foundation with HTML canvas, responsive CSS styling, and interactive JavaScript.",
    description: "Work with the Creative Tools and FigJam teams to create engaging canvas micro-interactions, responsive widgets, and real-time collaboration multiplayer tools.",
    responsibilities: [
      "Build interactive canvas plugins using JavaScript, HTML5 Canvas, and modern CSS.",
      "Craft smooth 60fps animations and transitions using CSS keyframes and requestAnimationFrame.",
      "Collaborate with visual designers to implement pixel-perfect user interface designs.",
      "Participate in design critiques and contribute to open-source plugin templates."
    ],
    requirements: [
      "Student in Computer Science, Human-Computer Interaction, or Digital Media.",
      "Strong skills in JavaScript, semantic HTML markup, and CSS layout algorithms.",
      "Portfolio demonstrating interactive web projects, canvas toys, or creative coding.",
      "Interest in graphic design, typography, and collaborative user experiences."
    ],
    perks: [
      "Competitive stipend ($47/hr) + $1,000 remote workspace stipend",
      "Latest MacBook Pro + Figma Enterprise workspace access",
      "Collaborative, design-centric, and inclusive engineering culture",
      "Return offer opportunities for upcoming graduates"
    ],
    applicants_count: 88
  },
  {
    id: "11111111-1111-1111-1111-111111111108",
    title: "FinTech Software & Analytics Intern",
    company: "Bloomberg",
    company_logo: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&auto=format&fit=crop&q=80",
    company_description: "Bloomberg is the global business and financial information and news leader, giving influential decision makers a critical edge.",
    location: "New York, NY",
    format: "Onsite",
    discipline: "Finance & Business",
    pay: "$45/hr",
    duration: "10 Weeks (Summer 2026)",
    skills: ["Python", "C++", "JavaScript", "SQL", "Algorithms"],
    deadline: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000).toISOString(),
    match_percentage: 79,
    match_reason: "Combines your foundational CS skills in C++ and Python with financial data models and analytical dashboard reporting.",
    description: "Join our Financial Products engineering group to design real-time data ingestion pipelines, analytical charting widgets, and terminal functions used by global finance leaders.",
    responsibilities: [
      "Develop real-time data parsing and transformation components in C++ and Python.",
      "Construct interactive analytical data grids and charting views using JavaScript and HTML/CSS.",
      "Query large-scale relational databases using optimized SQL queries.",
      "Participate in Bloomberg’s comprehensive agile training curriculum."
    ],
    requirements: [
      "Working towards a Bachelor’s or Master’s degree in Computer Science, Math, or Engineering.",
      "Working knowledge of Python or C++, with curiosity about financial markets.",
      "Familiarity with web technologies (JavaScript, HTML, CSS) for interface development.",
      "Solid problem-solving skills and eagerness to learn financial technology."
    ],
    perks: [
      "Competitive pay ($45/hr) + subsidized Midtown Manhattan housing",
      "Comprehensive Bloomberg terminal certification training",
      "Executive speaker series and corporate philanthropy days",
      "Strong conversion pipeline to full-time Software Engineer positions"
    ],
    applicants_count: 164
  }
];

// In-memory junction state for local/dev mode without Supabase connection
export const localSavedInternships = new Set<string>();
export const localAppliedInternships = new Set<string>();
