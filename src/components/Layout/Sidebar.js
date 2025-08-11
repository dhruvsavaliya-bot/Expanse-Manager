import React, { useContext } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { UserContext } from '../../contexts/UserContext';
import './Sidebar.css'; // CSS for the sidebar

const Sidebar = ({ isOpen }) => { // Accept isOpen prop
  const { loggedInUser, logout } = useContext(UserContext);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Determine active link
  const isActive = (path) => location.pathname === path;

  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
      <div className="sidebar-brand">
        <Link to="/">Expense Manager</Link>
      </div>
      <nav className="sidebar-nav">
        {loggedInUser ? (
          <>
            <Link to="/dashboard" className={isActive('/dashboard') ? 'active' : ''}>
              {/* Add icon here if desired, e.g., <i className="fas fa-tachometer-alt"></i> */}
              Dashboard
            </Link>
            <Link to="/report" className={isActive('/report') ? 'active' : ''}>
              {/* <i className="fas fa-chart-bar"></i> */}
              Report
            </Link>
            <Link to="/settings" className={isActive('/settings') ? 'active' : ''}>
              {/* <i className="fas fa-cog"></i> */}
              Settings
            </Link>
            <Link to="/profile" className={isActive('/profile') ? 'active' : ''}>
              {/* <i className="fas fa-user"></i> */}
              Profile
            </Link>
            <a href="#!" onClick={handleLogout} className="sidebar-logout">
              {/* <i className="fas fa-sign-out-alt"></i> */}
              Logout ({loggedInUser.name})
            </a>
          </>
        ) : (
          <>
            {location.pathname !== '/login' && location.pathname !== '/register' && location.pathname !== '/' && (
              <>
                <Link to="/login" className={isActive('/login') ? 'active' : ''}>Login</Link>
                <Link to="/register" className={isActive('/register') ? 'active' : ''}>Register</Link>
              </>
            )}
          </>
        )}
      </nav>
    </aside>
  );
};

export default Sidebar;