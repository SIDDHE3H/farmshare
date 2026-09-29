const { query, queryRow, run } = require('../config/db');

exports.getEquipment = async (req, res) => {
  try {
    const {
      q,
      category,
      location,
      minPrice,
      maxPrice,
      condition,
      sort
    } = req.query;

    let sql = `
      SELECT 
        e.*,
        u.name AS owner_name,
        u.phone AS owner_phone,
        u.village AS owner_village,
        u.district AS owner_district
      FROM equipment e
      JOIN users u ON e.owner_id = u.id
      WHERE 1=1
    `;
    const params = [];

    // General search query
    if (q && q.trim()) {
      const term = `%${q.trim().toLowerCase()}%`;
      sql += ` AND (
        LOWER(e.name) LIKE ? OR 
        LOWER(e.description) LIKE ? OR 
        LOWER(e.category) LIKE ? OR 
        LOWER(e.village) LIKE ? OR 
        LOWER(e.taluka) LIKE ? OR 
        LOWER(e.district) LIKE ? OR 
        LOWER(e.state) LIKE ?
      )`;
      params.push(term, term, term, term, term, term, term);
    }

    // Category filter
    if (category && category.trim() && category.toLowerCase() !== 'all') {
      sql += ' AND LOWER(e.category) = ?';
      params.push(category.trim().toLowerCase());
    }

    // Location filter
    if (location && location.trim()) {
      const locTerm = `%${location.trim().toLowerCase()}%`;
      sql += ` AND (
        LOWER(e.village) LIKE ? OR 
        LOWER(e.taluka) LIKE ? OR 
        LOWER(e.district) LIKE ? OR 
        LOWER(e.state) LIKE ?
      )`;
      params.push(locTerm, locTerm, locTerm, locTerm);
    }

    // Min / Max price
    if (minPrice && !isNaN(Number(minPrice))) {
      sql += ' AND e.price_per_day >= ?';
      params.push(Number(minPrice));
    }
    if (maxPrice && !isNaN(Number(maxPrice))) {
      sql += ' AND e.price_per_day <= ?';
      params.push(Number(maxPrice));
    }

    // Condition filter
    if (condition && condition.trim() && condition.toLowerCase() !== 'all') {
      sql += ' AND LOWER(e.condition) = ?';
      params.push(condition.trim().toLowerCase());
    }

    // Sorting
    if (sort === 'price_asc') {
      sql += ' ORDER BY e.price_per_day ASC';
    } else if (sort === 'price_desc') {
      sql += ' ORDER BY e.price_per_day DESC';
    } else {
      sql += ' ORDER BY e.created_at DESC';
    }

    const items = query(sql, params);
    res.json({ equipment: items });
  } catch (err) {
    console.error('Error fetching equipment:', err);
    res.status(500).json({ message: 'Unable to retrieve equipment listings.' });
  }
};

exports.getEquipmentById = async (req, res) => {
  try {
    const { id } = req.params;

    const item = queryRow(`
      SELECT 
        e.*,
        u.name AS owner_name,
        u.email AS owner_email,
        u.phone AS owner_phone,
        u.village AS owner_village,
        u.taluka AS owner_taluka,
        u.district AS owner_district,
        u.state AS owner_state,
        u.created_at AS owner_joined_at
      FROM equipment e
      JOIN users u ON e.owner_id = u.id
      WHERE e.id = ?
    `, [id]);

    if (!item) {
      return res.status(404).json({ message: 'Equipment listing not found.' });
    }

    // Also fetch accepted bookings so frontend can disable already booked dates
    const bookedDates = query(`
      SELECT id, requested_from, requested_until, status
      FROM requests
      WHERE equipment_id = ? AND status = 'Accepted'
      ORDER BY requested_from ASC
    `, [id]);

    res.json({
      equipment: item,
      bookedDates
    });
  } catch (err) {
    console.error('Error fetching equipment by id:', err);
    res.status(500).json({ message: 'Error retrieving equipment details.' });
  }
};

