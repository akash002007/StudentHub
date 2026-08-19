export interface AcademicSpecialization {
  id: string;
  name: string;
}

export interface AcademicProgram {
  id: string;
  name: string;
  specializations: string[];
}

export interface AcademicStreamHierarchy {
  id: string;
  name: string;
  programs: AcademicProgram[];
}

export const ACADEMIC_HIERARCHY: AcademicStreamHierarchy[] = [
  {
    id: "engineering",
    name: "Engineering & Technology",
    programs: [
      {
        id: "btech",
        name: "B.Tech",
        specializations: [
          "Computer Science & Engineering",
          "Information Technology",
          "Electronics & Communication Engineering",
          "Electrical Engineering",
          "Mechanical Engineering",
          "Civil Engineering",
          "Chemical Engineering",
          "Aerospace Engineering",
          "Automobile Engineering",
          "Biomedical Engineering",
          "Biotechnology",
          "Artificial Intelligence & Machine Learning",
          "Artificial Intelligence & Data Science",
          "Data Science",
          "Cyber Security",
          "Computer Science & Business Systems",
          "Internet of Things",
          "Robotics & Automation",
          "Mechatronics",
          "Environmental Engineering",
          "Industrial Engineering",
          "Production Engineering",
          "Instrumentation Engineering",
          "Mining Engineering",
          "Petroleum Engineering",
          "Food Technology",
          "Agricultural Engineering",
          "Textile Engineering",
          "Other",
        ],
      },
      {
        id: "be",
        name: "B.E.",
        specializations: [
          "Computer Science & Engineering",
          "Information Technology",
          "Electronics & Communication Engineering",
          "Electrical Engineering",
          "Mechanical Engineering",
          "Civil Engineering",
          "Chemical Engineering",
          "Aerospace Engineering",
          "Automobile Engineering",
          "Biomedical Engineering",
          "Artificial Intelligence & Machine Learning",
          "Data Science",
          "Cyber Security",
          "Mechatronics",
          "Robotics",
          "Instrumentation",
          "Production Engineering",
          "Other",
        ],
      },
      {
        id: "mtech",
        name: "M.Tech",
        specializations: [
          "Computer Science & Engineering",
          "Artificial Intelligence",
          "Machine Learning",
          "Data Science",
          "Cyber Security",
          "Software Engineering",
          "VLSI Design",
          "Embedded Systems",
          "Power Systems",
          "Structural Engineering",
          "Thermal Engineering",
          "Mechanical Design",
          "Robotics",
          "Control Systems",
          "Communication Systems",
          "Biotechnology",
          "Other",
        ],
      },
      {
        id: "me",
        name: "M.E.",
        specializations: [
          "Computer Science & Engineering",
          "Software Engineering",
          "VLSI Design",
          "Embedded Systems",
          "Structural Engineering",
          "Thermal Engineering",
          "Manufacturing Engineering",
          "Power Electronics",
          "Communication Systems",
          "Other",
        ],
      },
      {
        id: "bscs",
        name: "B.S. in Computer Science",
        specializations: [
          "Systems & Artificial Intelligence",
          "Software Engineering",
          "Data Science & Analytics",
          "Computer Systems & Architecture",
          "Theory of Computation & Algorithms",
          "Cyber Security & Privacy",
          "Human-Computer Interaction",
          "Other",
        ],
      },
      {
        id: "bca",
        name: "BCA",
        specializations: [
          "Cloud Computing",
          "Full Stack Web Development",
          "Data Analytics",
          "Cyber Security",
          "Artificial Intelligence",
          "Mobile Application Development",
          "Database Administration",
          "Other",
        ],
      },
      {
        id: "mca",
        name: "MCA",
        specializations: [
          "Enterprise Application Development",
          "Data Science & Big Data",
          "Cloud Architecture",
          "Cyber Security & Forensics",
          "Artificial Intelligence & ML",
          "DevOps & Software Architecture",
          "Other",
        ],
      },
      {
        id: "diploma_eng",
        name: "Diploma in Engineering",
        specializations: [
          "Computer Engineering",
          "Mechanical Engineering",
          "Civil Engineering",
          "Electrical Engineering",
          "Electronics Engineering",
          "Automobile Engineering",
          "Chemical Engineering",
          "Other",
        ],
      },
      {
        id: "other_eng",
        name: "Other",
        specializations: ["General Engineering", "Interdisciplinary Engineering", "Other"],
      },
    ],
  },
  {
    id: "science",
    name: "Sciences & Mathematics",
    programs: [
      {
        id: "bsc",
        name: "B.Sc",
        specializations: [
          "Computer Science",
          "Information Technology",
          "Mathematics",
          "Physics",
          "Chemistry",
          "Biotechnology",
          "Microbiology",
          "Biochemistry",
          "Zoology",
          "Botany",
          "Statistics",
          "Data Science",
          "Artificial Intelligence",
          "Environmental Science",
          "Forensic Science",
          "Geology",
          "Geography",
          "Psychology",
          "Agriculture",
          "Food Science",
          "Nutrition & Dietetics",
          "Physics & Mathematics",
          "Computer Science & Mathematics",
          "Other",
        ],
      },
      {
        id: "bsc_hons",
        name: "B.Sc (Hons)",
        specializations: [
          "Physics (Hons)",
          "Chemistry (Hons)",
          "Mathematics (Hons)",
          "Computer Science (Hons)",
          "Biotechnology (Hons)",
          "Economics & Statistics",
          "Biochemistry (Hons)",
          "Microbiology (Hons)",
          "Other",
        ],
      },
      {
        id: "msc",
        name: "M.Sc",
        specializations: [
          "Computer Science",
          "Information Technology",
          "Mathematics",
          "Physics",
          "Chemistry",
          "Biotechnology",
          "Microbiology",
          "Biochemistry",
          "Statistics",
          "Data Science",
          "Artificial Intelligence",
          "Environmental Science",
          "Forensic Science",
          "Zoology",
          "Botany",
          "Applied Geophysics",
          "Other",
        ],
      },
      {
        id: "msc_hons",
        name: "M.Sc (Hons)",
        specializations: [
          "Physics",
          "Chemistry",
          "Mathematics",
          "Biotechnology",
          "Data Science",
          "Other",
        ],
      },
      {
        id: "integrated_msc",
        name: "Integrated M.Sc",
        specializations: [
          "Physics",
          "Chemistry",
          "Mathematics & Computing",
          "Biological Sciences",
          "Data Science",
          "Other",
        ],
      },
      {
        id: "phd_science",
        name: "Ph.D. / Research",
        specializations: [
          "Computational Sciences",
          "Theoretical Physics",
          "Molecular Biology & Genomics",
          "Organic & Analytical Chemistry",
          "Applied Mathematics & Statistics",
          "Other",
        ],
      },
      {
        id: "other_science",
        name: "Other",
        specializations: ["General Science", "Applied Sciences", "Other"],
      },
    ],
  },
  {
    id: "management",
    name: "Management & Business",
    programs: [
      {
        id: "bba",
        name: "BBA",
        specializations: [
          "Finance",
          "Marketing",
          "Human Resources",
          "International Business",
          "Business Analytics",
          "Entrepreneurship",
          "Operations",
          "Supply Chain Management",
          "Information Systems",
          "Digital Marketing",
          "Banking & Finance",
          "Healthcare Management",
          "Hospitality Management",
          "Retail Management",
          "Other",
        ],
      },
      {
        id: "mba",
        name: "MBA",
        specializations: [
          "Finance",
          "Marketing",
          "Human Resources",
          "Operations",
          "Business Analytics",
          "International Business",
          "Entrepreneurship",
          "Information Technology",
          "Product Management",
          "Supply Chain Management",
          "Healthcare Management",
          "Hospitality Management",
          "Banking & Financial Services",
          "Investment Banking",
          "Risk Management",
          "Business Strategy",
          "Other",
        ],
      },
      {
        id: "pgdm",
        name: "PGDM",
        specializations: [
          "Finance & Banking",
          "Marketing Management",
          "Human Resource Management",
          "Business Analytics & AI",
          "Operations & Supply Chain",
          "International Business",
          "Other",
        ],
      },
      {
        id: "bms",
        name: "BMS",
        specializations: [
          "Finance",
          "Marketing",
          "Human Resources",
          "Management Studies",
          "E-Commerce & Digital Strategy",
          "Other",
        ],
      },
      {
        id: "bbm",
        name: "BBM",
        specializations: [
          "Finance",
          "Marketing",
          "Human Resource Management",
          "International Business",
          "Other",
        ],
      },
      {
        id: "exec_mba",
        name: "Executive MBA",
        specializations: [
          "Strategic Leadership",
          "Global Business & Finance",
          "Digital Transformation",
          "Corporate Innovation",
          "Other",
        ],
      },
      {
        id: "other_mgmt",
        name: "Other",
        specializations: ["General Management", "Strategic Business", "Other"],
      },
    ],
  },
  {
    id: "commerce",
    name: "Commerce & Finance",
    programs: [
      {
        id: "bcom",
        name: "B.Com",
        specializations: [
          "Accounting",
          "Finance",
          "Banking",
          "Taxation",
          "Economics",
          "Business Analytics",
          "International Business",
          "Marketing",
          "Financial Markets",
          "Corporate Accounting",
          "Other",
        ],
      },
      {
        id: "bcom_hons",
        name: "B.Com (Hons)",
        specializations: [
          "Accounting & Auditing",
          "Financial Management",
          "Banking & Insurance",
          "Taxation & Law",
          "Business Economics",
          "Other",
        ],
      },
      {
        id: "mcom",
        name: "M.Com",
        specializations: [
          "Advanced Accounting",
          "Financial Management",
          "Taxation & Auditing",
          "Banking & Insurance",
          "International Business",
          "Corporate Governance",
          "Other",
        ],
      },
      {
        id: "mcom_hons",
        name: "M.Com (Hons)",
        specializations: [
          "Accounting & Finance",
          "Banking & Capital Markets",
          "Economic Policy & Taxation",
          "Other",
        ],
      },
      {
        id: "other_comm",
        name: "Other",
        specializations: ["General Commerce", "Financial Services", "Other"],
      },
    ],
  },
  {
    id: "humanities",
    name: "Humanities & Social Sciences",
    programs: [
      {
        id: "ba",
        name: "BA",
        specializations: [
          "English",
          "History",
          "Political Science",
          "Economics",
          "Psychology",
          "Sociology",
          "Philosophy",
          "Geography",
          "Literature",
          "Journalism",
          "Mass Communication",
          "Public Administration",
          "International Relations",
          "Social Work",
          "Fine Arts",
          "Languages",
          "Other",
        ],
      },
      {
        id: "ba_hons",
        name: "BA (Hons)",
        specializations: [
          "English Literature",
          "Economics (Hons)",
          "Psychology (Hons)",
          "Political Science (Hons)",
          "History (Hons)",
          "Sociology (Hons)",
          "Other",
        ],
      },
      {
        id: "ma",
        name: "MA",
        specializations: [
          "English Literature",
          "Economics",
          "Psychology",
          "Sociology",
          "History",
          "Political Science",
          "International Relations",
          "Public Policy & Governance",
          "Philosophy",
          "Linguistics",
          "Development Studies",
          "Other",
        ],
      },
      {
        id: "ma_hons",
        name: "MA (Hons)",
        specializations: [
          "Economics",
          "English",
          "International Relations",
          "Psychology",
          "Other",
        ],
      },
      {
        id: "other_hum",
        name: "Other",
        specializations: ["Liberal Arts", "Social Sciences", "Other"],
      },
    ],
  },
  {
    id: "healthcare",
    name: "Healthcare & Medicine",
    programs: [
      {
        id: "mbbs",
        name: "MBBS",
        specializations: [
          "General Medicine & Surgery",
          "Clinical Medicine",
          "Pre-Clinical & Paraclinical Sciences",
          "Community Medicine",
          "Other",
        ],
      },
      {
        id: "bds",
        name: "BDS",
        specializations: [
          "Oral & Maxillofacial Surgery",
          "Prosthodontics",
          "Orthodontics",
          "Periodontics",
          "Conservative Dentistry & Endodontics",
          "Pedodontics",
          "Oral Pathology",
          "Other",
        ],
      },
      {
        id: "bsc_nursing",
        name: "B.Sc Nursing",
        specializations: [
          "General Nursing",
          "Community Health Nursing",
          "Mental Health Nursing",
          "Child Health Nursing",
          "Medical-Surgical Nursing",
          "Obstetric & Gynecological Nursing",
          "Pediatric Nursing",
          "Critical Care Nursing",
          "Other",
        ],
      },
      {
        id: "msc_nursing",
        name: "M.Sc Nursing",
        specializations: [
          "Medical-Surgical Nursing",
          "Community Health Nursing",
          "Pediatric Nursing",
          "Psychiatric Nursing",
          "Obstetric & Gynecological Nursing",
          "Cardiovascular & Thoracic Nursing",
          "Other",
        ],
      },
      {
        id: "bpt",
        name: "BPT",
        specializations: [
          "Orthopedic Physiotherapy",
          "Neurological Physiotherapy",
          "Sports Physiotherapy",
          "Cardiopulmonary Physiotherapy",
          "Pediatric Physiotherapy",
          "Other",
        ],
      },
      {
        id: "bams",
        name: "BAMS",
        specializations: [
          "Ayurvedic Medicine & Surgery",
          "Panchakarma",
          "Dravyaguna",
          "Kayachikitsa",
          "Other",
        ],
      },
      {
        id: "bhms",
        name: "BHMS",
        specializations: [
          "Homeopathic Medicine & Surgery",
          "Materia Medica",
          "Repertory",
          "Organon of Medicine",
          "Other",
        ],
      },
      {
        id: "bums",
        name: "BUMS",
        specializations: ["Unani Medicine & Surgery", "Ilmul Advia", "Moalajat", "Other"],
      },
      {
        id: "bsms",
        name: "BSMS",
        specializations: ["Siddha Medicine & Surgery", "Gunapadam", "Maruthuvam", "Other"],
      },
      {
        id: "mph",
        name: "MPH",
        specializations: [
          "Epidemiology",
          "Health Policy & Management",
          "Environmental Health",
          "Global Health",
          "Biostatistics",
          "Other",
        ],
      },
      {
        id: "md",
        name: "MD",
        specializations: [
          "General Medicine",
          "Pediatrics",
          "Anesthesiology",
          "Dermatology",
          "Radiology",
          "Psychiatry",
          "Pathology",
          "Other",
        ],
      },
      {
        id: "ms_med",
        name: "MS",
        specializations: [
          "General Surgery",
          "Orthopedics",
          "Ophthalmology",
          "Obstetrics & Gynecology",
          "ENT (Otorhinolaryngology)",
          "Other",
        ],
      },
      {
        id: "mds",
        name: "MDS",
        specializations: [
          "Oral & Maxillofacial Surgery",
          "Orthodontics & Dentofacial Orthopedics",
          "Prosthodontics",
          "Conservative Dentistry",
          "Periodontology",
          "Other",
        ],
      },
      {
        id: "other_health",
        name: "Other",
        specializations: ["Allied Health Sciences", "Clinical Research", "Other"],
      },
    ],
  },
  {
    id: "pharmacy",
    name: "Pharmacy",
    programs: [
      {
        id: "bpharm",
        name: "B.Pharm",
        specializations: [
          "Pharmaceutical Chemistry",
          "Pharmaceutics",
          "Pharmacology",
          "Pharmacognosy",
          "Clinical Pharmacy",
          "Industrial Pharmacy",
          "Other",
        ],
      },
      {
        id: "mpharm",
        name: "M.Pharm",
        specializations: [
          "Pharmaceutics",
          "Pharmacology",
          "Pharmaceutical Chemistry",
          "Pharmacognosy",
          "Pharmaceutical Analysis",
          "Clinical Pharmacy",
          "Industrial Pharmacy",
          "Regulatory Affairs",
          "Quality Assurance",
          "Other",
        ],
      },
      {
        id: "dpharm",
        name: "D.Pharm",
        specializations: [
          "Hospital Pharmacy",
          "Community Pharmacy",
          "Dispensing Pharmacy",
          "Other",
        ],
      },
      {
        id: "pharmd",
        name: "Pharm.D",
        specializations: [
          "Clinical Pharmacokinetics",
          "Pharmacotherapeutics",
          "Hospital Pharmacy Practice",
          "Toxicology & Patient Safety",
          "Other",
        ],
      },
      {
        id: "other_pharm",
        name: "Other",
        specializations: ["Pharmaceutical Sciences", "Biopharmaceutics", "Other"],
      },
    ],
  },
  {
    id: "law",
    name: "Law & Legal Studies",
    programs: [
      {
        id: "llb",
        name: "LLB",
        specializations: [
          "Corporate Law",
          "Criminal Law",
          "Constitutional Law",
          "Civil Law",
          "Intellectual Property Law",
          "Cyber Law",
          "International Law",
          "Tax Law",
          "Commercial Law",
          "Human Rights Law",
          "Environmental Law",
          "Family Law",
          "Other",
        ],
      },
      {
        id: "ba_llb",
        name: "BA LLB",
        specializations: [
          "Corporate & Commercial Law",
          "Criminal Justice & Criminology",
          "Constitutional & Administrative Law",
          "International Trade & Business Law",
          "Human Rights Law",
          "Intellectual Property Law",
          "Other",
        ],
      },
      {
        id: "bba_llb",
        name: "BBA LLB",
        specializations: [
          "Corporate Governance & Compliance",
          "Mergers & Acquisitions Law",
          "Banking & Financial Laws",
          "Competition & Antitrust Law",
          "Intellectual Property Rights",
          "Other",
        ],
      },
      {
        id: "bcom_llb",
        name: "B.Com LLB",
        specializations: [
          "Taxation Law & Auditing",
          "Corporate & Securities Law",
          "Banking & Insolvency Law",
          "Commercial Arbitration",
          "Other",
        ],
      },
      {
        id: "bsc_llb",
        name: "B.Sc LLB",
        specializations: [
          "Cyber Law & Digital Evidence",
          "Intellectual Property & Patents",
          "Forensic Law & Criminalistics",
          "Bioethics & Health Law",
          "Other",
        ],
      },
      {
        id: "llm",
        name: "LLM",
        specializations: [
          "Corporate & Commercial Law",
          "Criminal Law & Criminal Justice",
          "Constitutional & Administrative Law",
          "Intellectual Property Rights",
          "International Law & Human Rights",
          "Tax Law",
          "Cyber Law & Information Technology",
          "Maritime & Energy Law",
          "Other",
        ],
      },
      {
        id: "other_law",
        name: "Other",
        specializations: ["General Legal Studies", "Comparative Law", "Other"],
      },
    ],
  },
  {
    id: "design",
    name: "Design & Architecture",
    programs: [
      {
        id: "bdes",
        name: "B.Des",
        specializations: [
          "Communication Design",
          "Graphic Design",
          "Product Design",
          "UI/UX Design",
          "Fashion Design",
          "Interior Design",
          "Industrial Design",
          "Interaction Design",
          "Animation & VFX",
          "Game Design",
          "Textile Design",
          "Other",
        ],
      },
      {
        id: "mdes",
        name: "M.Des",
        specializations: [
          "Interaction Design & HCI",
          "Industrial & Product Design",
          "Visual Communication",
          "Design Strategy & Innovation",
          "Transportation Design",
          "Experience Design",
          "Other",
        ],
      },
      {
        id: "barch",
        name: "B.Arch",
        specializations: [
          "Architecture",
          "Urban Design",
          "Landscape Architecture",
          "Sustainable Architecture",
          "Interior Architecture",
          "Building Construction Technology",
          "Other",
        ],
      },
      {
        id: "march",
        name: "M.Arch",
        specializations: [
          "Urban Design & Planning",
          "Landscape Architecture",
          "Architectural Conservation",
          "Sustainable Architecture & Green Buildings",
          "Housing & Infrastructure",
          "Other",
        ],
      },
      {
        id: "bfa",
        name: "B.F.A.",
        specializations: [
          "Painting & Drawing",
          "Applied Arts & Advertising",
          "Sculpture",
          "Visual Communication",
          "Photography",
          "Other",
        ],
      },
      {
        id: "other_design",
        name: "Other",
        specializations: ["Creative Arts & Design", "Spatial Design", "Other"],
      },
    ],
  },
  {
    id: "education",
    name: "Education",
    programs: [
      {
        id: "bed",
        name: "B.Ed",
        specializations: [
          "Elementary Education",
          "Secondary Education",
          "Special Education",
          "Educational Psychology",
          "Curriculum & Instruction",
          "Educational Technology & EdTech",
          "Mathematics & Science Teaching",
          "Language Education",
          "Other",
        ],
      },
      {
        id: "med",
        name: "M.Ed",
        specializations: [
          "Educational Leadership & Policy",
          "Curriculum Design & Assessment",
          "Higher Education Administration",
          "Special & Inclusive Education",
          "Educational Technology",
          "Other",
        ],
      },
      {
        id: "deled",
        name: "DElEd",
        specializations: [
          "Primary Education Pedagogy",
          "Child Development & Learning",
          "Classroom Management",
          "Other",
        ],
      },
      {
        id: "other_edu",
        name: "Other",
        specializations: ["Educational Studies", "Pedagogical Sciences", "Other"],
      },
    ],
  },
  {
    id: "media",
    name: "Media & Communication",
    programs: [
      {
        id: "bjmc",
        name: "BJMC",
        specializations: [
          "Print Journalism",
          "Broadcast Journalism",
          "Digital Media & Content Creation",
          "Public Relations & Advertising",
          "Corporate Communication",
          "Photojournalism",
          "Other",
        ],
      },
      {
        id: "mjmc",
        name: "MJMC",
        specializations: [
          "Investigative Journalism",
          "Electronic Media Production",
          "Strategic Media Management",
          "New Media & Digital Analytics",
          "Film & Documentary Studies",
          "Other",
        ],
      },
      {
        id: "ba_journo",
        name: "BA in Journalism",
        specializations: [
          "News Reporting & Editing",
          "Media Studies & Ethics",
          "Broadcast & Television Media",
          "Online & Social Media Journalism",
          "Other",
        ],
      },
      {
        id: "ma_masscomm",
        name: "MA in Mass Communication",
        specializations: [
          "Mass Media Research",
          "Development Communication",
          "Advertising & Brand Strategy",
          "Media Law & Policy",
          "Other",
        ],
      },
      {
        id: "other_media",
        name: "Other",
        specializations: ["Media Studies", "Creative Communications", "Other"],
      },
    ],
  },
  {
    id: "hospitality",
    name: "Hospitality & Tourism",
    programs: [
      {
        id: "bhm",
        name: "BHM",
        specializations: [
          "Hotel Operations Management",
          "Food & Beverage Service",
          "Front Office Operations",
          "Housekeeping Management",
          "Culinary Arts",
          "Hospitality Marketing",
          "Other",
        ],
      },
      {
        id: "bsc_hospitality",
        name: "B.Sc in Hospitality & Hotel Administration",
        specializations: [
          "Hospitality Administration",
          "Culinary Operations",
          "Beverage & Bar Management",
          "Travel & Event Management",
          "Other",
        ],
      },
      {
        id: "mhm",
        name: "MHM",
        specializations: [
          "International Hospitality Strategy",
          "Tourism Policy & Planning",
          "Revenue Management & Hospitality Finance",
          "Luxury Brand Management",
          "Other",
        ],
      },
      {
        id: "other_hosp",
        name: "Other",
        specializations: ["Tourism Studies", "Event & Resort Management", "Other"],
      },
    ],
  },
  {
    id: "agriculture",
    name: "Agriculture & Life Sciences",
    programs: [
      {
        id: "bsc_agri",
        name: "B.Sc Agriculture",
        specializations: [
          "Agronomy",
          "Soil Science & Agricultural Chemistry",
          "Plant Pathology",
          "Agricultural Entomology",
          "Genetics & Plant Breeding",
          "Horticulture",
          "Agricultural Economics",
          "Agricultural Extension",
          "Other",
        ],
      },
      {
        id: "msc_agri",
        name: "M.Sc Agriculture",
        specializations: [
          "Advanced Agronomy",
          "Plant Breeding & Molecular Genetics",
          "Soil Fertility & Plant Nutrition",
          "Agricultural Biotechnology",
          "Seed Science & Technology",
          "Other",
        ],
      },
      {
        id: "btech_agri",
        name: "B.Tech Agricultural Engineering",
        specializations: [
          "Farm Machinery & Power Engineering",
          "Soil & Water Conservation Engineering",
          "Post Harvest & Processing Engineering",
          "Renewable Energy in Agriculture",
          "Irrigation & Drainage Engineering",
          "Other",
        ],
      },
      {
        id: "bsc_horti",
        name: "B.Sc Horticulture",
        specializations: [
          "Fruit Science (Pomology)",
          "Vegetable Science (Olericulture)",
          "Floriculture & Landscaping",
          "Post-Harvest Management",
          "Other",
        ],
      },
      {
        id: "other_agri",
        name: "Other",
        specializations: ["Agribusiness Management", "Sustainable Agriculture", "Other"],
      },
    ],
  },
  {
    id: "other",
    name: "Other",
    programs: [
      {
        id: "custom_prog",
        name: "Other",
        specializations: ["Other"],
      },
    ],
  },
];

