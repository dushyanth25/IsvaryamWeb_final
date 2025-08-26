import React from 'react';
import classes from './notFound.module.css';
import { Link } from 'react-router-dom';

export default function NotFound({ message, linkRoute, linkText }) {
  return (
    <div className={classes.container}>
      <div className={classes.message}>{message}</div>
      <Link className={classes.link} to={linkRoute}>{linkText}</Link>
      <div className={classes.suggestion}>
       
      </div>
    </div>
  );
}

NotFound.defaultProps = {
  message: 'We couldn\'t find what you were looking for.',
  linkRoute: '/',
  linkText: 'Go to Homepage',
};