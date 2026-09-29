const { query, queryRow } = require('../config/db');

exports.getDashboardStats = async (req, res) => {
  try {
    const userId = req.user.id;

    // Number of equipment listed by user
    const eqRow = queryRow('SELECT COUNT(*) AS count FROM equipment WHERE owner_id = ?', [userId]);
    const myEquipmentCount = eqRow ? eqRow.count : 0;

    // Number of requests sent by user
    const reqSentRow = queryRow('SELECT COUNT(*) AS count FROM requests WHERE requester_id = ?', [userId]);
    const myRequestsCount = reqSentRow ? reqSentRow.count : 0;

    // Pending requests sent by user
    const pendingSentRow = queryRow("SELECT COUNT(*) AS count FROM requests WHERE requester_id = ? AND status = 'Pending'", [userId]);
    const pendingSentCount = pendingSentRow ? pendingSentRow.count : 0;

    // Accepted requests sent by user
    const acceptedSentRow = queryRow("SELECT COUNT(*) AS count FROM requests WHERE requester_id = ? AND status = 'Accepted'", [userId]);
    const acceptedSentCount = acceptedSentRow ? acceptedSentRow.count : 0;

    // Inquiries received on user's equipment
    const inqReceivedRow = queryRow('SELECT COUNT(*) AS count FROM requests WHERE owner_id = ?', [userId]);
    const inqReceivedCount = inqReceivedRow ? inqReceivedRow.count : 0;

    // Pending inquiries awaiting owner's action
    const inqPendingRow = queryRow("SELECT COUNT(*) AS count FROM requests WHERE owner_id = ? AND status = 'Pending'", [userId]);
    const inqPendingCount = inqPendingRow ? inqPendingRow.count : 0;

    // Recent activity: latest requests sent and received
    const recentActivity = query(`
      SELECT 
        r.id,
        r.equipment_id,
        r.requester_id,
        r.owner_id,
        r.requested_from,
        r.requested_until,
        r.duration_days,
        r.total_price,
        r.status,
        r.created_at,
        e.name AS equipment_name,
        e.image_url AS equipment_image,
        u_req.name AS requester_name,
        u_own.name AS owner_name,
        CASE WHEN r.requester_id = ? THEN 'sent' ELSE 'received' END AS type
      FROM requests r
      JOIN equipment e ON r.equipment_id = e.id
      JOIN users u_req ON r.requester_id = u_req.id
      JOIN users u_own ON r.owner_id = u_own.id
      WHERE r.requester_id = ? OR r.owner_id = ?
      ORDER BY r.created_at DESC
      LIMIT 8
    `, [userId, userId, userId]);

    res.json({
      stats: {
        myEquipmentCount,
        myRequestsCount,
        pendingSentCount,
        acceptedSentCount,
        inqReceivedCount,
        inqPendingCount
      },
      recentActivity
    });
  } catch (err) {
    console.error('Error fetching dashboard stats:', err);
    res.status(500).json({ message: 'Error retrieving dashboard metrics.' });
  }
};