/**
 * Lookup helper: Get stream hierarchy by name
 */
export function getStreamHierarchy(streamName: string): AcademicStreamHierarchy | undefined {
  return ACADEMIC_HIERARCHY.find(
    (s) => s.name.toLowerCase() === streamName.toLowerCase()
  );
}

/**
 * Lookup helper: Get list of programs for a given stream name
 */
export function getProgramsForStream(streamName: string): AcademicProgram[] {
  const stream = getStreamHierarchy(streamName);
  if (!stream) {
    // If it's a custom stream or unknown, return default programs with "Other"
    return [
      {
        id: "other_program",
        name: "Other",
        specializations: ["Other"],
      },
    ];
  }
  return stream.programs;
}

/**
 * Lookup helper: Get list of specializations for a given stream and program name
 */
export function getSpecializationsForProgram(
  streamName: string,
  programName: string
): string[] {
  const stream = getStreamHierarchy(streamName);
  if (!stream) return ["Other"];

  const program = stream.programs.find(
    (p) => p.name.toLowerCase() === programName.toLowerCase()
  );
  if (!program) {
    return ["Other"];
  }

  return program.specializations;
}

/**
 * Validation helper: Verify if combination of stream, program, and specialization is valid
 */
export function isValidAcademicCombination(
  streamName: string,
  programName: string,
  specializationName: string
): { isValid: boolean; reason?: string } {
  if (!streamName || !programName || !specializationName) {
    return { isValid: false, reason: "Stream, degree, and specialization are all required." };
  }

  // If custom stream or program or specialization is used
  if (streamName === "Other" || programName === "Other" || specializationName === "Other") {
    return { isValid: true };
  }

  const stream = getStreamHierarchy(streamName);
  if (!stream) {
    // Custom stream write-in
    return { isValid: true };
  }

  const program = stream.programs.find(
    (p) => p.name.toLowerCase() === programName.toLowerCase()
  );
  if (!program) {
    return {
      isValid: false,
      reason: `Degree "${programName}" does not belong to Academic Stream "${streamName}".`,
    };
  }

  const specializationExists = program.specializations.some(
    (s) => s.toLowerCase() === specializationName.toLowerCase()
  );

  if (!specializationExists) {
    return {
      isValid: false,
      reason: `Specialization "${specializationName}" does not belong to Degree "${programName}".`,
    };
  }

  return { isValid: true };
}

