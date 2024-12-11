import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Typography,
  Button,
  Box,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import SiteCard from '../components/sites/SiteCard';
import { useAuth } from '../contexts/AuthContext';
import { getSites, createSite, updateSite, deleteSite } from '../services/siteService';

const SiteManagement = () => {
  const [sites, setSites] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedSite, setSelectedSite] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    type: '',
    status: 'active',
  });
  const { user } = useAuth();

  useEffect(() => {
    loadSites();
  }, []);

  const loadSites = async () => {
    try {
      const response = await getSites();
      setSites(response.data);
    } catch (error) {
      console.error('Error loading sites:', error);
    }
  };

  const handleOpenDialog = (site = null) => {
    if (site) {
      setSelectedSite(site);
      setFormData({
        name: site.name,
        address: site.address,
        type: site.type,
        status: site.status,
      });
    } else {
      setSelectedSite(null);
      setFormData({
        name: '',
        address: '',
        type: '',
        status: 'active',
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedSite(null);
    setFormData({
      name: '',
      address: '',
      type: '',
      status: 'active',
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (selectedSite) {
        await updateSite(selectedSite.id, formData);
      } else {
        await createSite(formData);
      }
      handleCloseDialog();
      loadSites();
    } catch (error) {
      console.error('Error saving site:', error);
    }
  };

  const handleDelete = async (site) => {
    if (window.confirm('Are you sure you want to delete this site?')) {
      try {
        await deleteSite(site.id);
        loadSites();
      } catch (error) {
        console.error('Error deleting site:', error);
      }
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4 }}>
        <Typography variant="h4" component="h1">
          Site Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Add Site
        </Button>
      </Box>

      <Grid container spacing={3}>
        {sites.map((site) => (
          <Grid item xs={12} sm={6} md={4} key={site.id}>
            <SiteCard
              site={site}
              onEdit={() => handleOpenDialog(site)}
              onDelete={() => handleDelete(site)}
              onManage={() => {/* Navigate to site details */}}
            />
          </Grid>
        ))}
      </Grid>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedSite ? 'Edit Site' : 'Add New Site'}
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Site Name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Address"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Type"
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  required
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button type="submit" variant="contained">
              {selectedSite ? 'Update' : 'Create'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Container>
  );
};

export default SiteManagement;
