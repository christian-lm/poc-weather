/**
 * @module main
 * @description Application entry point. Mounts the React root into the DOM
 * and enables StrictMode for development-time checks.
 */
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
