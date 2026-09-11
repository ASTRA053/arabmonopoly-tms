import { pool } from './db.js';

export async function recordAudit({ actorUserId = null, action, entityType, entityId = null, metadata = {} }) {
  await pool.query(
    `INSERT INTO audit_logs (actor_user_id, action, entity_type, entity_id, metadata)
     VALUES ($1, $2, $3, $4, $5)`,
    [actorUserId, action, entityType, entityId == null ? null : String(entityId), metadata]
  );
}
