// ═══════════════════════════════════════════
// AI Audit Service — Tracks AI accuracy
// All data via Neon PostgreSQL API
// ═══════════════════════════════════════════

import { api } from './apiClient';

/**
 * Log an AI prediction vs user's final input.
 */
export async function logAuditEntry({
    userId,
    aiPrediction,
    userFinal,
    confidence,
    source,
    wasOverridden,
}) {
    await api('/api/audit', {
        method: 'POST',
        body: JSON.stringify({ aiPrediction, userFinal, confidence, source, wasOverridden }),
    });
}

/**
 * Get full audit log + stats (admin only)
 */
export async function getAuditData() {
    const data = await api('/api/audit');
    return data;
}

/**
 * Clear the audit log (admin only)
 */
export async function clearAuditLog() {
    await api('/api/audit', { method: 'DELETE' });
}
