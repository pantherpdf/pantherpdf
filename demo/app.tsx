import React from 'react';
import { createRoot } from 'react-dom/client';
import Container from './Container';
import './style.scss';

const container = document.getElementById('root');
const root = createRoot(container!);
root.render(
  <React.StrictMode>
    <Container />
  </React.StrictMode>,
);
