import classes from './button.module.css';

export default function Button({
  type = 'button',
  text = 'Submit',
  onClick,
  color,
  backgroundColor,
  fontSize,
  width,
  height,
  variant = 'primary',
  disabled = false,
  fullWidth = false,
  icon,
  className,
}) {
  const buttonClass = `${classes.button} ${classes[variant]} ${
    disabled ? classes.disabled : ''
  } ${fullWidth ? classes.fullWidth : ''} ${className || ''}`;

  return (
    <div className={classes.container}>
      <button
        className={buttonClass}
        style={{
          color,
          backgroundColor,
          fontSize,
          width,
          height,
        }}
        type={type}
        onClick={onClick}
        disabled={disabled}
      >
        {icon && <span className={classes.icon}>{icon}</span>}
        {text}
      </button>
    </div>
  );
}