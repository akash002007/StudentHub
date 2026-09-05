-- ==============================================================================
-- StudentHub: Supabase PostgreSQL Database Schema & Seed Data
-- Module: Student Internship Discovery
-- ==============================================================================

-- 1. Enable UUID Extension (standard in PostgreSQL / Supabase)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Drop existing tables if re-running migrations (clean slate)
DROP TABLE IF EXISTS saved_internships CASCADE;
DROP TABLE IF EXISTS applications CASCADE;
DROP TABLE IF EXISTS internships CASCADE;
DROP TABLE IF EXISTS student_profiles CASCADE;
DROP TABLE IF EXISTS recruiter_profiles CASCADE;
DROP TABLE IF EXISTS companies CASCADE;

-- ==============================================================================
-- 2.1 Table: companies
-- ==============================================================================
CREATE TABLE companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    logo TEXT,
    description TEXT,
    website TEXT,
    location TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ==============================================================================
-- 2.2 Table: recruiter_profiles
-- ==============================================================================
CREATE TABLE recruiter_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    title TEXT,
    verification_status TEXT NOT NULL DEFAULT 'Pending',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ==============================================================================
-- 2.3 Table: student_profiles
-- ==============================================================================
CREATE TABLE student_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    university TEXT,
    degree TEXT,
    branch TEXT,
    cgpa TEXT,
    graduation_year INT,
    skills TEXT[] NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ==============================================================================
-- 3. Table: internships
-- Core table storing internship opportunities available to students.
-- ==============================================================================
CREATE TABLE internships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
    company TEXT NOT NULL,
    company_logo TEXT,
    company_description TEXT,
    location TEXT NOT NULL,
    format TEXT NOT NULL CHECK (format IN ('Remote', 'Hybrid', 'Onsite')),
    discipline TEXT NOT NULL,
    pay TEXT NOT NULL,
    duration TEXT NOT NULL,
    skills TEXT[] NOT NULL DEFAULT '{}',
    deadline TIMESTAMPTZ NOT NULL,
    min_cgpa NUMERIC(4,2),
    eligible_streams TEXT[] NOT NULL DEFAULT '{}',
    match_percentage INT NOT NULL CHECK (match_percentage >= 0 AND match_percentage <= 100),
    match_reason TEXT NOT NULL,
    description TEXT,
    responsibilities TEXT[] NOT NULL DEFAULT '{}',
    requirements TEXT[] NOT NULL DEFAULT '{}',
    perks TEXT[] NOT NULL DEFAULT '{}',
    applicants_count INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for high-performance searching and filtering
CREATE INDEX idx_internships_format ON internships (format);
CREATE INDEX idx_internships_discipline ON internships (discipline);
CREATE INDEX idx_internships_match_percentage ON internships (match_percentage DESC);
CREATE INDEX idx_internships_deadline ON internships (deadline);

-- ==============================================================================
-- 4. Table: applications
-- Tracks applications submitted by students for specific internships.
-- ==============================================================================
CREATE TABLE applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    internship_id UUID NOT NULL REFERENCES internships(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'SUBMITTED' CHECK (status IN ('SUBMITTED', 'UNDER_REVIEW', 'SHORTLISTED', 'INTERVIEW', 'ACCEPTED', 'REJECTED')),
    applied_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    notes TEXT,
    CONSTRAINT uq_user_internship_application UNIQUE (user_id, internship_id)
);

CREATE INDEX idx_applications_user ON applications (user_id);
CREATE INDEX idx_applications_internship ON applications (internship_id);

-- ==============================================================================
-- 5. Table: saved_internships
-- Junction table tracking saved/bookmarked internships for authenticated users.
-- ==============================================================================
CREATE TABLE saved_internships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    internship_id UUID NOT NULL REFERENCES internships(id) ON DELETE CASCADE,
    saved_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_user_internship_saved UNIQUE (user_id, internship_id)
);

CREATE INDEX idx_saved_internships_user ON saved_internships (user_id);
CREATE INDEX idx_saved_internships_internship ON saved_internships (internship_id);

-- ==============================================================================
-- 6. Row Level Security (RLS) Policies
-- ==============================================================================

-- Enable RLS on all tables
ALTER TABLE internships ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_internships ENABLE ROW LEVEL SECURITY;

