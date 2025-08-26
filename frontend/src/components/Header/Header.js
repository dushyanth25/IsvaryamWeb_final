import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../../hooks/useCart';
import { useAuth } from '../../hooks/useAuth';
import classes from './header.module.css';
import RegisterModal from '../RegisterModal/RegisterModal';
import LoginModal from '../LoginModal/LoginModal';

// Check if background is light
const isLight = (hex) => {
  const cleanHex = hex.replace('#', '');
  const r = parseInt(cleanHex.substr(0, 2), 16);
  const g = parseInt(cleanHex.substr(2, 2), 16);
  const b = parseInt(cleanHex.substr(4, 2), 16);
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness > 180;
};

export default function Header() {
  const { user, logout } = useAuth();
  const { cart } = useCart();

  const [menuOpen, setMenuOpen] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [headerColor, setHeaderColor] = useState('#ffffff');
  const [textColor, setTextColor] = useState('#000000');
  const navRef = useRef(null);

  const toggleMenu = () => setMenuOpen(open => !open);

  // Close menu on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (navRef.current && !navRef.current.contains(event.target) && !event.target.classList.contains(classes.hamburger)) {
        setMenuOpen(false);
      }
    };
    if (menuOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuOpen]);

  // Fetch header color from server and update dynamically
  const fetchHeaderColor = async () => {
    try {
      const res = await fetch('https://isvaryamweb-final.onrender.com/api/colors/colorheader');
      const data = await res.json();
      if (data?.color) {
        setHeaderColor(data.color);
        setTextColor(isLight(data.color) ? '#000000' : '#FFFFFF');
      }
    } catch (err) {
      console.error("❌ Failed to load header color:", err);
    }
  };

  useEffect(() => {
    fetchHeaderColor();
    // Re-fetch color on window resize for desktop breakpoint
    const handleResize = () => fetchHeaderColor();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleSwitchToRegister = () => {
    setShowLoginModal(false);
    setShowRegisterModal(true);
  };

  const handleSwitchToLogin = () => {
    setShowRegisterModal(false);
    setShowLoginModal(true);
  };

  return (
    <>
      <div className={classes.offerBar}>
        🎉 Use coupon code <strong>ISVARYAM10</strong> and get 10% OFF on your first order! 🛒
      </div>

      <header
        className={classes.header}
        style={{
          backgroundColor: headerColor,
          color: textColor,
        }}
      >
        <div className={classes.container}>
          <Link to="/" className={classes.logo}>
            <img src="/newlogo.webp" alt="Isvaryam Logo" />
          </Link>

          <button
            className={classes.hamburger}
            onClick={toggleMenu}
            aria-label={menuOpen ? "Close navigation" : "Open navigation"}
            aria-expanded={menuOpen}
            style={{ color: textColor }}
          >
            <span style={{ backgroundColor: textColor }} className={menuOpen ? classes.bar1open : ''}></span>
            <span style={{ backgroundColor: textColor }} className={menuOpen ? classes.bar2open : ''}></span>
            <span style={{ backgroundColor: textColor }} className={menuOpen ? classes.bar3open : ''}></span>
          </button>

          <nav
            ref={navRef}
            className={`${classes.nav} ${menuOpen ? classes.open : ''}`}
            style={{ backgroundColor: headerColor, color: textColor }}
          >
            <ul className={classes.nav_links} style={{ color: textColor }}>
              <li><Link style={{ color: textColor }} to="/" onClick={() => setMenuOpen(false)}>Home</Link></li>
              <li><Link style={{ color: textColor }} to="/about" onClick={() => setMenuOpen(false)}>About Us</Link></li>

              {user ? (
                <>
                  <li><Link style={{ color: textColor }} to="/product" onClick={() => setMenuOpen(false)}>Products</Link></li>
                  <li><Link style={{ color: textColor }} to="/orders" onClick={() => setMenuOpen(false)}>My Orders</Link></li>
                  <li><Link style={{ color: textColor }} to="/cart" onClick={() => setMenuOpen(false)}>My Cart</Link></li>
                  <li>
                    <Link style={{ color: textColor }} to="/profile" onClick={() => setMenuOpen(false)} className={classes.profileLink}>
                      {user?.name?.length > 10 ? (
                        <div className={classes.profileAvatar}>
                          {user?.name?.[0]?.toUpperCase()}
                        </div>
                      ) : (
                        user?.name || "Profile"
                      )}
                    </Link>
                  </li>
                  <li>
                    <a
                      onClick={() => { logout(); setMenuOpen(false); }}
                      style={{ cursor: 'pointer', color: textColor }}
                    >
                      Logout
                    </a>
                  </li>
                </>
              ) : (
                <li
                  className={classes.authButton}
                  onClick={() => { setShowLoginModal(true); setMenuOpen(false); }}
                  style={{ color: textColor }}
                >
                  Login
                </li>
              )}
            </ul>
          </nav>

          {showLoginModal && (
            <LoginModal onClose={() => setShowLoginModal(false)} onSwitchToRegister={handleSwitchToRegister} />
          )}
          {showRegisterModal && (
            <RegisterModal onClose={() => setShowRegisterModal(false)} onSwitchToLogin={handleSwitchToLogin} />
          )}
        </div>
      </header>
    </>
  );
}
