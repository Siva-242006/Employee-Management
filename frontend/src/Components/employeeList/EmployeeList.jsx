import React, { useEffect, useState } from 'react';
import { getAllEmployees } from '../../Services/employeeService';
import { useNavigate } from 'react-router-dom';
import './EmployeeList.css';
import { deleteEmployee } from '../../Services/employeeService';

const EmployeeList = () => {
  const [employees, setEmployees] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    getAllEmployees().then(setEmployees).catch(console.error);
  }, []);

const handleDelete = async (id) => {
  if (window.confirm('Are you sure you want to delete this employee?')) {
    try {
      await deleteEmployee(id);
      alert('Employee deleted');
  
      setEmployees(prev => prev.filter(emp => emp.employeeId !== id));
    } catch (err) {
      alert(err.error || 'Delete failed');
    }
  }
};


  return (
    <div className="employee-list">
     {employees.length === 0 ? (<div className='no-employees-container'><h1 className='no-employees-text'>No Employees Found</h1></div>)
     : (<>
      <h2>Employee List</h2>
      <table>
        <thead>
          <tr>
            <th>ID</th><th>Name</th><th>Company</th><th>Phone</th><th>Email</th><th>Actions</th>
          </tr>
        </thead>
        <tbody>
  {  employees.map(emp => (
    <tr key={emp._id}>
      <td data-label="ID">{emp.employeeId}</td>
      <td data-label="Name">{emp.name}</td>
      <td data-label="Company">{emp.companyName}</td>
      <td data-label="Phone">{emp.phone}</td>
      <td data-label="Email">{emp.email}</td>
      <td data-label="Actions" className='actions'>
        <button onClick={() => navigate('/new', { state: { employee: emp } })}>Edit</button>
        <button className='delete-btn' onClick={() => handleDelete(emp.employeeId)}>Delete</button>
      </td>
    </tr>
  ))}
</tbody>

      </table>
      </>
    
     ) 
     }
     </div>
  );
};

export default EmployeeList;