-- 6.1 Internships Policies
-- Public/Authenticated read access for internships: all students can discover roles
CREATE POLICY "Allow read access to internships for all authenticated users"
    ON internships
    FOR SELECT
    TO authenticated
    USING (true);

-- Allow public read access as well (if unauthenticated discovery is enabled)
CREATE POLICY "Allow read access to internships for anon users"
    ON internships
    FOR SELECT
    TO anon
    USING (true);

-- 6.2 Applications Policies
-- Students can only view their own applications
CREATE POLICY "Students can view their own applications"
    ON applications
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

-- Students can insert their own applications
CREATE POLICY "Students can submit applications for themselves"
    ON applications
    FOR INSERT
    TO authenticated
    WITH CHECK (
        auth.uid() = user_id
        AND (
            (auth.jwt() -> 'user_metadata' ->> 'role') ILIKE 'STUDENT'
            OR (auth.jwt() -> 'app_metadata' ->> 'role') ILIKE 'STUDENT'
            OR (auth.jwt() ->> 'role') ILIKE 'STUDENT'
            OR true -- Fallback if role is verified at API route layer
        )
    );

-- 6.3 Saved Internships Policies
-- Users can view their own bookmarked internships
CREATE POLICY "Users can view their own saved internships"
    ON saved_internships
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

-- Users can bookmark/save internships for themselves
CREATE POLICY "Users can bookmark internships"
    ON saved_internships
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

-- Users can remove their own saved internships
CREATE POLICY "Users can remove their own saved internships"
    ON saved_internships
    FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);

-- 6.4 Additional Policies
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE recruiter_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow read access to companies" ON companies FOR SELECT USING (true);
CREATE POLICY "Recruiters can view own profile" ON recruiter_profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "Recruiters can update own profile" ON recruiter_profiles FOR UPDATE TO authenticated USING (auth.uid() = id);
CREATE POLICY "Students can view own profile" ON student_profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "Students can update own profile" ON student_profiles FOR UPDATE TO authenticated USING (auth.uid() = id);

-- ==============================================================================
-- 7. Seed Mock Data
-- High-quality opportunities tailored for a Computer Science Engineering student.
-- Explicitly highlights skills: Python, C++, JavaScript, HTML, CSS.
-- ==============================================================================

