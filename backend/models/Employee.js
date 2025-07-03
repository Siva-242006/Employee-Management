const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
  employeeId: {
    type: String,
    required: true,
    unique: true,
  },
  name: { type: String, required: true },
  dob: { type: Date, required: true },
  age: { type: Number, required: true },
  maritalStatus: {
    type: String,
    enum: ['Single', 'Married'],
    required: true,
  },
  spouseName: { type: String },
  noOfKids: { type: Number },
  fatherName: { type: String, required: true },
  motherName: { type: String, required: true },
  adhaar: {
    type: String,
    required: true,
    match: [/^\d{12}$/, 'Aadhaar must be exactly 12 digits.'],
  },
  pan: {
    type: String,
    required: true,
    match: [/^[A-Z]{5}[0-9]{4}[A-Z]$/, 'PAN must follow format: ABCDE1234F'],
  },
  companyName: { type: String, required: true },
  companyId: { type: String, required: true },
  joiningDate: { type: Date, required: true },
  salary: {
    type: String,
    required: true,
    match: [/^\d+(\.\d+)?$/, 'Salary must be a valid number.'],
  },
  email: {
    type: String,
    required: true,
    match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Email format is invalid.'],
  },
  phone: {
    type: String,
    required: true,
    match: [/^\d{10}$/, 'Phone must be exactly 10 digits.'],
  },
  address: { type: String, required: true },
}, { timestamps: true });

/**Composite Unique Indexes (only PAN and Aadhaar must be unique within a company) */
employeeSchema.index({ companyId: 1, adhaar: 1 }, { unique: true });
employeeSchema.index({ companyId: 1, pan: 1 }, { unique: true });

module.exports = mongoose.model('Employee', employeeSchema);
