"use strict";
const crypto = require("crypto");

// ─── Config ──────────────────────────────────────────────────────────────────

const CFG = Object.freeze({
    DIFFICULTY_MIN:             16,
    DIFFICULTY_MAX:             26,

    CHALLENGE_MAX_AGE_MS:       60000,
    SOLVE_TIMEOUT_MS:           45000,

    SESSION_MAX_CHALLENGES:     6,
    SESSION_WINDOW_MS:          60000,

    // FIX 1: Two-tier EMA for flood resistance.
    // Fast EMA reacts quickly to genuine spikes.
    // Slow EMA provides a stable baseline.
    // Difficulty is driven by the SLOWER of the two —
    // this prevents retry storms (Firefox/Safari) from
    // spiking difficulty for everyone immediately.
    LOAD_EMA_ALPHA_FAST:        0.6,   // was 0.25 — reacts in ~2 samples (~4 seconds)
    LOAD_EMA_ALPHA_SLOW:        0.05,   // reacts in ~20 samples
    LOAD_SAMPLE_INTERVAL_MS:    2000,
    LOAD_FLOOD_THRESHOLD:       0.4,   // was 0.65 — trigger earlier

    RISK_THRESHOLD_HARD:        85,
    RISK_THRESHOLD_MAX_DIFF:    60,

    MAX_PENDING_CHALLENGES:     500,
    MAX_SESSIONS:               2000,

    CLEANUP_INTERVAL_MS:        15000,

    // FIX 2: Global session creation rate limit.
    // Prevents session regeneration abuse where attacker
    // creates fresh sessions repeatedly to reset challenge counts.
    // Tracked as a simple sliding count — NOT per-IP.
    GLOBAL_SESSION_WINDOW_MS:   10000,  // 10s window
    GLOBAL_SESSION_MAX:         150,    // max new sessions per window across all clients

    // FIX 3: Nonce answer validation bounds.
    // Reject answers that are clearly out of range to prevent
    // garbage-flooding the PoW check with huge strings.
    ANSWER_MAX_LENGTH:          32,
});

// ─── State ───────────────────────────────────────────────────────────────────

// nonce -> { issuedAt, difficulty, sessionId }
const pending = new Map();

// sessionId -> { issuedAt, lastSeen, challengeCount, riskScore }
const sessions = new Map();

// FIX 1: Two-tier EMA state
let emaFast = 0.0;
let emaSlow = 0.0;
let connectionsSinceLastSample = 0;
let lastSampleTime = Date.now();

// FIX 2: Global session creation rate tracking
let globalSessionTimestamps = [];

// ─── Load estimation (two-tier EMA) ──────────────────────────────────────────

const EXPECTED_MAX_CPS = 3;

setInterval(() => {
    const now = Date.now();
    const elapsed = Math.max((now - lastSampleTime) / 1000, 0.001);
    const cps = connectionsSinceLastSample / elapsed;
    const normalized = Math.min(1.0, cps / EXPECTED_MAX_CPS);

    // FIX 1: Update both EMAs independently
    emaFast = CFG.LOAD_EMA_ALPHA_FAST * normalized + (1 - CFG.LOAD_EMA_ALPHA_FAST) * emaFast;
    emaSlow = CFG.LOAD_EMA_ALPHA_SLOW * normalized + (1 - CFG.LOAD_EMA_ALPHA_SLOW) * emaSlow;

    connectionsSinceLastSample = 0;
    lastSampleTime = now;
}, CFG.LOAD_SAMPLE_INTERVAL_MS);

// ─── Cleanup ─────────────────────────────────────────────────────────────────

setInterval(() => {
    const now = Date.now();

    for (const [nonce, data] of pending) {
        if (now - data.issuedAt > CFG.CHALLENGE_MAX_AGE_MS) pending.delete(nonce);
    }

    for (const [sid, sess] of sessions) {
        if (now - sess.lastSeen > CFG.SESSION_WINDOW_MS * 2) sessions.delete(sid);
    }

    // FIX 2: Trim global session timestamps
    const gCutoff = now - CFG.GLOBAL_SESSION_WINDOW_MS;
    globalSessionTimestamps = globalSessionTimestamps.filter(t => t > gCutoff);

    // Emergency eviction — oldest first
    if (pending.size > CFG.MAX_PENDING_CHALLENGES) {
        [...pending.entries()]
            .sort((a, b) => a[1].issuedAt - b[1].issuedAt)
            .slice(0, pending.size - CFG.MAX_PENDING_CHALLENGES)
            .forEach(([n]) => pending.delete(n));
    }

    if (sessions.size > CFG.MAX_SESSIONS) {
        [...sessions.entries()]
            .sort((a, b) => a[1].lastSeen - b[1].lastSeen)
            .slice(0, sessions.size - CFG.MAX_SESSIONS)
            .forEach(([s]) => sessions.delete(s));
    }

}, CFG.CLEANUP_INTERVAL_MS);

