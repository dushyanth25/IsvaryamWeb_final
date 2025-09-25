import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../hooks/useAuth';
import { EMAIL } from '../../constants/patterns';
import Button from '../Button/Button';
import classes from '../AuthModal/AuthModal.module.css';

export default function RegisterModal({ onClose, onSwitchToLogin }) {
  const auth = useAuth();
  const { user } = auth;

  useEffect(() => {
    if (user) {
      onClose();
    }
  }, [user, onClose]);

  const {
    handleSubmit,
    register,
    getValues,
    formState: { errors },
  } = useForm();

  const submit = async (data) => {
    try {
      const result = await auth.register({
        ...data,
        address: {
          doorNumber: data.doorNumber,
          street: data.street,
          area: data.area,
          district: data.district,
          state: data.state,
          pincode: data.pincode,
        },
      });

      if (result && result.error) {
        alert(result.error);
      } else {
        alert('Registration successful!');
        onClose();
      }
    } catch (error) {
      console.error('Registration error:', error);
      alert('Registration failed. Please try again.');
    }
  };

  const emailRegex = new RegExp(EMAIL);

  return (
    <div className={classes.modalBackdrop} onClick={onClose}>
      <div className={classes.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={classes.modalHeader}>
          <h2>Register</h2>
          <button className={classes.closeButton} onClick={onClose}>
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit(submit)} className={classes.form} noValidate>
          {/* Email */}
          <div className={classes.field}>
            <label>Email</label>
            <input
              type="email"
              {...register('email', {
                required: 'Email is required',
                pattern: { value: emailRegex, message: 'Enter a valid email' },
              })}
              className={classes.input}
            />
            {errors.email && <p className={classes.error}>{errors.email.message}</p>}
          </div>

          {/* Name */}
          <div className={classes.field}>
            <label>Name</label>
            <input
              type="text"
              {...register('name', { required: 'Name is required', minLength: { value: 5, message: 'Name must be at least 5 characters' } })}
              className={classes.input}
            />
            {errors.name && <p className={classes.error}>{errors.name.message}</p>}
          </div>

          {/* Phone */}
          <div className={classes.field}>
            <label>Phone Number</label>
            <input
              type="tel"
              {...register('phone', {
                required: 'Phone number is required',
                pattern: { value: /^[6-9]\d{9}$/, message: 'Enter a valid 10-digit phone number' },
              })}
              className={classes.input}
            />
            {errors.phone && <p className={classes.error}>{errors.phone.message}</p>}
          </div>

          {/* Password */}
          <div className={classes.field}>
            <label>Password</label>
            <input
              type="password"
              {...register('password', { required: 'Password is required', minLength: { value: 5, message: 'Password must be at least 5 characters' } })}
              className={classes.input}
            />
            {errors.password && <p className={classes.error}>{errors.password.message}</p>}
          </div>

          {/* Confirm Password */}
          <div className={classes.field}>
            <label>Confirm Password</label>
            <input
              type="password"
              {...register('confirmPassword', {
                required: 'Confirm Password is required',
                validate: (value) => (value !== getValues('password') ? 'Passwords do not match' : true),
              })}
              className={classes.input}
            />
            {errors.confirmPassword && <p className={classes.error}>{errors.confirmPassword.message}</p>}
          </div>

          {/* Address Fields */}
          <div className={classes.field}>
            <label>Door Number</label>
            <input type="text" {...register('doorNumber', { required: 'Door Number is required' })} className={classes.input} />
            {errors.doorNumber && <p className={classes.error}>{errors.doorNumber.message}</p>}
          </div>

          <div className={classes.field}>
            <label>Street</label>
            <input type="text" {...register('street', { required: 'Street is required' })} className={classes.input} />
            {errors.street && <p className={classes.error}>{errors.street.message}</p>}
          </div>

          <div className={classes.field}>
            <label>Area</label>
            <input type="text" {...register('area', { required: 'Area is required' })} className={classes.input} />
            {errors.area && <p className={classes.error}>{errors.area.message}</p>}
          </div>

          <div className={classes.field}>
            <label>District</label>
            <input type="text" {...register('district', { required: 'District is required' })} className={classes.input} />
            {errors.district && <p className={classes.error}>{errors.district.message}</p>}
          </div>

          <div className={classes.field}>
            <label>State</label>
            <input type="text" {...register('state', { required: 'State is required' })} className={classes.input} />
            {errors.state && <p className={classes.error}>{errors.state.message}</p>}
          </div>

          <div className={classes.field}>
            <label>Pincode</label>
            <input type="text" {...register('pincode', { required: 'Pincode is required' })} className={classes.input} />
            {errors.pincode && <p className={classes.error}>{errors.pincode.message}</p>}
          </div>

          <Button type="submit" text="Register" />

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
