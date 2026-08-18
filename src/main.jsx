import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import { ThemeProvider } from '@material-tailwind/react';
import './i18n/i18n.js'; // Подключаем i18n

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider>
    {/* wtf */}
      <App />
    </ThemeProvider>
  </StrictMode>
);
