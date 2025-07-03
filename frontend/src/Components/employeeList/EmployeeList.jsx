import React, { useEffect, useState } from 'react';
import { getAllEmployees, deleteEmployee } from '../../Services/employeeService';
import { useNavigate } from 'react-router-dom';
import './EmployeeList.css';

const EmployeeList = () => {
  const [employees, setEmployees] = useState([]);
  const [popup, setPopup] = useState({ show: false, message: '', confirm: false, id: null });
  const navigate = useNavigate();

  useEffect(() => {
    getAllEmployees().then(setEmployees).catch(console.error);
  }, []);

  const handleDelete = (id) => {
    const emp = employees.find(e => e.employeeId === id);
    setPopup({
      show: true,
      message: `Are you sure you want to delete employee "${emp?.name}"?`,
      confirm: true,
      id
    });
  };

  const confirmDelete = async () => {
    try {
      await deleteEmployee(popup.id);
      setEmployees(prev => prev.filter(emp => emp.employeeId !== popup.id));
      setPopup({
        show: true,
        message: 'Employee deleted successfully!',
        confirm: false,
        id: null
      });
      setTimeout(() => setPopup({ show: false, message: '', confirm: false, id: null }), 1500);
    } catch (err) {
      setPopup({
        show: true,
        message: err.error || 'Delete failed',
        confirm: false,
        id: null
      });
      setTimeout(() => setPopup({ show: false, message: '', confirm: false, id: null }), 1500);
    }
  };

  const cancelDelete = () => {
    setPopup({ show: false, message: '', confirm: false, id: null });
  };

  return (
    <div className="employee-list">
      {popup.show && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.18)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999
        }}>
          <div style={{
            background: '#fff',
            padding: '28px 32px',
            borderRadius: '12px',
            boxShadow: '0 4px 24px #1976d250',
            fontSize: '1.1rem',
            color: '#1976d2',
            fontWeight: 500,
            textAlign: 'center',
            minWidth: 260
          }}>
            <div style={{ marginBottom: popup.confirm ? 18 : 0 }}>{popup.message}</div>
            {popup.confirm && (
              <div style={{ display: 'flex', gap: 16, justifyContent: 'center', marginTop: 8 }}>
                <button
                  style={{
                    background: '#e53935',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 6,
                    padding: '8px 18px',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                  onClick={confirmDelete}
                >
                  Yes, Delete
                </button>
                <button
                  style={{
                    background: '#bdbdbd',
                    color: '#333',
                    border: 'none',
                    borderRadius: 6,
                    padding: '8px 18px',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                  onClick={cancelDelete}
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>
      )}
      {employees.length === 0 ? (
        <div className='no-employees-container'>
          <h1 className='no-employees-text'>No Employees Found</h1>
        </div>
      ) : (
        <>
          <h2>Employee List</h2>
          <table>
            <thead>
              <tr>
                <th>ID</th><th>Name</th><th>Company</th><th>Phone</th><th>Email</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {employees.map(emp => (
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
      )}
    </div>
  );
};

export default EmployeeList;
