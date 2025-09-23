import React from "react";
import "./LogoSlider.css";

const LogoSlider = () => {
  // Paths must match exactly (case-sensitive and spaces included!)
  const logos = [
    "/Certificate images/Certificate images/fssai.png",
    "/Certificate images/Certificate images/msme.png",
  ];

  return (
    <div className="logo-slider-wrapper">
      <div className="logo-slider">
        <div className="logo-slide-track">
          {logos.map((file, idx) => (
            <div className="logo-slide" key={idx}>
              <img
                src={file}
                alt={`logo-${idx}`}
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
