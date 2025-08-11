import React, { useState, useEffect } from 'react';
import { UserProvider } from './contexts/UserContext';
import { TransactionsProvider } from './contexts/TransactionsContext';
import { BudgetsProvider } from './contexts/BudgetsContext';
import { CategoriesProvider } from './contexts/CategoriesContext'; 
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import barba from '@barba/core'; 
import './styles/App.css';


import Sidebar from './components/Layout/Sidebar';
import ProtectedRoute from './components/Layout/ProtectedRoute';
import SplashScreen from './components/Layout/SplashScreen';

// Page Components
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import Dashboard from './components/Dashboard/Dashboard';
import SettingsPage from './components/Settings/SettingsPage'; 
import ProfilePage from './components/Profile/ProfilePage'; 
import ReportPage from './components/Report/ReportPage'; 
// A simple Home component for the landing page
const homeContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
    },
  },
};

const homeItemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 },
  },
};

const Home = () => (
  <motion.div
    className="form-container text-center"
    variants={homeContainerVariants}
    initial="hidden"
    animate="visible"
  >
    <motion.h1 variants={homeItemVariants}>Welcome to Expense Manager</motion.h1>
    <motion.p variants={homeItemVariants}>Track your finances with ease. Login or Register to get started.</motion.p>
    <motion.div variants={homeItemVariants}>
      <Link to="/login" className="btn btn-primary" style={{marginRight: '10px'}}>Login</Link>
      <Link to="/register" className="btn btn-secondary">Register</Link>
    </motion.div>
  </motion.div>
);

function App() {
  return (
    <UserProvider>
      <TransactionsProvider>
        <BudgetsProvider>
          <CategoriesProvider> {}
            <Router>
              <AppContent />
            </Router>
          </CategoriesProvider>
        </BudgetsProvider>
      </TransactionsProvider>
    </UserProvider>
  );
}