exports.createEquipment = async (req, res) => {
  try {
    const {
      name,
      category,
      description,
      village,
      taluka,
      district,
      state,
      price_per_day,
      price_per_hour,
      available_from,
      available_until,
      condition,
      image_url: customImageUrl
    } = req.body;

    if (!name || !category || !description || !village || !taluka || !district || !state || !price_per_day || !available_from || !available_until || !condition) {
      return res.status(400).json({ message: 'All required fields must be filled.' });
    }

    let finalImageUrl = customImageUrl || '';
    if (req.file) {
      finalImageUrl = `/uploads/${req.file.filename}`;
    }

    if (!finalImageUrl) {
      // Default agricultural placeholder based on category
      const placeholders = {
        'Tractor': 'https://images.unsplash.com/photo-1592982537447-6f2a6a0c5c1b?auto=format&fit=crop&w=1000&q=80',
        'Rotavator': 'https://images.unsplash.com/photo-1589923188900-85dae523342b?auto=format&fit=crop&w=1000&q=80',
        'Harvester': 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=1000&q=80',
        'Water Pump': 'https://images.unsplash.com/photo-1544979590-37e9b47eb705?auto=format&fit=crop&w=1000&q=80',
        'Sprayer': 'https://images.unsplash.com/photo-1628352081506-83c43123ed6d?auto=format&fit=crop&w=1000&q=80',
        'Seed Drill': 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?auto=format&fit=crop&w=1000&q=80'
      };
      finalImageUrl = placeholders[category] || 'https://images.unsplash.com/photo-1592982537447-6f2a6a0c5c1b?auto=format&fit=crop&w=1000&q=80';
    }

    const result = run(`
      INSERT INTO equipment (
        owner_id, name, category, description, village, taluka, district, state,
        price_per_day, price_per_hour, available_from, available_until, condition, image_url, status
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'available')
    `, [
      req.user.id,
      name.trim(),
      category.trim(),
      description.trim(),
      village.trim(),
      taluka.trim(),
      district.trim(),
      state.trim(),
      Number(price_per_day),
      price_per_hour ? Number(price_per_hour) : null,
      available_from,
      available_until,
      condition.trim(),
      finalImageUrl
    ]);

    const createdItem = queryRow('SELECT * FROM equipment WHERE id = ?', [result.lastInsertRowid]);

    res.status(201).json({
      message: 'Equipment listed successfully.',
      equipment: createdItem
    });
  } catch (err) {
    console.error('Error creating equipment:', err);
    res.status(500).json({ message: 'Unable to list equipment. Please try again.' });
  }
};

exports.updateEquipment = async (req, res) => {
  try {
    const { id } = req.params;
    const existing = queryRow('SELECT * FROM equipment WHERE id = ?', [id]);

    if (!existing) {
      return res.status(404).json({ message: 'Equipment listing not found.' });
    }

    if (existing.owner_id !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized. You can only edit your own equipment listings.' });
    }

    const {
      name,
      category,
      description,
      village,
      taluka,
      district,
      state,
      price_per_day,
      price_per_hour,
      available_from,
      available_until,
      condition,
      image_url: customImageUrl,
      status
    } = req.body;

    let finalImageUrl = existing.image_url;
    if (req.file) {
      finalImageUrl = `/uploads/${req.file.filename}`;
    } else if (customImageUrl) {
      finalImageUrl = customImageUrl;
    }

    run(`
      UPDATE equipment
      SET 
        name = ?,
        category = ?,
        description = ?,
        village = ?,
        taluka = ?,
        district = ?,
        state = ?,
        price_per_day = ?,
        price_per_hour = ?,
        available_from = ?,
        available_until = ?,
        condition = ?,
        image_url = ?,
        status = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [
      name ? name.trim() : existing.name,
      category ? category.trim() : existing.category,
      description ? description.trim() : existing.description,
      village ? village.trim() : existing.village,
      taluka ? taluka.trim() : existing.taluka,
      district ? district.trim() : existing.district,
      state ? state.trim() : existing.state,
      price_per_day ? Number(price_per_day) : existing.price_per_day,
      price_per_hour !== undefined ? (price_per_hour ? Number(price_per_hour) : null) : existing.price_per_hour,
      available_from || existing.available_from,
      available_until || existing.available_until,
      condition ? condition.trim() : existing.condition,
      finalImageUrl,
      status || existing.status,
      id
    ]);

    const updated = queryRow('SELECT * FROM equipment WHERE id = ?', [id]);

    res.json({
      message: 'Equipment listing updated successfully.',
      equipment: updated
    });
  } catch (err) {
    console.error('Error updating equipment:', err);
    res.status(500).json({ message: 'Failed to update equipment.' });
  }
};

exports.deleteEquipment = async (req, res) => {
  try {
    const { id } = req.params;
    const existing = queryRow('SELECT * FROM equipment WHERE id = ?', [id]);

    if (!existing) {
      return res.status(404).json({ message: 'Equipment listing not found.' });
    }

    if (existing.owner_id !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized. You can only delete your own equipment.' });
    }

    run('DELETE FROM equipment WHERE id = ?', [id]);

    res.json({ message: 'Equipment listing deleted successfully.' });
  } catch (err) {
    console.error('Error deleting equipment:', err);
    res.status(500).json({ message: 'Failed to delete equipment.' });
  }
};

exports.getMyEquipment = async (req, res) => {
  try {
    const items = query(`
      SELECT 
        e.*,
        COUNT(r.id) AS total_requests,
        SUM(CASE WHEN r.status = 'Pending' THEN 1 ELSE 0 END) AS pending_requests,
        SUM(CASE WHEN r.status = 'Accepted' THEN 1 ELSE 0 END) AS accepted_requests
      FROM equipment e
      LEFT JOIN requests r ON e.id = r.equipment_id
      WHERE e.owner_id = ?
      GROUP BY e.id
      ORDER BY e.created_at DESC
    `, [req.user.id]);

    res.json({ equipment: items });
  } catch (err) {
    console.error('Error fetching my equipment:', err);
    res.status(500).json({ message: 'Error retrieving your listings.' });
  }
};
