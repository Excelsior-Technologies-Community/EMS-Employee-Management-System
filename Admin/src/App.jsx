import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { Toaster } from 'react-hot-toast';
import theme from './theme/theme';
import { colors } from './theme/colors';
import { AuthProvider } from './context/AuthContext';
import AppRoutes from './routes/AppRoutes';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3200,
          style: {
            fontFamily: 'Inter, sans-serif',
            fontSize: 13.5,
            borderRadius: 10,
            background: colors.ink,
            color: '#fff',
          },
          success: { iconTheme: { primary: colors.success, secondary: '#fff' } },
          error: { iconTheme: { primary: colors.danger, secondary: '#fff' } },
        }}
      />
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
