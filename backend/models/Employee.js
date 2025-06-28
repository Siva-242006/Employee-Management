const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
  employeeId: { type: String, required: true, unique: true },

  name: { type: String, required: true },

  dob: { type: Date, required: true },

  age: {
    type: Number
  },

  maritalStatus: { type: String, enum: ['Single', 'Married'], required: true },

  spouseName: {
    type: String,
    required: function () {
      return this.maritalStatus === 'Married';
    },
  },

  noOfKids: {
    type: Number,
    required: function () {
      return this.maritalStatus === 'Married';
    },
  },

  fatherName: { type: String, required: true },
  motherName: { type: String, required: true },

  adhaar: {
    type: String,
    unique: true,
    validate: {
      validator: v => /^\d{12}$/.test(v),
      message: 'Aadhaar must be exactly 12 digits and numeric only',
    },
  },

  pan: {
    type: String,
    unique: true,
    uppercase: true,
    validate: {
      validator: v => /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(v),
      message: 'PAN must follow the format: 5 uppercase letters, 4 digits, 1 uppercase letter (e.g., ABCDE1234F)',
    },
  },

  companyName: { type: String, required: true },
  companyId: { type: String },

  salary: {
    type: Number,
    required: true,
    validate: {
      validator: v => Number.isInteger(v) && v > 0,
      message: 'Salary must be a positive whole number without any special characters',
    },
  },

  email: {
    type: String,
    unique: true,
    lowercase: true,
    match: [/^[a-zA-Z0-9._%+-]+@gmail\.com$/, 'Email must be a valid Gmail address'],
  },

  phone: {
  type: String,
  unique: true,
  required: true,
  validate: {
    validator: v => /^\d{10}$/.test(v),
    message: 'Phone number must be exactly 10 digits and numeric only (no spaces, symbols, or characters)',
  },
},

  address: { type: String, required: true }
});

module.exports = mongoose.model('Employee', employeeSchema);
