import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../api';
import { goBack } from '../helpers';
import '../styles/autho/forgot.css';

const ResetPassword = () => {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await authAPI.resetPassword({ password });
      const result = await res.json();

      if (result.success) {
        navigate('/login');
      } else {
        setError(result.message || 'Failed to reset password.');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="wrapper">
      <div className="main-con">
        <div className="title-text">
          <div className="title login">New Password</div>
        </div>
        <div className="form-container">
          <div className="form-inner">
            <form className="login" onSubmit={handleSubmit}>
              <div className="field">
                <input
                  type="password"
                  name="password"
                  placeholder="Enter new password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              {error && (
                <div className="error-message" style={{ display: 'block' }}>
                  {error}
                </div>
              )}
              <div className="field btn">
                <div className="btn-layer"></div>
                <input
                  type="submit"
                  value={loading ? 'Changing...' : 'Change Password'}
                  disabled={loading}
                />
              </div>
            </form>
          </div>
          <div className="back-btn">
            <button className="back btn-primary" onClick={goBack}>
              Back
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
