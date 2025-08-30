import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../hooks/useAuth';
import { EMAIL } from '../../constants/patterns';

import Button from '../../components/Button/Button';
import classes from '../../components/AuthModal/AuthModal.module.css';

export default function RegisterModal({ onClose, onSwitchToLogin }) {
  const auth = useAuth();
  const { user } = auth;

  // OTP states
  const [otpEmail, setOtpEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpMessage, setOtpMessage] = useState('');
  const [emailVerified, setEmailVerified] = useState(false);

  // ✅ only close when emailVerified + user exist
  useEffect(() => {
    if (emailVerified && user) {
      onClose();
    }
  }, [emailVerified, user, onClose]);

  const {
    handleSubmit,
    register,
    getValues,
    setValue,
    formState: { errors },
  } = useForm();

    const submit = async data => {
    if (!emailVerified) {
      setOtpMessage('Please verify your email with OTP first');
      return;
    }
    try {
      const res = await fetch('https://demo.isvaryam.com/api/users/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          email: otpEmail,
          address: {
            doorNumber: data.doorNumber,
            street: data.street,
            area: data.area,
            district: data.district,
            state: data.state,
            pincode: data.pincode,
          },
        }),
      });
      const result = await res.json();
      if (res.ok) {
        setOtpMessage('Registration successful!');
        onClose?.();
      } else {
        setOtpMessage(result.message || 'Registration failed');
      }
    } catch (err) {
      setOtpMessage('Error registering user');
    }
  };


  const emailRegex = new RegExp(EMAIL);

  // Send OTP
  const sendOtpToEmail = async () => {
    const email = getValues('email');
    if (!email || !emailRegex.test(email)) {
      setOtpMessage('Please enter a valid email first');
      return;
    }
    try {
      setOtpMessage('Sending OTP...');
      // ✅ fixed API path
      const res = await fetch('https://demo.isvaryam.com/api/otp/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok) {
        setOtpSent(true);
        setOtpEmail(email);
        setOtpMessage('OTP sent to your email.');
      } else {
        setOtpMessage(data.error || 'Failed to send OTP.');
      }
    } catch (err) {
      setOtpMessage('Error sending OTP');
    }
  };

  // Verify OTP
  const verifyOtp = async () => {
    if (!otp) {
      setOtpMessage('Please enter OTP');
      return;
    }
    try {
      setOtpMessage('Verifying OTP...');
      // ✅ fixed API path
      const res = await fetch('https://demo.isvaryam.com/api/otp/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: otpEmail, otp }),
      });
      const data = await res.json();
      if (res.ok) {
        setOtpMessage('Email verified successfully!');
        setEmailVerified(true);
        setValue('email', otpEmail);
      } else {
        setOtpMessage(data.error || 'Failed to verify OTP');
      }
    } catch (err) {
      setOtpMessage('Error verifying OTP');
    }
  };

  // Password eye toggle
  useEffect(() => {
    const setupToggle = (inputId, iconId) => {
      const input = document.getElementById(inputId);
      const icon = document.getElementById(iconId);
      if (!input || !icon) return;

      const toggle = () => {
        if (input.type === 'password') {
          input.type = 'text';
          icon.classList.remove('fa-eye');
          icon.classList.add('fa-eye-slash');
        } else {
          input.type = 'password';
          icon.classList.remove('fa-eye-slash');
          icon.classList.add('fa-eye');
        }
      };

      icon.addEventListener('click', toggle);
      return () => icon.removeEventListener('click', toggle);
    };

    const cleanup1 = setupToggle('password', 'eye-icon');
    const cleanup2 = setupToggle('confirmPassword', 'eye-icon-confirm');

    return () => {
      cleanup1?.();
      cleanup2?.();
    };
  }, [emailVerified]);

  return (
    <div className={classes.modalBackdrop} onClick={onClose}>
      <div className={classes.modalContent} onClick={e => e.stopPropagation()}>
        <div className={classes.modalHeader}>
          <h2>Register</h2>
          <button className={classes.closeButton} onClick={onClose}>
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit(submit)} className={classes.form} noValidate>
          {/* Email + OTP */}
          <div className={classes.field}>
            <label>Email</label>
            <div className={classes.emailContainer}>
              <input
                type="email"
                {...register('email', {
                  required: true,
                  pattern: { value: emailRegex, message: 'Enter a valid email' },
                  onChange: e => {
                    if (!emailVerified) setOtpEmail(e.target.value);
                  },
                })}
                className={classes.input}
                disabled={emailVerified}
              />
              {!emailVerified && (
                <button
                  type="button"   // ✅ prevent accidental form submit
                  className={classes.otpButton}
                  onClick={otpSent ? verifyOtp : sendOtpToEmail}
                  disabled={otpSent && !otp}
                >
                  {otpSent ? 'Verify OTP' : 'Send OTP'}
                </button>
              )}
            </div>
            {errors.email && <p className={classes.error}>{errors.email.message}</p>}
            {otpSent && !emailVerified && (
              <div className={classes.otpField}>
                <label>Enter OTP</label>
                <input
                  type="text"
                  value={otp}
                  onChange={e => setOtp(e.target.value)}
                  className={classes.input}
                  placeholder="Check your email for OTP"
                />
              </div>
            )}
            {otpMessage && (
              <p className={emailVerified ? classes.success : classes.error}>{otpMessage}</p>
            )}
          </div>

          {/* Name */}
          <div className={classes.field}>
            <label>Name</label>
            <input
              type="text"
              {...register('name', { required: true, minLength: 5 })}
              className={classes.input}
              disabled={!emailVerified}
            />
            {errors.name && <p className={classes.error}>Name must be at least 5 characters</p>}
          </div>

          {/* Phone */}
          <div className={classes.field}>
            <label>Phone Number</label>
            <input
              type="tel"
              {...register('phone', {
                required: 'Phone number is required',
                pattern: {
                  value: /^[6-9]\d{9}$/,
                  message: 'Enter a valid 10-digit phone number',
                },
              })}
              className={classes.input}
              disabled={!emailVerified}
            />
            {errors.phone && <p className={classes.error}>{errors.phone.message}</p>}
          </div>

          {/* Password */}
          <div className={classes.field}>
            <label>Password</label>
            <div className={classes.passwordContainer}>
              <input
                type="password"
                id="password"
                {...register('password', { required: true, minLength: 5 })}
                className={classes.input}
                disabled={!emailVerified}
              />
              <i className="fa fa-eye" id="eye-icon"></i>
            </div>
            {errors.password && (
              <p className={classes.error}>Password must be at least 5 characters</p>
            )}
          </div>

          {/* Confirm Password */}
          <div className={classes.field}>
            <label>Confirm Password</label>
            <div className={classes.passwordContainer}>
              <input
                type="password"
                id="confirmPassword"
                {...register('confirmPassword', {
                  required: true,
                  validate: value =>
                    value !== getValues('password') ? 'Passwords do not match' : true,
                })}
                className={classes.input}
                disabled={!emailVerified}
              />
              <i className="fa fa-eye" id="eye-icon-confirm"></i>
            </div>
            {errors.confirmPassword && (
              <p className={classes.error}>{errors.confirmPassword.message}</p>
            )}
          </div>

          {/* Address fields */}
          <div className={classes.field}>
            <label>Door Number</label>
            <input
              type="text"
              {...register('doorNumber', { required: true })}
              className={classes.input}
              disabled={!emailVerified}
            />
            {errors.doorNumber && <p className={classes.error}>Door Number is required</p>}
          </div>

          <div className={classes.field}>
            <label>Street</label>
            <input
              type="text"
              {...register('street', { required: true })}
              className={classes.input}
              disabled={!emailVerified}
            />
            {errors.street && <p className={classes.error}>Street is required</p>}
          </div>

          <div className={classes.field}>
            <label>Area</label>
            <input
              type="text"
              {...register('area', { required: true })}
              className={classes.input}
              disabled={!emailVerified}
            />
            {errors.area && <p className={classes.error}>Area is required</p>}
          </div>

          <div className={classes.field}>
            <label>District</label>
            <input
              type="text"
              {...register('district', { required: true })}
              className={classes.input}
              disabled={!emailVerified}
            />
            {errors.district && <p className={classes.error}>District is required</p>}
          </div>

          <div className={classes.field}>
            <label>State</label>
            <input
              type="text"
              {...register('state', { required: true })}
              className={classes.input}
              disabled={!emailVerified}
            />
            {errors.state && <p className={classes.error}>State is required</p>}
          </div>

          <div className={classes.field}>
            <label>Pincode</label>
            <input
              type="text"
              {...register('pincode', { required: true })}
              className={classes.input}
              disabled={!emailVerified}
            />
            {errors.pincode && <p className={classes.error}>Pincode is required</p>}
          </div>

          <Button type="submit" text="Register" disabled={!emailVerified} />

          <div className={classes.switch}>
            Already a user?&nbsp;
            <button type="button" className={classes.switchButton} onClick={onSwitchToLogin}>
              Login here
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
