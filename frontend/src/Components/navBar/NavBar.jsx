import React from 'react';
import { NavLink } from 'react-router-dom';
import './NavBar.css';

const Menu = () => {
  return (
    <nav className="navbar">
      <h1>Employee Manager</h1>
      <div className="nav-links">
        <NavLink to="/">Home</NavLink>
        <NavLink to="/new">Add Employee</NavLink>
        <NavLink to="/view">View Employees</NavLink>
      </div>
    </nav>
  );
};

export default Menu;
