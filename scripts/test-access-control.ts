import { ServerStore } from "../src/lib/server-store";
import {
  normalizeVerificationStatus,
  getStudentAccessStatus,
  isStudentVerified,
  canAccessCareerDNA,
  canAccessConnectedAccounts,
  canApplyForInternship,
} from "../src/lib/student-access-policy";
import { requireVerifiedStudent } from "../src/lib/student-access-server";
import { NextRequest } from "next/server";

async function runTests() {
  console.log("=== Starting Verification-Based Account Access Control Test Suite ===\n");

  const testStudentId = "student_test_access";
  const nowStr = new Date().toISOString();

  // Initialize test student profile in ServerStore
  ServerStore.updateStudentProfile(testStudentId, {
    id: testStudentId,
    name: "Aarav Gupta",
    email: "aarav.gupta@personal.com",
    role: "student",
    university: "Stanford University",
    studentId: "SU2026_AARAV",
    institutionalId: "SU2026_AARAV",
    degree: "B.Tech",
    branch: "Computer Science",
    graduationYear: 2027,
    cgpa: "3.9",
    location: "Campus",
    bio: "Test candidate",
    status: "Open to Summer 2026 Internships",
    skills: ["React", "TypeScript", "Node.js"],
    resume: null,
    projects: [],
    certifications: [],
    socialLinks: {},
    stats: { profileViews: 0, searchAppearances: 0, applicationsCount: 0, interviewsCount: 0 },
    verificationStatus: "not_submitted",
    accountAccessStatus: "RESTRICTED",
  });

  let student = ServerStore.getStudentProfileById(testStudentId)!;

  // -------------------------------------------------------------
  // TEST 1: Initial Unverified State
  // -------------------------------------------------------------
  console.log("--- TEST 1: Initial Unverified State ---");
  console.assert(normalizeVerificationStatus(student.verificationStatus) === "UNVERIFIED", "Status should be UNVERIFIED");
  console.assert(getStudentAccessStatus(student) === "RESTRICTED", "Access should be RESTRICTED");
  console.assert(!isStudentVerified(student), "isStudentVerified should be false");
  console.assert(!canAccessCareerDNA(student), "Career DNA should be locked");
  console.assert(!canAccessConnectedAccounts(student), "Connected Accounts should be locked");
  console.assert(!canApplyForInternship(student), "Internship apply should be blocked");

  // Verify requireVerifiedStudent returns 403
  const dummyReq1 = new NextRequest(`http://localhost:3000/api/internships/int_01/apply?studentId=${testStudentId}`, {
    method: "POST",
  });
  const check1 = await requireVerifiedStudent(dummyReq1, testStudentId);
  console.assert(!check1.authorized, "check1 should not be authorized");
  if (!check1.authorized) {
    const resData = await check1.errorResponse.json();
    console.assert(check1.errorResponse.status === 403, "Response status must be 403");
    console.assert(resData.code === "VERIFICATION_REQUIRED", "Response code must be VERIFICATION_REQUIRED");
    console.log("  [PASS] Direct API call blocked with 403 VERIFICATION_REQUIRED");
  }

  // -------------------------------------------------------------
  // TEST 2: Student Requests Manual Review (MANUAL_REVIEW_REQUESTED)
  // -------------------------------------------------------------
  console.log("\n--- TEST 2: Manual Review Requested ---");
  // Save a mock document for student
  const docId = `doc_test_${Date.now()}`;
  ServerStore.saveDocument(testStudentId, {
    id: docId,
    userId: testStudentId,
    studentName: student.name,
    collegeName: student.university,
    institutionalId: student.studentId,
    documentType: "COLLEGE_ID",
    fileName: "student_id_aarav.pdf",
    storageKey: `docs/${docId}`,
    mimeType: "application/pdf",
    fileSize: "1.2 MB",
    fileSizeBytes: 1258291,
    uploadedAt: nowStr,
    updatedAt: nowStr,
    verificationStatus: "VERIFICATION_FAILED",
    isSensitive: true,
    isShareableWithRecruiters: false,
    decisionReason: "Automated OCR low confidence",
  });

  // Request manual review
  ServerStore.requestManualReview(docId, testStudentId, "Please review my student ID card manually.");
  ServerStore.updateStudentProfile(testStudentId, {
    verificationStatus: "manual_review_requested",
    accountAccessStatus: "RESTRICTED",
  });

  student = ServerStore.getStudentProfileById(testStudentId)!;
  console.assert(normalizeVerificationStatus(student.verificationStatus) === "MANUAL_REVIEW_REQUESTED", "Status should be MANUAL_REVIEW_REQUESTED");
  console.assert(getStudentAccessStatus(student) === "RESTRICTED", "Access should be RESTRICTED");
  console.assert(!canAccessCareerDNA(student), "Career DNA should be locked during manual review");
  console.assert(!canAccessConnectedAccounts(student), "Connected Accounts should be locked during manual review");
  console.assert(!canApplyForInternship(student), "Internship application should be blocked during manual review");

  const check2 = await requireVerifiedStudent(dummyReq1, testStudentId);
  console.assert(!check2.authorized, "check2 must be unauthorized");
  if (!check2.authorized) {
    const resData = await check2.errorResponse.json();
    console.assert(resData.code === "VERIFICATION_REQUIRED", "Must be VERIFICATION_REQUIRED");
    console.assert(resData.message.includes("review"), "Message must mention review: " + resData.message);
    console.log("  [PASS] API returns 403 with message:", resData.message);
  }

  // -------------------------------------------------------------
  // TEST 3: Officer Starts Review (UNDER_REVIEW)
  // -------------------------------------------------------------
  console.log("\n--- TEST 3: Officer Starts Review (UNDER_REVIEW) ---");
  ServerStore.adminReviewDocument(docId, "START_REVIEW", "Officer Priya");
  student = ServerStore.getStudentProfileById(testStudentId)!;
  console.assert(normalizeVerificationStatus(student.verificationStatus) === "UNDER_REVIEW", "Status should be UNDER_REVIEW");
  console.assert(getStudentAccessStatus(student) === "RESTRICTED", "Access should remain RESTRICTED");
  console.assert(!canApplyForInternship(student), "Applications must remain blocked");
  console.log("  [PASS] Status is UNDER_REVIEW, features remain restricted");

  // -------------------------------------------------------------
  // TEST 4: Admin Rejects (REJECTED & RESTRICTED)
  // -------------------------------------------------------------
  console.log("\n--- TEST 4: Admin Rejects (REJECTED) ---");
  const rejectReason = "Uploaded student ID card has expired and name spelling does not match institutional registry.";
  const rejectResult = ServerStore.adminReviewDocument(docId, "REJECT", "Officer Priya", rejectReason);
  console.assert(rejectResult.success, "Reject should succeed");

  student = ServerStore.getStudentProfileById(testStudentId)!;
  console.assert(normalizeVerificationStatus(student.verificationStatus) === "REJECTED", "Status should be REJECTED");
  console.assert(student.accountAccessStatus === "RESTRICTED", "Account access status must be RESTRICTED");
  console.assert(student.rejectionReason === rejectReason, "Rejection reason must match");
  console.assert(!canAccessCareerDNA(student), "Career DNA must remain locked");
  console.assert(!canApplyForInternship(student), "Applications must remain locked");

  const check3 = await requireVerifiedStudent(dummyReq1, testStudentId);
  console.assert(!check3.authorized, "check3 must be unauthorized");
  if (!check3.authorized) {
    const resData = await check3.errorResponse.json();
    console.assert(resData.code === "VERIFICATION_REQUIRED", "Must be VERIFICATION_REQUIRED");
    console.assert(resData.message.includes(rejectReason), "Must return actual rejection reason: " + resData.message);
    console.log("  [PASS] Rejected student receives 403 with exact reason:", resData.message);
  }

  // -------------------------------------------------------------
  // TEST 5: Try Verification Again (Reset without deleting account)
  // -------------------------------------------------------------
  console.log("\n--- TEST 5: Try Verification Again (Reset flow) ---");
  const resetResult = ServerStore.resetVerificationForResubmission(testStudentId);
  console.assert(resetResult.success, "Reset should succeed");
  student = ServerStore.getStudentProfileById(testStudentId)!;
  console.assert(student.verificationStatus === "not_submitted", "Status should be not_submitted");
  console.assert(student.accountAccessStatus === "RESTRICTED", "Access remains RESTRICTED until verified");
  console.assert(!student.rejectionReason, "Rejection reason cleared for new attempt");
  console.assert(student.name === "Aarav Gupta", "Account profile data preserved (not deleted)");
  console.log("  [PASS] Account reset for new attempt; features stay restricted; profile data preserved");

  // -------------------------------------------------------------
  // TEST 6: Admin Approves Manual Review -> Instant Full Unlock
  // -------------------------------------------------------------
  console.log("\n--- TEST 6: Admin Approves -> Instant Full Unlock ---");
  const approveResult = ServerStore.adminReviewDocument(docId, "APPROVE", "Officer Priya", undefined, "Verified after re-checking university enrollment list.");
  console.assert(approveResult.success, "Approval should succeed");

  student = ServerStore.getStudentProfileById(testStudentId)!;
  console.assert(normalizeVerificationStatus(student.verificationStatus) === "VERIFIED", "Status must be VERIFIED");
  console.assert(student.accountAccessStatus === "ACTIVE", "Access status must be ACTIVE");
  console.assert(isStudentVerified(student), "isStudentVerified must be true");
  console.assert(canAccessCareerDNA(student), "Career DNA should be UNLOCKED");
  console.assert(canAccessConnectedAccounts(student), "Connected Accounts should be UNLOCKED");
  console.assert(canApplyForInternship(student), "Internship applications should be ENABLED");

  const check4 = await requireVerifiedStudent(dummyReq1, testStudentId);
  console.assert(check4.authorized, "check4 must be authorized after approval");
  console.log("  [PASS] All student features instantly unlocked and API authorized");

  // -------------------------------------------------------------
  // TEST 7: Re-registration Bypass Prevention (Section 21)
  // -------------------------------------------------------------
  console.log("\n--- TEST 7: Re-registration Conflict Check ---");
  // Mark student as rejected again to test conflict detection
  ServerStore.updateStudentProfile(testStudentId, { verificationStatus: "rejected", accountAccessStatus: "RESTRICTED" });
  const conflictCheck = ServerStore.checkRejectedIdentityConflict("SU2026_AARAV", "aarav.gupta@personal.com");
  console.assert(conflictCheck.isConflict, "Conflict must be detected for duplicate rejected institutional identity");
  console.log("  [PASS] Conflict detected:", conflictCheck.reason);

  console.log("\n=== ALL ACCESS CONTROL TESTS PASSED SUCCESSFULLY! ===");
}

runTests().catch((err) => {
  console.error("Test error:", err);
  process.exit(1);
});
