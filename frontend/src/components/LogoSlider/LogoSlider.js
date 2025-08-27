import React from "react";
import "./LogoSlider.css";

const LogoSlider = () => {
  const logos = [
    "anv-ftr-1.png", "anv-ftr-2.png", "anv-ftr-3.png", "anv-ftr-4.png",
    "anv-ftr-5.png", "anv-ftr-6.png", "anv-ftr-7.png", "anv-ftr-8.png",
  ];

  return (
    <div className="logo-slider-wrapper">
      <div className="logo-slider">
        <div className="logo-slide-track">
          {logos.map((file, idx) => (
            <div className="logo-slide" key={idx}>
              <img
                src={`https://www.anveshan.farm/cdn/shop/files/${file}?v=1729241487&width=480`}
                alt=""
                loading="lazy"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LogoSlider;