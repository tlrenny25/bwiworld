const https = require("https");
const fs = require("fs");
const path = require("path");

const DEFAULT_BANNED = [
    // ----- Major cloud (used for proxies/scraping) -----
    16509,  // AWS
    14618,  // AWS (Amazon Data Services)
    8987,   // AWS EU
    39111,  // AWS partner
    14061,  // DigitalOcean
    20473,  // Vultr / Choopa
    63949,  // Linode / Akamai
    16276,  // OVH
    35540,  // OVH Canada
    24940,  // Hetzner
    213230, // Hetzner online
    45102,  // Alibaba US
    14315,  // Alibaba Singapore
    37963,  // Alibaba Hangzhou
    132203, // Tencent
    45090,  // Tencent CN

    // ----- Bulletproof / abuse-friendly hosters -----
    9009,   // M247
    201814, // MivoCloud
    210644, // AEZA
    213035, // Aeza Group
    204957, // Aeza International
    216246, // Aeza
    51167,  // Contabo
    60068,  // Datacamp / CDN77
    62240,  // Clouvider
    39351,  // 31173 Services
    135161, // MEGALAYER
    46844,  // Sharktech
    44477,  // Stark Industries
    200651, // FlokiNET
    43350,  // NForce
    197540, // netcup
    49981,  // WorldStream
    133752, // Leaseweb
    47583,  // Hostinger
    50673,  // Serverius
    41564,  // Orion Network
    199524, // G-Core Labs
    35916,  // MULTACOM
    46562,  // Performive
    49870,  // Alsycon
    25369,  // Hydra Communications
    20860,  // Iomart Cloud Services
    51852,  // Private Layer
    29066,  // Private Layer Inc
    62567,  // DigitalOcean variant
    62217,  // Lima City / cheap VPS
    30633,  // Leaseweb USA
    30823,  // Combahton
    62000,  // Inferno Communications
    207990, // Hostkey
    395092, // Shock Hosting
    136787, // TEFINCOM (NordVPN)
    209103, // ProtonVPN
    62041,  // QuadraNet
    23470,  // ReliableSite
    8100,   // QuadraNet
    197695, // Reg.ru hosting
    47764,  // VK / mail.ru cloud
    53667,  // FranTech / BuyVM
    396507, // FranTech / Frantech variants
    3214,   // XTOM
    22612,  // Namecheap
    19437,  // SecuredServers / GoDaddy
    26496,  // GoDaddy
    61317,  // Digital Energy Technologies
    207812, // FastNetwork / pq.hosting
    50340,  // SELECTEL
    59729,  // Selectel
    49505,  // Selectel
    206092, // INTERNET-COSMOS
    211252, // Delis LLC (proxy)
    215826, // Aeza variant
    210079, // EstNoc
];

const CACHE_FILE = path.join(__dirname, "config/asn_cache.json");
let cache = {};
try {
    if (fs.existsSync(CACHE_FILE)) cache = JSON.parse(fs.readFileSync(CACHE_FILE));
} catch (e) { cache = {}; }

function saveCache() {
    try { fs.writeFileSync(CACHE_FILE, JSON.stringify(cache)); } catch (e) {}
}

let saveTimer = null;
function scheduleSave() {
    if (saveTimer) return;
    saveTimer = setTimeout(() => { saveTimer = null; saveCache(); }, 5000);
}

function getBannedList() {
    try {
        const cfg = JSON.parse(fs.readFileSync(path.join(__dirname, "config/server-settings.json")));
        if (Array.isArray(cfg.bannedASNs)) return cfg.bannedASNs;
    } catch (e) {}
    return DEFAULT_BANNED;
}

function lookupASN(ip, cb) {
    const cached = cache[ip];
    if (cached && Date.now() - cached.ts < 7 * 24 * 3600 * 1000) {
        return cb(null, cached.asn);
    }
    const req = https.get(`https://ip-api.com/json/${encodeURIComponent(ip)}?fields=as,status`, res => {
        let body = "";
        res.on("data", c => { body += c; });
        res.on("end", () => {
            try {
                const j = JSON.parse(body);
                if (j.status !== "success" || !j.as) {
                    cache[ip] = { asn: null, ts: Date.now() };
                    scheduleSave();
                    return cb(null, null);
                }
                const m = /^AS(\d+)/.exec(j.as);
                const asn = m ? parseInt(m[1], 10) : null;
                cache[ip] = { asn, ts: Date.now() };
                scheduleSave();
                cb(null, asn);
            } catch (e) { cb(e); }
        });
    });
    req.on("error", e => cb(e));
    req.setTimeout(4000, () => { req.destroy(new Error("asn lookup timeout")); });
}

function check(ip, cb) {
    if (!ip || ip === "127.0.0.1" || ip.startsWith("192.168.") || ip.startsWith("10.") || ip.startsWith("::1")) {
        return cb(null, { banned: false, asn: null });
    }
    lookupASN(ip, (err, asn) => {
        if (err || asn == null) return cb(null, { banned: false, asn });
        const banned = getBannedList().includes(asn);
        cb(null, { banned, asn });
    });
}

function addASN(asn) {
    const cfgPath = path.join(__dirname, "config/server-settings.json");
    try {
        const cfg = JSON.parse(fs.readFileSync(cfgPath));
        if (!Array.isArray(cfg.bannedASNs)) cfg.bannedASNs = DEFAULT_BANNED.slice();
        if (!cfg.bannedASNs.includes(asn)) {
            cfg.bannedASNs.push(asn);
            fs.writeFileSync(cfgPath, JSON.stringify(cfg, null, 4));
            return true;
        }
    } catch (e) {}
    return false;
}

function removeASN(asn) {
    const cfgPath = path.join(__dirname, "config/server-settings.json");
    try {
        const cfg = JSON.parse(fs.readFileSync(cfgPath));
        if (!Array.isArray(cfg.bannedASNs)) return false;
        const idx = cfg.bannedASNs.indexOf(asn);
        if (idx >= 0) {
            cfg.bannedASNs.splice(idx, 1);
            fs.writeFileSync(cfgPath, JSON.stringify(cfg, null, 4));
            return true;
        }
    } catch (e) {}
    return false;
}

module.exports = { check, addASN, removeASN, getBannedList, DEFAULT_BANNED };
