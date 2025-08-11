import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaEnvelope, FaLock, FaGoogle, FaApple } from 'react-icons/fa';
import { UserContext } from '../../contexts/UserContext';
import Alert from '../common/Alert'; // Import Alert component

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login, lastUserEmail } = useContext(UserContext); // Use UserContext

  useEffect(() => {
    if (lastUserEmail) {
      setEmail(lastUserEmail);
    }
  }, [lastUserEmail]); // Depend on lastUserEmail from context

  const handleSubmit = async (e) => { // Made async for potential future API calls
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email address.');
      return;
    }

    try {
      const loggedIn = login(email, password); // Use login from context
      if (loggedIn) {
        navigate('/dashboard');
      } else {
        setError('Invalid email or password.');
      }
    } catch (err) {
      console.error("Error during login:", err);
      setError(err.message || 'An unexpected error occurred. Please try again.');
    }
  };

  const handleGoogleLogin = () => {
    // Placeholder for Google login logic
    console.log('Attempting Google login...');
    setError('Google login is not yet implemented.');
  };

  const handleAppleLogin = () => {
    // Placeholder for Apple login logic
    console.log('Attempting Apple login...');
    setError('Apple login is not yet implemented.');
  };

  return (
    <div className="form-container">
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        {error && <Alert type="error" message={error} />}
        <div className="form-group">
          <label htmlFor="email">Email Address</label>
          <div className="input-with-icon">
            <FaEnvelope className="input-icon" />
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
            />
          </div>
        </div>
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <div className="input-with-icon password-input-container">
            <FaLock className="input-icon" />
            <input
              type={showPassword ? 'text' : 'password'}
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />
            <button
              type="button"
              className="toggle-password-btn"
              onClick={() => setShowPassword(!showPassword)}
              title={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? '\u2717' : '\u{1F441}'} {/* ✗ for Hide, 👁️ for Show */}
            </button>
          </div>
        </div>
        <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
          Login
        </button>
      </form>
      <div className="social-login-options mt-3">
        <p className="text-center">Or continue with</p>
        <div className="social-buttons-container d-flex justify-content-center">
          <button
            type="button"
            className="btn btn-social btn-google m-1"
            onClick={handleGoogleLogin}
            title="Login with Google"
          >
            <FaGoogle /> Google
          </button>
          <button
            type="button"
            className="btn btn-social btn-apple m-1"
            onClick={handleAppleLogin}
            title="Login with Apple"
          >
            <FaApple /> Apple
          </button>
        </div>
      </div>
      <p className="text-center mt-3">
        Don't have an account? <a href="/register">Register here</a>
      </p>
    </div>
  );
};

export default Login;