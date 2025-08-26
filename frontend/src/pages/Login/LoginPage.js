import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { EMAIL } from '../../constants/patterns';
import Title from '../../components/Title/Title';
import Button from '../../components/Button/Button';
import classes from './loginPage.module.css';
import GoogleButton from '../../components/GoogleButton/GoogleButton';
import { googleSignup } from '../../services/userService';

export default function LoginPage() {
  useEffect(() => {
  const scrollToTop = () => {
    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;
  };

  const timeout = setTimeout(scrollToTop, 100);
  return () => clearTimeout(timeout);
}, []);

  const {
    handleSubmit,
    register,
    formState: { errors },
  } = useForm();

  const navigate = useNavigate();
  const { user, login } = useAuth();
  const [params] = useSearchParams();
  const returnUrl = params.get('returnUrl');

  useEffect(() => {
    if (!user) return;
    returnUrl ? navigate(returnUrl) : navigate('/');
  }, [user, navigate, returnUrl]);

  const submit = async ({ email, password }) => {
    await login(email, password);
  };

  // Eye icon toggle for password field
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

    const cleanup = setupToggle('password', 'eye-icon');
    return () => cleanup?.();
  }, []);

  // Google login handler
  const handleGoogleSuccess = async (result) => {
    alert('Google Sign-In successful');
    // Optionally: handle user info, call your backend, or redirect
    // Example: loginWithGoogle(result.user) or navigate('/')

    // After successful Firebase login:
    const handleGoogleLogin = async (firebaseUser) => {
      const name = firebaseUser.displayName;
      const email = firebaseUser.email;
      try {
        const user = await googleSignup({ name, email });
        // Redirect to home page
        window.location.href = '/';
      } catch (err) {
        alert('Google signup failed');
      }
    };

    handleGoogleLogin(result.user);
  };

  const handleGoogleError = (error) => {
    alert(error.message || 'Google Sign-In failed');
  };

  return (
    <div className={classes.container}>
      <div className={classes.details}>
        <Title title="Login" />
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
                {...register('password', {
                  required: true,
                })}
                className={classes.input}
              />
              <i className="fa fa-eye" id="eye-icon"></i>
            </div>
            {errors.password && <p className={classes.error}>Password is required</p>}
          </div>
          <Button type="submit" text="Login" />
        </form>

        {/* Google Sign-In Button */}
        <GoogleButton
          onSuccess={handleGoogleSuccess}
          onError={handleGoogleError}
        />

        <div className={classes.login}>
          New user?&nbsp;
          <Link to={`/register${returnUrl ? '?returnUrl=' + returnUrl : ''}`}>
            Register here
          </Link>
        </div>
      </div>
    </div>
  );
}