import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faInstagram, faYoutube } from '@fortawesome/free-brands-svg-icons';
import './Footer.css';
import LogoSlider from '../LogoSlider/LogoSlider';
import ScrollToTop from '../ScrollToTop/ScrollToTop';

function Footer() {
  return (
    <>
      <ScrollToTop />
      <LogoSlider />
      <footer className="footer">
        <div className="footer-content">

          {/* Logo at the top of the footer */}
          <div className="footer-logo">
            <a href="/"><img src="/newlogo (1).png" alt="Isvaryam Logo" className="footer-logo-img" /></a>
          </div>

          <div className="footer-section">
            <h3>About Us</h3>
            <p>Experience the purity of tradition with Isvaryam oils — cold-pressed, chemical-free, and packed with natural nutrients to promote health, flavor, and sustainability in every drop.</p>
          </div>

          <div className="footer-section">
            <h3>Quick Links</h3>
            <ul>
              <li><a href="/">Home</a></li>
              <li><a href="/product">Products</a></li>
              <li><a href="/about">About</a></li>
            </ul>
            <h3>Policies</h3>
            <ul>
              <li><a href="/privacy-policy">Privacy Policy</a></li>
              <li><a href="/shipping-policy">Shipping Policy</a></li>
              <li><a href="/refund-policy">Refund Policy</a></li>
              <li><a href="/terms-of-service">Terms of Service</a></li>
            </ul>
          </div>

          <div className="footer-section">
            <h3>Contact</h3>
            <p>Email: info@isvaryam.com</p>
            <p>Phone: +91 95788 22000</p>
            <div className="social-icons">
              <a href="https://www.instagram.com/isvaryamofficial" target="_blank" rel="noopener noreferrer">
                <FontAwesomeIcon icon={faInstagram} size="2x" />
              </a>
              <a href="https://www.youtube.com/@Isvaryam" target="_blank" rel="noopener noreferrer">
                <FontAwesomeIcon icon={faYoutube} size="2x" />
              </a>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} Isvaryam. All rights reserved.</p>
        </div>
      </footer>
    </>
  );
}

export default Footer;
