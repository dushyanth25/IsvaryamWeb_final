import React, { useEffect, useReducer, useState,useRef } from 'react';
import { useParams } from 'react-router-dom';
import Tags from '../../components/Tags/Tags';
import Thumbnails from '../../components/Thumbnails/Thumbnails';
import {
  getAll,
  getAllByTag,
  getAllTags,
  search,
} from '../../services/foodService';
import NotFound from '../../components/NotFound/NotFound';
import Loading from '../../components/Loading/Loading';
import './HomePage.css';
import axios from 'axios';
import CategorySection from '../../components/Category/category'; // ad
import CountdownBanner from '../../components/CountdownBanner/CountdownBanner';

import TestimonialSlider from '../../components/Testimonials/TestimonialSlider';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import RecipeDetails from '../../components/RecipeDetails/RecipeDetails';

const initialState = {
  foods: [],
  tags: [],
  loading: true,
  error: null,
};
  const backgrounds = [
    {
      type: "image",
      src: "https://res.cloudinary.com/dbmhum57n/image/upload/v1756129589/sample.webp",
    },
   
    {
      type: "video",
      src: "https://res.cloudinary.com/dbmhum57n/video/upload/v1756129589/h7ipxdjo6xvougrkgo5l.mp4",
    },
  ];
const promises = [
  {
   icon:<img src="/pure.webp" alt="Purity Icon" style={{ width: '150px', height: '140px', borderRadius: '12px', objectFit: 'cover' }} />,
    title: 'PURITY',
    description: 'Delivering food in its most natural form, sourced directly from trusted farms.'
  },
  {
    icon: <img src="/heritage.webp" alt="Purity Icon" style={{ width: '150px', height: '140px', borderRadius: '12px', objectFit: 'cover' }} />,
    title: 'HERITAGE',
    description: 'Celebrating traditional practices and recipes passed down through generations.'
  },
  {
    icon: <img src="/honest.webp" alt="Purity Icon" style={{ width: '150px', height: '140px', borderRadius: '12px', objectFit: 'cover' }} />,
    title: 'HONESTY',
    description: 'Ensuring complete transparency and rigorous quality checks.'
  },
  {
    icon: <img src="/impact.webp" alt="Purity Icon" style={{ width: '150px', height: '140px', borderRadius: '12px', objectFit: 'cover' }} />,
    title: 'IMPACT',
    description: 'Supporting rural communities through fair trade and responsible sourcing.'
  },
  {
    icon: <img src="/sustainability.webp" alt="Purity Icon" style={{ width: '150px', height: '140px', borderRadius: '12px', objectFit: 'cover' }} />,
    title: 'SUSTAINABILITY',
    description: 'Committed to eco-friendly packaging and environmentally responsible sourcing.'
  },
  {
    icon: <img src="/fastdelivery.webp" alt="Purity Icon" style={{ width: '150px', height: '140px', borderRadius: '12px', objectFit: 'cover' }} />,
    title: 'TRUSTED DELIVERY',
    description: 'Ensuring safe, fast, and hygienic delivery of every order to your doorstep.'
  }
];

const shorts = [
    {
      id: 'jfG9504I7OE',
      title: 'Our Organic Promise in 60 Seconds'
    },
    {
      id: 'lEq7JXUYxsM',
      title: 'Behind the Scenes – Oil Making'
    },
    {
      id: 'QTJMKEm_nu4',
      title: 'Why Isvaryam Cold Pressed?'
    },
    {id:'fN0GYiUVFfA',
      title:'isvaryam'
    }
  ];

const reducer = (state, action) => {
  switch (action.type) {
    case 'FETCH_START':
      return { ...state, loading: true, error: null };
    case 'TAGS_LOADED':
      return { ...state, tags: action.payload };
    case 'FOODS_LOADED':
      return { ...state, foods: action.payload, loading: false };
    case 'FETCH_ERROR':
      return { ...state, loading: false, error: action.payload };
    default:
      return state;
  }
};