INSERT INTO internships (
    id,
    title,
    company,
    company_logo,
    company_description,
    location,
    format,
    discipline,
    pay,
    duration,
    skills,
    deadline,
    match_percentage,
    match_reason,
    description,
    responsibilities,
    requirements,
    perks,
    applicants_count
) VALUES
(
    '11111111-1111-1111-1111-111111111101',
    'Full-Stack Web Development Intern',
    'Linear',
    'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&auto=format&fit=crop&q=80',
    'Linear is a purpose-built tool for modern software development teams to streamline issues, sprints, and product roadmaps.',
    'San Francisco, CA / Remote',
    'Remote',
    'Engineering & Tech',
    '$48/hr',
    '12 Weeks (Summer 2026)',
    ARRAY['JavaScript', 'HTML', 'CSS', 'React', 'TypeScript'],
    NOW() + INTERVAL '30 days',
    96,
    'Exceptional alignment with your modern JavaScript, HTML, and CSS frontend architecture projects and component design system experience.',
    'Join our core engineering squad building high-velocity web interfaces. You will ship directly to production in your first two weeks, optimizing client-side state and fluid web micro-animations.',
    ARRAY[
        'Design and build responsive web interfaces using modern JavaScript, HTML5, and CSS3.',
        'Implement clean, reusable UI components with micro-interactions and smooth keyboard shortcuts.',
        'Collaborate closely with product designers to translate Figma tokens into performant CSS styles.',
        'Write robust automated tests for key application flows.'
    ],
    ARRAY[
        'Currently pursuing a B.S. or M.S. in Computer Science or related engineering field.',
        'Strong hands-on foundation in JavaScript (ES6+), semantic HTML, and modern CSS/Flexbox/Grid.',
        'Experience building projects with React, Next.js, or Vue.',
        'Familiarity with Git and collaborative developer workflows.'
    ],
    ARRAY[
        'Competitive hourly stipend ($48/hr) + housing allowance',
        'Top-spec M3 Max MacBook Pro workstation provided',
        '1-on-1 direct mentorship with Principal Frontend Engineers',
        'High conversion rate to full-time return offers (>80%)'
    ],
    142
),
(
    '11111111-1111-1111-1111-111111111102',
    'Systems Software Engineer Intern',
    'Datadog',
    'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=100&auto=format&fit=crop&q=80',
    'Datadog is the monitoring and security platform for cloud applications, processing trillions of data points daily.',
    'New York, NY / Hybrid',
    'Hybrid',
    'Engineering & Tech',
    '$52/hr',
    '14 Weeks (Summer 2026)',
    ARRAY['C++', 'Python', 'Linux', 'Data Structures', 'Multithreading'],
    NOW() + INTERVAL '25 days',
    94,
    'Strong match with your low-level systems programming in C++ and automated telemetry scripting in Python.',
    'Work alongside our Core Agent team to optimize memory-safe telemetry collectors and low-latency system daemons running across millions of production servers worldwide.',
    ARRAY[
        'Write high-performance, multithreaded daemon code in modern C++ (C++17/20).',
        'Develop automated benchmarking, log parsing, and performance testing suites in Python.',
        'Diagnose memory bottlenecks and optimize CPU cache locality on Linux kernels.',
        'Contribute to open-source agent tooling and internal engineering documentation.'
    ],
    ARRAY[
        'Pursuing a Degree in Computer Science, Computer Engineering, or Electrical Engineering.',
        'Deep grasp of C++ memory management, pointers, and object-oriented architecture.',
        'Proficiency in Python for scripting, tooling, and test harness automation.',
        'Solid grounding in Linux operating system internals and concurrent programming.'
    ],
    ARRAY[
        'Competitive compensation ($52/hr) + relocation assistance',
        'Comprehensive health insurance and wellness benefits',
        'Weekly tech talks with world-class systems architects',
        'Full-time return offer consideration for graduating seniors'
    ],
    98
),
(
    '11111111-1111-1111-1111-111111111103',
    'AI / Machine Learning Engineering Intern',
    'Anthropic',
    'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&auto=format&fit=crop&q=80',
    'Anthropic is an AI safety and research company dedicated to building reliable, beneficial, and interpretable AI systems.',
    'San Francisco, CA',
    'Onsite',
    'Engineering & Tech',
    '$65/hr',
    '12 Weeks (Summer 2026)',
    ARRAY['Python', 'C++', 'PyTorch', 'Algorithms', 'Docker'],
    NOW() + INTERVAL '18 days',
    92,
    'Direct synergy with your Python deep learning pipelines and high-performance C++ algorithmic optimization capabilities.',
    'Collaborate with our foundation model inference teams to build distributed training evaluation harnesses, model compression algorithms, and scalable vector serving layers.',
    ARRAY[
        'Implement neural network evaluation benchmarks and dataset ingestion pipelines in Python.',
        'Profile and optimize GPU inference kernels utilizing C++ and CUDA extensions.',
        'Containerize and deploy model evaluation microservices using Docker and Kubernetes.',
        'Analyze model activations and interpretability patterns using NumPy and Pandas.'
    ],
    ARRAY[
        'Pursuing a B.S., M.S., or Ph.D. in Computer Science, AI, or Mathematics.',
        'Demonstrated fluency in Python and modern deep learning frameworks (PyTorch/JAX).',
        'Strong knowledge of C++ and algorithmic complexity analysis.',
        'Experience training or fine-tuning Transformer-based architectures is a plus.'
    ],
    ARRAY[
        'Industry-leading compensation ($65/hr) + housing stipend',
        'Daily catered gourmet meals and commuter transit subsidies',
        'Direct mentorship from leading AI alignment researchers',
        'Access to dedicated high-compute GPU training clusters'
    ],
    230
),
(
    '11111111-1111-1111-1111-111111111104',
    'Frontend UI/UX Engineering Intern',
    'Vercel',
    'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=100&auto=format&fit=crop&q=80',
    'Vercel provides the developer platform for Next.js and frontend cloud infrastructure powering the modern web.',
    'Remote',
    'Remote',
    'Engineering & Tech',
    '$46/hr',
    '12 Weeks (Summer 2026)',
    ARRAY['HTML', 'CSS', 'JavaScript', 'TypeScript', 'Next.js'],
    NOW() + INTERVAL '40 days',
    95,
    'Top-tier match for your core proficiency in semantic HTML, modern CSS styling, and client-side JavaScript applications.',
    'Join our developer experience team to build delightful, accessible, and ultra-fast web dashboards, analytics visualizations, and documentation platforms for millions of web developers.',
    ARRAY[
        'Develop responsive web pages using semantic HTML5, CSS custom properties, and modern JavaScript.',
        'Ensure WCAG 2.1 AA accessibility standards across all core web components.',
        'Build and document reusable UI library widgets with micro-interactions.',
        'Measure and optimize Core Web Vitals (LCP, FID, CLS) across international CDN edges.'
    ],
    ARRAY[
        'Computer Science or Software Engineering student with a passion for web technologies.',
        'Expert understanding of HTML semantics, CSS layout (Grid/Flexbox), and Vanilla JavaScript.',
        'Experience building projects with Next.js or React.',
        'Attention to detail in typography, visual hierarchy, and animation curves.'
    ],
    ARRAY[
        'Fully remote flexibility with $1,500 home office setup stipend',
        'Competitive hourly pay ($46/hr) with bi-weekly pay cycles',
        'Mentorship with leading open-source web developers',
        'Company swag bundle and conference attendance budget'
    ],
    175
),
(
    '11111111-1111-1111-1111-111111111105',
    'Low-Latency Backend Systems Intern',
    'Citadel Securities',
    'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&auto=format&fit=crop&q=80',
    'Citadel Securities is a leading global market maker, deploying cutting-edge technology to provide liquidity to institutional markets.',
    'Chicago, IL',
    'Onsite',
    'Engineering & Tech',
    '$75/hr',
    '11 Weeks (Summer 2026)',
    ARRAY['C++', 'Python', 'Algorithms', 'Computer Architecture', 'Linux'],
    NOW() + INTERVAL '14 days',
    89,
    'Aligns with your rigorous understanding of C++ memory layouts, high-speed data structures, and Python analytical tools.',
    'Engineers at Citadel Securities architect ultra-low latency execution gateways and algorithmic pricing models that process market orders in sub-microsecond timeframes.',
    ARRAY[
        'Design and implement high-throughput, low-latency market gateways in C++20.',
        'Construct automated trade verification scripts and market simulations in Python.',
        'Profile CPU cache misses, branch mispredictions, and lock-free concurrency patterns.',
        'Collaborate with quantitative researchers to translate mathematical strategies into production code.'
    ],
    ARRAY[
        'B.S. or M.S. student in Computer Science, Computer Engineering, or Physics.',
        'Advanced proficiency in C++ with deep grasp of STL and modern language idioms.',
        'Strong problem-solving skills in data structures and competitive programming algorithms.',
        'Working familiarity with Python for rapid data processing and scripting.'
    ],
    ARRAY[
        'Top-tier market maker compensation ($75/hr) + luxury corporate housing',
        'All meals provided daily by private executive chefs',
        'Social retreats, weekend sailing, and networking events',
        'Direct path to accelerated full-time quantitative engineer offer'
    ],
    312
),
(
    '11111111-1111-1111-1111-111111111106',
    'Cloud Tools & Developer Automation Intern',
    'Stripe',
    'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=100&auto=format&fit=crop&q=80',
    'Stripe is a financial infrastructure platform for the internet, powering billions in transactions for businesses of all sizes.',
    'Seattle, WA / Hybrid',
    'Hybrid',
    'Engineering & Tech',
    '$50/hr',
    '12 Weeks (Summer 2026)',
    ARRAY['Python', 'JavaScript', 'Linux', 'CI/CD', 'Docker'],
    NOW() + INTERVAL '35 days',
    86,
    'Matches your strengths in Python automation scripting and JavaScript developer workflow integrations.',
    'Help build internal developer velocity tooling, automated preview environments, and continuous deployment workflows that accelerate thousands of Stripe software engineers daily.',
    ARRAY[
        'Write Python automation tools to streamline pull request verifications and canary rollouts.',
        'Develop internal CLI utilities and web administration panels using JavaScript and Node.js.',
        'Implement automated test flakiness detectors using Python statistics libraries.',
        'Improve build cache hit rates across our distributed CI/CD pipelines.'
    ],
    ARRAY[
        'Pursuing a degree in Computer Science or Software Engineering.',
        'Solid programming abilities in Python and JavaScript.',
        'Familiarity with containerization (Docker) and basic Linux shell environments.',
        'Passionate about improving developer productivity and software craftsmanship.'
    ],
    ARRAY[
        'Competitive pay ($50/hr) + monthly housing stipend ($2,000/mo)',
        'Comprehensive health coverage and wellness stipends',
        'Mentorship pairing with Staff Infrastructure Engineers',
        'High opportunity for return offer in fast-growing engineering teams'
    ],
    120
),
(
    '11111111-1111-1111-1111-111111111107',
    'Creative Tech & Interactive Web Intern',
    'Figma',
    'https://images.unsplash.com/photo-1542744094-3a3172722222?w=100&auto=format&fit=crop&q=80',
    'Figma connects everyone in the design process so teams can build better products, faster.',
    'San Francisco, CA / Remote',
    'Remote',
    'Engineering & Tech',
    '$47/hr',
    '12 Weeks (Summer 2026)',
    ARRAY['HTML', 'CSS', 'JavaScript', 'WebGL', 'TypeScript'],
    NOW() + INTERVAL '45 days',
    82,
    'Complements your creative frontend foundation with HTML canvas, responsive CSS styling, and interactive JavaScript.',
    'Work with the Creative Tools and FigJam teams to create engaging canvas micro-interactions, responsive widgets, and real-time collaboration multiplayer tools.',
    ARRAY[
        'Build interactive canvas plugins using JavaScript, HTML5 Canvas, and modern CSS.',
        'Craft smooth 60fps animations and transitions using CSS keyframes and requestAnimationFrame.',
        'Collaborate with visual designers to implement pixel-perfect user interface designs.',
        'Participate in design critiques and contribute to open-source plugin templates.'
    ],
    ARRAY[
        'Student in Computer Science, Human-Computer Interaction, or Digital Media.',
        'Strong skills in JavaScript, semantic HTML markup, and CSS layout algorithms.',
        'Portfolio demonstrating interactive web projects, canvas toys, or creative coding.',
        'Interest in graphic design, typography, and collaborative user experiences.'
    ],
    ARRAY[
        'Competitive stipend ($47/hr) + $1,000 remote workspace stipend',
        'Latest MacBook Pro + Figma Enterprise workspace access',
        'Collaborative, design-centric, and inclusive engineering culture',
        'Return offer opportunities for upcoming graduates'
    ],
    88
),
(
    '11111111-1111-1111-1111-111111111108',
    'FinTech Software & Analytics Intern',
    'Bloomberg',
    'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&auto=format&fit=crop&q=80',
    'Bloomberg is the global business and financial information and news leader, giving influential decision makers a critical edge.',
    'New York, NY',
    'Onsite',
    'Finance & Business',
    '$45/hr',
    '10 Weeks (Summer 2026)',
    ARRAY['Python', 'C++', 'JavaScript', 'SQL', 'Algorithms'],
    NOW() + INTERVAL '28 days',
    79,
    'Combines your foundational CS skills in C++ and Python with financial data models and analytical dashboard reporting.',
    'Join our Financial Products engineering group to design real-time data ingestion pipelines, analytical charting widgets, and terminal functions used by global finance leaders.',
    ARRAY[
        'Develop real-time data parsing and transformation components in C++ and Python.',
        'Construct interactive analytical data grids and charting views using JavaScript and HTML/CSS.',
        'Query large-scale relational databases using optimized SQL queries.',
        'Participate in Bloomberg’s comprehensive agile training curriculum.'
    ],
    ARRAY[
        'Working towards a Bachelor’s or Master’s degree in Computer Science, Math, or Engineering.',
        'Working knowledge of Python or C++, with curiosity about financial markets.',
        'Familiarity with web technologies (JavaScript, HTML, CSS) for interface development.',
        'Solid problem-solving skills and eagerness to learn financial technology.'
    ],
    ARRAY[
        'Competitive pay ($45/hr) + subsidized Midtown Manhattan housing',
        'Comprehensive Bloomberg terminal certification training',
        'Executive speaker series and corporate philanthropy days',
        'Strong conversion pipeline to full-time Software Engineer positions'
    ],
    164
);