// New component to access useLocation hook
const AppContent = () => {
  const [showSplash, setShowSplash] = useState(true);
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); 
  const noSidebarPaths = ['/login', '/register', '/']; 
  const showSidebar = !noSidebarPaths.includes(location.pathname);

  // Function to toggle sidebar (will be passed to Navbar later)
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 2000); // Show splash for 2 seconds
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!showSplash) {
      // Initialize Barba.js once the splash screen is hidden and main content is likely rendered
      barba.init({
        debug: true,
        transitions: [{
          name: 'fade-transition',
          leave({ current }) {
            return new Promise(resolve => {
              //  leave animation
              current.container.classList.add('fade-leave-active', 'fade-leave-to');
              setTimeout(() => {
                //  after animation
                current.container.classList.remove('fade-leave-active', 'fade-leave-to');
                resolve();
              }, 500); 
            });
          },
          beforeEnter({ next }) {
            // Prepare next container for enter animation
            next.container.classList.remove('fade-enter-active', 'fade-enter-to', 'fade-enter-from');
            next.container.style.opacity = '0'; 
          },
          enter({ next }) {
            return new Promise(resolve => {
              // Add classes for enter animation
              next.container.classList.add('fade-enter-active', 'fade-enter-from');
              // Trigger reflow
              // eslint-disable-next-line no-unused-expressions
              next.container.offsetHeight;
              // Start animation
              next.container.style.opacity = '1';
              next.container.classList.remove('fade-enter-from'); 

              setTimeout(() => {
                // Remove active class after animation
                next.container.classList.remove('fade-enter-active');
                resolve();
              }, 500); // Duration matches CSS
            });
          },
          // Optional: after hook if React components need re-initialization
          // after({ next }) {
          //   console.log('Barba transition "after" hook for:', next.namespace);
          // }
        }],
        // views: [ /* ... your view configurations if any ... */ ]
      });

      // Cleanup Barba.js instance when component unmounts or showSplash changes back
      return () => {
        if (barba.destroy) { // Check if barba is initialized and has destroy method
          barba.destroy();
        }
      };
    }
  }, [showSplash]); 

  const pageVariants = {
    initial: {
      opacity: 0,
      x: "-100vw",
      scale: 0.8
    },
    in: {
      opacity: 1,
      x: 0,
      scale: 1
    },
    out: {
      opacity: 0,
      x: "100vw",
      scale: 1.2
    }
  };

  const pageTransition = {
    type: "tween",
    ease: "anticipate",
    duration: 0.5
  };

  return (
    <AnimatePresence>
      {showSplash ? (
        <SplashScreen key="splash" />
      ) : (
        <motion.div
          key="app-content"
          data-barba="wrapper" // Added Barba wrapper attribute
          // className="app-container" // Old class, remove or adjust
          initial={{ opacity: 0 }} // Initial app load animation
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {/* Navbar component removed */}
          {showSidebar && (
            <button onClick={toggleSidebar} className="global-sidebar-toggle-btn">
              {/* Simple text or an icon like ☰ */}
              Menu
            </button>
          )}
          {showSidebar && <Sidebar isOpen={isSidebarOpen} />} {/* Pass isOpen prop */}
          <main
            data-barba="container"
            data-barba-namespace={location.pathname === '/' ? 'home' : location.pathname.substring(1).replace(/\//g, '-')}
            className={showSidebar ? "content-with-sidebar" : "content-full-width"}
          > {/* Added Barba container & namespace & Apply class for sidebar spacing */}
            <AnimatePresence mode="wait">
              <Routes location={location} key={location.pathname}>
                {/* Public Routes */}
                <Route
                  path="/"
                  element={
                    <motion.div
                      key="home"
                      initial="initial"
                      animate="in"
                      exit="out"
                      variants={pageVariants}
                      transition={pageTransition}
                    >
                      <Home />
                    </motion.div>
                  }
                />
                <Route
                  path="/login"
                  element={
                    <motion.div
                      key="login"
                      initial="initial"
                      animate="in"
                      exit="out"
                      variants={pageVariants}
                      transition={pageTransition}
                    >
                      <Login />
                    </motion.div>
                  }
                />
                <Route
                  path="/register"
                  element={
                    <motion.div
                      key="register"
                      initial="initial"
                      animate="in"
                      exit="out"
                      variants={pageVariants}
                      transition={pageTransition}
                    >
                      <Register />
                    </motion.div>
                  }
                />

                {/* Protected Routes */}
                <Route element={<ProtectedRoute />}>
                  <Route
                    path="/dashboard"
                    element={
                      <motion.div
                        key="dashboard"
                        initial="initial"
                        animate="in"
                        exit="out"
                        variants={pageVariants}
                        transition={pageTransition}
                      >
                        <Dashboard />
                      </motion.div>
                    }
                  />
                  <Route
                    path="/settings"
                    element={
                      <motion.div
                        key="settings"
                        initial="initial"
                        animate="in"
                        exit="out"
                        variants={pageVariants}
                        transition={pageTransition}
                      >
                        <SettingsPage />
                      </motion.div>
                    }
                  />
                  <Route
                    path="/profile"
                    element={
                      <motion.div
                        key="profile"
                        initial="initial"
                        animate="in"
                        exit="out"
                        variants={pageVariants}
                        transition={pageTransition}
                      >
                        <ProfilePage />
                      </motion.div>
                    }
                  />
                  <Route
                    path="/report"
                    element={
                      <motion.div
                        key="report"
                        initial="initial"
                        animate="in"
                        exit="out"
                        variants={pageVariants}
                        transition={pageTransition}
                      >
                        <ReportPage />
                      </motion.div>
                    }
                  />
                </Route>

                {/* Fallback route for unmatched paths */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </AnimatePresence>
          </main>
          <footer className="text-center mt-5 mb-3">
            <p>&copy; {new Date().getFullYear()} Expense Manager App. All rights reserved.</p>
          </footer>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default App;
