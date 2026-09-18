const assert = require("assert");

/**
 * Score-to-particle mapping logic matching CareerDNAHelix
 */
function computeHelixParticles(score) {
  const effectiveScore = score !== null && score !== undefined
    ? Math.min(Math.max(score, 0), 100)
    : 50;

  const totalCount = Math.round(2 + (effectiveScore / 100) * 16);
  const countA = Math.ceil(totalCount / 2);
  const countB = Math.floor(totalCount / 2);

  const baseDur = 9.0 - (effectiveScore / 100) * 3.5;
  const durA = baseDur;
  const durB = baseDur * 1.18;

  const opacity = parseFloat((0.7 + (effectiveScore / 100) * 0.28).toFixed(2));

  const particlesA = [];
  for (let i = 0; i < countA; i++) {
    const beginOffset = parseFloat(-(i * (durA / countA)).toFixed(2));
    const r = parseFloat((2.2 + ((i % 3) * 0.45)).toFixed(1));
    particlesA.push({ id: `pa-${i}`, r, dur: durA, begin: beginOffset, opacity });
  }

  const particlesB = [];
  for (let i = 0; i < countB; i++) {
    const beginOffset = parseFloat(-((i * (durB / Math.max(countB, 1))) + durB * 0.35).toFixed(2));
    const r = parseFloat((2.1 + (((i + 1) % 3) * 0.45)).toFixed(1));
    particlesB.push({ id: `pb-${i}`, r, dur: durB, begin: beginOffset, opacity });
  }

  return { totalCount, countA, countB, baseDur, opacity, particlesA, particlesB };
}

console.log("=== Testing Career DNA Helix Score Mapping ===");

// 1. Score = 0 (Minimal, subtle activity - never completely dead)
const score0 = computeHelixParticles(0);
console.log("Score 0:", { count: score0.totalCount, baseDur: score0.baseDur, opacity: score0.opacity });
assert.strictEqual(score0.totalCount, 2, "Score 0 should produce exactly 2 particles (1 per strand)");
assert.strictEqual(score0.countA, 1);
assert.strictEqual(score0.countB, 1);
assert.strictEqual(score0.baseDur, 9.0, "Score 0 should have base duration of 9.0s (calm, subtle)");
assert.strictEqual(score0.opacity, 0.70, "Score 0 should have subtle opacity");

// 2. Score = 30 (Low activity)
const score30 = computeHelixParticles(30);
console.log("Score 30:", { count: score30.totalCount, baseDur: score30.baseDur.toFixed(2), opacity: score30.opacity });
assert.ok(score30.totalCount >= 5 && score30.totalCount <= 8, "Score 30 should produce low particle count");
assert.ok(score30.totalCount > score0.totalCount, "Score 30 should produce more particles than score 0");

// 3. Score = 60 (Moderate activity)
const score60 = computeHelixParticles(60);
console.log("Score 60:", { count: score60.totalCount, baseDur: score60.baseDur.toFixed(2), opacity: score60.opacity });
assert.ok(score60.totalCount >= 10 && score60.totalCount <= 13, "Score 60 should produce moderate particle count");
assert.ok(score60.totalCount > score30.totalCount, "Score 60 should produce more particles than score 30");

// 4. Score = 84 (High activity - matching screenshot case)
const score84 = computeHelixParticles(84);
console.log("Score 84:", { count: score84.totalCount, baseDur: score84.baseDur.toFixed(2), opacity: score84.opacity });
assert.ok(score84.totalCount >= 14 && score84.totalCount <= 16, "Score 84 should produce high particle count");
assert.ok(score84.baseDur < score60.baseDur, "Score 84 should be slightly faster than score 60");

// 5. Score = 100 (Maximum intended activity - controlled, premium)
const score100 = computeHelixParticles(100);
console.log("Score 100:", { count: score100.totalCount, baseDur: score100.baseDur, opacity: score100.opacity });
assert.strictEqual(score100.totalCount, 18, "Score 100 should produce exactly 18 particles");
assert.strictEqual(score100.baseDur, 5.5, "Score 100 should have base duration of 5.5s (nimble, lively)");
assert.strictEqual(score100.opacity, 0.98, "Score 100 should have vibrant opacity");

// 6. Loading state (null / undefined -> neutral fallback 50/100)
const scoreNull = computeHelixParticles(null);
const score50 = computeHelixParticles(50);
assert.strictEqual(scoreNull.totalCount, score50.totalCount, "Loading state should use neutral 50/100 equivalent");
assert.strictEqual(scoreNull.baseDur, score50.baseDur);
console.log("Null (loading) -> neutral fallback verified:", scoreNull.totalCount, "particles");

// 7. Negative begin offset check (ensures particles are distributed across the whole strand immediately)
score84.particlesA.forEach((p, idx) => {
  assert.ok(p.begin <= 0, `Particle A-${idx} must have non-positive begin offset for immediate distribution`);
});
score84.particlesB.forEach((p, idx) => {
  assert.ok(p.begin <= 0, `Particle B-${idx} must have non-positive begin offset for immediate distribution`);
});
console.log("Particle begin offsets properly staggered to prevent clumping.");

console.log("\nALL HELIX SCORE MAPPING TESTS PASSED SUCCESSFULLY!");
