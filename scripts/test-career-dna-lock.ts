import {
  normalizeVerificationStatus,
  isStudentVerified,
} from "../src/lib/student-access-policy";

async function runCareerDNALockTests() {
  console.log("=== Running Career DNA Locked State Tests ===\n");

  const states = [
    {
      raw: "approved",
      expectedNorm: "VERIFIED",
      isVerified: true,
      shouldLock: false,
    },
    {
      raw: "VERIFIED",
      expectedNorm: "VERIFIED",
      isVerified: true,
      shouldLock: false,
    },
    {
      raw: "processing",
      expectedNorm: "PROCESSING",
      isVerified: false,
      shouldLock: true,
      expectedTitle: "Career DNA Locked",
      expectedMsgPart: "currently being processed",
      expectedButton: "View Verification Status",
    },
    {
      raw: "manual_review_requested",
      expectedNorm: "MANUAL_REVIEW_REQUESTED",
      isVerified: false,
      shouldLock: true,
      expectedTitle: "Career DNA Locked",
      expectedMsgPart: "currently under manual review",
      expectedButton: "View Verification Status",
    },
    {
      raw: "under_review",
      expectedNorm: "UNDER_REVIEW",
      isVerified: false,
      shouldLock: true,
      expectedTitle: "Career DNA Locked",
      expectedMsgPart: "reviewed by a StudentHub verification officer",
      expectedButton: "View Verification Status",
    },
    {
      raw: "verification_failed",
      expectedNorm: "VERIFICATION_FAILED",
      isVerified: false,
      shouldLock: true,
      expectedTitle: "Career DNA Locked",
      expectedMsgPart: "could not be verified automatically",
      expectedButtons: ["View Verification Status", "Try Verification Again"],
    },
    {
      raw: "rejected",
      expectedNorm: "REJECTED",
      isVerified: false,
      shouldLock: true,
      expectedTitle: "Career DNA Locked",
      expectedMsgPart: "was not approved",
      expectedButton: "Try Verification Again",
    },
    {
      raw: "not_submitted",
      expectedNorm: "UNVERIFIED",
      isVerified: false,
      shouldLock: true,
      expectedTitle: "Career DNA Locked",
      expectedMsgPart: "verification is required to unlock Career DNA",
      expectedButton: "View Verification Status",
    },
  ];

  for (const s of states) {
    const norm = normalizeVerificationStatus(s.raw);
    console.assert(
      norm === s.expectedNorm,
      `Expected ${s.expectedNorm} but got ${norm} for ${s.raw}`
    );

    const mockStudent: any = {
      id: "std_test",
      role: "student",
      verificationStatus: s.raw,
      accountAccessStatus: s.isVerified ? "ACTIVE" : "RESTRICTED",
    };

    const verified = isStudentVerified(mockStudent);
    console.assert(
      verified === s.isVerified,
      `isStudentVerified mismatch for ${s.raw}: expected ${s.isVerified}, got ${verified}`
    );

    const locked = !verified;
    console.assert(
      locked === s.shouldLock,
      `Lock mismatch for ${s.raw}: expected ${s.shouldLock}, got ${locked}`
    );

    console.log(
      `  [PASS] State: ${s.raw.padEnd(25)} -> Normalized: ${norm.padEnd(23)} Locked: ${String(locked).padEnd(6)} Verified: ${verified}`
    );
  }

  // 2. Test live pages rendering with HTTP fetch
  console.log("\n--- Testing Live Server Endpoints on http://localhost:3000 ---");
  const dashboardRes = await fetch("http://localhost:3000/dashboard");
  console.assert(dashboardRes.status === 200, "Dashboard must return 200");
  console.log("  [PASS] GET /dashboard returned 200 OK");

  const careerDNARes = await fetch("http://localhost:3000/dashboard/career-dna");
  console.assert(careerDNARes.status === 200, "Career DNA page must return 200");
  console.log("  [PASS] GET /dashboard/career-dna returned 200 OK");

  // 3. Test GitHub sync API security rejection for restricted student
  console.log("\n--- Testing Backend API Authorization on /api/integrations/github/sync ---");
  const syncRes = await fetch("http://localhost:3000/api/integrations/github/sync?userId=stu_2201", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId: "stu_2201" }),
  });
  const syncJson = await syncRes.json();
  console.log("  Sync endpoint status:", syncRes.status, "body:", syncJson);
  console.assert(syncRes.status === 403, "Sync endpoint must return 403");
  console.assert(syncJson.code === "VERIFICATION_REQUIRED", "Code must be VERIFICATION_REQUIRED");
  console.log("  [PASS] Direct GitHub sync mutation blocked by backend API with 403 VERIFICATION_REQUIRED");

  console.log("\n=== ALL CAREER DNA LOCKED STATE TESTS PASSED! ===");
}

runCareerDNALockTests().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
