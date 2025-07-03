const express = require('express');
const router = express.Router();
const Company = require('../models/Company');

const generateCompanyId = async (name) => {
  const cleanPrefix = name
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')  
    .slice(0, 5);              

  const count = await Company.countDocuments({
    name: new RegExp(`^${name}$`, 'i')
  });

  const next = String(count + 1).padStart(3, '0');
  return `${cleanPrefix}${next}`;
};

// Add company (if not exists)
router.post('/add', async (req, res) => {
  try {
    const { name } = req.body;

    if (!name || name.trim() === '') {
      return res.status(400).json({ error: 'Company name is required' });
    }

    const existing = await Company.findOne({ name: new RegExp(`^${name}$`, 'i') });
    if (existing) {
      return res.status(200).json({ message: 'Company already exists', data: existing });
    }

    const companyId = await generateCompanyId(name);
    const newCompany = new Company({ name, companyId });
    await newCompany.save();

    res.status(201).json({ message: 'Company added successfully', data: newCompany });
  } catch (err) {
    res.status(500).json({ error: 'Failed to add company.' });
  }
});

// Get all companies
router.get('/', async (req, res) => {
  try {
    const companies = await Company.find().sort({ name: 1 });
    if (!companies || companies.length === 0) {
      return res.status(404).json({ message: 'No companies found.' });
    }
    res.json(companies);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch companies.' });
  }
});

router.delete('/delete', async (req, res) => {
  try {
    await Company.deleteMany({});
    res.status(200).json({ message: 'All companies deleted successfully.' });
  }catch (err) {
    res.status(500).json({ error: 'Failed to delete companies.' });
  }
})

module.exports = router;
