const db = require('../config/db');

async function generateEmployeeId() {
  const [[lastEmployee]] = await db.query(
    `SELECT emp_id
     FROM employees
     WHERE emp_id REGEXP '^EMP[0-9]+$'
     ORDER BY CAST(SUBSTRING(emp_id, 4) AS UNSIGNED) DESC
     LIMIT 1`
  );

  const lastNumber = lastEmployee ? Number(lastEmployee.emp_id.replace('EMP', '')) : 0;
  return 'EMP' + String(lastNumber + 1).padStart(3, '0');
}

// ─── DASHBOARD ────────────────────────────────────────────────────────────────
exports.dashboard = async (req, res) => {
  try {
    const [[{ totalEmp }]] = await db.query('SELECT COUNT(*) as totalEmp FROM employees');
    const [[{ activeEmp }]] = await db.query("SELECT COUNT(*) as activeEmp FROM employees WHERE status='active'");
    const [[{ inactiveEmp }]] = await db.query("SELECT COUNT(*) as inactiveEmp FROM employees WHERE status='inactive'");
    const [[{ deptCount }]] = await db.query('SELECT COUNT(*) as deptCount FROM departments');

    const [recentEmp] = await db.query(
      `SELECT e.*, d.name as dept_name 
       FROM employees e 
       LEFT JOIN departments d ON e.department_id = d.id 
       ORDER BY e.created_at DESC LIMIT 6`
    );

    const [deptStats] = await db.query(
      `SELECT d.name, COUNT(e.id) as emp_count, d.id
       FROM departments d 
       LEFT JOIN employees e ON d.id = e.department_id 
       GROUP BY d.id, d.name 
       ORDER BY emp_count DESC`
    );

    const [[{ totalSalary }]] = await db.query(
      "SELECT COALESCE(SUM(salary),0) as totalSalary FROM employees WHERE status='active'"
    );
    res.render('dashboard', {
        totalEmp, activeEmp, inactiveEmp, deptCount,
        recentEmp, deptStats, totalSalary,
        page: 'dashboard'
    });
} catch (err) {
    console.error('Dashboard error:', err);
    res.render('error', { message: err.message });
}
};

// ─── GET ALL EMPLOYEES ─────────────────────────────────────────────────────────
exports.getAllEmployees = async (req, res) => {
  try {
    const [employees] = await db.query(
      `SELECT e.*, d.name as dept_name 
       FROM employees e 
       LEFT JOIN departments d ON e.department_id = d.id 
       ORDER BY e.created_at DESC`
    );
    const [departments] = await db.query('SELECT * FROM departments ORDER BY name');
    res.render('employees/index', { employees, departments, page: 'employees', search: '' });
  } catch (err) {
    req.flash('error', 'An error occurred while loading employees: ' + err.message);
    res.redirect('/');
  }
};

// ─── SEARCH EMPLOYEES ─────────────────────────────────────────────────────────
exports.searchEmployee = async (req, res) => {
  try {
    const search = req.query.q || '';
    const dept = req.query.dept || '';
    const status = req.query.status || '';
    const q = `%${search}%`;

    let query = `SELECT e.*, d.name as dept_name 
                 FROM employees e 
                 LEFT JOIN departments d ON e.department_id = d.id 
                 WHERE (e.first_name LIKE ? OR e.last_name LIKE ? OR e.email LIKE ? OR e.emp_id LIKE ? OR e.designation LIKE ?)`;
    let params = [q, q, q, q, q];

    if (dept) { query += ' AND e.department_id = ?'; params.push(dept); }
    if (status) { query += ' AND e.status = ?'; params.push(status); }
    query += ' ORDER BY e.created_at DESC';

    const [employees] = await db.query(query, params);
    const [departments] = await db.query('SELECT * FROM departments ORDER BY name');
    res.render('employees/index', { employees, departments, page: 'employees', search });
  } catch (err) {
    req.flash('error', 'An error occurred during the search: ' + err.message);
    res.redirect('/employees');
  }
};

// ─── ADD FORM ──────────────────────────────────────────────────────────────────
exports.addForm = async (req, res) => {
  try {
    const [departments] = await db.query('SELECT * FROM departments ORDER BY name');
    res.render('employees/add', { departments, page: 'employees' });
  } catch (err) {
    req.flash('error', err.message);
    res.redirect('/employees');
  }
};

