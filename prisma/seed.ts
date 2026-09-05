import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding internships...');

  await prisma.internship.deleteMany(); // Clear existing

  const internships = [
    {
      title: "Software Engineering Intern",
      company: "Google",
      companyLogo: "https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg",
      companyDescription: "Google's mission is to organize the world's information and make it universally accessible and useful.",
      location: "Mountain View, CA",
      workType: "Hybrid",
      stipend: "$8,000/mo",
      duration: "12 weeks",
      deadline: "2026-10-15",
      postedDate: "2026-09-01",
      department: "Engineering & Tech",
      requiredSkills: JSON.stringify(["Python", "C++", "Distributed Systems", "Go"]),
      description: "Join Google as a SWE intern and build systems at scale.",
      responsibilities: JSON.stringify([
        "Write robust, testable code in Python or C++",
        "Collaborate with senior engineers on system design",
        "Participate in code reviews"
      ]),
      requirements: JSON.stringify([
        "Currently pursuing a BS/MS in Computer Science",
        "Strong foundation in data structures and algorithms",
        "Experience with Python, C++, or Java"
      ]),
      perks: JSON.stringify(["Free food", "Housing stipend", "Intern events"]),
      applicantsCount: 1520,
    },
    {
      title: "Frontend Engineering Intern",
      company: "Linear",
      companyLogo: "https://linear.app/static/favicon.svg",
      companyDescription: "Linear is a better way to build products.",
      location: "San Francisco, CA",
      workType: "Remote",
      stipend: "$6,500/mo",
      duration: "10 weeks",
      deadline: "2026-11-01",
      postedDate: "2026-09-02",
      department: "Engineering & Tech",
      requiredSkills: JSON.stringify(["React", "TypeScript", "JavaScript", "HTML", "CSS"]),
      description: "Help build the fastest, most beautiful issue tracker.",
      responsibilities: JSON.stringify([
        "Develop high-performance React components",
        "Ensure pixel-perfect implementation of UI designs",
        "Optimize web vitals"
      ]),
      requirements: JSON.stringify([
        "Solid understanding of JavaScript/TypeScript",
        "Experience with React and modern CSS",
        "A strong portfolio of web projects"
      ]),
      perks: JSON.stringify(["Remote work setup", "Mentorship", "Latest MacBook Pro"]),
      applicantsCount: 850,
    },
    {
      title: "Machine Learning Intern",
      company: "OpenAI",
      companyLogo: "https://upload.wikimedia.org/wikipedia/commons/4/4d/OpenAI_Logo.svg",
      companyDescription: "Creating safe AGI that benefits all of humanity.",
      location: "San Francisco, CA",
      workType: "Onsite",
      stipend: "$10,000/mo",
      duration: "16 weeks",
      deadline: "2026-12-01",
      postedDate: "2026-09-03",
      department: "Engineering & Tech",
      requiredSkills: JSON.stringify(["Python", "PyTorch", "Machine Learning", "C++"]),
      description: "Work on cutting-edge language models and AI alignment.",
      responsibilities: JSON.stringify([
        "Train and fine-tune large language models",
        "Run ablation studies on model architectures",
        "Optimize inference pipelines"
      ]),
      requirements: JSON.stringify([
        "Strong mathematical background (Linear Algebra, Calc, Prob)",
        "Proficiency in PyTorch and Python",
        "Previous research experience is a plus"
      ]),
      perks: JSON.stringify(["Uncapped computing resources", "Relocation assistance", "Incredible team"]),
      applicantsCount: 3400,
    },
    {
      title: "Backend Developer Intern",
      company: "Stripe",
      companyLogo: "https://upload.wikimedia.org/wikipedia/commons/b/ba/Stripe_Logo%2C_revised_2016.svg",
      companyDescription: "Financial infrastructure for the internet.",
      location: "Seattle, WA",
      workType: "Hybrid",
      stipend: "$9,000/mo",
      duration: "12 weeks",
      deadline: "2026-10-30",
      postedDate: "2026-09-04",
      department: "Engineering & Tech",
      requiredSkills: JSON.stringify(["Ruby", "Go", "PostgreSQL", "API Design"]),
      description: "Build robust, reliable, and secure APIs for global payments.",
      responsibilities: JSON.stringify([
        "Implement new API endpoints for our core payment engine",
        "Write comprehensive test suites",
        "Analyze and improve database query performance"
      ]),
      requirements: JSON.stringify([
        "Deep understanding of HTTP and REST APIs",
        "Experience with typed languages or Ruby",
        "Relational database knowledge"
      ]),
      perks: JSON.stringify(["Top-tier mentorship", "Stripe corporate card", "Housing assistance"]),
      applicantsCount: 1120,
    }
  ];

  for (const intern of internships) {
    await prisma.internship.create({
      data: intern
    });
  }

  console.log('Database seeded with internships!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
