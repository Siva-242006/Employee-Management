import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { addEmployee, updateEmployee } from '../../Services/employeeService';
import { getAllCompanies, addCompany } from '../../Services/companyService';
import './EmployeeForm.css';

const initialState = {
  name: '', dob: '', maritalStatus: 'Single', fatherName: '', motherName: '',
  adhaar: '', pan: '', companyName: '', salary: '', email: '', phone: '', address: '', joiningDate: '', age: ''
};

const EmployeeForm = () => {
  const [form, setForm] = useState(initialState);
  const [companies, setCompanies] = useState([]);
  const [isAddingCompany, setIsAddingCompany] = useState(false);
  const [errors, setErrors] = useState({});
  const [validFields, setValidFields] = useState({});
  const [showPopup, setShowPopup] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();
  const editData = location.state?.employee;

  useEffect(() => {
    if (editData) {
      setForm({ ...editData, dob: editData.dob?.split('T')[0], joiningDate: editData.joiningDate?.split('T')[0] });
    } else {
      setForm(initialState);
    }
  }, [editData]);

  useEffect(() => {
    getAllCompanies().then(setCompanies).catch(console.error);
  }, []);

  useEffect(() => {
    if (form.dob) {
      const dobDate = new Date(form.dob);
      const today = new Date();
      let age = today.getFullYear() - dobDate.getFullYear();
      const m = today.getMonth() - dobDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < dobDate.getDate())) {
        age--;
      }
      const valid = age >= 18;
      setForm(prev => ({ ...prev, age: age > 0 ? age : '' }));
      setValidFields(prev => ({ ...prev, dob: valid }));
      setErrors(prev => ({
        ...prev,
        dob: form.dob && !valid ? 'Employee must be at least 18 years old.' : ''
      }));
    } else {
      setForm(prev => ({ ...prev, age: '' }));
      setValidFields(prev => ({ ...prev, dob: false }));
      setErrors(prev => ({ ...prev, dob: '' }));
    }
  }, [form.dob]);

  const validateField = (name, value) => {
    if (!value) return false;
    switch (name) {
      case 'email': return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
      case 'adhaar': return /^\d{12}$/.test(value);
      case 'pan': return /^[A-Z]{5}[0-9]{4}[A-Z]$/.test(value);
      case 'phone': return /^\d{10}$/.test(value);
      case 'salary': return /^\d+(\.\d*)?$/.test(value);
      default: return value.trim() !== '';
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    let updated = value;
    let errorMsg = '';

    if (['name', 'fatherName', 'motherName', 'spouseName'].includes(name)) {
      updated = value.replace(/[^A-Za-z ]/g, '').replace(/\s+/g, ' ').trimStart();
      updated = updated.replace(/\b\w/g, (c) => c.toUpperCase());
    } else if (name === 'pan') {
  let raw = value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 10); // only A-Z and 0-9, max 10 chars
  let valid = '';

  for (let i = 0; i < raw.length; i++) {
    const char = raw[i];
    if (i < 5 && /[A-Z]/.test(char)) {
      valid += char;
    } else if (i >= 5 && i < 9 && /[0-9]/.test(char)) {
      valid += char;
    } else if (i === 9 && /[A-Z]/.test(char)) {
      valid += char;
    } else {
      break;
    }
  }

  updated = valid;

  if (updated.length === 10) {
    if (!/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(updated)) {
      errorMsg = 'PAN must follow format: ABCDE1234F';
    } else {
      errorMsg = '';
    }
  } else if ((value.length > 0 && value !== updated ) || (updated.length < 10)) {
    errorMsg = 'PAN must follow format: ABCDE1234F';
  } else {
    errorMsg = '';
  }
}
 else if (name === 'adhaar') {
  let filtered = value.replace(/[^0-9]/g, '').slice(0, 12);
  updated = filtered;

  if ((value !== filtered && /[^0-9]/.test(value)) || (filtered.length < 12)) {
    errorMsg = "Aadhaar must contain only numbers and exactly 12 digits.";
  } else {
    errorMsg = '';
  }

  if (/^\d{12}$/.test(filtered)) {
    errorMsg = '';
  }
}

 else if (name === 'phone') {
  const filtered = value.replace(/[^0-9]/g, '');
  updated = filtered.slice(0, 10);

  if ((filtered.length < 10 && /[^0-9]/.test(value)) || (filtered.length < 10)) {
    errorMsg = 'Phone number must contain only digits (0-9) and exactly 10.';
  } else {
    errorMsg = '';
  }
}
 else if (name === 'email') {
      updated = value.toLowerCase();
      if (updated && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(updated)) {
        errorMsg = 'Enter a valid email address eg: john@example.com';
      }
    }
    else if (name === 'salary') {
  let filtered = value.replace(/[^0-9.]/g, '');
  const dotCount = (filtered.match(/\./g) || []).length;

  if (dotCount > 1) {
    const firstDot = filtered.indexOf('.');
    filtered = filtered.slice(0, firstDot + 1) + filtered.slice(firstDot + 1).replace(/\./g, '');
    errorMsg = "Only one decimal point is allowed in salary.";
  } else if (value !== filtered) {
    errorMsg = "Only numbers and decimal points are allowed (e.g., 25000.50 or 25000)";
  } else {
    errorMsg = '';
  }

  updated = filtered;
}

    setForm(prev => ({ ...prev, [name]: updated }));
    const isValid = validateField(name, updated) && !errorMsg;
    setValidFields(prev => ({ ...prev, [name]: isValid }));
    setErrors(prev => ({
      ...prev,
      [name]: updated ? errorMsg : ''
    }));
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
    setErrors({});
    try {
      if (!companies.find(c => c.name === form.companyName)) {
        await addCompany(form.companyName);
      }

      if (editData) {
        await updateEmployee(editData.employeeId, form);
      } else {
        await addEmployee(form);
      }

      setShowPopup(true);

      setTimeout(() => {
        setShowPopup(false);
        navigate('/view');
      }, 1800);

    } catch (err) {
      const apiErrors = err.errors || ['Something went wrong'];
      const errorMap = { ...errors };

      apiErrors.forEach((msg) => {
        const lower = msg.toLowerCase();
        if (lower.includes('adhaar')) errorMap.adhaar = msg;
        else if (lower.includes('pan')) errorMap.pan = msg;
        else if (lower.includes('email')) errorMap.email = msg;
        else if (lower.includes('phone')) errorMap.phone = msg;
        else if (lower.includes('dob')) errorMap.dob = msg;
        else if (lower.includes('company')) errorMap.companyName = msg;
        else if (lower.includes('salary')) errorMap.salary = msg;
        else if (lower.includes('address')) errorMap.address = msg;
        else if (lower.includes('name') && !errorMap.name) errorMap.name = msg;
        else errorMap.general = msg;
      });

      setErrors(errorMap);
    }
  };

  const renderInput = (name, placeholder, type = 'text', required = true) => (
    <div className="input-container" style={{ display: 'flex', flexDirection: 'column', position: 'relative' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', position: 'relative' }}>
        <input
          name={name}
          value={form[name] || ''}
          onChange={handleChange}
          placeholder={placeholder}
          type={type}
          required={required}
          readOnly={name === 'age'}
          style={{ flex: 1, paddingRight: '32px' }}
        />
        {validFields[name] && (
          <span
    className="checkmark"
    style={{
      color: '#1abc9c',
      position: 'absolute',
      right: '8px',
      fontSize: '1.4em',
      display: 'flex',
      alignItems: 'center'
    }}
  >
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <circle cx="11" cy="11" r="11" fill="#1abc9c"/>
      <path d="M6 12.5L10 16L16 8" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  </span>
        )}
      </div>
      {errors[name] && (
        <span className="error-text" style={{ color: '#d32f2f', fontSize: '0.95em', marginTop: '2px' }}>
          {errors[name]}
        </span>
      )}
    </div>
  );

  return (
    <div className="page-container">
      {showPopup && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.25)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999
        }}>
          <div style={{
            background: '#fff',
            padding: '32px 36px',
            borderRadius: '12px',
            boxShadow: '0 4px 24px #1976d250',
            fontSize: '1.25rem',
            color: '#1976d2',
            fontWeight: 600,
            textAlign: 'center'
          }}>
            {editData ? 'Employee updated successfully!' : 'Employee added successfully!'}
          </div>
        </div>
      )}
      <form className="employee-form" onSubmit={handleSubmit}>
        <h2>{editData ? 'Update' : 'Add'} Employee</h2>
        {renderInput('name', 'Name')}
        <div style={{ display: 'flex', gap: '10px' }}>
          <div style={{ flex: 2 }}>{renderInput('dob', '', 'date')}</div>
          <div style={{ flex: 1 }}>{renderInput('age', 'Age', 'number')}</div>
        </div>
        <select name="maritalStatus" value={form.maritalStatus} onChange={handleChange}>
          <option value="Single">Single</option>
          <option value="Married">Married</option>
        </select>
        {form.maritalStatus === 'Married' && (
          <>
            {renderInput('spouseName', 'Spouse Name', 'text', false)}
            {renderInput('noOfKids', 'Number of Kids', 'number', false)}
          </>
        )}
        {renderInput('fatherName', 'Father Name')}
        {renderInput('motherName', 'Mother Name')}
        {renderInput('adhaar', 'Aadhaar')}
        {renderInput('pan', 'PAN')}
        <select value={isAddingCompany ? 'add_new' : form.companyName} onChange={handleCompanySelect} required>
          <option value="">--Select Company--</option>
          {companies.map((c) => (
            <option key={c.companyId} value={c.name}>{c.name}</option>
          ))}
          <option value="add_new">+ Add New Company</option>
        </select>
        {isAddingCompany && renderInput('companyName', 'Enter New Company Name')}
        {renderInput('joiningDate', '', 'date')}
        {renderInput('salary', 'Salary')}
        {renderInput('email', 'Email')}
        {renderInput('phone', 'Phone Number')}
        {renderInput('address', 'Address')}
        <button type="submit">{editData ? 'Update' : 'Submit'}</button>
      </form>
    </div>
  );
};

export default EmployeeForm;
