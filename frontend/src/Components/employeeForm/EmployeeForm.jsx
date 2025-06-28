import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { addEmployee, updateEmployee } from '../../Services/employeeService';
import { getAllCompanies, addCompany } from '../../Services/companyService';
import './EmployeeForm.css';

const initialState = {
  name: '',
  dob: '',
  maritalStatus: 'Single',
  fatherName: '',
  motherName: '',
  adhaar: '',
  pan: '',
  companyName: '',
  salary: '',
  email: '',
  phone: '',
  address: '',
};

const EmployeeForm = () => {
  const [form, setForm] = useState(initialState);
  const [companies, setCompanies] = useState([]);
  const [isAddingCompany, setIsAddingCompany] = useState(false);
  const [errors, setErrors] = useState([]);
  const location = useLocation();
  const navigate = useNavigate();
  const editData = location.state?.employee;

  useEffect(() => {
  if (editData) {
    setForm({
      ...editData,
      dob: editData.dob?.split('T')[0],
    });
  } else {
    setForm(initialState); 
  }
}, [editData]);

  useEffect(() => {
    getAllCompanies().then(setCompanies).catch(console.error);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleCompanySelect = (e) => {
    const value = e.target.value;
    if (value === 'add_new') {
      setIsAddingCompany(true);
      setForm(prev => ({ ...prev, companyName: '' }));
    } else {
      setIsAddingCompany(false);
      setForm(prev => ({ ...prev, companyName: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors([]);

    try {
      // Add new company if not existing
      if (!companies.find(c => c.name === form.companyName)) {
        await addCompany(form.companyName);
      }

      let response;
      if (editData) {
        response = await updateEmployee(editData.employeeId, form);
      } else {
        response = await addEmployee(form);
      }

      alert(response.message);
      navigate('/view');
    } catch (err) {
      setErrors(err.errors || ['Something went wrong']);
    }
  };

  return (
    <div className="page-container">
    <form className="employee-form" onSubmit={handleSubmit}>
      <h2>{editData ? 'Update' : 'Add'} Employee</h2>

      <input name="name" value={form.name} onChange={handleChange} placeholder="Name" required />
      <input type="date" name="dob" value={form.dob} onChange={handleChange} required />
      <select name="maritalStatus" value={form.maritalStatus} onChange={handleChange}>
        <option value="Single">Single</option>
        <option value="Married">Married</option>
      </select>

      {form.maritalStatus === 'Married' && (
        <>
          <input name="spouseName" value={form.spouseName || ''} onChange={handleChange} placeholder="Spouse Name" />
          <input name="noOfKids" type="number" value={form.noOfKids || ''} onChange={handleChange} placeholder="Number of Kids" />
        </>
      )}

      <input name="fatherName" value={form.fatherName} onChange={handleChange} placeholder="Father Name" required />
      <input name="motherName" value={form.motherName} onChange={handleChange} placeholder="Mother Name" required />
      <input name="adhaar" value={form.adhaar} onChange={handleChange} placeholder="Aadhaar" required />
      <input name="pan" value={form.pan} onChange={handleChange} placeholder="PAN" required />

      <select value={isAddingCompany ? 'add_new' : form.companyName} onChange={handleCompanySelect} required>
        <option value="">--Select Company--</option>
        {companies.map((c) => (
          <option key={c.companyId} value={c.name}>{c.name}</option>
        ))}
        <option value="add_new">+ Add New Company</option>
    </select>

    {isAddingCompany && (
      <input
        name="companyName"
        value={form.companyName}
        onChange={handleChange}
        placeholder="Enter New Company Name"
        required
      />
)}

      <input name="salary" value={form.salary} onChange={handleChange} placeholder="Salary" required />
      <input name="email" value={form.email} onChange={handleChange} placeholder="Email" required />
      <input name="phone" value={form.phone} onChange={handleChange} placeholder="Phone Number" required />
      <textarea name="address" value={form.address} onChange={handleChange} placeholder="Address" required />

      <button type="submit">{editData ? 'Update' : 'Submit'}</button>

      {errors.length > 0 && (
  <ul className="error-msg">
    {errors.map((error, index) => (
      <li key={index}>{error}</li>
    ))}
  </ul>
)}

    </form>
  </div>
  );
};

export default EmployeeForm;
