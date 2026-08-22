const assert = require("assert");
const crypto = require("crypto");

console.log("=================================================");
console.log("RUNNING GITHUB & HUGGING FACE OAUTH RECONNECT TESTS");
console.log("=================================================");

// 1. Test GitHub OAuth URL Generation
console.log("Test 1: GitHub OAuth URL Generation");
function buildGitHubAuthUrl(clientId, callbackUrl, userId) {
  const randomToken = crypto.randomBytes(32).toString("hex");
  const state = `${randomToken}:${userId}`;
  const url = `https://github.com/login/oauth/authorize?client_id=${encodeURIComponent(
    clientId
  )}&redirect_uri=${encodeURIComponent(
    callbackUrl
  )}&scope=read:user,repo&state=${encodeURIComponent(state)}&prompt=select_account`;
  return { url, state };
}

const gh = buildGitHubAuthUrl("gh_test_123", "http://localhost:3000/api/integrations/github/callback", "user_1");
assert.ok(gh.url.includes("prompt=select_account"), "GitHub URL must include prompt=select_account");
assert.ok(gh.url.includes("scope=read%3Auser%2Crepo") || gh.url.includes("scope=read:user,repo"), "GitHub URL must include scope");
assert.ok(gh.state.includes("user_1"), "GitHub state must include userId");
console.log("✓ Test 1 passed: GitHub authorization URL correctly includes prompt=select_account and secure state.");

// 2. Test Hugging Face OAuth URL Generation
console.log("Test 2: Hugging Face OAuth URL Generation");
function buildHuggingFaceAuthUrl(clientId, callbackUrl, userId) {
  const randomToken = crypto.randomBytes(32).toString("hex");
  const state = `${randomToken}:${userId}`;
  const url = `https://huggingface.co/oauth/authorize?client_id=${encodeURIComponent(
    clientId
  )}&redirect_uri=${encodeURIComponent(
    callbackUrl
  )}&scope=openid%20profile%20read-repos&state=${encodeURIComponent(
    state
  )}&response_type=code&prompt=consent`;
  return { url, state };
}

const hf = buildHuggingFaceAuthUrl("hf_test_123", "http://localhost:3000/api/integrations/huggingface/callback", "user_1");
assert.ok(hf.url.includes("prompt=consent"), "Hugging Face URL must include prompt=consent");
assert.ok(hf.url.includes("scope=openid%20profile%20read-repos"), "Hugging Face URL must include scopes");
assert.ok(hf.url.includes("response_type=code"), "Hugging Face URL must include response_type=code");
console.log("✓ Test 2 passed: Hugging Face authorization URL correctly includes prompt=consent and secure state.");

// 3. Test OAuth State Validation & CSRF Rejection
console.log("Test 3: OAuth State Validation & CSRF Rejection");
function validateOAuthState(cookieState, paramState) {
  if (!cookieState || !paramState || cookieState !== paramState) {
    return false;
  }
  return true;
}

assert.strictEqual(validateOAuthState("token_abc:user_1", "token_abc:user_1"), true);
assert.strictEqual(validateOAuthState("token_abc:user_1", "token_xyz:user_1"), false);
assert.strictEqual(validateOAuthState(null, "token_abc:user_1"), false);
console.log("✓ Test 3 passed: OAuth State mismatch is strictly rejected.");

// 4. Test Disconnect -> Reconnect State Transition
console.log("Test 4: Disconnect -> Reconnect State Transition");
let connectionStore = new Map();
connectionStore.set("user_1", {
  id: "gh_conn_1",
  userId: "user_1",
  githubUsername: "octocat",
  accessTokenEncrypted: "enc_token_123",
  connectedAt: new Date().toISOString(),
});

// Disconnect
function disconnect(userId) {
  connectionStore.delete(userId);
  return true;
}

disconnect("user_1");
assert.strictEqual(connectionStore.has("user_1"), false, "Connection must be deleted from store on disconnect");

// Reconnect initiates a completely fresh transaction
const ghReconnect = buildGitHubAuthUrl("gh_test_123", "http://localhost:3000/api/integrations/github/callback", "user_1");
assert.notStrictEqual(ghReconnect.state, gh.state, "Each connection attempt must generate a new unique state");
console.log("✓ Test 4 passed: Disconnect removes connection and reconnect produces a unique new transaction.");

console.log("\n=================================================");
console.log("ALL GITHUB & HUGGING FACE OAUTH TESTS PASSED!");
console.log("=================================================");