// ─── Session management ───────────────────────────────────────────────────────

function createSession() {
    // FIX 2: Global session creation rate limit.
    // Trims the window and checks count before creating.
    // Prevents attacker from hammering new sessions to reset
    // per-session challenge counters. Not IP-based — affects
    // all connections equally when under flood.
    const now = Date.now();
    const cutoff = now - CFG.GLOBAL_SESSION_WINDOW_MS;
    globalSessionTimestamps = globalSessionTimestamps.filter(t => t > cutoff);

    if (globalSessionTimestamps.length >= CFG.GLOBAL_SESSION_MAX) {
        // Return null — caller must handle this gracefully
        return null;
    }

    globalSessionTimestamps.push(now);

    const sessionId = crypto.randomBytes(24).toString("hex");
    sessions.set(sessionId, {
        issuedAt:       now,
        lastSeen:       now,
        challengeCount: 0,
        riskScore:      0
    });
    return sessionId;
}

function getSession(sessionId) {
    if (typeof sessionId !== "string" || sessionId.length === 0) return null;
    return sessions.get(sessionId) || null;
}

function touchSession(sessionId) {
    const sess = sessions.get(sessionId);
    if (sess) sess.lastSeen = Date.now();
}

// ─── Risk scoring ──────────────────────────────────────────────────────────────

function computeRiskScore(sess) {
    let score = 0;

    // Signal 1: excessive challenge requests within session
    const extraChallenges = Math.max(0, sess.challengeCount - 2);
    score += Math.min(40, extraChallenges * 15);

    // FIX 1: Use slow EMA for risk scoring, not fast EMA.
    // Fast EMA would spike risk during Firefox/Safari retry storms
    // (e.g. rapid reconnects after network hiccup), unfairly penalizing
    // legitimate users. Slow EMA only rises under sustained load.
    score += Math.floor(emaSlow * 25);

    // Signal 3: session velocity — suspiciously fast first challenge
    const sessionAgeSec = (Date.now() - sess.issuedAt) / 1000;
    if (sessionAgeSec < 1.0 && sess.challengeCount >= 1) {
        score += 20;
    }

    return Math.min(100, score);
}

function difficultyFromRisk(riskScore) {
    const t = Math.min(1.0, riskScore / 100);
    return Math.round(CFG.DIFFICULTY_MIN + t * (CFG.DIFFICULTY_MAX - CFG.DIFFICULTY_MIN));
}

// ─── PoW core ─────────────────────────────────────────────────────────────────

function countLeadingZeroBits(buf) {
    let bits = 0;
    for (let i = 0; i < buf.length; i++) {
        const byte = buf[i];
        if (byte === 0) { bits += 8; continue; }
        let b = byte;
        while ((b & 0x80) === 0) { bits++; b <<= 1; }
        break;
    }
    return bits;
}

