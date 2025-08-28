import React, { useState } from 'react';
import './TestimonialSlider.css';

const testimonials = [
  {
    name: 'Tarini Manchanda',
    rating: 5,
    text: 'After an initial hiccup which was handled beautifully, the products arrived on time, well packaged and safe...'
  },
  {
    name: 'Padmini Subramani',
    rating: 5,
    text: 'My first attempt. First of all it was very easy to use your website and place my order. Billing was transparent...'
  },
  {
    name: 'Jeba Julians J',
    rating: 5,
    text: 'Recently bought 11 items from Isvaryam. Both sesame and groundnut oil was good...'
  },
  {
    name: 'Karthic R',
    rating: 5,
    text: 'Thank you Is,varyam Received Deepavali combo box, packing of every product was awesome!!! We tried all...'
  },
  {
    name: 'Sangeetha R',
    rating: 5,
    text: 'I am so happy with the quality and service. Especially the coconut oil—it’s so fresh and pure. Highly recommended!'
  },
  {
    name: 'Venkat K',
    rating: 5,
    text: 'The best part was the on-time delivery and excellent packaging. Will definitely order again.'
  }
];

const TestimonialSlider = () => {
  const [index, setIndex] = useState(0);
  const visibleCount = 3;

  const handleNext = () => {
    setIndex((prevIndex) => (prevIndex + visibleCount) % testimonials.length);
  };

  const handlePrev = () => {
    setIndex((prevIndex) => (prevIndex - visibleCount + testimonials.length) % testimonials.length);
  };

  const visibleTestimonials = testimonials.slice(index, index + visibleCount).concat(
    index + visibleCount > testimonials.length
      ? testimonials.slice(0, (index + visibleCount) % testimonials.length)
      : []
  );

  return (
    <section className="testimonial-slider-section">
      <h2 className="section-title">Customer Testimonials</h2>
      <div className="testimonial-slider">
        <button className="arrow left" onClick={handlePrev}>&#10094;</button>
        <div className="testimonial-cards">
          {visibleTestimonials.map((item, i) => (
            <div key={i} className="testimonial-card">
              <h3>{item.name}</h3>
              <div className="stars">
                {'⭐'.repeat(item.rating)}
              </div>
              <p>{item.text}</p>
            </div>
          ))}
        </div>
        <button className="arrow right" onClick={handleNext}>&#10095;</button>
      </div>
    </section>
  );
};

export default TestimonialSlider;
