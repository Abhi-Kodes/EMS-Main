const db = require('../config/db');

exports.index = async (req, res) => {
  try {
    const [departments] = await db.query(
      `SELECT d.*, COUNT(e.id) AS emp_count, COALESCE(SUM(e.salary), 0) AS salary_total
       FROM departments d
       LEFT JOIN employees e ON e.department_id = d.id
       GROUP BY d.id
       ORDER BY d.name`
    );

    res.render('departments/index', { departments, page: 'departments' });
  } catch (err) {
    req.flash('error', 'Department page load nahi ho paya: ' + err.message);
    res.redirect('/');
  }
};

exports.create = async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name || !name.trim()) {
      req.flash('error', 'Department name required hai.');
      return res.redirect('/departments');
    }

    await db.query('INSERT INTO departments (name, description) VALUES (?, ?)', [
      name.trim(),
      description || null
    ]);
    req.flash('success', 'Department added successfully.');
    res.redirect('/departments');
  } catch (err) {
    req.flash('error', 'Department add nahi hua: ' + err.message);
    res.redirect('/departments');
  }
};

exports.update = async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name || !name.trim()) {
      req.flash('error', 'Department name required hai.');
      return res.redirect('/departments');
    }

    await db.query('UPDATE departments SET name = ?, description = ? WHERE id = ?', [
      name.trim(),
      description || null,
      req.params.id
    ]);
    req.flash('success', 'Department updated successfully.');
    res.redirect('/departments');
  } catch (err) {
    req.flash('error', 'Department update nahi hua: ' + err.message);
    res.redirect('/departments');
  }
};

exports.remove = async (req, res) => {
  try {
    await db.query('DELETE FROM departments WHERE id = ?', [req.params.id]);
    req.flash('success', 'Department deleted. Linked employees are now unassigned.');
    res.redirect('/departments');
  } catch (err) {
    req.flash('error', 'Department delete nahi hua: ' + err.message);
    res.redirect('/departments');
  }
};
