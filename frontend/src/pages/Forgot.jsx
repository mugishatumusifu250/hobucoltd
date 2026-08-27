import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../api';
import { goBack } from '../helpers';
import '../styles/autho/forgot.css';

const Forgot = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await authAPI.forgot({ email });
      const result = await res.json();

      if (result.success) {
        navigate('/verify-code');
      } else {
        setError(result.message || 'Failed to send confirmation code.');
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
          <div className="title login">Forgot Password?</div>
        </div>
        <div className="form-container">
          <div className="form-inner">
            <form className="login" onSubmit={handleSubmit}>
              <div className="field">
                <input
                  name="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
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
                  value={loading ? 'Sending...' : 'Send Confirmation Code'}
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

export default Forgot;
