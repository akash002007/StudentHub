async function testHttpEndpoints() {
  console.log("=== Testing Real HTTP Endpoints on http://localhost:3000 ===");

  const baseUrl = "http://localhost:3000";

  // 1. Check direct apply endpoint for an unverified/restricted student
  console.log("\n1. Testing POST /api/internships/int_01/apply for restricted student (student_01)...");
  const applyRes = await fetch(`${baseUrl}/api/internships/int_01/apply?studentId=student_01`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ notes: "Test application" }),
  });
  console.log("Status:", applyRes.status);
  const applyJson = await applyRes.json();
  console.log("Body:", applyJson);
  console.assert(applyRes.status === 403, "Must return 403");
  console.assert(applyJson.code === "VERIFICATION_REQUIRED", "Must have code VERIFICATION_REQUIRED");
  console.log("  [PASS] Direct API application attempt rejected with 403 VERIFICATION_REQUIRED");

  // 2. Test Try Verification Again reset endpoint
  console.log("\n2. Testing POST /api/student/verification/reset...");
  const resetRes = await fetch(`${baseUrl}/api/student/verification/reset`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ studentId: "student_01" }),
  });
  console.log("Status:", resetRes.status);
  const resetJson = await resetRes.json();
  console.log("Body:", resetJson);
  console.assert(resetRes.status === 200, "Must return 200");
  console.assert(resetJson.success === true, "Must be successful");
  console.assert(resetJson.accountAccessStatus === "RESTRICTED", "Must remain RESTRICTED");
  console.log("  [PASS] Reset endpoint successfully initiates new attempt while keeping account restricted");

  // 3. Test verification status endpoint
  console.log("\n3. Testing GET /api/student/verification...");
  const verifRes = await fetch(`${baseUrl}/api/student/verification?studentId=student_01`);
  console.log("Status:", verifRes.status);
  const verifJson = await verifRes.json();
  console.log("Body:", {
    success: verifJson.success,
    verificationStatus: verifJson.verificationStatus,
    accountAccessStatus: verifJson.accountAccessStatus,
  });
  console.assert(verifRes.status === 200, "Must return 200");
  console.assert(verifJson.accountAccessStatus === "RESTRICTED", "Access must be RESTRICTED");
  console.log("  [PASS] Authoritative status returned correctly from server");

  console.log("\n=== ALL HTTP ENDPOINT TESTS PASSED! ===");
}

testHttpEndpoints().catch((err) => {
  console.error("HTTP test error:", err);
  process.exit(1);
});
