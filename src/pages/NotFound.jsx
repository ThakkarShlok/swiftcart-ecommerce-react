import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div style={{ padding: '40px', textAlign: 'center', fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ fontSize: '3rem', marginBottom: '20px' }}>404</h1>
      <p style={{ fontSize: '1.1rem', marginBottom: '20px' }}>Sorry, the page you are looking for does not exist.</p>
      <Link to="/" style={{ color: '#3498db', textDecoration: 'none', fontWeight: 'bold' }}>
        Back to Home
      </Link>
    </div>
  );
};

export default NotFound;
