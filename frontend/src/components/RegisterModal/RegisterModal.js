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
} = useForm({
  mode: "onChange", // 🔥 validates live as user types
});

const emailRegex =  /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/; // strict email regex
const passwordRegex =  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

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
         {/* Email */}
<div className={classes.field}>
  <label>Email</label>
  <input
    type="email"
    {...register("email", {
      required: "Email is required",
      pattern: {
        value: emailRegex,
        message: "Enter a valid email address",
      },
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
              {...register('name', {
                required: 'Name is required',
                minLength: { value: 3, message: 'Name must be at least 3 characters' },
              })}
              className={classes.input}
            />
            {errors.name && <p className={classes.error}>{errors.name.message}</p>}
          </div>

          {/* Phone */}
         {/* Phone */}
<div className={classes.field}>
  <label>Phone Number</label>
  <input
    type="tel"
    {...register('phone', {
      required: 'Phone number is required',
      pattern: {
        value: /^\d{10,15}$/,  // ✅ allows 10 to 15 digits
        message: 'Enter a valid phone number (10–15 digits)',
      },
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
              {...register('password', {
                required: 'Password is required',
                pattern: {
                  value: passwordRegex,
                  message:
                    'Password must be 8+ chars with uppercase, lowercase, number & special char',
                },
              })}
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
                validate: (value) =>
                  value !== getValues('password') ? 'Passwords do not match' : true,
              })}
              className={classes.input}
            />
            {errors.confirmPassword && <p className={classes.error}>{errors.confirmPassword.message}</p>}
          </div>

          {/* Address Fields */}
          <div className={classes.field}>
            <label>Door Number</label>
            <input
              type="text"
              {...register('doorNumber', { required: 'Door Number is required' })}
              className={classes.input}
            />
            {errors.doorNumber && <p className={classes.error}>{errors.doorNumber.message}</p>}
          </div>

          <div className={classes.field}>
            <label>Street</label>
            <input
              type="text"
              {...register('street', { required: 'Street is required' })}
              className={classes.input}
            />
            {errors.street && <p className={classes.error}>{errors.street.message}</p>}
          </div>

          <div className={classes.field}>
            <label>Area</label>
            <input
              type="text"
              {...register('area', { required: 'Area is required' })}
              className={classes.input}
            />
            {errors.area && <p className={classes.error}>{errors.area.message}</p>}
          </div>

          <div className={classes.field}>
            <label>District</label>
            <input
              type="text"
              {...register('district', { required: 'District is required' })}
              className={classes.input}
            />
            {errors.district && <p className={classes.error}>{errors.district.message}</p>}
          </div>

          <div className={classes.field}>
            <label>State</label>
            <input
              type="text"
              {...register('state', { required: 'State is required' })}
              className={classes.input}
            />
            {errors.state && <p className={classes.error}>{errors.state.message}</p>}
          </div>

          <div className={classes.field}>
            <label>Pincode</label>
            <input
              type="text"
              {...register('pincode', {
                required: 'Pincode is required',
                pattern: { value: /^[0-9]{6}$/, message: 'Pincode must be 6 digits' },
              })}
              className={classes.input}
            />
            {errors.pincode && <p className={classes.error}>{errors.pincode.message}</p>}
          </div>

          <Button type="submit" text="Register" />

          <div className={classes.switch}>
            Already a user?&nbsp;
            <button
              type="button"
              className={classes.switchButton}
              onClick={onSwitchToLogin}
            >
              Login here
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
