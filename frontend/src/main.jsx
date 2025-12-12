import React from 'react';
import ReactDOM from 'react-dom/client';
import './services/api'; // Initialize axios interceptor for production
import App from './App';


ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);
