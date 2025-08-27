import React from 'react';
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import classes from './GoogleButton.module.css';
import { googleSignup } from '../../services/userService';

// Your Firebase config (move to a separate file if you want)
const firebaseConfig = {
  apiKey: "AIzaSyBAgLFjNeyalLd7dTXE0L8vjBX3DOQTPS8",
  authDomain: "isvaryamapp.firebaseapp.com",
  projectId: "isvaryamapp",
  storageBucket: "isvaryamapp.appspot.com",
  messagingSenderId: "1091202224877",
  appId: "1:1091202224877:web:b94131616cfbeec59f72e4",
  measurementId: "G-TCQTTCRPVJ"
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

export default function GoogleButton({ onSuccess, onError }) {
  const handleGoogleClick = async () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    try {
      const result = await firebase.auth().signInWithPopup(provider);
      if (onSuccess) onSuccess(result);
      await handleGoogleSignup(result.user); // <-- call the renamed function
    } catch (error) {
      if (onError) onError(error);
    }
  };

  async function handleGoogleSignup(firebaseUser) {
    const name = firebaseUser.displayName;
    const email = firebaseUser.email;
    try {
      const user = await googleSignup({ name, email });
      window.location.href = '/'; // Redirect to home page
    } catch (err) {
      alert('Google signup failed');
    }
  }

  return (
    <button className={classes.googleBtn} onClick={handleGoogleClick}>
      <img
        src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
        alt="Google logo"
        className={classes.googleLogo}
      />
        Continue with Google
    </button>
  );
}