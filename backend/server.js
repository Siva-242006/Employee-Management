require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const employeeRoutes = require('./routes/employees');
const companyRoutes = require('./routes/companies');

const app = express();

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

app.use(cors());
app.use(express.json()); 

mongoose.connect('mongodb+srv://sivas393922:siva2468@cluster0.abohu9u.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0/employeesDB', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB'))
.catch((err) => console.error('MongoDB connection error:', err));

app.use('/api/employees', employeeRoutes);
app.use('/api/companies', companyRoutes);

app.get('/', (req, res) => {
  res.send('Employee Details Form API is running...');
});

app.listen(5000, () => {
  console.log('Server is running on http://localhost:5000');
});
