import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../api';
import { goBack } from '../helpers';
import '../styles/autho/forgot.css';

const VerifyCode = () => {
  const navigate = useNavigate();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await authAPI.verifyCode({ code });
      const result = await res.json();

      if (result.success) {
        navigate('/reset-password');
      } else {
        setError(result.message || 'Verification failed.');
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
          <div className="title login">Enter Your Verification Code</div>
        </div>
        <div className="form-container">
          <div className="form-inner">
            <form className="login" onSubmit={handleSubmit}>
              <div className="field">
                <input
                  type="text"
                  name="code"
                  placeholder="Enter code"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
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
                  value={loading ? 'Verifying...' : 'Verify'}
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

export default VerifyCode;
