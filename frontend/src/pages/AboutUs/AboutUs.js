import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './AboutUs.css';

export default function AboutUs() {
  useEffect(() => {
  const scrollToTop = () => {
    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;
  };

  const timeout = setTimeout(scrollToTop, 100);
  return () => clearTimeout(timeout);
}, []);

  const [bgColor, setBgColor] = useState('#f9f8f5');
  const [currentCertIndex, setCurrentCertIndex] = useState(0);
  const [currentShopIndex, setCurrentShopIndex] = useState(2); // Centered at 3rd image
  const certIntervalRef = useRef(null);
  const missionRef = useRef(null);
  const storyRef = useRef(null);
  const valuesRef = useRef(null);
  const autoScrollRef = useRef(null);
   const [formData, setFormData] = useState({
      name: '',
      email: '',
      subject: '',
      message: ''
    });
  
    const [isSending, setIsSending] = useState(false);
  
    const handleChange = (e) => {
      setFormData((prev) => ({
        ...prev,
        [e.target.name]: e.target.value
      }));
    };
  
    const handleSubmit = async (e) => {
      e.preventDefault();
      setIsSending(true); // 🔒 Disable button
  
      try {
        const res = await fetch('https://demo.isvaryam.com/api/contact/send-contact-email', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          credentials: 'include',
          body: JSON.stringify(formData)
        });
  
        const data = await res.json();
        if (res.ok) {
          alert('✅ Message sent successfully!');
          setFormData({
            name: '',
            email: '',
            subject: '',
            message: ''
          });
        } else {
          alert(data.error || 'Something went wrong');
        }
      } catch (error) {
        console.error(error);
        alert('❌ Failed to send message.');
      }
  
      setIsSending(false); // 🔓 Re-enable button
    };
  
   const navigate = useNavigate();

  const handleClick = () => {
    navigate('/product'); // 👈 Your target route
  };

  // Sample data - replace with your actual certificate and shop images
  const certificates = [
  { id: 1, image: '/Certificate images/Certificate images/fda.webp' },
  { id: 2, image: '/Certificate images/Certificate images/fssai.png', alt: 'Quality Assurance' },
  { id: 3, image: '/Certificate images/Certificate images/gmp.avif', alt: 'Fair Trade Certified' },
  { id: 4, image: '/Certificate images/Certificate images/haccp.avif', alt: 'Sustainable Practices' },
  { id: 5, image: '/Certificate images/Certificate images/iac.avif', alt: 'Sustainable Practices' },
  { id: 6, image: '/Certificate images/Certificate images/iaf.webp', alt: 'Sustainable Practices' },
  { id: 7, image: '/Certificate images/Certificate images/iso-22000.webp', alt: 'Sustainable Practices' },
  { id: 8, image: '/Certificate images/Certificate images/iso-90001.webp', alt: 'Sustainable Practices' },
];

  const shops = [
    { id: 1, image: '/Kadai logos/Kadai logos/1.webp', alt: 'Isvaryam Store Bangalore', location: 'Bangalore' },
    { id: 2, image: '/Kadai logos/Kadai logos/2.webp', alt: 'Isvaryam Store Delhi', location: 'Delhi' },
    { id: 3, image: '/Kadai logos/Kadai logos/3.webp', alt: 'Isvaryam Store Mumbai', location: 'Mumbai' },
    { id: 4, image: '/Kadai logos/Kadai logos/4.webp', alt: 'Isvaryam Store Chennai', location: 'Chennai' },
    { id: 5, image: '/Kadai logos/Kadai logos/5.webp', alt: 'Isvaryam Store Hyderabad', location: 'Hyderabad' },
    { id: 6, image: '/Kadai logos/Kadai logos/6.webp', alt: 'Isvaryam Store Kolkata', location: 'Kolkata' },
    { id: 7, image: '/Kadai logos/Kadai logos/7.avif', alt: 'Isvaryam Store Pune', location: 'Pune' },
    { id: 8, image: '/Kadai logos/Kadai logos/8.webp', alt: 'Isvaryam Store Pune', location: 'Pune' },
    { id: 9, image: '/Kadai logos/Kadai logos/9.webp', alt: 'Isvaryam Store Pune', location: 'Pune' },
    { id: 10, image: '/Kadai logos/Kadai logos/10.avif', alt: 'Isvaryam Store Pune', location: 'Pune' },
  ];

  useEffect(() => {
    // Background color fetch
    fetch('https://isvaryamweb-final.onrender.com/api/colors/colorabout')
      .then(res => res.json())
      .then(data => {
        if (data.color) setBgColor(data.color);
      })
      .catch(err => console.error('Failed to load About Us background color:', err));

    // Auto-rotate certificates
    certIntervalRef.current = setInterval(() => {
      setCurrentCertIndex(prev => (prev + 1) % certificates.length);
    }, 3000);

    // Intersection Observer for animations
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-in');
          }
        });
      },
      { threshold: 0.1 }
    );

    if (missionRef.current) observer.observe(missionRef.current);
    if (storyRef.current) observer.observe(storyRef.current);
    if (valuesRef.current) observer.observe(valuesRef.current);

    return () => {
      clearInterval(certIntervalRef.current);
      observer.disconnect();
    };
  }, []);

  const handlePrevCert = () => {
    clearInterval(certIntervalRef.current);
    setCurrentCertIndex(prev => (prev - 1 + certificates.length) % certificates.length);
    certIntervalRef.current = setInterval(() => {
      setCurrentCertIndex(prev => (prev + 1) % certificates.length);
    }, 3000);
  };

  const handleNextCert = () => {
    clearInterval(certIntervalRef.current);
    setCurrentCertIndex(prev => (prev + 1) % certificates.length);
    certIntervalRef.current = setInterval(() => {
      setCurrentCertIndex(prev => (prev + 1) % certificates.length);
    }, 3000);
  };

  const handlePrevShop = () => {
    setCurrentShopIndex(prev => (prev - 1 + shops.length) % shops.length);
  };

  const handleNextShop = () => {
    setCurrentShopIndex(prev => (prev + 1) % shops.length);
  };

  // Auto-scroll effect
  useEffect(() => {
    autoScrollRef.current = setInterval(() => {
      setCurrentShopIndex(prev => (prev + 1) % shops.length);
    }, 2000); // Change image every 2 seconds
    return () => clearInterval(autoScrollRef.current);
  }, [shops.length]);

  // Get 5 images to display, centered on currentShopIndex
  const getVisibleShops = () => {
    const visible = [];
    for (let i = -2; i <= 2; i++) {
      let idx = (currentShopIndex + i + shops.length) % shops.length;
      visible.push({ ...shops[idx], position: i });
    }
    return visible;
  };

  return (
    <div className="about-section" style={{ backgroundColor: bgColor }}>
      {/* Hero Section with video background */}
      <div className="about-hero">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="about-hero-video"
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            left: 0,
            top: 0,
            zIndex: 0,
          }}
        >
          <source src="https://res.cloudinary.com/dbmhum57n/video/upload/v1756129589/h7ipxdjo6xvougrkgo5l.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        <div className="hero-overlay" style={{ position: 'relative', zIndex: 1 }}>
          <h1>Rooted in Purity, Growing with Purpose</h1>
          <p>Discover the Isvaryam difference - where tradition meets wellness</p>
        </div>
      </div>

      <div className="about-container">
        {/* Story Section with animation */}
        <div className="about-intro" ref={storyRef}>
          <div className="intro-text">
            <h2>Our Story</h2>
            <p>
              Isvaryam began as a simple idea - to bring pure, traditional foods back to modern tables. 
              What started as a small family endeavor has grown into a movement connecting conscious 
              consumers with ethically-sourced, nutrient-rich organic products.
            </p>
            <div className="signature">
              <img src="/signature.webp" alt="Founder's Signature" />
              <span>The Isvaryam Family</span>
            </div>
          </div>
          <div className="intro-image">
            <img src="/oil bg.webp" alt="Organic farm" />
          </div>
        </div>

        {/* Certificates Section */}
        <div className="certificates-section">
          <h2 className="section-title">Our Certifications</h2>
          <div className="certificates-slider">
            <button className="slider-arrow left" onClick={handlePrevCert}>&lt;</button>
            <div className="certificates-container">
              {certificates.map((cert, index) => (
                <div 
                  key={cert.id}
                  className={`certificate ${index === currentCertIndex ? 'active' : ''}`}
                  style={{ backgroundImage: `url(${cert.image})` }}
                >
                  <div className="certificate-overlay"></div>
                  <img src={cert.image} alt={cert.alt} />
                </div>
              ))}
            </div>
            <button className="slider-arrow right" onClick={handleNextCert}>&gt;</button>
          </div>
        </div>

        {/* Mission Section with animation */}
        <div className="mission-section" ref={missionRef}>
          <div className="mission-card">
            <h3>Our Mission</h3>
            <p>
              To empower healthier living through authentic, chemical-free foods while supporting 
              sustainable farming communities and preserving traditional food wisdom.
            </p>
          </div>
          <svg className="mission-vision-connector" viewBox="0 0 120 60" fill="none">
    <path d="M10 50 Q60 0 110 50" stroke="#5e9c76" strokeWidth="4" fill="none" />
    <circle cx="110" cy="50" r="6" fill="#ffd180" stroke="#ffd180" />
    <circle cx="10" cy="50" r="6" fill="#5e9c76" stroke="#5e9c76" />
  </svg>
          <div className="vision-card">
            <h3>Our Vision</h3>
            <p>
              To create a world where every kitchen is filled with pure, nourishing foods that honor both 
              our bodies and the earth they come from.
            </p>
          </div>
        </div>

        {/* Values Section with animation */}
        <div className="values-grid" ref={valuesRef}>
          <h2 className="section-title">Our Values</h2>
          <div className="values-container">
            <div className="value-card">
              <div className="value-icon">🌱</div>
              <h3>Purity First</h3>
              <p>
                We never compromise on quality. Every product is rigorously tested to ensure it meets 
                our high standards for purity and nutritional value.
              </p>
            </div>
            
            <div className="value-card">
              <div className="value-icon">🤝</div>
              <h3>Ethical Sourcing</h3>
              <p>
                We build direct relationships with farmers who share our commitment to sustainable 
                agriculture and fair working conditions.
              </p>
            </div>
            
            <div className="value-card">
              <div className="value-icon">⚗️</div>
              <h3>Traditional Methods</h3>
              <p>
                We preserve ancient food preparation techniques that maintain maximum nutritional 
                benefits and authentic flavors.
              </p>
            </div>
            
            <div className="value-card">
              <div className="value-icon">🌿</div>
              <h3>Holistic Wellness</h3>
              <p>
                We believe in food as medicine and create products that nourish both body and soul, 
                just as nature intended.
              </p>
            </div>
          </div>
        </div>

        {/* Shops Section */}
        <div className="shops-section">
          <h2 className="section-title">Shops By Our Brand</h2>
          <div className="shops-carousel">
    {getVisibleShops().map((shop, idx) => (
      <div
        key={shop.id}
        className={`shop-carousel-card${shop.position === 0 ? ' center' : ''}`}
        style={{
          zIndex: shop.position === 0 ? 2 : 1,
          opacity: Math.abs(shop.position) > 2 ? 0 : 1,
        }}
      >
        <div className="shop-image-container auto-size">
          <img src={shop.image} alt={shop.alt} className="shop-logo-img" />
        </div>
      </div>
    ))}
  </div>
        </div>

        
        <div className="process-section">
          <h2 className="section-title">Our Process</h2>
          <div className="process-steps">
            <div className="process-step">
              <div className="step-number">1</div>
              <h3>Farm Selection</h3>
              <p>Visiting and vetting farms that meet our organic and sustainable standards</p>
            </div>
            <div className="process-step">
              <div className="step-number">2</div>
              <h3>Harvesting</h3>
              <p>Timed precisely to capture peak nutritional content</p>
            </div>
            <div className="process-step">
              <div className="step-number">3</div>
              <h3>Cold Processing</h3>
              <p>Using traditional methods without heat or chemicals</p>
            </div>
            <div className="process-step">
              <div className="step-number">4</div>
              <h3>Quality Testing</h3>
              <p>Rigorous checks for purity and nutrient retention</p>
            </div>
            <div className="process-step">
              <div className="step-number">5</div>
              <h3>Packaging</h3>
              <p>In eco-friendly materials that preserve freshness</p>
            </div>
          </div>
        </div>
      </div>

      <div className="about-cta">
        <h2>Join Our Journey</h2>
        <p>
          Experience the difference of truly pure, traditional foods. Your health, and the health of our planet, 
          begins with what you choose to nourish yourself with.
        </p>
          <button className="cta-button" onClick={handleClick}>
      Discover Our Products
    </button>
      </div>

      <section className="contact-header">
        <div className="contact-header-left">
          <h2>Contact Us</h2>
          <p>We'd love to hear from you!</p>
          <ul>
            <li><strong>📍 Address:</strong> 10 E, Ondipudur-Irugur Rd, Coimbatore, Tamil Nadu 641103</li>
            <li><strong>📞 Phone:</strong> +91 98765 43210</li>
            <li><strong>✉️ Email:</strong> support@isvaryam.com</li>
          </ul>
        </div>

        <div className="contact-header-right">
          <iframe
            title="map"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3912.074969508015!2d77.03662587503193!3d11.004505054507975!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ba859f0c4f69c0f%3A0x5ff80f5f5b5ad478!2s10%20E%2C%20Ondipudur-Irugur%20Rd%2C%20Coimbatore%2C%20Tamil%20Nadu%20641103!5e0!3m2!1sen!2sin!4v1718272720002!5m2!1sen!2sin"
            loading="lazy"
            allowFullScreen=""
          ></iframe>
        </div>
      </section>

      <section className="contact-form-section">
        <h2>Send a Message</h2>
        <form onSubmit={handleSubmit}>
      <input
        type="text"
        name="name"
        value={formData.name}
        onChange={handleChange}
        placeholder="Your Name"
        className="contact-input"
        required
      />
      <input
        type="email"
        name="email"
        value={formData.email}
        onChange={handleChange}
        placeholder="Your Email"
        className="contact-input"
        required
      />
      <input
        type="text"
        name="subject"
        value={formData.subject}
        onChange={handleChange}
        placeholder="Subject"
        className="contact-input"
        required
      />
      <textarea
        name="message"
        value={formData.message}
        onChange={handleChange}
        placeholder="Message"
        className="contact-input"
        required
      ></textarea>
      
      <button
        type="submit"
        className="send-btn"
        disabled={isSending}
        style={{ opacity: isSending ? 0.6 : 1, cursor: isSending ? 'not-allowed' : 'pointer' }}
      >
        {isSending ? 'Sending...' : 'Send Message'}
      </button>
    </form>
      </section>
    </div>
  );
}
