const express = require('express');
const router = express.Router();
const Employee = require('../models/Employee');
const Company = require('../models/Company');

// Generate employee ID: EMP+YYYY+### (no reset on delete)
const generateEmployeeId = async () => {
  const year = new Date().getFullYear();
  const last = await Employee.findOne({ employeeId: new RegExp(`^EMP${year}`) }).sort({ employeeId: -1 });
  let next = 1;
  if (last) {
    const lastNum = parseInt(last.employeeId.slice(7));
    next = lastNum + 1;
  }
  return `EMP${year}${String(next).padStart(3, '0')}`;
};

//Calculate age from dob
const calculateAge = (dob) => {
  const today = new Date();
  const birth = new Date(dob);
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
};

//Create or return company
const findOrCreateCompany = async (companyName) => {
  const existing = await Company.findOne({ name: new RegExp(`^${companyName}$`, 'i') });
  if (existing) return existing;

  const cleanPrefix = companyName.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 5);
  const count = await Company.countDocuments({ name: new RegExp(`^${companyName}$`, 'i') }) + 1;
  const companyId = `${cleanPrefix}${String(count).padStart(3, '0')}`;

  const newCompany = new Company({ name: companyName, companyId });
  await newCompany.save();
  return newCompany;
};

router.post('/add', async (req, res) => {
  const errors = [];
  let age;

  try {
    if (!req.body.dob) errors.push('Date of Birth is required.');
    else {
      age = calculateAge(req.body.dob);
      if (age < 18) errors.push('Employee must be at least 18 years old.');
    }
  } catch {
    errors.push('Invalid Date of Birth.');
  }

  req.body.age = age;
  req.body.employeeId = await generateEmployeeId();

  const company = await findOrCreateCompany(req.body.companyName);
  req.body.companyId = company.companyId;

  // Validate with Mongoose schema
  try {
    const temp = new Employee(req.body);
    await temp.validate();
  } catch (err) {
    if (err.name === 'ValidationError') {
      errors.push(...Object.values(err.errors).map(e => e.message));
    }
  }

  // Check PAN + Aadhaar uniqueness within company
  const uniqueFields = ['adhaar', 'pan'];
  for (const field of uniqueFields) {
    if (req.body[field]) {
      const exists = await Employee.findOne({
        [field]: req.body[field],
        companyId: req.body.companyId
      });
      if (exists) errors.push(`${field.toUpperCase()} already exists in this company.`);
    }
  }

  if (errors.length > 0) return res.status(400).json({ errors });

  try {
    const newEmp = new Employee(req.body);
    await newEmp.save();
    res.status(201).json({ message: 'Employee added successfully', data: newEmp });
  } catch (err) {
    console.error('Save error:', err);
    res.status(500).json({ errors: ['Failed to save employee.'] });
  }
});

router.put('/update/:id', async (req, res) => {
  const errors = [];
  let age;

  try {
    if (!req.body.dob) errors.push('Date of Birth is required.');
    else {
      age = calculateAge(req.body.dob);
      if (age < 18) errors.push('Employee must be at least 18 years old.');
    }
  } catch {
    errors.push('Invalid Date of Birth.');
  }

  req.body.age = age;
  req.body.employeeId = req.params.id;

  const company = await findOrCreateCompany(req.body.companyName);
  req.body.companyId = company.companyId;

  // Remove spouse fields if single
  const unsetFields = {};
  if (req.body.maritalStatus === 'Single') {
    unsetFields.spouseName = '';
    unsetFields.noOfKids = '';
    delete req.body.spouseName;
    delete req.body.noOfKids;
  }

  try {
    const temp = new Employee(req.body);
    await temp.validate();
  } catch (err) {
    if (err.name === 'ValidationError') {
      errors.push(...Object.values(err.errors).map(e => e.message));
    }
  }

  const uniqueFields = ['adhaar', 'pan'];
  for (const field of uniqueFields) {
    if (req.body[field]) {
      const exists = await Employee.findOne({
        [field]: req.body[field],
        companyId: req.body.companyId,
        employeeId: { $ne: req.params.id }
      });
      if (exists) errors.push(`${field.toUpperCase()} already exists in this company.`);
    }
  }

  if (errors.length > 0) return res.status(400).json({ errors });

  try {
    const updated = await Employee.findOneAndUpdate(
      { employeeId: req.params.id },
      { $set: req.body, $unset: unsetFields },
      { new: true }
    );

    if (!updated) return res.status(404).json({ error: 'Employee not found' });
    res.status(200).json({ message: 'Employee updated successfully', data: updated });

  } catch (err) {
    console.error('Update error:', err);
    res.status(500).json({ error: 'Failed to update employee' });
  }
});

router.get('/', async (req, res) => {
  try {
    const employees = await Employee.find().sort({ createdAt: 1 });
    res.json(employees);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch employees' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const emp = await Employee.findOne({ employeeId: req.params.id });
    if (!emp) return res.status(404).json({ error: 'Employee not found' });
    res.json(emp);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch employee' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const removed = await Employee.findOneAndDelete({ employeeId: req.params.id });
    if (!removed) return res.status(404).json({ error: 'Employee not found' });
    res.json({ message: 'Employee deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete employee' });
  }
});

module.exports = router;