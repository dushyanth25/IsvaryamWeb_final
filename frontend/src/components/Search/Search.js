import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import classes from './search.module.css';

Search.defaultProps = {
  searchRoute: '/search/',
  defaultRoute: '/',
  placeholder: 'Search products...',
};

export default function Search({
  searchRoute,
  defaultRoute,
  margin,
  placeholder,
}) {
  const [term, setTerm] = useState('');
  const navigate = useNavigate();
  const { searchTerm } = useParams();

  useEffect(() => {
    setTerm(searchTerm ?? '');
  }, [searchTerm]);

  const search = () => {
    term ? navigate(searchRoute + term) : navigate(defaultRoute);
  };

  return (
    <div className={classes.searchContainer} style={{ margin }}>
      <div className={classes.inputWrapper}>
        <input
          type="text"
          placeholder={placeholder}
          onChange={(e) => setTerm(e.target.value)}
          onKeyUp={(e) => e.key === 'Enter' && search()}
          value={term}
          className={classes.input}
        />
        {/* Removed search icon and button */}
      </div>
    </div>
  );
}