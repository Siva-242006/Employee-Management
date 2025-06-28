const mongoose = require('mongoose');

const companySchema = new mongoose.Schema({
companyId: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  }  
});

module.exports = mongoose.model('Company', companySchema);
