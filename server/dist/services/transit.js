"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTransitProvider = getTransitProvider;
function haversineKm(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}
class GoogleTransitProvider {
    constructor(apiKey) {
        this.apiKey = apiKey;
        this.name = 'google-distance-matrix';
    }
    async getEta(input) {
        const origins = `${input.fromLat},${input.fromLng}`;
        const destinations = `${input.toLat},${input.toLng}`;
        const walkUrl = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${encodeURIComponent(origins)}&destinations=${encodeURIComponent(destinations)}&mode=walking&key=${this.apiKey}`;
        const transitUrl = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${encodeURIComponent(origins)}&destinations=${encodeURIComponent(destinations)}&mode=transit&transit_mode=bus&departure_time=now&key=${this.apiKey}`;
        const [walkRes, transitRes] = await Promise.all([fetch(walkUrl), fetch(transitUrl)]);
        if (!walkRes.ok || !transitRes.ok)
            throw new Error('Google Distance Matrix request failed');
        const walkJson = await walkRes.json();
        const transitJson = await transitRes.json();
        const walk = walkJson.rows?.[0]?.elements?.[0];
        const transit = transitJson.rows?.[0]?.elements?.[0];
        if (!walk || walk.status !== 'OK' || !walk.duration || !walk.distance)
            throw new Error('No walk route available');
        const walkMinutes = Math.max(1, Math.round(walk.duration.value / 60));
        const transitMinutes = transit && transit.status === 'OK' && transit.duration
            ? Math.max(2, Math.round(transit.duration.value / 60))
            : Math.max(2, Math.round(walkMinutes * 1.6));
        return {
            provider: this.name,
            walkMinutes,
            transitMinutes,
            distanceKm: Number((walk.distance.value / 1000).toFixed(2)),
        };
    }
}
class OsrmFallbackProvider {
    constructor() {
        this.name = 'osrm-fallback';
    }
    async getEta(input) {
        const profile = input.safeRoute ? 'foot' : 'walking';
        const url = `https://router.project-osrm.org/route/v1/${profile}/${input.fromLng},${input.fromLat};${input.toLng},${input.toLat}?overview=false`;
        try {
            const res = await fetch(url);
            if (!res.ok)
                throw new Error('OSRM failed');
            const data = await res.json();
            const first = data.routes?.[0];
            if (!first)
                throw new Error('No OSRM route');
            const walkMinutes = Math.max(1, Math.round(first.duration / 60));
            const transitMinutes = Math.max(2, Math.round(walkMinutes * 1.7));
            return {
                provider: this.name,
                walkMinutes,
                transitMinutes,
                distanceKm: Number((first.distance / 1000).toFixed(2)),
            };
        }
        catch {
            const distanceKm = haversineKm(input.fromLat, input.fromLng, input.toLat, input.toLng);
            const walkMinutes = Math.max(1, Math.round((distanceKm / (input.safeRoute ? 4.0 : 4.8)) * 60));
            const transitMinutes = Math.max(2, Math.round(walkMinutes * 1.8));
            return { provider: 'haversine-fallback', walkMinutes, transitMinutes, distanceKm: Number(distanceKm.toFixed(2)) };
        }
    }
}
function getTransitProvider() {
    const googleKey = process.env.GOOGLE_MAPS_API_KEY;
    if (googleKey)
        return new GoogleTransitProvider(googleKey);
    return new OsrmFallbackProvider();
}
