import React from 'react';
import InputContainer from '../InputContainer/InputContainer';
import classes from './input.module.css';

function Input(
  { label, type, defaultValue, onChange, onBlur, name, error, required },
  ref
) {
  const getErrorMessage = () => {
    if (!error) return;
    if (error.message) return error.message;
    //defaults
    switch (error.type) {
      case 'required':
        return 'This Field Is Required';
      case 'minLength':
        return 'Field Is Too Short';
      default:
        return '*';
    }
  };

  const inputClass = `${classes.input} ${error ? classes.errorState : ''}`;

  return (
    <InputContainer label={label}>
      <div className={classes.container}>
        {label && (
          <label className={`${classes.label} ${required ? classes.required : ''}`}>
            {label}
          </label>
        )}
        <div style={{ position: 'relative' }}>
          <input
            defaultValue={defaultValue}
            className={inputClass}
            type={type}
            placeholder={label}
            ref={ref}
            name={name}
            onChange={onChange}
            onBlur={onBlur}
            required={required}
          />
          {type === 'password' && (
            <button 
              type="button" 
              className={classes.passwordToggle}
              onClick={() => {}}
            >
              Show
            </button>
          )}
        </div>
        {error && <div className={classes.error}>{getErrorMessage()}</div>}
      </div>
    </InputContainer>
  );
}

export default React.forwardRef(Input);