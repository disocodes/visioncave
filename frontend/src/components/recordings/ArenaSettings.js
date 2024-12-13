import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Switch,
  FormControlLabel,
  Grid,
  Alert,
  IconButton,
  Divider,
  Snackbar,
  CircularProgress,
} from '@mui/material';
import {
  CloudUpload,
  Save,
  Delete,
  Add as AddIcon,
  Close as CloseIcon,
  Check as CheckIcon,
} from '@mui/icons-material';

const ArenaSettings = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });
  const [storageProviders, setStorageProviders] = useState([
    { id: 1, type: 'google-drive', credentials: {}, enabled: false, status: 'unconfigured' },
    { id: 2, type: 'aws-s3', credentials: {}, enabled: false, status: 'unconfigured' },
    { id: 3, type: 'nextcloud', credentials: {}, enabled: false, status: 'unconfigured' },
    { id: 4, type: 'azure-blob', credentials: {}, enabled: false, status: 'unconfigured' },
    { id: 5, type: 'dropbox', credentials: {}, enabled: false, status: 'unconfigured' },
  ]);

  const [retentionRules, setRetentionRules] = useState({
    maxStorageSize: 1000, // GB
    maxRetentionDays: 30,
    autoDelete: true,
    autoArchive: true,
    archiveAfterDays: 7,
    minRetentionDays: 1,
    archiveStorageProvider: '',
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/arena-settings');
      if (response.ok) {
        const data = await response.json();
        setStorageProviders(data.storageProviders);
        setRetentionRules(data.retentionRules);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      showNotification('Error loading settings', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (message, severity = 'success') => {
    setNotification({ open: true, message, severity });
  };

  const handleStorageToggle = (providerId) => {
    setStorageProviders(providers =>
      providers.map(provider =>
        provider.id === providerId
          ? { ...provider, enabled: !provider.enabled }
          : provider
      )
    );
  };

  const validateCredentials = (provider) => {
    switch (provider.type) {
      case 'google-drive':
        return provider.credentials.clientId && provider.credentials.clientSecret;
      case 'aws-s3':
        return provider.credentials.accessKeyId && 
               provider.credentials.secretAccessKey && 
               provider.credentials.bucketName;
      case 'nextcloud':
        return provider.credentials.serverUrl && 
               provider.credentials.username && 
               provider.credentials.password;
      case 'azure-blob':
        return provider.credentials.connectionString && 
               provider.credentials.containerName;
      case 'dropbox':
        return provider.credentials.accessToken;
      default:
        return false;
    }
  };

  const handleCredentialsUpdate = (providerId, field, value) => {
    setStorageProviders(providers =>
      providers.map(provider =>
        provider.id === providerId
          ? {
              ...provider,
              credentials: { ...provider.credentials, [field]: value },
              status: 'unconfigured'
            }
          : provider
      )
    );
  };

  const handleRetentionUpdate = (field, value) => {
    setRetentionRules(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const renderStorageForm = (provider) => {
    switch (provider.type) {
      case 'google-drive':
        return (
          <>
            <TextField
              fullWidth
              label="Client ID"
              margin="normal"
              value={provider.credentials.clientId || ''}
              onChange={(e) => handleCredentialsUpdate(provider.id, 'clientId', e.target.value)}
              required
            />
            <TextField
              fullWidth
              label="Client Secret"
              margin="normal"
              type="password"
              value={provider.credentials.clientSecret || ''}
              onChange={(e) => handleCredentialsUpdate(provider.id, 'clientSecret', e.target.value)}
              required
            />
          </>
        );
      case 'aws-s3':
        return (
          <>
            <TextField
              fullWidth
              label="Access Key ID"
              margin="normal"
              value={provider.credentials.accessKeyId || ''}
              onChange={(e) => handleCredentialsUpdate(provider.id, 'accessKeyId', e.target.value)}
              required
            />
            <TextField
              fullWidth
              label="Secret Access Key"
              margin="normal"
              type="password"
              value={provider.credentials.secretAccessKey || ''}
              onChange={(e) => handleCredentialsUpdate(provider.id, 'secretAccessKey', e.target.value)}
              required
            />
            <TextField
              fullWidth
              label="Bucket Name"
              margin="normal"
              value={provider.credentials.bucketName || ''}
              onChange={(e) => handleCredentialsUpdate(provider.id, 'bucketName', e.target.value)}
              required
            />
            <TextField
              fullWidth
              label="Region"
              margin="normal"
              value={provider.credentials.region || ''}
              onChange={(e) => handleCredentialsUpdate(provider.id, 'region', e.target.value)}
            />
          </>
        );
      case 'nextcloud':
        return (
          <>
            <TextField
              fullWidth
              label="Server URL"
              margin="normal"
              value={provider.credentials.serverUrl || ''}
              onChange={(e) => handleCredentialsUpdate(provider.id, 'serverUrl', e.target.value)}
              required
            />
            <TextField
              fullWidth
              label="Username"
              margin="normal"
              value={provider.credentials.username || ''}
              onChange={(e) => handleCredentialsUpdate(provider.id, 'username', e.target.value)}
              required
            />
            <TextField
              fullWidth
              label="Password"
              margin="normal"
              type="password"
              value={provider.credentials.password || ''}
              onChange={(e) => handleCredentialsUpdate(provider.id, 'password', e.target.value)}
              required
            />
          </>
        );
      case 'azure-blob':
        return (
          <>
            <TextField
              fullWidth
              label="Connection String"
              margin="normal"
              value={provider.credentials.connectionString || ''}
              onChange={(e) => handleCredentialsUpdate(provider.id, 'connectionString', e.target.value)}
              required
            />
            <TextField
              fullWidth
              label="Container Name"
              margin="normal"
              value={provider.credentials.containerName || ''}
              onChange={(e) => handleCredentialsUpdate(provider.id, 'containerName', e.target.value)}
              required
            />
          </>
        );
      case 'dropbox':
        return (
          <TextField
            fullWidth
            label="Access Token"
            margin="normal"
            type="password"
            value={provider.credentials.accessToken || ''}
            onChange={(e) => handleCredentialsUpdate(provider.id, 'accessToken', e.target.value)}
            required
          />
        );
      default:
        return null;
    }
  };

  const handleTestConnection = async (provider) => {
    if (!validateCredentials(provider)) {
      showNotification('Please fill in all required fields', 'error');
      return;
    }

    try {
      const response = await fetch('/api/test-storage-connection', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: provider.type,
          credentials: provider.credentials,
        }),
      });

      if (response.ok) {
        setStorageProviders(providers =>
          providers.map(p =>
            p.id === provider.id
              ? { ...p, status: 'connected' }
              : p
          )
        );
        showNotification('Connection test successful', 'success');
      } else {
        const error = await response.json();
        throw new Error(error.message);
      }
    } catch (error) {
      console.error('Connection test failed:', error);
      setStorageProviders(providers =>
        providers.map(p =>
          p.id === provider.id
            ? { ...p, status: 'error' }
            : p
        )
      );
      showNotification(`Connection test failed: ${error.message}`, 'error');
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch('/api/arena-settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          storageProviders: storageProviders.filter(p => p.enabled),
          retentionRules,
        }),
      });

      if (response.ok) {
        showNotification('Settings saved successfully');
      } else {
        throw new Error('Failed to save settings');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      showNotification('Error saving settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Cloud Storage Providers
            </Typography>
            {storageProviders.map((provider) => (
              <Box key={provider.id} sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={provider.enabled}
                        onChange={() => handleStorageToggle(provider.id)}
                      />
                    }
                    label={provider.type.replace('-', ' ').toUpperCase()}
                  />
                  {provider.enabled && provider.status === 'connected' && (
                    <CheckIcon color="success" sx={{ ml: 1 }} />
                  )}
                </Box>
                {provider.enabled && (
                  <>
                    {renderStorageForm(provider)}
                    <Button
                      variant="outlined"
                      onClick={() => handleTestConnection(provider)}
                      sx={{ mt: 2 }}
                    >
                      Test Connection
                    </Button>
                  </>
                )}
                <Divider sx={{ my: 2 }} />
              </Box>
            ))}
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Retention Rules
            </Typography>
            <TextField
              fullWidth
              label="Maximum Storage Size (GB)"
              type="number"
              margin="normal"
              value={retentionRules.maxStorageSize}
              onChange={(e) => handleRetentionUpdate('maxStorageSize', parseInt(e.target.value))}
              inputProps={{ min: 1 }}
            />
            <TextField
              fullWidth
              label="Maximum Retention Days"
              type="number"
              margin="normal"
              value={retentionRules.maxRetentionDays}
              onChange={(e) => handleRetentionUpdate('maxRetentionDays', parseInt(e.target.value))}
              inputProps={{ min: retentionRules.minRetentionDays }}
            />
            <TextField
              fullWidth
              label="Archive After Days"
              type="number"
              margin="normal"
              value={retentionRules.archiveAfterDays}
              onChange={(e) => handleRetentionUpdate('archiveAfterDays', parseInt(e.target.value))}
              inputProps={{ min: 1, max: retentionRules.maxRetentionDays }}
            />
            <FormControl fullWidth margin="normal">
              <InputLabel>Archive Storage Provider</InputLabel>
              <Select
                value={retentionRules.archiveStorageProvider}
                onChange={(e) => handleRetentionUpdate('archiveStorageProvider', e.target.value)}
                label="Archive Storage Provider"
              >
                <MenuItem value="">
                  <em>None</em>
                </MenuItem>
                {storageProviders
                  .filter(p => p.enabled && p.status === 'connected')
                  .map(p => (
                    <MenuItem key={p.id} value={p.type}>
                      {p.type.replace('-', ' ').toUpperCase()}
                    </MenuItem>
                  ))}
              </Select>
            </FormControl>
            <FormControlLabel
              control={
                <Switch
                  checked={retentionRules.autoDelete}
                  onChange={(e) => handleRetentionUpdate('autoDelete', e.target.checked)}
                />
              }
              label="Auto-delete old recordings"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={retentionRules.autoArchive}
                  onChange={(e) => handleRetentionUpdate('autoArchive', e.target.checked)}
                />
              }
              label="Auto-archive to cloud storage"
            />
          </Paper>
        </Grid>
      </Grid>

      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          variant="contained"
          startIcon={saving ? <CircularProgress size={20} /> : <Save />}
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? 'Saving...' : 'Save Settings'}
        </Button>
      </Box>

      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={() => setNotification({ ...notification, open: false })}
      >
        <Alert
          onClose={() => setNotification({ ...notification, open: false })}
          severity={notification.severity}
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ArenaSettings;
