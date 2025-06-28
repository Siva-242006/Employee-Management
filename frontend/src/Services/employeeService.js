const EMP_API = process.env.REACT_APP_BACKEND_URL/api/employees;

export const getAllEmployees = async () => {
  const res = await fetch(`${EMP_API}`);
  const data = await res.json();
  if (!res.ok) throw data;
  return data;
};

export const addEmployee = async (emp) => {
  const res = await fetch(`${EMP_API}/add`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(emp),
  });
  const data = await res.json();
  if (!res.ok) throw data;
  return data;
};

export const updateEmployee = async (id, emp) => {
  emp.employeeId = id;
  const res = await fetch(`${EMP_API}/update/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(emp),
  });
  const data = await res.json();
  if (!res.ok) throw data;
  return data;
};

export const deleteEmployee = async (id) => {
  const response = await fetch(`${EMP_API}/${id}`, {
    method: 'DELETE',
  });
  const data = await response.json();
  if (!response.ok) throw data;
  return data;
};
