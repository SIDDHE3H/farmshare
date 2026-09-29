const { query } = require('../config/db');

/**
 * Checks if the specified equipment has any conflicting ACCEPTED requests
 * for the requested date window.
 *
 * Conflict occurs if:
 * requested_from <= existing.requested_until AND requested_until >= existing.requested_from
 */
function findConflictingAcceptedBookings(equipmentId, requestedFrom, requestedUntil, excludeRequestId = null) {
  let sql = `
    SELECT id, equipment_id, requested_from, requested_until, status
    FROM requests
    WHERE equipment_id = ?
      AND status = 'Accepted'
      AND NOT (requested_until < ? OR requested_from > ?)
  `;
  const params = [equipmentId, requestedFrom, requestedUntil];

  if (excludeRequestId) {
    sql += ' AND id != ?';
    params.push(excludeRequestId);
  }

  return query(sql, params);
}

module.exports = {
  findConflictingAcceptedBookings
};
