-- ============================================
-- Employee Management System - Database Setup
-- Run this file in MySQL Workbench or terminal
-- Command: mysql -u root -p < database.sql
-- ============================================

CREATE DATABASE IF NOT EXISTS employee_db;
USE employee_db;

-- Departments table
CREATE TABLE IF NOT EXISTS departments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS admins (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(120) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Employees table
CREATE TABLE IF NOT EXISTS employees (
  id INT AUTO_INCREMENT PRIMARY KEY,
  emp_id VARCHAR(20) UNIQUE NOT NULL,
  first_name VARCHAR(50) NOT NULL,
  last_name VARCHAR(50) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  phone VARCHAR(15),
  department_id INT,
  designation VARCHAR(100),
  salary DECIMAL(10,2) DEFAULT 0,
  join_date DATE,
  status ENUM('active', 'inactive') DEFAULT 'active',
  gender ENUM('male', 'female', 'other') DEFAULT 'male',
  address TEXT,
  profile_pic VARCHAR(255) DEFAULT 'default.png',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL
);

-- Insert sample departments
INSERT INTO departments (name, description) VALUES
('Engineering', 'Software & Hardware Development'),
('Human Resources', 'People & Culture Management'),
('Marketing', 'Brand & Growth Marketing'),
('Finance', 'Accounting & Financial Planning'),
('Operations', 'Business Operations & Logistics')
ON DUPLICATE KEY UPDATE name=name;

-- Insert sample employees
INSERT INTO employees (emp_id, first_name, last_name, email, phone, department_id, designation, salary, join_date, gender, status) VALUES
('EMP001', 'Rahul', 'Sharma', 'rahul.sharma@company.com', '9876543210', 1, 'Senior Developer', 85000, '2022-01-15', 'male', 'active'),
('EMP002', 'Priya', 'Gupta', 'priya.gupta@company.com', '9876543211', 2, 'HR Manager', 65000, '2021-06-01', 'female', 'active'),
('EMP003', 'Amit', 'Kumar', 'amit.kumar@company.com', '9876543212', 3, 'Marketing Lead', 70000, '2023-03-10', 'male', 'active'),
('EMP004', 'Sneha', 'Verma', 'sneha.verma@company.com', '9876543213', 4, 'Finance Analyst', 72000, '2022-08-20', 'female', 'active'),
('EMP005', 'Vikash', 'Singh', 'vikash.singh@company.com', '9876543214', 1, 'Junior Developer', 45000, '2023-11-01', 'male', 'active'),
('EMP006', 'Ananya', 'Patel', 'ananya.patel@company.com', '9876543215', 5, 'Operations Manager', 78000, '2020-04-15', 'female', 'active'),
('EMP007', 'Rohan', 'Mehta', 'rohan.mehta@company.com', '9876543216', 1, 'Full Stack Developer', 90000, '2021-09-05', 'male', 'active'),
('EMP008', 'Kavya', 'Nair', 'kavya.nair@company.com', '9876543217', 2, 'HR Executive', 42000, '2023-07-12', 'female', 'inactive')
ON DUPLICATE KEY UPDATE emp_id=emp_id;

SELECT 'Database setup complete! ✅' as Message;
