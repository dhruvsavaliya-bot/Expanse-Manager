import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUser, FaEnvelope, FaLock, FaGoogle, FaApple } from 'react-icons/fa';
import { UserContext } from '../../contexts/UserContext';
import Alert from '../common/Alert'; // Import Alert component

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, label: '', color: 'grey' });
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { register } = useContext(UserContext); // Use UserContext

  const handleSubmit = (e) => {
    e.preventDefault();
    setError(''); // Clear previous errors

    if (!name || !email || !password || !confirmPassword) {
      setError('Please fill in all fields.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    // Basic email validation
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email address.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    // --- LocalStorage Registration Logic ---
    try {
      register(name, email, password); // Use register from context
      navigate('/login'); // Navigate to login page after successful registration
    } catch (err) {
      console.error("Error during registration:", err);
      setError(err.message || 'An unexpected error occurred. Please try again.');
    }
  };

  const handleGoogleRegister = () => {
    // Placeholder for Google registration logic
    console.log('Attempting Google registration...');
    setError('Google registration is not yet implemented.');
  };

  const handleAppleRegister = () => {
    // Placeholder for Apple registration logic
    console.log('Attempting Apple registration...');
    setError('Apple registration is not yet implemented.');
  };

  const calculatePasswordStrength = (password) => {
    let score = 0;
    let label = 'Too weak';
    let color = 'red';

    if (!password || password.length < 1) {
      return { score: 0, label: '', color: 'grey' }; // Default or empty state
    }

    // Length check
    if (password.length >= 6) score++;
    if (password.length >= 8) score++;
    if (password.length >= 10) score++;

    // Character type checks
    if (/[a-z]/.test(password)) score++; // Lowercase
    if (/[A-Z]/.test(password)) score++; // Uppercase
    if (/[0-9]/.test(password)) score++; // Numbers
    if (/[^a-zA-Z0-9]/.test(password)) score++; // Special characters

    // Determine label and color based on score
    // Max score can be 3 (length) + 4 (char types) = 7
    if (score <= 2) {
      label = 'Too weak';
      color = '#dc3545'; // Red
    } else if (score <= 4) {
      label = 'Weak';
      color = '#ffc107'; // Orange/Yellow
    } else if (score <= 6) {
      label = 'Medium';
      color = '#fd7e14'; // Lighter Orange
    } else {
      label = 'Strong';
      color = '#28a745'; // Green
    }
    
    if (password.length > 0 && password.length < 6) {
        label = 'Too short';
        color = '#dc3545';
        score = 1; // Ensure it's not 0 if there's some input but too short
    }


    return { score, label, color };
  };

  const handlePasswordChange = (e) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    setPasswordStrength(calculatePasswordStrength(newPassword));
  };

  return (
    <div className="form-container">
      <h2>Register</h2>
      <form onSubmit={handleSubmit}>
        {error && <Alert type="error" message={error} />}
        <div className="form-group">
          <label htmlFor="name">Full Name</label>
          <div className="input-with-icon">
            <FaUser className="input-icon" />
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your full name"
              required
            />
          </div>
        </div>
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
              onChange={handlePasswordChange}
              placeholder="Create a password (min. 6 characters)"
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
          {password.length > 0 && (
            <div className="password-strength-meter" style={{ marginTop: '5px' }}>
              <div
                style={{
                  width: `${(passwordStrength.score / 7) * 100}%`, // Max score is 7
                  height: '8px',
                  backgroundColor: passwordStrength.color,
                  borderRadius: '4px',
                  transition: 'width 0.3s ease-in-out, background-color 0.3s ease-in-out',
                }}
              ></div>
              <small style={{ color: passwordStrength.color, display: 'block', marginTop: '3px' }}>
                Strength: {passwordStrength.label}
              </small>
            </div>
          )}
        </div>
        <div className="form-group">
          <label htmlFor="confirmPassword">Confirm Password</label>
          <div className="input-with-icon password-input-container">
            <FaLock className="input-icon" />
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm your password"
              required
            />
            <button
              type="button"
              className="toggle-password-btn"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              title={showConfirmPassword ? 'Hide password' : 'Show password'}
            >
              {showConfirmPassword ? '\u2717' : '\u{1F441}'} {/* ✗ for Hide, 👁️ for Show */}
            </button>
          </div>
        </div>
        <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
          Register
        </button>
      </form>
      <div className="social-login-options mt-3">
        <p className="text-center">Or sign up with</p>
        <div className="social-buttons-container d-flex justify-content-center">
          <button
            type="button"
            className="btn btn-social btn-google m-1"
            onClick={handleGoogleRegister}
            title="Sign up with Google"
          >
            <FaGoogle /> Google
          </button>
          <button
            type="button"
            className="btn btn-social btn-apple m-1"
            onClick={handleAppleRegister}
            title="Sign up with Apple"
          >
            <FaApple /> Apple
          </button>
        </div>
      </div>
      <p className="text-center mt-3">
        Already have an account? <a href="/login">Login here</a>
      </p>
    </div>
  );
};

export default Register;