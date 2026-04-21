import React, { useState } from 'react';
import { LayoutDashboard, Users, Settings, Moon, Sun, Shield, User, LogOut } from 'lucide-react';

const Sidebar = ({ isAdmin, setIsAdmin, theme, toggleTheme }) => {

  const handleRoleToggle = () => {
    if (isAdmin) {
      setIsAdmin(false);
    } else {
      const password = prompt("Enter Admin Password:");
      if (password === 'admin123') {
        setIsAdmin(true);
      } else if (password !== null) {
        alert("Incorrect Password!");
      }
    }
  };

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <LayoutDashboard size={24} />
        <span>SalesDash</span>
      </div>
      
      <ul className="nav-links">
        <li className="nav-item active">
          <LayoutDashboard size={20} />
          <span>Dashboard</span>
        </li>
      </ul>
      
      <div className="sidebar-footer">
        <button className="theme-toggle mb-4" onClick={toggleTheme}>
          {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          <span style={{ marginLeft: '10px' }}>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
        </button>

        <div className="role-toggle" onClick={handleRoleToggle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {isAdmin ? <Shield size={18} className="text-danger" /> : <User size={18} className="text-success" />}
            <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>
              {isAdmin ? 'Admin Mode' : 'User Mode'}
            </span>
          </div>
          <span className={`role-badge ${isAdmin ? 'admin' : 'user'}`}>
            {isAdmin ? 'Admin' : 'User'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
