"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const transit_1 = require("../services/transit");
const router = (0, express_1.Router)();
function asNumber(input) {
    const n = Number(input);
    return Number.isFinite(n) ? n : NaN;
}
// GET /api/transit/eta
router.get('/eta', async (req, res) => {
    const fromLat = asNumber(req.query.fromLat);
    const fromLng = asNumber(req.query.fromLng);
    const toLat = asNumber(req.query.toLat);
    const toLng = asNumber(req.query.toLng);
    const safeRoute = req.query.safeRoute === 'true';
    if (![fromLat, fromLng, toLat, toLng].every(Number.isFinite)) {
        return res.status(400).json({ error: 'fromLat, fromLng, toLat, toLng are required numeric values' });
    }
    try {
        const provider = (0, transit_1.getTransitProvider)();
        const eta = await provider.getEta({ fromLat, fromLng, toLat, toLng, safeRoute });
        return res.json(eta);
    }
    catch (err) {
        console.error('[transit]', err);
        return res.status(500).json({ error: 'Failed to fetch transit ETA' });
    }
});
exports.default = router;
