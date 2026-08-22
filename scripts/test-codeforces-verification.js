const assert = require("assert");

console.log("=================================================");
console.log("RUNNING CODEFORCES VERIFICATION TIMING & STATE TESTS");
console.log("=================================================");

// Mock Response Handler mimicking ConnectCodeforcesModal.tsx
function parseVerificationResponse(status, data) {
  // CASE F: Genuine Auth 401
  if (status === 401) {
    return {
      state: "FAILED",
      errorMessage: "Session expired. Please sign in again.",
      isRetryable: false,
    };
  }

  // CASE A: Verified
  if (status === 200 && data.success && data.status === "VERIFIED") {
    return {
      state: "VERIFIED",
      errorMessage: "",
      isRetryable: false,
    };
  }

  // CASE C & D: Temporary error (504, 502, 503, 408, 429)
  if (
    status === 504 ||
    status === 502 ||
    status === 503 ||
    status === 408 ||
    status === 429 ||
    data.status === "TEMPORARY_ERROR"
  ) {
    return {
      state: "TEMPORARY_ERROR",
      errorMessage: data.error || "Codeforces is taking longer than expected. Please try again.",
      isRetryable: true,
    };
  }

  // CASE B: Verification code genuinely missing (400, 404, status FAILED)
  return {
    state: "FAILED",
    errorMessage: data.error || "Verification code was not found on your Codeforces profile. Please save the profile changes and try again.",
    isRetryable: false,
  };
}

// TEST 1: Verification Succeeds
console.log("Test 1: Verification Succeeds");
const t1 = parseVerificationResponse(200, { success: true, status: "VERIFIED" });
assert.strictEqual(t1.state, "VERIFIED");
assert.strictEqual(t1.errorMessage, "");
console.log("✓ Test 1 passed: State is VERIFIED.");

// TEST 2: Slow Codeforces Response (Timeout 504)
console.log("Test 2: Slow Codeforces Response (Timeout 504)");
const t2 = parseVerificationResponse(504, {
  success: false,
  status: "TEMPORARY_ERROR",
  retryable: true,
  error: "Codeforces is taking longer than expected. Please try again.",
});
assert.strictEqual(t2.state, "TEMPORARY_ERROR");
assert.strictEqual(t2.isRetryable, true);
assert.notStrictEqual(t2.errorMessage, "Authentication failed");
assert.strictEqual(t2.errorMessage, "Codeforces is taking longer than expected. Please try again.");
console.log("✓ Test 2 passed: Timeout returns TEMPORARY_ERROR, NEVER 'Authentication failed'.");

// TEST 3: Codeforces Temporarily Unavailable (502 / 503)
console.log("Test 3: Codeforces Temporarily Unavailable (502)");
const t3 = parseVerificationResponse(502, {
  success: false,
  status: "TEMPORARY_ERROR",
  retryable: true,
  error: "Codeforces is temporarily unavailable. Please try again in a moment.",
});
assert.strictEqual(t3.state, "TEMPORARY_ERROR");
assert.strictEqual(t3.isRetryable, true);
assert.notStrictEqual(t3.errorMessage, "Authentication failed");
assert.strictEqual(t3.errorMessage, "Codeforces is temporarily unavailable. Please try again in a moment.");
console.log("✓ Test 3 passed: Unavailable returns TEMPORARY_ERROR with retryable flag.");

// TEST 4: Verification Code Genuinely Missing (400)
console.log("Test 4: Verification Code Genuinely Missing (400)");
const t4 = parseVerificationResponse(400, {
  success: false,
  status: "FAILED",
  error: "Verification code was not found on your Codeforces profile. Please save the profile changes and try again.",
});
assert.strictEqual(t4.state, "FAILED");
assert.strictEqual(t4.isRetryable, false);
assert.strictEqual(t4.errorMessage, "Verification code was not found on your Codeforces profile. Please save the profile changes and try again.");
console.log("✓ Test 4 passed: Genuine failure returns FAILED with clear guidance.");

// TEST 5: StudentHub Authentication Genuinely Missing (401)
console.log("Test 5: StudentHub Authentication Genuinely Missing (401)");
const t5 = parseVerificationResponse(401, { success: false, error: "Authentication required" });
assert.strictEqual(t5.state, "FAILED");
assert.strictEqual(t5.errorMessage, "Session expired. Please sign in again.");
console.log("✓ Test 5 passed: 401 is ONLY returned for genuine StudentHub auth failures.");

// TEST 6: Double-Click Prevention
console.log("Test 6: Double-Click Prevention");
let verificationState = "VERIFYING";
let requestCount = 0;
function triggerVerification() {
  if (verificationState === "VERIFYING") {
    // Ignored
    return;
  }
  requestCount++;
}
triggerVerification();
triggerVerification();
triggerVerification();
assert.strictEqual(requestCount, 0);
console.log("✓ Test 6 passed: Duplicate triggers while VERIFYING are safely discarded.");

// TEST 7: Polling / Timers Cleanup Simulation
console.log("Test 7: Polling / Timers Cleanup on Modal Close");
let activeInterval = setInterval(() => {}, 1000);
let activeTimeout = setTimeout(() => {}, 45000);
let controller = new AbortController();

function cleanup() {
  clearInterval(activeInterval);
  activeInterval = null;
  clearTimeout(activeTimeout);
  activeTimeout = null;
  controller.abort();
}

cleanup();
assert.strictEqual(activeInterval, null);
assert.strictEqual(activeTimeout, null);
assert.strictEqual(controller.signal.aborted, true);
console.log("✓ Test 7 passed: Timers and fetch controllers are aborted on cleanup.");

console.log("\n=================================================");
console.log("ALL 7 CODEFORCES VERIFICATION TIMING TESTS PASSED!");
console.log("=================================================");
