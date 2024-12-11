import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Grid,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  Box,
} from '@mui/material';
import {
  Home as HomeIcon,
  School as SchoolIcon,
  LocalHospital as HospitalIcon,
  Construction as MineIcon,
  Traffic as TrafficIcon,
} from '@mui/icons-material';

const modules = [
  {
    id: 'residential',
    title: 'Residential',
    icon: HomeIcon,
    description: 'Monitor residential areas with smart surveillance',
    color: '#4caf50',
  },
  {
    id: 'school',
    title: 'School',
    icon: SchoolIcon,
    description: 'Enhance school safety and monitoring',
    color: '#2196f3',
  },
  {
    id: 'hospital',
    title: 'Hospital',
    icon: HospitalIcon,
    description: 'Healthcare facility monitoring and safety',
    color: '#f44336',
  },
  {
    id: 'mine',
    title: 'Mine Site',
    icon: MineIcon,
    description: 'Industrial safety and equipment tracking',
    color: '#ff9800',
  },
  {
    id: 'traffic',
    title: 'Traffic',
    icon: TrafficIcon,
    description: 'Traffic monitoring and analysis',
    color: '#9c27b0',
  },
];

const ModuleSelection = () => {
  const navigate = useNavigate();

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Select Module Dashboard
      </Typography>
      <Grid container spacing={3}>
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
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: (theme) => theme.shadows[8],
                  },
                  transition: 'transform 0.2s, box-shadow 0.2s',
                }}
                onClick={() => navigate(`/module/${module.id}`)}
              >
                <Box
                  sx={{
                    p: 3,
                    display: 'flex',
                    alignItems: 'center',
                    bgcolor: module.color,
                  }}
                >
                  <Icon sx={{ fontSize: 40, color: 'white' }} />
                </Box>
                <CardContent>
                  <Typography gutterBottom variant="h5" component="div">
                    {module.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {module.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
};

export default ModuleSelection;
