const assert = require("assert");

// Test LeetCode ID Normalization Logic
function normalizeLeetCodeId(input) {
  if (!input || typeof input !== "string") return "";
  let clean = input.trim();
  clean = clean.replace(/^(https?:\/\/)?(www\.)?leetcode\.com\/(u\/)?/i, "");
  clean = clean.replace(/^\/|\/$/g, "");
  clean = clean.replace(/^@/, "");
  clean = clean.split("/")[0];
  clean = clean.split("?")[0];
  return clean.trim();
}

console.log("--- 1. Testing LeetCode ID Normalization ---");
assert.strictEqual(normalizeLeetCodeId("tourist"), "tourist");
assert.strictEqual(normalizeLeetCodeId("  @tourist  "), "tourist");
assert.strictEqual(normalizeLeetCodeId("https://leetcode.com/u/tourist/"), "tourist");
assert.strictEqual(normalizeLeetCodeId("https://leetcode.com/tourist?tab=profile"), "tourist");
console.log("✓ ID normalization passed all cases.");

// Test Token Matching in Profiles
console.log("--- 2. Testing Ownership Token Matching ---");
const token = "STUDENTHUB-A1B2-C3D4";
const profileAboutMeValid = "Hi, I am a competitive programmer. Verification: STUDENTHUB-A1B2-C3D4. Let's code!";
const profileAboutMeCase = "verification: studenthub-a1b2-c3d4";
const profileAboutMeInvalid = "STUDENTHUB-XXXX-YYYY";

function checkTokenMatch(text, expectedToken) {
  if (!text) return false;
  return text.toLowerCase().includes(expectedToken.toLowerCase());
}

assert.strictEqual(checkTokenMatch(profileAboutMeValid, token), true);
assert.strictEqual(checkTokenMatch(profileAboutMeCase, token), true);
assert.strictEqual(checkTokenMatch(profileAboutMeInvalid, token), false);
console.log("✓ Ownership verification token matching passed.");

// Test Failure Fallback Policy (Zero Fallback Prohibition)
console.log("--- 3. Testing Zero Fallback Prohibition ---");
const existingConnection = {
  leetcodeId: "sample_dev",
  totalProblemsSolved: 420,
  easySolved: 150,
  mediumSolved: 220,
  hardSolved: 50,
  contestRating: 1845,
  ranking: 24500,
  syncStatus: "SYNCED"
};

function handleSyncFailure(connection, errorMessage) {
  // CRITICAL RULE: Preserve previous valid statistics, never overwrite with fake zeros!
  return {
    ...connection,
    syncStatus: "FAILED",
    error: errorMessage || "Failed to synchronize with LeetCode. Previous statistics preserved."
  };
}

const failedConn = handleSyncFailure(existingConnection, "Rate limited by LeetCode API");
assert.strictEqual(failedConn.syncStatus, "FAILED");
assert.strictEqual(failedConn.totalProblemsSolved, 420);
assert.strictEqual(failedConn.easySolved, 150);
assert.strictEqual(failedConn.mediumSolved, 220);
assert.strictEqual(failedConn.hardSolved, 50);
assert.strictEqual(failedConn.contestRating, 1845);
console.log("✓ Failed sync maintains previous successful metrics and sets syncStatus = FAILED.");

// Test LeetCode DNA Score Calculation
console.log("--- 4. Testing LeetCode DNA Score Engine ---");
function calculateLeetCodeScore(totalSolved, hardSolved, mediumSolved, contestRating) {
  let score = 50;
  if (totalSolved >= 500) score += 25;
  else if (totalSolved >= 250) score += 20;
  else if (totalSolved >= 100) score += 15;
  else if (totalSolved >= 50) score += 10;
  else if (totalSolved > 0) score += 5;

  if (hardSolved >= 50) score += 15;
  else if (hardSolved >= 20) score += 10;
  else if (hardSolved >= 5) score += 5;

  if (contestRating >= 2000) score += 10;
  else if (contestRating >= 1750) score += 8;
  else if (contestRating >= 1600) score += 5;

  return Math.min(Math.max(score, 40), 99);
}

const score1 = calculateLeetCodeScore(420, 50, 220, 1845);
assert.ok(score1 >= 80 && score1 <= 99, `Score ${score1} should be high`);
console.log(`✓ Calculated LeetCode DNA Score: ${score1}/100.`);

console.log("\n==========================================");
console.log("ALL LEETCODE INTEGRATION LOGIC TESTS PASSED!");
console.log("==========================================");
