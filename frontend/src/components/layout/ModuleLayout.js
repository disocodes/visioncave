import React from 'react';
import { Box } from '@mui/material';
import VerticalNavigation from './VerticalNavigation';

const ModuleLayout = ({ children }) => {
  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <VerticalNavigation />
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        {children}
      </Box>
    </Box>
  );
};

export default ModuleLayout;
