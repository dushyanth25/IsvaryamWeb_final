import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './tags.module.css';

export default function Tags({ tags }) {
  const navigate = useNavigate();

  return (
    <div className={styles.tagsContainer}>
      <select
        className={styles.tagsSelect}
        onChange={(e) => navigate(`/tag/${e.target.value}`)}
      >
        <option value="">All Categories</option>
        {tags.map((tag, index) => (
          <option key={index} value={tag}>
            {tag}
          </option>
        ))}
      </select>
    </div>
  );
}