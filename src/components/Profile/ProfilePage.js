import React, { useState, useContext } from 'react';
import { UserContext } from '../../contexts/UserContext';
import Alert from '../common/Alert';
import './ProfilePage.css'; // We'll create this file next

const ProfilePage = () => {
  const { loggedInUser, changePassword } = useContext(UserContext);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState({ type: '', content: '' });
  const [showPassword, setShowPassword] = useState(false); // For displaying stored password
  const [showCurrentPasswordInput, setShowCurrentPasswordInput] = useState(false);
  const [showNewPasswordInput, setShowNewPasswordInput] = useState(false);
  const [showConfirmPasswordInput, setShowConfirmPasswordInput] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: '', content: '' }); // Clear previous messages

    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', content: 'New passwords do not match.' });
      return;
    }

    if (newPassword.length < 6) {
      setMessage({ type: 'error', content: 'New password must be at least 6 characters long.' });
      return;
    }

    // In a real app, you'd call an API here.
    // We'll simulate this with a function in UserContext
    try {
      if (!loggedInUser) {
        setMessage({ type: 'error', content: 'You must be logged in to change your password.' });
        return;
      }

      if (!currentPassword) {
        setMessage({ type: 'error', content: 'Current password is required.' });
        return;
      }

      // The changePassword function in UserContext now expects (userId, currentPassword, newPassword)
      // It returns an object like { success: true/false, message: '...' }
      const result = await changePassword(loggedInUser.id, currentPassword, newPassword);

      if (result.success) {
        setMessage({ type: 'success', content: result.message || 'Password changed successfully!' });
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setMessage({ type: 'error', content: result.message || 'Failed to change password.' });
      }
    } catch (error) {
      
      setMessage({ type: 'error', content: error.message || 'An unexpected error occurred while changing password.' });
    }
  };

  if (!loggedInUser) {
    return <p>Please log in to view your profile.</p>;
  }

  return (
    <div className="profile-page-container">
      <h2>User Profile</h2>
      {message.content && <Alert type={message.type} message={message.content} />}
      <div className="profile-info">
        <p><strong>Email:</strong> {loggedInUser.email}</p>
        <p><strong>Name:</strong> {loggedInUser.name}</p>
        <div className="password-display-section">
          <p>
            <strong>Password:</strong> {showPassword ? loggedInUser.password : '••••••••'}
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="btn btn-secondary btn-sm" // Removed password-toggle-btn
              style={{ marginLeft: '10px' }}
              title={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? '\u2717' : '\u{1F441}'}
            </button>
          </p>
        </div>
        {}
      </div>
      <form onSubmit={handleSubmit} className="password-change-form">
        <h3>Change Password</h3>
        <div className="form-group">
          <label htmlFor="currentPassword">Current Password:</label>
          <div className="password-input-container">
            <input
              type={showCurrentPasswordInput ? "text" : "password"}
              id="currentPassword"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
            />
            <button
              type="button"
              onClick={() => setShowCurrentPasswordInput(!showCurrentPasswordInput)}
              className="btn btn-secondary btn-sm password-toggle-btn"
              title={showCurrentPasswordInput ? 'Hide current password' : 'Show current password'}
            >
              {showCurrentPasswordInput ? '\u2717' : '\u{1F441}'}
            </button>
          </div>
        </div>
        <div className="form-group">
          <label htmlFor="newPassword">New Password:</label>
          <div className="password-input-container">
            <input
              type={showNewPasswordInput ? "text" : "password"}
              id="newPassword"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
            <button
              type="button"
              onClick={() => setShowNewPasswordInput(!showNewPasswordInput)}
              className="btn btn-secondary btn-sm password-toggle-btn"
              title={showNewPasswordInput ? 'Hide new password' : 'Show new password'}
            >
              {showNewPasswordInput ? '\u2717' : '\u{1F441}'}
            </button>
          </div>
        </div>
        <div className="form-group">
          <label htmlFor="confirmPassword">Confirm New Password:</label>
          <div className="password-input-container">
            <input
              type={showConfirmPasswordInput ? "text" : "password"}
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            <button
              type="button"
              onClick={() => setShowConfirmPasswordInput(!showConfirmPasswordInput)}
              className="btn btn-secondary btn-sm password-toggle-btn"
              title={showConfirmPasswordInput ? 'Hide confirm password' : 'Show confirm password'}
            >
              {showConfirmPasswordInput ? '\u2717' : '\u{1F441}'}
            </button>
          </div>
        </div>
        <button type="submit" className="btn btn-primary">Change Password</button>
      </form>
    </div>
  );
};

export default ProfilePage;