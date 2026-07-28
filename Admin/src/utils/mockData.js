// In-memory mock "database". No backend is connected — everything here lives
// only for the current browser session and resets on refresh.
// Shape mirrors the real EMS backend (roles/departments/employees tables) so
// swapping to real API calls later is a drop-in change in the services/ layer.

export let roles = [
  { id: 1, role_name: 'Admin' },
  { id: 2, role_name: 'HR' },
  { id: 3, role_name: 'Manager' },
  { id: 4, role_name: 'Employee' },
];

export let departments = [
  { id: 1, department_name: 'Engineering', description: 'Product & platform engineering', status: 1 },
  { id: 2, department_name: 'Human Resources', description: 'People operations & hiring', status: 1 },
  { id: 3, department_name: 'Sales', description: 'Revenue & client accounts', status: 1 },
  { id: 4, department_name: 'Design', description: 'Product & brand design', status: 1 },
];

export let employees = [
  { id: 1, name: 'Aarav Sharma', email: 'admin@ems.com', role_id: 1, department_id: 1, status: 1 },
  { id: 2, name: 'Priya Nair', email: 'hr@ems.com', role_id: 2, department_id: 2, status: 1 },
  { id: 3, name: 'Rohan Mehta', email: 'manager@ems.com', role_id: 3, department_id: 1, status: 1 },
  { id: 4, name: 'Sanya Kapoor', email: 'sanya.kapoor@ems.com', role_id: 4, department_id: 1, status: 1 },
  { id: 5, name: 'Vikram Rao', email: 'vikram.rao@ems.com', role_id: 4, department_id: 3, status: 1 },
  { id: 6, name: 'Neha Verma', email: 'neha.verma@ems.com', role_id: 4, department_id: 4, status: 0 },
  { id: 7, name: 'Karan Singh', email: 'karan.singh@ems.com', role_id: 4, department_id: 3, status: 1 },
];

// Demo credentials — any of these log in with password shown in Login.jsx helper text
export const demoUsers = [
  { email: 'admin@ems.com', password: 'admin123', employeeId: 1 },
  { email: 'hr@ems.com', password: 'hr123', employeeId: 2 },
  { email: 'manager@ems.com', password: 'manager123', employeeId: 3 },
];

let nextEmployeeId = 8;
let nextDepartmentId = 5;
let nextRoleId = 5;

export const getNextEmployeeId = () => nextEmployeeId++;
export const getNextDepartmentId = () => nextDepartmentId++;
export const getNextRoleId = () => nextRoleId++;

export const setEmployees = (next) => { employees = next; };
export const setDepartments = (next) => { departments = next; };
export const setRoles = (next) => { roles = next; };

export const roleName = (id) => roles.find((r) => r.id === Number(id))?.role_name || '—';
export const departmentName = (id) => departments.find((d) => d.id === Number(id))?.department_name || '—';
