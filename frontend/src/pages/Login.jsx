import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../api';
import { useAuth } from '../AuthContext';
import { goBack } from '../helpers';
import '../styles/autho/login.css';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  // Login form state
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  // Signup form state
  const [signupUsername, setSignupUsername] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupError, setSignupError] = useState('');
  const [signupSuccess, setSignupSuccess] = useState('');
  const [signupLoading, setSignupLoading] = useState(false);

  // Preloader state
  const [preloaderVisible, setPreloaderVisible] = useState(true);

  // Slide control state
  const [activeSlide, setActiveSlide] = useState('login');

  // Refs for slide animation
  const loginFormRef = useRef(null);
  const loginTitleRef = useRef(null);

  // Preloader fade out on mount
  useEffect(() => {
    setPreloaderVisible(false);
  }, []);

  // Handle slide control change
  const handleSlideChange = (value) => {
    setActiveSlide(value);
    if (loginFormRef.current) {
      loginFormRef.current.style.marginLeft = value === 'signup' ? '-50%' : '0%';
    }
    if (loginTitleRef.current) {
      loginTitleRef.current.style.marginLeft = value === 'signup' ? '-50%' : '0%';
    }
  };

  // Login form submission
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoginError('');
    setLoginLoading(true);

    try {
      const data = await login({
        username: loginUsername,
        password: loginPassword,
        remember,
      });

      if (data.success) {
        navigate('/dashboard');
      } else {
        setLoginError(data.message || 'Login failed');
      }
    } catch (error) {
      setLoginError('Network error. Please try again.');
    } finally {
      setLoginLoading(false);
    }
  };

  // Signup form submission
  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    setSignupError('');
    setSignupSuccess('');
    setSignupLoading(true);

    try {
      const res = await authAPI.signup({
        username: signupUsername,
        email: signupEmail,
        password: signupPassword,
      });

      const result = await res.json();

      if (result.success) {
        setSignupSuccess(result.message || 'Account created successfully!');
        setSignupUsername('');
        setSignupEmail('');
        setSignupPassword('');
      } else {
        setSignupError(result.message || 'Signup failed');
      }
    } catch (err) {
      setSignupError('Network error. Try again later.');
    } finally {
      setSignupLoading(false);
    }
  };

  // Toggle password visibility
  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  return (
    <>
      <div id="preloader" className={preloaderVisible ? '' : 'fade-out'}>
        <div className="loader-content">
          <p className="loader-text">HOBUCO platform...</p>
          <div className="loader-dots">
            <div className="dot"></div>
            <div className="dot"></div>
            <div className="dot"></div>
            <div className="dot"></div>
          </div>
        </div>
      </div>

      <div className="wrapper">
        <div className="main-con">
          <div className="title-text" ref={loginTitleRef}>
            <div className="title login">Login Form</div>
            <div className="title signup">Signup Form</div>
          </div>
          <div className="form-container">
            <div className="slide-controls">
              <input
                type="radio"
                name="slide"
                id="login"
                checked={activeSlide === 'login'}
                onChange={() => handleSlideChange('login')}
              />
              <input
                type="radio"
                name="slide"
                id="signup"
                checked={activeSlide === 'signup'}
                onChange={() => handleSlideChange('signup')}
              />
              <label htmlFor="login" className="slide login" onClick={() => handleSlideChange('login')}>
                Login
              </label>
              <label htmlFor="signup" className="slide signup" onClick={() => handleSlideChange('signup')}>
                Create Account
              </label>
              <div className="slider-tab"></div>
            </div>
            <div className="form-inner" ref={loginFormRef}>
              <form className="login" onSubmit={handleLoginSubmit}>
                <div className="field">
                  <input
                    type="text"
                    name="username"
                    placeholder="Username"
                    value={loginUsername}
                    onChange={(e) => setLoginUsername(e.target.value)}
                    required
                  />
                </div>
                <div className="field password-field">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    placeholder="Password"
                    id="password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    required
                  />
                  <i
                    className={showPassword ? 'fa-regular fa-eye-slash' : 'fa-regular fa-eye'}
                    id="togglePassword"
                    onClick={togglePasswordVisibility}
                  ></i>
                </div>
                <div className="pass-link">
                  <input
                    type="checkbox"
                    name="remember"
                    id="remember"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                  />
                  <span className="remember-text" onClick={() => setRemember((prev) => !prev)}>
                    Remember me.
                  </span>
                </div>

                {/* Error message container */}
                {loginError && (
                  <div id="errorMessage" className="error-message" style={{ display: 'block' }}>
                    {loginError}
                  </div>
                )}

                <div className="field btn">
                  <div className="btn-layer"></div>
                  <input
                    type="submit"
                    value={loginLoading ? 'Logging in...' : 'Login'}
                    disabled={loginLoading}
                    className={loginLoading ? 'login-btn-loading' : ''}
                  />
                </div>
                <div className="forgot-password">
                  <Link to="/forgot">Forgot Password?</Link>
                </div>
              </form>

              <form className="signup" id="signupForm" onSubmit={handleSignupSubmit}>
                <div className="field">
                  <input
                    type="text"
                    name="username"
                    placeholder="Username"
                    value={signupUsername}
                    onChange={(e) => setSignupUsername(e.target.value)}
                    required
                  />
                </div>
                <div className="field">
                  <input
                    type="email"
                    name="email"
                    placeholder="Email Address"
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="field">
                  <input
                    type="password"
                    name="password"
                    placeholder="Password"
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    required
                  />
                </div>

                {/* error msg */}
                {signupError && (
                  <div id="signupErrorMessage" className="error-message" style={{ display: 'block' }}>
                    {signupError}
                  </div>
                )}

                {/* success msg */}
                {signupSuccess && (
                  <div id="signupSuccessMessage" className="success-message" style={{ display: 'block' }}>
                    {signupSuccess}
                  </div>
                )}

                <div className="field btn">
                  <div className="btn-layer"></div>
                  <input
                    type="submit"
                    value={signupLoading ? 'Signing up...' : 'Signup'}
                    disabled={signupLoading}
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
    </>
  );
};

export default Login;
