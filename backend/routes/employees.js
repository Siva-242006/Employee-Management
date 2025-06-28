const express = require('express');
const router = express.Router();
const Employee = require('../models/Employee');

const Company = require('../models/Company');

async function findOrCreateCompany(companyName) {
  // 1. Check if the company already exists (case-insensitive match)
  const existing = await Company.findOne({ name: new RegExp(`^${companyName}$`, 'i') });

  if (existing) return existing;

  // 2. Generate a clean prefix from the company name
  const cleanPrefix = companyName
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '') 
    .slice(0, 5);              

  // 3. Count how many companies already start with this name
  const count = await Company.countDocuments({
    name: new RegExp(`^${companyName}$`, 'i')
  }) + 1;

  // 4. Generate the companyId
  const paddedCount = String(count).padStart(3, '0');
  const companyId = `${cleanPrefix}${paddedCount}`;

  // 5. Save the new company
  const newCompany = new Company({
    name: companyName,
    companyId: companyId,
  });

  await newCompany.save();
  return newCompany;
}



// Generate Employee ID: EMP+YYYY+Count
const generateEmployeeId = async () => {
  const year = new Date().getFullYear();

  const lastEmployee = await Employee
    .findOne({ employeeId: new RegExp(`^EMP${year}`) })
    .sort({ employeeId: -1 });

  let nextCount = 1;

  if (lastEmployee) {
    const lastId = lastEmployee.employeeId;
    const lastNumber = parseInt(lastId.slice(7)); 
    nextCount = lastNumber + 1;
  }

  const padded = String(nextCount).padStart(3, '0');
  return `EMP${year}${padded}`;
};


// Utility: Calculate Age from DOB
const calculateAge = (dob) => {
  const today = new Date();
  const birthDate = new Date(dob);
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
};

// ADD NEW EMPLOYEE
router.post('/add', async (req, res) => {
 
  const validationErrors = [];

  // 1. Calculate age from DOB
  let calculatedAge = null;
  try {
    if (!req.body.dob) {
      validationErrors.push("Date of Birth is required.");
    } else {
      calculatedAge = calculateAge(req.body.dob);
      if (calculatedAge < 18) {
        validationErrors.push("Employee must be at least 18 years old.");
      }
    }
  } catch {
    validationErrors.push("Invalid Date of Birth.");
  }

  // 2. Temporarily assign age (so schema doesn't complain)
  req.body.age = calculatedAge;

  // 3. Generate employeeId
  const employeeId = await generateEmployeeId();
  req.body.employeeId = employeeId;

  // Find or create company
const company = await findOrCreateCompany(req.body.companyName);

// Attach companyId to employee body
req.body.companyId = company.companyId;


  // 4. Try validation using Mongoose but do not save yet
  try {
    const tempEmployee = new Employee(req.body);
    await tempEmployee.validate();

  } catch (err) {
    if (err.name === 'ValidationError') {
      const mongooseErrors = Object.values(err.errors).map(e => e.message);
      validationErrors.push(...mongooseErrors);
    }
  }

  // 5. Check for duplicate (unique) fields manually
  const duplicateFields = ['email', 'phone', 'adhaar', 'pan'];
  for (const field of duplicateFields) {
    if (req.body[field]) {
      const exists = await Employee.findOne({ [field]: req.body[field] });
      if (exists) {
        validationErrors.push(`${field.toUpperCase()} already exists.`);
      }
    }
  }

  // 6. If any errors collected, return them all at once
  if (validationErrors.length > 0) {
    return res.status(400).json({ errors: validationErrors });
  }

  // 7. Save the validated employee
  try {
    const newEmployee = new Employee(req.body);
    await newEmployee.save();

    res.status(201).json({
      message: 'Employee added successfully',
      data: newEmployee
    });

  } catch (err) {
    res.status(500).json({ errors: ['Failed to save employee.'] });
  }
});

router.put('/update/:id', async (req, res) => {
  const validationErrors = [];

  req.body.employeeId = req.params.id;

  // Recalculate age
  let calculatedAge = null;
  try {
    if (!req.body.dob) {
      validationErrors.push("Date of Birth is required.");
    } else {
      calculatedAge = calculateAge(req.body.dob);
      if (calculatedAge < 18) {
        validationErrors.push("Employee must be at least 18 years old.");
      }
    }
  } catch {
    validationErrors.push("Invalid Date of Birth.");
  }

  req.body.age = calculatedAge;

  // Get companyId if needed
  if (req.body.companyName) {
    const company = await findOrCreateCompany(req.body.companyName);
    req.body.companyId = company.companyId;
  }

  // Prepare fields to unset if marital status is single
  const unsetFields = {};
  if (req.body.maritalStatus === 'Single') {
    unsetFields.spouseName = '';
    unsetFields.noOfKids = '';

    // Remove from $set body to avoid conflict
    delete req.body.spouseName;
    delete req.body.noOfKids;
  }

  // Mongoose validation
  try {
    const temp = new Employee(req.body);
    await temp.validate();
  } catch (err) {
    if (err.name === 'ValidationError') {
      const mongooseErrors = Object.values(err.errors).map(e => e.message);
      validationErrors.push(...mongooseErrors);
    }
  }

  // Check for duplicates (excluding current)
  const duplicateFields = ['email', 'phone', 'adhaar', 'pan'];
  for (const field of duplicateFields) {
    if (req.body[field]) {
      const exists = await Employee.findOne({
        [field]: req.body[field],
        employeeId: { $ne: req.params.id }
      });

      if (exists) {
        validationErrors.push(`${field.toUpperCase()} already exists.`);
      }
    }
  }

  // Send all validation errors if found
  if (validationErrors.length > 0) {
    return res.status(400).json({ errors: validationErrors });
  }

  // Perform update with both $set and $unset safely
  try {
    const updated = await Employee.findOneAndUpdate(
      { employeeId: req.params.id },
      {
        $set: req.body,
        $unset: unsetFields
      },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ errors: ['Employee not found.'] });
    }

    res.status(200).json({
      message: 'Employee updated successfully',
      data: updated
    });

  } catch (err) {
    console.error('Update failed:', err);
    res.status(500).json({ errors: ['Failed to update employee.'] });
  }
});



// GET ALL EMPLOYEES
router.get('/', async (req, res) => {
  try {
    const employees = await Employee.find().sort({ createdAt: -1 });
    if (!employees || employees.length === 0) {
      return res.status(404).json({ message: 'No employees found.' });
    }
    res.json(employees);
  } catch (err) {
    res.status(500).json({ errors: ['Failed to fetch employees.'] });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const employee = await Employee.findOne({ employeeId: req.params.id });

    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    res.status(200).json(employee);
  } catch (err) {
    console.error('Error fetching employee:', err);
    res.status(500).json({ error: 'Failed to fetch employee' });
  }
});

// DELETE EMPLOYEE BY employeeId
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Employee.findOneAndDelete({ employeeId: req.params.id });

    if (!deleted) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    res.status(200).json({ message: 'Employee deleted successfully' });
  } catch (err) {
    console.error('Delete error:', err);
    res.status(500).json({ error: 'Failed to delete employee' });
  }
});


module.exports = router;


