import React from 'react';
import ReactDOM from 'react-dom/client';
import '@fontsource-variable/inter-tight';
import '@fontsource-variable/newsreader/opsz.css';
import '@fontsource-variable/jetbrains-mono';
import App from './App';
import axios from 'axios';
import { supabase } from './auth';
import './index.css';

axios.interceptors.request.use(async config => {
  if (!supabase) return config;
  const { data: { session } } = await supabase.auth.getSession();
  if (session?.access_token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${session.access_token}`;
  }
  return config;
});

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