// ─── ADD EMPLOYEE ──────────────────────────────────────────────────────────────
exports.addEmployee = async (req, res) => {
  try {
    const { first_name, last_name, email, phone, department_id, designation, salary, join_date, gender, address, status } = req.body;

    // Validate required fields
    if (!first_name || !last_name || !email) {
      req.flash('error', 'First name, last name, and email are required!');
      return res.redirect('/employees/add');
    }

    // Check duplicate email
    const [existing] = await db.query('SELECT id FROM employees WHERE email = ?', [email]);
    if (existing.length > 0) {
      req.flash('error', 'This email address is already registered!');
      return res.redirect('/employees/add');
    }

    const emp_id = await generateEmployeeId();

    await db.query(
      `INSERT INTO employees 
       (emp_id, first_name, last_name, email, phone, department_id, designation, salary, join_date, gender, address, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [emp_id, first_name, last_name, email, phone || null, department_id || null,
       designation || null, salary || 0, join_date || null, gender || 'male', address || null, status || 'active']
    );

    req.flash('success', `Employee ${first_name} ${last_name} (${emp_id}) Added successfully!" 🎉`);
    res.redirect('/employees');
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      req.flash('error', 'Duplicate email or employee ID mila. Please try again.');
      return res.redirect('/employees/add');
    }
    req.flash('error', 'An error occurred while adding the employee: ' + err.message);
    res.redirect('/employees/add');
  }
};

// ─── VIEW EMPLOYEE ─────────────────────────────────────────────────────────────
exports.viewEmployee = async (req, res) => {
  try {
    const [result] = await db.query(
      `SELECT e.*, d.name as dept_name 
       FROM employees e 
       LEFT JOIN departments d ON e.department_id = d.id 
       WHERE e.id = ?`, [req.params.id]
    );
    if (!result.length) {
      req.flash('error', 'The employee could not be found!');
      return res.redirect('/employees');
    }
    res.render('employees/view', { employee: result[0], page: 'employees' });
  } catch (err) {
    req.flash('error', err.message);
    res.redirect('/employees');
  }
};

// ─── EDIT FORM ─────────────────────────────────────────────────────────────────
exports.editForm = async (req, res) => {
  try {
    const [result] = await db.query('SELECT * FROM employees WHERE id = ?', [req.params.id]);
    if (!result.length) {
      req.flash('error', 'The employee was not found');
      return res.redirect('/employees');
    }
    const [departments] = await db.query('SELECT * FROM departments ORDER BY name');
    res.render('employees/edit', { employee: result[0], departments, page: 'employees' });
  } catch (err) {
    req.flash('error', err.message);
    res.redirect('/employees');
  }
};

// ─── UPDATE EMPLOYEE ───────────────────────────────────────────────────────────
exports.updateEmployee = async (req, res) => {
  try {
    const { first_name, last_name, email, phone, department_id, designation, salary, join_date, gender, address, status } = req.body;
    const { id } = req.params;

    // Check duplicate email (exclude current)
    const [existing] = await db.query('SELECT id FROM employees WHERE email = ? AND id != ?', [email, id]);
    if (existing.length > 0) {
      req.flash('error', 'This email address is already assigned to another employee.');
      return res.redirect(`/employees/edit/${id}`);
    }

    await db.query(
      `UPDATE employees SET 
       first_name=?, last_name=?, email=?, phone=?, department_id=?,
       designation=?, salary=?, join_date=?, gender=?, address=?, status=?, updated_at=NOW()
       WHERE id=?`,
      [first_name, last_name, email, phone || null, department_id || null,
       designation || null, salary || 0, join_date || null, gender || 'male', address || null, status || 'active', id]
    );

    req.flash('success', `${first_name} ${last_name} s record has been updated successfully! ✅`);
    res.redirect('/employees');
  } catch (err) {
    req.flash('error', 'Error updating the record ❌:' + err.message);
    res.redirect(`/employees/edit/${req.params.id}`);
  }
};

// ─── DELETE EMPLOYEE ───────────────────────────────────────────────────────────
exports.deleteEmployee = async (req, res) => {
  try {
    const [result] = await db.query('SELECT first_name, last_name FROM employees WHERE id = ?', [req.params.id]);
    if (!result.length) {
      req.flash('error', 'Employee not found!');
      return res.redirect('/employees');
    }
    const { first_name, last_name } = result[0];
    await db.query('DELETE FROM employees WHERE id = ?', [req.params.id]);
    req.flash('success', `${first_name} ${last_name} delete ho gaya!`);
    res.redirect('/employees');
  } catch (err) {
    req.flash('error', 'Error deleting: ' + err.message);
    res.redirect('/employees');
  }
};

// ─── TOGGLE STATUS ─────────────────────────────────────────────────────────────
exports.toggleStatus = async (req, res) => {
  try {
    const [result] = await db.query('SELECT status FROM employees WHERE id = ?', [req.params.id]);
    if (!result.length) return res.json({ success: false, message: 'Employee not found' });

    const newStatus = result[0].status === 'active' ? 'inactive' : 'active';
    await db.query('UPDATE employees SET status = ? WHERE id = ?', [newStatus, req.params.id]);
    res.json({ success: true, status: newStatus });
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
};