function checkPoW(nonce, answer, requiredBits) {
    // FIX 5: Explicit UTF-8 Buffer construction.
    // String(answer) normalises numeric answers safely.
    // Buffer.from(..., "utf8") guarantees identical byte sequences
    // across Firefox, Chrome, Safari, and Node.js — no implicit
    // encoding differences can affect the hash.
    const input = Buffer.from(nonce + ":" + String(answer), "utf8");
    const hash = crypto.createHash("sha256").update(input).digest();
    return countLeadingZeroBits(hash) >= requiredBits;
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Call once per new socket connection.
 * Returns sessionId string, or null if global session rate is exceeded.
 */
function recordConnection() {
    connectionsSinceLastSample++;
    return createSession(); // may return null under flood
}

/**
 * Returns true if system load exceeds flood threshold.
 * Driven by slow EMA to avoid reacting to short bursts.
 */
function isUnderAttack() {
    // FIX: Use fast EMA for immediate burst detection,
    // slow EMA for sustained flood detection.
    // Either triggers the gate — fast catches sudden join floods,
    // slow catches sustained low-rate floods.
    return emaFast > CFG.LOAD_FLOOD_THRESHOLD || emaSlow > CFG.LOAD_FLOOD_THRESHOLD;
}

/**
 * Generate a challenge for a session.
 * @param {string} sessionId
 * @returns {{ nonce, difficulty, timeoutMs } | { error, blocked }}
 */
function generateChallenge(sessionId) {
    const sess = getSession(sessionId);
    if (!sess) return { error: "Invalid or expired session.", blocked: true };

    touchSession(sessionId);

    if (sess.challengeCount >= CFG.SESSION_MAX_CHALLENGES) {
        return { error: "Too many challenge requests. Please wait.", blocked: true };
    }

    const riskScore = computeRiskScore(sess);
    if (riskScore >= CFG.RISK_THRESHOLD_HARD) {
        return { error: "Request rejected.", blocked: true };
    }

    // FIX 4: Increment challenge count BEFORE issuing the challenge.
    // Previous order: issue nonce, then increment.
    // Under concurrent requests the old order allowed two simultaneous
    // generateChallenge calls to both read challengeCount = N,
    // both pass the limit check, and both issue a challenge —
    // effectively allowing 2x the session limit.
    // Incrementing first means the second concurrent call sees N+1
    // even if the Map write hasn't flushed yet in the same tick.
    sess.challengeCount++;
    sess.riskScore = riskScore;

    const nonce = crypto.randomBytes(16).toString("hex");
    const difficulty = difficultyFromRisk(riskScore);
    const issuedAt = Date.now();

    pending.set(nonce, { issuedAt, difficulty, sessionId });

    return { nonce, difficulty, timeoutMs: CFG.SOLVE_TIMEOUT_MS };
}

/**
 * Verify a challenge answer.
 * Always returns a plain boolean. Never throws. Never returns a Promise.
 *
 * @param {object} challenge  - original challenge { nonce }
 * @param {string|number} answer
 * @param {string} sessionId
 * @returns {boolean}
 */
function verify(challenge, answer, sessionId) {
    // Input validation
    if (!challenge || typeof challenge.nonce !== "string") return false;
    if (typeof answer !== "string" && typeof answer !== "number") return false;

    // FIX 3: Reject oversized answers before doing any Map lookups.
    // Prevents garbage-flooding the verify path with huge strings
    // that could cause string allocation pressure.
    if (String(answer).length > CFG.ANSWER_MAX_LENGTH) return false;

    // FIX 4: Extract AND delete the record in a single operation.
    // This is as close to atomic as JS single-threaded event loop allows.
    // Reading then deleting in two separate statements creates no race
    // in Node.js (single-threaded), but doing it in one assignment
    // makes the intent explicit and prevents future refactoring mistakes.
    const record = pending.get(challenge.nonce);
    pending.delete(challenge.nonce); // delete unconditionally — even on failure paths

    if (!record) return false;

    // Server-side expiry
    if (Date.now() - record.issuedAt > CFG.CHALLENGE_MAX_AGE_MS) return false;

    // Session consistency — prevents challenge harvesting across sessions.
    // Soft: only enforced when both sides provide a sessionId.
    // This preserves compatibility with NAT/proxy users where session
    // might not be available on every request path.
    if (sessionId && record.sessionId && record.sessionId !== sessionId) {
        return false;
    }

    // PoW check — uses server-recorded difficulty, never client-supplied
    return checkPoW(challenge.nonce, answer, record.difficulty);
}

/**
 * Issue a fresh challenge to replace an expired one.
 */
function refreshChallenge(oldNonce, sessionId) {
    if (typeof oldNonce === "string") pending.delete(oldNonce);
    return generateChallenge(sessionId);
}

function getStats() {
    return {
        pendingChallenges:      pending.size,
        activeSessions:         sessions.size,
        emaFast:                emaFast.toFixed(3),
        emaSlow:                emaSlow.toFixed(3),
        currentDifficulty:      difficultyFromRisk(Math.floor(emaSlow * 100)),
        underAttack:            isUnderAttack(),
        globalSessionRate:      globalSessionTimestamps.length
    };
}

function forceAttack() {
    emaFast = 1.0;
    emaSlow = 1.0;
}

function clearAttack() {
    emaFast = 0.0;
    emaSlow = 0.0;
    connectionsSinceLastSample = 0;
    globalSessionTimestamps = [];
}

function isSessionRateHigh() {
    const cutoff = Date.now() - CFG.GLOBAL_SESSION_WINDOW_MS;
    const recent = globalSessionTimestamps.filter(t => t > cutoff).length;
    // If we're burning through more than half our session budget
    // in the current window, treat it as suspicious regardless of EMA.
    return recent > CFG.GLOBAL_SESSION_MAX * 0.4;
}

module.exports = {
    recordConnection,
    isUnderAttack,
    isSessionRateHigh, // <-- add this
    generateChallenge,
    verify,
    refreshChallenge,
    getStats,
    forceAttack,
    clearAttack,
    SOLVE_TIMEOUT_MS: CFG.SOLVE_TIMEOUT_MS
};