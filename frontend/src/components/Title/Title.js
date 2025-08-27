import React from 'react';

export default function Title({ title, fontSize, margin }) {
  return (
    <h1 
      className="title"
      style={{ 
        fontSize, 
        margin, 
        '--dynamic-color': '#131921' // CSS variable for easy theming
      }}
    >
      {title}
      <span className="title-underline"></span>
    </h1>
  );
}