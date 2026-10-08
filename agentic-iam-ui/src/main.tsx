import React from 'react';
import ReactDOM from 'react-dom/client';
import '@fontsource-variable/inter-tight';
import '@fontsource-variable/newsreader/opsz.css';
import '@fontsource-variable/jetbrains-mono';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
