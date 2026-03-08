// ═══════════════════════════════════════════
// AI Audit Service — Tracks AI accuracy
// ═══════════════════════════════════════════

const AUDIT_KEY = 'carcues_ai_audit';

/**
 * Log an AI prediction vs user's final input.
 * Only records an entry when the user actually changes the AI's answer.
 */
export function logAuditEntry({
    userId,
    timestamp,
    aiPrediction,
    userFinal,
    confidence,
    source,
    wasOverridden,
}) {
    const entries = getAuditLog();
    entries.push({
        id: `audit-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        userId,
        timestamp: timestamp || new Date().toISOString(),
        aiPrediction,   // { make, model, year, category }
        userFinal,      // { make, model, year, category }
        confidence,     // AI confidence %
        source,         // 'vision_api' | 'demo'
        wasOverridden,  // true if user changed the AI answer
    });
    localStorage.setItem(AUDIT_KEY, JSON.stringify(entries));
}

/**
 * Get full audit log (admin only — caller should check isAdmin)
 */
export function getAuditLog() {
    return JSON.parse(localStorage.getItem(AUDIT_KEY) || '[]');
}

/**
 * Get summary stats from the audit log
 */
export function getAuditStats() {
    const log = getAuditLog();
    const total = log.length;
    const overridden = log.filter(e => e.wasOverridden).length;
    const accurate = total - overridden;
    const accuracyRate = total > 0 ? Math.round((accurate / total) * 100) : 0;

    // Breakdown by confidence level
    const highConf = log.filter(e => e.confidence >= 80);
    const lowConf = log.filter(e => e.confidence < 80);
    const highConfAccurate = highConf.filter(e => !e.wasOverridden).length;
    const lowConfAccurate = lowConf.filter(e => !e.wasOverridden).length;

    // Most commonly overridden makes
    const overriddenMakes = {};
    log.filter(e => e.wasOverridden).forEach(e => {
        const make = e.aiPrediction?.make || 'Unknown';
        overriddenMakes[make] = (overriddenMakes[make] || 0) + 1;
    });

    return {
        total,
        accurate,
        overridden,
        accuracyRate,
        highConfTotal: highConf.length,
        highConfAccurate,
        highConfRate: highConf.length > 0 ? Math.round((highConfAccurate / highConf.length) * 100) : 0,
        lowConfTotal: lowConf.length,
        lowConfAccurate,
        lowConfRate: lowConf.length > 0 ? Math.round((lowConfAccurate / lowConf.length) * 100) : 0,
        topOverriddenMakes: Object.entries(overriddenMakes)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5),
    };
}

/**
 * Clear the audit log (admin only)
 */
export function clearAuditLog() {
    localStorage.removeItem(AUDIT_KEY);
}
