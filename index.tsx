
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

// Registro simplificado para evitar erros de "Invalid URL" em ambientes restritos
const registerServiceWorker = async () => {
  if ('serviceWorker' in navigator) {
    try {
      // Usa caminho relativo direto para sw.js
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('✅ Service Worker ativo:', registration.scope);
    } catch (err) {
      // Silencia avisos de sandbox para não poluir o console do usuário
    }
  }
};

registerServiceWorker();

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
