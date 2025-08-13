import React from 'react';

const NotFound = () => {
  return (
    <div style={styles.container}>
      <h1 style={styles.title}>404 - Page Not Found</h1>
      <p style={styles.subtitle}>Sorry, the page you're looking for doesn't exist.</p>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    textAlign: 'center',
    backgroundColor: '#f0f4f8',
    padding: '20px',
  },
  image: {
    maxWidth: '600px',
    width: '100%',
    borderRadius: '12px',
    marginBottom: '30px',
    boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
  },
  title: {
    fontSize: '3rem',
    marginBottom: '10px',
    color: '#333',
  },
  subtitle: {
    fontSize: '1.2rem',
    color: '#666',
  }
};

export default NotFound;
