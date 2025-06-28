import { Routes, Route } from 'react-router-dom';
import Home from './Components/home/Home';
import EmployeeForm from './Components/employeeForm/EmployeeForm';
import EmployeeList from './Components/employeeList/EmployeeList';
import NavBar from './Components/navBar/NavBar';
import './App.css';

const App = () => {
  return (
    <>
    <NavBar />
    <div className="app-container">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/new" element={<EmployeeForm />} />
        <Route path="/view" element={<EmployeeList />} />
      </Routes>
    </div>
    </>
  );
};

export default App;
