import React from 'react';
import { createRoot } from 'react-dom/client';
import { ProfilePage } from './components/ProfilePage';
import './index.css';

const container = document.getElementById('popup-root');
if (!container) {
  throw new Error('Popup root element not found');
}

const root = createRoot(container);
root.render(
  <React.StrictMode>
    <div style={{ width: '380px', minHeight: '500px' }}>
      <ProfilePage 
        showBackButton={false}
        containerClasses="w-full rounded-none border-0 bg-white overflow-auto shadow-none font-sans"
      />
    </div>
  </React.StrictMode>
);
