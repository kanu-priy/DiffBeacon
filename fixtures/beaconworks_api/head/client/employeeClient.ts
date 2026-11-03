import axios from "axios";

export interface EmployeePayload {
  first_name: string;
  last_name: string;
  email: string;
  department_id?: number;
  annual_salary: number;
}

export async function fetchEmployees(): Promise<any[]> {
  const response = await fetch("/api/v1/employees/");
  return response.json();
}

export async function createEmployee(payload: EmployeePayload): Promise<any> {
  // Post payload to backend DRF employee endpoint
  const response = await axios.post("/api/v1/employees/", payload);
  return response.data;
}

export async function fetchDepartments(): Promise<any[]> {
  const response = await fetch("/api/v1/departments/");
  return response.json();
}
