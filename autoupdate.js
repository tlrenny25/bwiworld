const { execFile } = require("child_process");
const fs = require("fs");
const path = require("path");

const REPO_URL = "https://github.com/BlueEyedStickman/BWIWorld.git";
const BRANCH = "main";
const INTERVAL_MS = 5 * 60 * 1000;
const RESTART_ETA_MS = 10000;

function getToken() {
    if (process.env.GITHUB_TOKEN) return process.env.GITHUB_TOKEN.trim();
    const tokenFile = path.join(__dirname, ".github_token");
    if (fs.existsSync(tokenFile)) {
        return fs.readFileSync(tokenFile, "utf8").trim();
    }
    return null;
}

function git(args, cb) {
    const token = getToken();
    const fullArgs = [];
    if (token) {
        const basic = Buffer.from("x-access-token:" + token).toString("base64");
        fullArgs.push("-c", "http.extraheader=Authorization: Basic " + basic);
    }
    fullArgs.push(...args);
    execFile("git", fullArgs, { cwd: __dirname }, (err, stdout, stderr) => {
        cb(err, (stdout || "").trim(), (stderr || "").trim());
    });
}

function broadcastUpdateNotice() {
    try {
        const rooms = require("./commands.js").rooms;
        if (!rooms) return;
        Object.keys(rooms).forEach(rname => {
            const r = rooms[rname];
            if (r && typeof r.emit === "function") {
                r.emit("announce", {
                    title: "SYSTEM",
                    html: "BonziWORLD is updating in 10 seconds. Prepare yourselves."
                });
            }
        });
    } catch (e) {
        console.log("[autoupdate] broadcast failed:", e.message);
    }
}

function pullAndRestart() {
    broadcastUpdateNotice();
    setTimeout(() => {
        git(["reset", "--hard", "FETCH_HEAD"], (err, _out, stderr) => {
            if (err) {
                console.log("[autoupdate] reset failed:", stderr || err.message);
                return;
            }
            console.log("[autoupdate] reset to FETCH_HEAD; restarting via pm2");
            const name = process.env.name || process.env.pm_id || "bonziworld-cc";
            execFile("pm2", ["restart", String(name)], (err, _o, serr) => {
                if (err) console.log("[autoupdate] pm2 restart failed:", serr || err.message);
            });
        });
    }, 10000);
}

// cb(err, { updated: bool, etaMs: number|null, local, remote })
function checkNow(cb) {
    if (!getToken()) {
        return cb(new Error("no token configured"));
    }
    git(["fetch", REPO_URL, BRANCH], (err, _out, stderr) => {
        if (err) return cb(new Error(stderr || err.message));
        git(["rev-parse", "HEAD"], (err, local) => {
            if (err) return cb(err);
            git(["rev-parse", "FETCH_HEAD"], (err, remote) => {
                if (err) return cb(err);
                if (local === remote) {
                    return cb(null, { updated: false, etaMs: null, local, remote });
                }
                cb(null, { updated: true, etaMs: RESTART_ETA_MS, local, remote });
                pullAndRestart();
            });
        });
    });
}

function start() {
    if (!getToken()) {
        console.log("[autoupdate] no GITHUB_TOKEN / .github_token found, auto-update disabled");
        return;
    }
    console.log("[autoupdate] enabled, checking every", INTERVAL_MS / 1000, "s");
    setInterval(() => checkNow(() => {}), INTERVAL_MS);
    setTimeout(() => checkNow(() => {}), 15000);
}

module.exports = { start, checkNow };
