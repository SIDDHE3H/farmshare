const { query, queryRow, run } = require('../config/db');
const { findConflictingAcceptedBookings } = require('../utils/bookingConflict');

exports.createRequest = async (req, res) => {
  try {
    const {
      equipment_id,
      requested_from,
      requested_until,
      duration_days,
      message,
      contact_number
    } = req.body;

    if (!equipment_id || !requested_from || !requested_until || !duration_days || !contact_number) {
      return res.status(400).json({ message: 'Please provide all booking details (dates, duration, contact number).' });
    }

    const equipment = queryRow('SELECT * FROM equipment WHERE id = ?', [equipment_id]);
    if (!equipment) {
      return res.status(404).json({ message: 'Equipment not found.' });
    }

    // Prevent owner from requesting their own equipment
    if (equipment.owner_id === req.user.id) {
      return res.status(400).json({ message: 'You cannot rent your own equipment.' });
    }

    // Verify date ordering
    if (new Date(requested_from) > new Date(requested_until)) {
      return res.status(400).json({ message: 'Requested end date cannot be earlier than start date.' });
    }

    // Check if dates fall within equipment general availability window
    if (requested_from < equipment.available_from || requested_until > equipment.available_until) {
      return res.status(400).json({
        message: `Equipment is only available between ${equipment.available_from} and ${equipment.available_until}.`
      });
    }

    // Check for existing accepted booking conflicts
    const conflicts = findConflictingAcceptedBookings(equipment_id, requested_from, requested_until);
    if (conflicts && conflicts.length > 0) {
      return res.status(409).json({
        message: 'This equipment is already booked by another farmer for the selected dates. Please choose different dates.'
      });
    }

    const duration = Math.max(1, parseInt(duration_days, 10));
    const totalPrice = duration * equipment.price_per_day;

    const result = run(`
      INSERT INTO requests (
        equipment_id, requester_id, owner_id,
        requested_from, requested_until, duration_days,
        total_price, message, contact_number, status
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'Pending')
    `, [
      equipment_id,
      req.user.id,
      equipment.owner_id,
      requested_from,
      requested_until,
      duration,
      totalPrice,
      message ? message.trim() : 'I would like to rent this equipment for farming work.',
      contact_number.trim()
    ]);

    const created = queryRow('SELECT * FROM requests WHERE id = ?', [result.lastInsertRowid]);

    res.status(201).json({
      message: 'Request sent successfully.',
      request: created
    });
  } catch (err) {
    console.error('Error creating request:', err);
    res.status(500).json({ message: 'Something went wrong while submitting your request.' });
  }
};

exports.getMyRequests = async (req, res) => {
  try {
    const requests = query(`
      SELECT 
        r.*,
        e.name AS equipment_name,
        e.category AS equipment_category,
        e.image_url AS equipment_image,
        e.price_per_day AS equipment_price_per_day,
        e.village AS equipment_village,
        e.taluka AS equipment_taluka,
        e.district AS equipment_district,
        u.name AS owner_name,
        u.phone AS owner_phone,
        u.village AS owner_village
      FROM requests r
      JOIN equipment e ON r.equipment_id = e.id
      JOIN users u ON r.owner_id = u.id
      WHERE r.requester_id = ?
      ORDER BY r.created_at DESC
    `, [req.user.id]);

    res.json({ requests });
  } catch (err) {
    console.error('Error fetching my requests:', err);
    res.status(500).json({ message: 'Error retrieving your equipment requests.' });
  }
};

exports.getReceivedRequests = async (req, res) => {
  try {
    const requests = query(`
      SELECT 
        r.*,
        e.name AS equipment_name,
        e.category AS equipment_category,
        e.image_url AS equipment_image,
        e.price_per_day AS equipment_price_per_day,
        e.village AS equipment_village,
        u.name AS requester_name,
        u.phone AS requester_phone,
        u.email AS requester_email,
        u.village AS requester_village,
        u.taluka AS requester_taluka,
        u.district AS requester_district
      FROM requests r
      JOIN equipment e ON r.equipment_id = e.id
      JOIN users u ON r.requester_id = u.id
      WHERE r.owner_id = ?
      ORDER BY r.created_at DESC
    `, [req.user.id]);

    res.json({ requests });
  } catch (err) {
    console.error('Error fetching received requests:', err);
    res.status(500).json({ message: 'Error retrieving received equipment requests.' });
  }
};

exports.updateRequestStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['Accepted', 'Rejected', 'Completed'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status. Must be Accepted, Rejected, or Completed.' });
    }

    const requestItem = queryRow('SELECT * FROM requests WHERE id = ?', [id]);
    if (!requestItem) {
      return res.status(404).json({ message: 'Request not found.' });
    }

    if (requestItem.owner_id !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized. You can only manage requests for your own equipment.' });
    }

    // Double-Booking Protection Check
    if (status === 'Accepted') {
      const conflicts = findConflictingAcceptedBookings(
        requestItem.equipment_id,
        requestItem.requested_from,
        requestItem.requested_until,
        requestItem.id
      );

      if (conflicts && conflicts.length > 0) {
        return res.status(409).json({
          message: 'Equipment is already booked for these dates.',
          conflicts
        });
      }
    }

    run(`
      UPDATE requests
      SET status = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [status, id]);

    const updated = queryRow('SELECT * FROM requests WHERE id = ?', [id]);

    res.json({
      message: `Request status updated to ${status}.`,
      request: updated
    });
  } catch (err) {
    console.error('Error updating request status:', err);
    res.status(500).json({ message: 'Failed to update request status.' });
  }
};

exports.cancelRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const requestItem = queryRow('SELECT * FROM requests WHERE id = ?', [id]);

    if (!requestItem) {
      return res.status(404).json({ message: 'Request not found.' });
    }

    if (requestItem.requester_id !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized. You can only cancel your own requests.' });
    }

    if (requestItem.status !== 'Pending') {
      return res.status(400).json({ message: `Cannot cancel a request that is already ${requestItem.status}.` });
    }

    run(`
      UPDATE requests
      SET status = 'Cancelled', updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [id]);

    res.json({ message: 'Request cancelled successfully.' });
  } catch (err) {
    console.error('Error cancelling request:', err);
    res.status(500).json({ message: 'Failed to cancel request.' });
  }
};
