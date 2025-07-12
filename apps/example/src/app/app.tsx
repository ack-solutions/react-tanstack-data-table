import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Container } from '@mui/material';

// Import from our published package - start with just the main component
import {
  ServerSideTest,
  SimpleEnhancedSlotsExample,
  SimpleLocalExample,
} from '@ackplus/react-tanstack-data-table';


const theme = createTheme();

export function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <ServerSideTest />
        <SimpleLocalExample />
        <SimpleEnhancedSlotsExample />
      </Container>
    </ThemeProvider>
  );
}

export default App;


