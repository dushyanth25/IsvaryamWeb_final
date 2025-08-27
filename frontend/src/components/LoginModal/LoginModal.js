import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../hooks/useAuth';
import { EMAIL } from '../../constants/patterns';
import Button from '../Button/Button';
import classes from '../AuthModal/AuthModal.module.css';
import GoogleButton from '../GoogleButton/GoogleButton';
import { useNavigate } from 'react-router-dom';

export default function LoginModal({ onClose, onSwitchToRegister }) {
  const {
    handleSubmit,
    register,
    formState: { errors },
  } = useForm();

  const { user, login } = useAuth();
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotStep, setForgotStep] = useState(1); // 1: Email, 2: OTP, 3: New Password
  const [forgotEmail, setForgotEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [forgotMessage, setForgotMessage] = useState({ text: '', isError: false });
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    if (user) onClose();
  }, [user, onClose]);

  const submit = async ({ email, password }) => {
    await login(email, password);
  };

  // Countdown timer for OTP resend
  useEffect(() => {
    if (countdown <= 0) return;
    
    const timer = setTimeout(() => {
      setCountdown(countdown - 1);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [countdown]);

  // Toggle password visibility
  useEffect(() => {
    const setupToggle = () => {
      const input = document.getElementById('password');
      const icon = document.getElementById('eye-icon');
      if (!input || !icon) return;

      const toggle = () => {
        input.type = input.type === 'password' ? 'text' : 'password';
        icon.classList.toggle('fa-eye');
        icon.classList.toggle('fa-eye-slash');
      };

      icon.addEventListener('click', toggle);
      return () => icon.removeEventListener('click', toggle);
    };

    return setupToggle();
  }, []);

  // Forgot password: Request OTP
  const requestOtp = async () => {
    if (!forgotEmail || !new RegExp(EMAIL).test(forgotEmail)) {
      setForgotMessage({ text: 'Please enter a valid email', isError: true });
      return;
    }

    try {
      setForgotMessage({ text: 'Sending OTP...', isError: false });
      const res = await fetch('http://localhost:5000/api/forget/forget-send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },  
        body: JSON.stringify({ email: forgotEmail }),
      });

      if (res.ok) {
        setForgotMessage({ text: 'OTP sent to your email', isError: false });
        setForgotStep(2);
        setCountdown(60); // Start 60-second countdown
      } else {
        const data = await res.json();
        setForgotMessage({ text: data.error || data.message || 'Failed to send OTP', isError: true });
      }
    } catch (err) {
      setForgotMessage({ text: 'Server error. Try again later.', isError: true });
    }
  };

  // Forgot password: Verify OTP
  const verifyOtp = async () => {
    if (!otp) {
      setForgotMessage({ text: 'Please enter the OTP', isError: true });
      return;
    }

    try {
      setForgotMessage({ text: 'Verifying OTP...', isError: false });
      const res = await fetch('http://localhost:5000/api/forget/forget-verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail, otp }),
      });

      const data = await res.json();
      if (res.ok) {
        setForgotMessage({ text: 'OTP verified successfully', isError: false });
        setForgotStep(3);
      } else {
        setForgotMessage({ text: data.message || 'Invalid OTP', isError: true });
      }
    } catch (err) {
      setForgotMessage({ text: 'Server error. Try again later.', isError: true });
    }
  };

  // Forgot password: Reset password
  const resetPassword = async () => {
    // Basic validations
    if (!newPassword || newPassword.length < 6) {
      setForgotMessage({ text: 'Password must be at least 6 characters', isError: true });
      return;
    }
    try {
      setForgotMessage({ text: 'Resetting password...', isError: false });
      const res = await fetch('http://localhost:5000/api/forget/forget-reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail, password: newPassword }),
      });
      const data = await res.json();
      if (res.ok) {
        setForgotMessage({ text: 'Password reset successful! You can now login.', isError: false });
        setTimeout(() => {
          setShowForgotPassword(false);
          setForgotStep(1);
          setForgotMessage({ text: '', isError: false });
          setNewPassword('');
          setOtp('');
          setForgotEmail('');
        }, 2000);
      } else {
        setForgotMessage({ text: data.message || 'Failed to reset password', isError: true });
      }
    } catch (err) {
      setForgotMessage({ text: 'Server error. Try again later.', isError: true });
    }
  };
  

  // Forgot password: Resend OTP
  const handleResend = () => {
    if (countdown > 0) return;
    requestOtp();
  };

  if (showForgotPassword) {
    return (
      <div className={classes.modalBackdrop} onClick={onClose}>
        <div className={classes.modalContent} onClick={(e) => e.stopPropagation()}>
          <div className={classes.modalHeader}>
            <h2>Reset Password</h2>
            <button className={classes.closeButton} onClick={() => {
              setShowForgotPassword(false);
              setForgotStep(1);
              setForgotMessage({ text: '', isError: false });
            }}>&times;</button>
          </div>

          <div className={classes.form}>
            {/* Step 1: Email */}
            {forgotStep === 1 && (
              <div className={classes.field}>
                <label>Email</label>
                <input
                  type="email"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  className={classes.input}
                  placeholder="Enter your registered email"
                />
                {forgotMessage.text && (
                  <p className={forgotMessage.isError ? classes.error : classes.success}>
                    {forgotMessage.text}
                  </p>
                )}
                <Button type="button" text="Request OTP" onClick={requestOtp} />
              </div>
            )}

            {/* Step 2: OTP */}
            {forgotStep === 2 && (
              <div className={classes.field}>
                <label>Enter OTP</label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className={classes.input}
                  placeholder="Enter OTP sent to your email"
                />
                <div className={classes.resendContainer}>
                  {countdown > 0 ? (
                    <span className={classes.countdown}>Resend in {countdown}s</span>
                  ) : (
                    <button 
                      type="button" 
                      className={classes.resendButton}
                      onClick={handleResend}
                    >
                      Resend OTP
                    </button>
                  )}
                </div>
                {forgotMessage.text && (
                  <p className={forgotMessage.isError ? classes.error : classes.success}>
                    {forgotMessage.text}
                  </p>
                )}
                <Button type="button" text="Verify OTP" onClick={verifyOtp} />
              </div>
            )}

            {/* Step 3: New Password */}
            {forgotStep === 3 && (
              <div className={classes.field}>
                <label>New Password</label>
                <div className={classes.passwordContainer}>
                  <input
                    type="password"
                    id="newPassword"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className={classes.input}
                    placeholder="Enter new password"
                  />
                  <i className="fa fa-eye" id="eye-icon-new"></i>
                </div>
                {forgotMessage.text && (
                  <p className={forgotMessage.isError ? classes.error : classes.success}>
                    {forgotMessage.text}
                  </p>
                )}
                <Button type="button" text="Reset Password" onClick={resetPassword} />
              </div>
            )}

            <div className={classes.switch}>
              Remember your password?{' '}
              <button 
                type="button" 
                className={classes.switchButton} 
                onClick={() => {
                  setShowForgotPassword(false);
                  setForgotStep(1);
                  setForgotMessage({ text: '', isError: false });
                }}
              >
                Login here
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={classes.modalBackdrop} onClick={onClose}>
      <div className={classes.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={classes.modalHeader}>
          <h2>Login</h2>
          <button className={classes.closeButton} onClick={onClose}>&times;</button>
        </div>

        <form onSubmit={handleSubmit(submit)} className={classes.form} noValidate>
          <div className={classes.field}>
            <label>Email</label>
            <input
              type="email"
              {...register('email', {
                required: true,
                pattern: EMAIL,
              })}
              className={classes.input}
            />
            {errors.email && <p className={classes.error}>Enter a valid email</p>}
          </div>

          <div className={classes.field}>
            <label>Password</label>
            <div className={classes.passwordContainer}>
              <input
                type="password"
                id="password"
                {...register('password', { required: true })}
                className={classes.input}
              />
              <i className="fa fa-eye" id="eye-icon"></i>
            </div>
            {errors.password && <p className={classes.error}>Password is required</p>}
            
            {/* Forgot Password Link */}
            <div className={classes.forgotPassword}>
              <button 
                type="button" 
                className={classes.forgotButton}
                onClick={() => setShowForgotPassword(true)}
              >
                Forgot Password?
              </button>
            </div>
          </div>

<button className={classes.loginButton} type="submit">
  Login
</button>



          <div className={classes.orDivider} style={{ color: 'black' }}>Or</div>

          <GoogleButton
            onSuccess={(result) => {
              const { displayName: name, email } = result.user;
              localStorage.setItem('firebaseUser', JSON.stringify({ name, email }));
              alert('Google Sign-In successful');
              onClose();
            }}
            onError={(error) => {
              alert(error.message || 'Google Sign-In failed');
            }}
          />

          {/* Switch to Register */}
          <div className={classes.switch}>
            New user?{' '}
            <button type="button" className={classes.switchButton} onClick={onSwitchToRegister}>
              Register here
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}