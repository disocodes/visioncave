import React from 'react';
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  Box,
  Chip,
  IconButton,
  Avatar,
  Grid,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Business as BusinessIcon,
  Badge as BadgeIcon,
} from '@mui/icons-material';

const UserCard = ({ user, onEdit, onDelete, onManage }) => {
  const getInitials = (firstName, lastName) => {
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
  };

  const getRoleColor = (role) => {
    const colors = {
      admin: 'error',
      manager: 'warning',
      user: 'primary',
    };
    return colors[role.toLowerCase()] || 'default';
  };

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardContent sx={{ flexGrow: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Avatar
            sx={{ width: 56, height: 56, mr: 2, bgcolor: 'primary.main' }}
          >
            {getInitials(user.firstName, user.lastName)}
          </Avatar>
          <Box>
            <Typography variant="h6" component="div">
              {`${user.firstName} ${user.lastName}`}
            </Typography>
            <Typography color="text.secondary" variant="body2">
              {user.email}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
          {user.roles?.map((role) => (
            <Chip
              key={role}
              label={role}
              size="small"
              color={getRoleColor(role)}
            />
          ))}
        </Box>

        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center' }}>
              <BusinessIcon sx={{ fontSize: 16, mr: 0.5 }} />
              Organization
            </Typography>
            <Typography variant="body1">
              {user.organization}
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center' }}>
              <BadgeIcon sx={{ fontSize: 16, mr: 0.5 }} />
              Employee ID
            </Typography>
            <Typography variant="body1">
              {user.employeeId}
            </Typography>
          </Grid>
        </Grid>
      </CardContent>

      <CardActions sx={{ justifyContent: 'flex-end', p: 2, pt: 0 }}>
        <Button
          size="small"
          variant="contained"
          onClick={() => onManage(user)}
        >
          Manage
        </Button>
        <IconButton
          size="small"
          onClick={() => onEdit(user)}
        >
          <EditIcon />
        </IconButton>
        <IconButton
          size="small"
          onClick={() => onDelete(user)}
        >
          <DeleteIcon />
        </IconButton>
      </CardActions>
    </Card>
  );
};

export default UserCard;
