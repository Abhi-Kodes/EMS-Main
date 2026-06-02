const db = require('../config/db');

exports.reports = async (req, res) => {
  try {
    const [[summary]] = await db.query(
      `SELECT
        COUNT(*) AS totalEmp,
        SUM(status = 'active') AS activeEmp,
        SUM(status = 'inactive') AS inactiveEmp,
        COALESCE(SUM(salary), 0) AS totalSalary,
        COALESCE(AVG(salary), 0) AS avgSalary
       FROM employees`
    );

    const [departments] = await db.query(
      `SELECT d.name, COUNT(e.id) AS emp_count, COALESCE(SUM(e.salary), 0) AS salary_total
       FROM departments d
       LEFT JOIN employees e ON e.department_id = d.id
       GROUP BY d.id, d.name
       ORDER BY emp_count DESC`
    );

    const [recent] = await db.query(
      `SELECT e.emp_id, e.first_name, e.last_name, e.status, e.salary, d.name AS dept_name
       FROM employees e
       LEFT JOIN departments d ON e.department_id = d.id
       ORDER BY e.created_at DESC
       LIMIT 10`
    );

    res.render('reports/index', { summary, departments, recent, page: 'reports' });
  } catch (err) {
    req.flash('error', 'Report load nahi hua: ' + err.message);
    res.redirect('/');
  }
};

exports.settings = async (req, res) => {
  try {
    const [[{ adminCount }]] = await db.query('SELECT COUNT(*) AS adminCount FROM admins');
    const [[{ deptCount }]] = await db.query('SELECT COUNT(*) AS deptCount FROM departments');
    res.render('settings/index', { adminCount, deptCount, page: 'settings' });
  } catch (err) {
    req.flash('error', 'Settings load nahi hua: ' + err.message);
    res.redirect('/');
  }
};
