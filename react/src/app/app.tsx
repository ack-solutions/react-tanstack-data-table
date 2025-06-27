import { StrictMode } from 'react';
import * as ReactDOM from 'react-dom/client';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

import NxWelcome from './nx-welcome';
import { CustomColumnFilterExample } from '../components/CustomColumnFilterExample';

const theme = createTheme();

export function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <CustomColumnFilterExample />
    </ThemeProvider>
  );
}

export default App;


