import React, { useState } from 'react';
import { FaStar } from 'react-icons/fa';

export default function StarRating({ stars = 0, size = 24, onRate = () => {}, editable = false }) {
  const [hovered, setHovered] = useState(0);

  return (
    <div style={{ display: 'flex', gap: 5, cursor: editable ? 'pointer' : 'default' }}>
      {[1, 2, 3, 4, 5].map((value) => (
        <FaStar
          key={value}
          size={size}
          color={hovered >= value || (!hovered && stars >= value) ? '#ffc107' : '#e4e5e9'}
          onClick={() => editable && onRate(value)}
          onMouseEnter={() => editable && setHovered(value)}
          onMouseLeave={() => editable && setHovered(0)}
        />
      ))}
    </div>
  );
}
