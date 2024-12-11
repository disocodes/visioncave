import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Layout from './components/Layout';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import WidgetBuilder from './pages/WidgetBuilder';
import CameraManagement from './pages/CameraManagement';
import Models from './pages/ModelsPage';
import Settings from './pages/Settings';
import ModuleSelection from './pages/ModuleSelection';
import SiteManagement from './pages/SiteManagement';
import UserManagement from './pages/UserManagement';
import { AuthProvider } from './contexts/AuthContext';
import { SiteProvider } from './contexts/SiteContext';
import { CameraProvider } from './contexts/CameraContext';
import { AnalyticsProvider } from './contexts/AnalyticsContext';
import { WidgetProvider } from './contexts/WidgetContext';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#2196f3',
    },
    secondary: {
      main: '#f50057',
    },
    background: {
      default: '#121212',
      paper: '#1e1e1e',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <SiteProvider>
          <CameraProvider>
            <AnalyticsProvider>
              <WidgetProvider>
                <Router>
                  <Routes>
                    <Route path="/login" element={<LandingPage />} />
                    <Route element={<Layout />}>
                      <Route path="/" element={<ModuleSelection />} />
                      <Route path="/module/:moduleType" element={<Dashboard />} />
                      <Route path="/widget-builder" element={<WidgetBuilder />} />
                      <Route path="/camera-management" element={<CameraManagement />} />
                      <Route path="/site-management" element={<SiteManagement />} />
                      <Route path="/user-management" element={<UserManagement />} />
                      <Route path="/models" element={<Models />} />
                      <Route path="/settings" element={<Settings />} />
                    </Route>
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                </Router>
              </WidgetProvider>
            </AnalyticsProvider>
          </CameraProvider>
        </SiteProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