export default function HomePage() {

  const [showVideo, setShowVideo] = useState(false);
  useEffect(() => {
  const scrollToTop = () => {
    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;
  };

  const timeout = setTimeout(scrollToTop, 100);
  return () => clearTimeout(timeout);
}, []);

  const [{ foods, tags, loading, error }, dispatch] = useReducer(reducer, initialState);
  const { searchTerm, tag } = useParams();

  const [bannerImages, setBannerImages] = useState([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [bgColor, setBgColor] = useState('#ffffff');
  const touchStartX = useRef(null);
  const touchEndX = useRef(null);
  const mouseStartX = useRef(null);
  const mouseEndX = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [name, setName] = useState('');
const [email, setEmail] = useState('');
const [subject, setSubject] = useState('');
const [message, setMessage] = useState('');
  const [index, setIndex] = useState(0);

  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const duration = 3000; // 3 sec per slide
    const stepTime = 30; // update progress every 30ms
    let elapsed = 0;

    const interval = setInterval(() => {
      elapsed += stepTime;
      setProgress((elapsed / duration) * 100);

      if (elapsed >= duration) {
        setIndex((prev) => (prev + 1) % backgrounds.length);
        elapsed = 0;
        setProgress(0);
      }
    }, stepTime);

    return () => clearInterval(interval);
  }, [backgrounds.length]);

  const current = backgrounds[index];
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
      const res = await fetch('https://isvaryam-backend.onrender.com/api/contact/send-contact-email', {
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


  useEffect(() => {
    const fetchAssets = async () => {
      try {
        const [imagesRes, colorRes] = await Promise.all([
          axios.get('https://admin-isvaryam.onrender.com/images'),
          axios.get('http://localhost:5000/api/colors/colorhome'),
        ]);

        if (Array.isArray(imagesRes.data) && imagesRes.data.length > 0) {
          setBannerImages(imagesRes.data.map(img => img.imageUrl));
        } else {
          setBannerImages(['/bg.png', '/bg2.png']);
        }

        if (colorRes.data?.color) {
          setBgColor(colorRes.data.color);
        }
      } catch (err) {
        console.error('Error loading banner or color:', err);
        
      }
    };

    fetchAssets();
  }, []);

 

  const handleSwipe = (start, end) => {
    if (start == null || end == null) return;
    const delta = start - end;
    if (Math.abs(delta) > 50) {
      if (delta > 0) {
        setCurrentImageIndex(prev => (prev + 1) % bannerImages.length);
      } else {
        setCurrentImageIndex(prev => (prev - 1 + bannerImages.length) % bannerImages.length);
      }
    }
  };

  const handleTouchStart = e => {
    touchStartX.current = e.touches[0].clientX;
  };
  const handleTouchEnd = e => {
    touchEndX.current = e.changedTouches[0].clientX;
    handleSwipe(touchStartX.current, touchEndX.current);
    touchStartX.current = null;
    touchEndX.current = null;
  };

  const handleMouseDown = e => {
    setIsDragging(true);
    mouseStartX.current = e.clientX;
  };
  const handleMouseUp = e => {
    if (!isDragging) return;
    mouseEndX.current = e.clientX;
    handleSwipe(mouseStartX.current, mouseEndX.current);
    setIsDragging(false);
    mouseStartX.current = null;
    mouseEndX.current = null;
  };
  const handleMouseLeave = () => {
    if (!isDragging) return;
    setIsDragging(false);
    mouseEndX.current = mouseStartX.current;
  };

  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      dispatch({ type: 'FETCH_START' });
      try {
        const [tagsData, foodsData] = await Promise.all([
          getAllTags(),
          tag ? getAllByTag(tag) : searchTerm ? search(searchTerm) : getAll(),
        ]);
        if (isMounted) {
          dispatch({ type: 'TAGS_LOADED', payload: tagsData });
          dispatch({ type: 'FOODS_LOADED', payload: foodsData });
        }
      } catch (err) {
        if (isMounted) {
          dispatch({ type: 'FETCH_ERROR', payload: err.message || 'Failed to load data.' });
        }
      }
    };
    fetchData();
    return () => {
      isMounted = false;
    };
  }, [searchTerm, tag]);


  return (
    <div
  className="home-page"
  style={{
    backgroundColor: bgColor,
    transition: 'background-color 1s ease-in-out',
    margin: 0,
    padding: 0,
  }}
>
  <div className="about-hero" style={{ margin: 0, padding: 0, position: "relative" }}>
      {/* Background (Image/Video) */}
      {current.type === "image" ? (
        <img
          src={current.src}
          alt="Hero Background"
          style={{
            position: "absolute",
            width: "100%",
            height: "100%",
            objectFit: "cover",
            left: 0,
            top: 0,
            zIndex: 0,
          }}
        />
      ) : (
        <video
          autoPlay
          loop
          muted
          playsInline
          className="about-hero-video"
          style={{
            position: "absolute",
            width: "100%",
            height: "100%",
            objectFit: "cover",
            left: 0,
            top: 0,
            zIndex: 0,
          }}
        >
          <source src={current.src} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      )}

      {/* Hero Overlay */}
      <div className="hero-overlay" style={{ position: "relative", zIndex: 1, textAlign: "center" }}>
        <h1 style={{ fontFamily: "Arial Black, Arial, sans-serif" }}>
          𝕎𝕖𝕝𝕔𝕠𝕞𝕖 𝕋𝕠 𝕀𝕤𝕧𝕒𝕣𝕪𝕒𝕞
        </h1>
        <p style={{ fontFamily: "Arial Black, Arial, sans-serif" }}>
          HEALTHY HEART BETTER LIFE
        </p>
      </div>

      {/* Status Bars */}
      <div
        style={{
          position: "absolute",
          bottom: "20px",
          left: "50%",
          transform: "translateX(-50%)",
          width: "80%",
          display: "flex",
          gap: "8px",
          zIndex: 2,
        }}
      >
        {backgrounds.map((_, i) => (
          <div
            key={i}
            style={{
              flex: 1,
              height: "4px",
              background: "rgba(255,255,255,0.3)",
              borderRadius: "2px",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                height: "100%",
                width: i === index ? `${progress}%` : i < index ? "100%" : "0%",
                background: "#ff6600",
                transition: i === index ? "none" : "width 0.3s ease",
              }}
            ></div>
          </div>
        ))}
      </div>
    </div>

      
    
       
    <CountdownBanner />

    <section className="categories-section">   
       <CategorySection tags={tags} />
    </section>
     
    <section className="products-section container fadeInUp" style={{ backgroundImage: `url('/bg2.png')`,
        backgroundColor: bgColor,

      }}
    >
        
    {loading ? (
          <Loading />
        ) : error ? (
          <NotFound linkText="Try Again" message={error} />
        ) : foods.length === 0 ? (
          <NotFound linkText="Reset Search" message="No items found." />
        ) : (
      
      <div className="products-grid-container" /*style={{
        backgroundColor: bgColor,
        backgroundImage: `url('/bg2.png')`, 
      }}*/
      >
      </div>
    )}

      <>
      {/* rest of homepage */}
      </>
      
        <h2 className="section-title"><br />Fresh From Our Farms</h2>
        <div className="filter-container">
          <Tags tags={tags} />
        </div>

      

        {loading ? (
          <Loading />
        ) : error ? (
          <NotFound linkText="Try Again" message={error} />
        ) : foods.length === 0 ? (
          <NotFound linkText="Reset Search" message="No items found." />
        ) : (
          <Thumbnails foods={foods} />
        )}
      </section>

      <section className="why-choose-section fadeInUp">
        <div className="container">
          <h2 className="section-title" style={{ color: '#000000' }}><br />Why Choose Us</h2>

          <div className="benefits-grid">
            <div className="benefit-card">
              <div className="benefit-icon">
  <img src="/nature.webp" alt="Benefit Icon" style={{ width: '150px', height: '140px' }} />
</div>

              <h3>100% Organic</h3>
              <p>Chemical-free farming practices for healthier living</p>
            </div>
            <div className="benefit-card">
              <div className="benefit-icon"><img src="/direct.webp" alt="Benefit Icon" style={{ width: '150px', height: '140px' }} /></div>
              <h3>Farm to Table</h3>
              <p>Directly from our farms to your home within 24 hours</p>
            </div>
            <div className="benefit-card">
              <div className="benefit-icon"><img src="/eco.webp" alt="Benefit Icon" style={{ width: '150px', height: '140px' }} /></div>
              <h3>Sustainable</h3>
              <p>Eco-friendly packaging & sustainable farming practices</p>
            </div>
          </div>
        </div>
      </section>


{/* Add Stats Section below */}


{/* Isvaryam Promise */}


      <section className="isvaryam-promise-section" style={{ color: '#000000' }}  >
      <h2 className="section-title">The Isvaryam Oath</h2>
      <div className="promise-container">
        {promises.map((item, index) => (
          <div className="promise-card" key={index}>
            <div className="promise-icon">{item.icon}</div>
            <h3 className="promise-title">{item.title}</h3>
            <p className="promise-description">{item.description}</p>
          </div>
        ))}
      </div>
    </section>



      {/* After About Us or StatsSection */}
<TestimonialSlider />

    <section  style={{
    backgroundColor: bgColor,
    backgroundImage: `url('/bg2.png')`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    minHeight: '60vh',
    transition: 'background-image 1s ease-in-out, background-color 1s ease-in-out',
  }}>
    <RecipeDetails /></section>
       <section  className="contact-section" style={{ backgroundColor: '#fff', padding: '60px 20px' }}>
      <div className="container">
        {/* Google Map Embed */}
        <div className="map mb-4">
          <iframe
            title="Google Map"
            style={{ border: 0, width: '100%', height: '350px', borderRadius: '12px' }}
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3916.128706510114!2d77.06089447588557!3d10.99896718921483!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ba8590c20a52b59%3A0x6f9be67824b2b6e5!2s10%20E%2C%20Ondipudur-Irugur%20Rd%2C%20Irugur%2C%20Tamil%20Nadu%20641103!5e0!3m2!1sen!2sin!4v1720141116242!5m2!1sen!2sin"
            allowFullScreen=""
            loading="lazy"
          ></iframe>
        </div>

        {/* Contact Info Cards */}
        <div className="row g-4 mb-4">
          <div className="col-md-6 col-lg-3">
            <div className="info-box">
              <i className="bi bi-geo-alt-fill text-danger fs-4"></i>
              <h5>Address</h5>
              <p>10 e, Ondipudur-Irugur Rd, Coimbatore, Irugur, Tamil Nadu 641103</p>
            </div>
          </div>
          <div className="col-md-6 col-lg-3">
            <div className="info-box">
              <i className="bi bi-telephone-fill text-danger fs-4"></i>
              <h5>Call Us</h5>
              <p>+91 9578822000</p>
            </div>
          </div>
          <div className="col-md-6 col-lg-3">
            <div className="info-box">
              <i className="bi bi-envelope-fill text-danger fs-4"></i>
              <h5>Email Us</h5>
              <p>isvaryam@hotmail.com</p>
            </div>
          </div>
          
        </div>

        

      </div>
    </section>
  


<section className="shorts-section">
      <h2>🎥 Explore Our Shorts</h2>
      <div className="shorts-grid">
        {shorts.map((short, index) => (
          <div className="shorts-video-wrapper" key={index}>
            <iframe
              src={`https://www.youtube.com/embed/${short.id}`}
              title={short.title}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
            <p>{short.title}</p>
          </div>
        ))}

      </div>
    </section>
    </div>

    
    
  );
}