/**
 * Get all unique degree names across all academic streams
 */
export function getAllUniqueDegrees(): string[] {
  const degreeSet = new Set<string>();
  for (const stream of ACADEMIC_HIERARCHY) {
    for (const prog of stream.programs) {
      if (prog.name !== "Other") {
        degreeSet.add(prog.name);
      }
    }
  }
  // Add common additional degree levels if not already present
  const popularDegrees = [
    "Diploma",
    "Certificate",
    "Associate Degree",
    "B.Tech",
    "B.E.",
    "B.Sc",
    "B.Sc (Hons)",
    "BBA",
    "B.Com",
    "B.Com (Hons)",
    "BA",
    "BA (Hons)",
    "BCA",
    "B.Des",
    "B.Arch",
    "B.Pharm",
    "B.Sc Nursing",
    "MBBS",
    "BDS",
    "BPT",
    "LLB",
    "BA LLB",
    "BBA LLB",
    "B.Com LLB",
    "B.Sc LLB",
    "B.S. in Computer Science",
    "B.Ed",
    "BJMC",
    "BHM",
    "B.Sc Agriculture",
    "M.Tech",
    "M.E.",
    "M.Sc",
    "MBA",
    "PGDM",
    "M.Com",
    "MA",
    "MCA",
    "M.Des",
    "M.Arch",
    "M.Pharm",
    "M.Sc Nursing",
    "LLM",
    "MD",
    "MS",
    "MDS",
    "M.Ed",
    "MJMC",
    "MHM",
    "M.Sc Agriculture",
    "Ph.D. / Research",
    "Other",
  ];

  for (const deg of popularDegrees) {
    degreeSet.add(deg);
  }

  return Array.from(degreeSet);
}

