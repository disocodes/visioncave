import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Container,
  useTheme,
} from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import SchoolIcon from '@mui/icons-material/School';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import ConstructionIcon from '@mui/icons-material/Construction';
import TrafficIcon from '@mui/icons-material/Traffic';

const modules = [
  {
    id: 'residential',
    title: 'Residential Vision',
    description: 'Smart monitoring and security for residential areas',
    icon: HomeIcon,
    path: '/residential',
  },
  {
    id: 'school',
    title: 'School Vision',
    description: 'Ensuring safety and efficiency in educational environments',
    icon: SchoolIcon,
    path: '/school',
  },
  {
    id: 'hospital',
    title: 'Hospital Vision',
    description: 'Advanced monitoring for healthcare facilities',
    icon: LocalHospitalIcon,
    path: '/hospital',
  },
  {
    id: 'mine',
    title: 'Mine Site Vision',
    description: 'Safety and operations monitoring for mining sites',
    icon: ConstructionIcon,
    path: '/mine',
  },
  {
    id: 'traffic',
    title: 'Traffic Vision',
    description: 'Smart traffic monitoring and analysis',
    icon: TrafficIcon,
    path: '/traffic',
  },
];

const LandingPage = () => {
  const theme = useTheme();
  const navigate = useNavigate();

  const handleModuleClick = (path) => {
    navigate(path);
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundColor: theme.palette.background.default,
        py: 8,
      }}
    >
      <Container maxWidth="lg">
        <Typography
          variant="h2"
          component="h1"
          align="center"
          gutterBottom
          sx={{ color: theme.palette.primary.main, mb: 6 }}
        >
          VisionCave
        </Typography>
        <Typography
          variant="h5"
          component="h2"
          align="center"
          sx={{ color: theme.palette.text.secondary, mb: 8 }}
        >
          Advanced Computer Vision Solutions for Every Domain
        </Typography>
        <Grid container spacing={4}>
          {modules.map((module) => {
            const Icon = module.icon;
            return (
              <Grid item xs={12} sm={6} md={4} key={module.id}>
                <Card
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    cursor: 'pointer',
                    transition: 'transform 0.2s',
                    '&:hover': {
                      transform: 'scale(1.02)',
                    },
                    backgroundColor: theme.palette.background.paper,
                    borderRadius: 2,
                  }}
                  onClick={() => handleModuleClick(module.path)}
                >
                  <Box
                    sx={{
                      p: 3,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: theme.palette.primary.dark,
                    }}
                  >
                    <Icon sx={{ fontSize: 48, color: theme.palette.primary.contrastText }} />
                  </Box>
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography gutterBottom variant="h5" component="h2" sx={{ color: theme.palette.text.primary }}>
                      {module.title}
                    </Typography>
                    <Typography sx={{ color: theme.palette.text.secondary }}>
                      {module.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      </Container>
    </Box>
  );
};

export default LandingPage;
