import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './category.module.css';

export default function Tags({ tags }) {
  const navigate = useNavigate();

  const handleClick = (tag) => {
    if (tag === '') {
      navigate('/');
    } else {
      navigate(`/tag/${tag}`);
    }
  };

  return (
    <div className={styles.tagsContainer}>
      <button
        className={styles.tagButton}
        onClick={() => handleClick('')}
      >
        All Categories
      </button>
      {tags.map((tag, index) => (
        <button
          key={index}
          className={styles.tagButton}
          onClick={() => handleClick(tag)}
        >
          {tag}
        </button>
      ))} 
    </div>
  );
}