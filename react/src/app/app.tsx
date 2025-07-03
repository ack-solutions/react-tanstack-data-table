import { StrictMode } from 'react';
import * as ReactDOM from 'react-dom/client';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

import NxWelcome from './nx-welcome';
import { CustomColumnFilterExample } from '../components/CustomColumnFilterExample';
import { ImprovedExportExample } from '../../../packages/src/lib/examples/improved-export-example';
import { VirtualizedExample } from '../../../packages/src/lib/examples/virtualized-example';
import { DataTableExample } from '../../../packages/src/lib/examples/basic-example';
import { SimpleServerSelectionExample } from '../../../packages/src/lib/examples/simple-server-selection-example';
import { ImprovedServerSelectionExample } from '../../../packages/src/lib/examples/improved-server-selection-example';
import { SelectionTestExample } from '../../../packages/src/lib/examples/selection-test-example';
import { AdvancedFeaturesExample } from '../../../packages/src/lib/examples/advanced-features-example';
import { SimpleLocalExample } from '../../../packages/src/lib/examples/simple-local-example';

const theme = createTheme();

export function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <SelectionTestExample /> 
      <AdvancedFeaturesExample />
      <SimpleLocalExample />
       <ImprovedServerSelectionExample />
       <ImprovedServerSelectionExample  />
      <DataTableExample />
      <CustomColumnFilterExample />
      <ImprovedExportExample />
      <SimpleServerSelectionExample /> 
    </ThemeProvider>
  );
}

export default App;