/**
 * Get all matching branches/specializations for an array of selected degrees
 */
export function getBranchesForDegrees(selectedDegrees: string[]): string[] {
  if (!selectedDegrees || selectedDegrees.length === 0) {
    return [];
  }

  const branchSet = new Set<string>();

  // If "Other" is the only selection
  if (selectedDegrees.includes("Other")) {
    branchSet.add("Other");
  }

  for (const deg of selectedDegrees) {
    const cleanDeg = deg.trim().toLowerCase();
    for (const stream of ACADEMIC_HIERARCHY) {
      for (const prog of stream.programs) {
        if (
          prog.name.toLowerCase() === cleanDeg ||
          prog.name.toLowerCase().replace(/[.\s]/g, "") === cleanDeg.replace(/[.\s]/g, "")
        ) {
          for (const spec of prog.specializations) {
            branchSet.add(spec);
          }
        }
      }
    }
  }

  // If no matching programs found (e.g. custom degrees or diploma), add default/general options
  if (branchSet.size === 0 || (branchSet.size === 1 && branchSet.has("Other"))) {
    return [
      "Computer Science & Engineering",
      "Information Technology",
      "General Management",
      "Finance & Accounting",
      "Biological & Medical Sciences",
      "General Studies",
      "Other",
    ];
  }

  // Ensure "Other" is always at the bottom if present
  const branches = Array.from(branchSet).filter((b) => b !== "Other");
  branches.sort();
  branches.push("Other");

  return branches;
}

/**
 * Check if a branch is valid for any of the selected degrees
 */
export function isBranchValidForSelectedDegrees(
  branch: string,
  selectedDegrees: string[]
): boolean {
  if (!branch || !selectedDegrees || selectedDegrees.length === 0) return false;
  if (branch === "Other" || selectedDegrees.includes("Other")) return true;

  const validBranches = getBranchesForDegrees(selectedDegrees);
  return validBranches.some((b) => b.toLowerCase() === branch.toLowerCase());
}

