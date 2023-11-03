import React from 'react';
import { createRoot } from 'react-dom/client';
import Container from './Container';
import CssBaseline from '@mui/material/CssBaseline';

const container = document.getElementById('root');
const root = createRoot(container!);
root.render(
  <React.StrictMode>
    <CssBaseline />
    <Container />
  </React.StrictMode>,
);
