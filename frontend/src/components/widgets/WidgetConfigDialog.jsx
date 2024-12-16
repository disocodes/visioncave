import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Grid,
  Typography,
  Box,
  Stepper,
  Step,
  StepLabel,
  Alert
} from '@mui/material';

const steps = ['Select Widget', 'Configure Data Sources', 'Widget Settings'];

const WidgetConfigDialog = ({ 
  open, 
  onClose, 
  availableWidgets, 
  onAddWidget,
  currentSiteId 
}) => {
  const [activeStep, setActiveStep] = useState(0);
  const [selectedWidget, setSelectedWidget] = useState(null);
  const [dataSources, setDataSources] = useState([]);
  const [config, setConfig] = useState({});
  const [error, setError] = useState(null);

  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleWidgetSelect = (widget) => {
    setSelectedWidget(widget);
    // Initialize config with widget's default configuration
    setConfig(widget.configDefaults || {
      refreshInterval: 30,
      alertThreshold: 80,
      ...widget.configDefaults
    });
    handleNext();
  };

  const handleDataSourceSelect = (sources) => {
    setDataSources(sources);
    setConfig(prev => ({
      ...prev,
      dataSources: sources
    }));
    handleNext();
  };

  const handleConfigChange = (field) => (event) => {
    setConfig(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  const handleSubmit = () => {
    if (!currentSiteId) {
      setError('No site selected. Please select a site first.');
      return;
    }

    try {
      onAddWidget({
        name: config.title || selectedWidget.title, // Use title as name
        type: selectedWidget.type,
        site_id: currentSiteId,
        config: {
          ...config,
          dataSources,
          isCustom: selectedWidget.isCustom
        },
        description: `${selectedWidget.title} widget for ${currentSiteId}`,
        module: selectedWidget.module
      });
      
      // Reset state
      setActiveStep(0);
      setSelectedWidget(null);
      setDataSources([]);
      setConfig({});
      setError(null);
      onClose();
    } catch (error) {
      console.error('Failed to create widget:', error);
      setError('Failed to create widget. Please try again.');
    }
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Grid container spacing={2}>
            {availableWidgets.map((widget) => (
              <Grid item xs={12} sm={6} key={widget.type}>
                <Button
                  variant={selectedWidget?.type === widget.type ? "contained" : "outlined"}
                  fullWidth
                  onClick={() => handleWidgetSelect(widget)}
                  sx={{ height: '100px', textAlign: 'left', p: 2 }}
                >
                  <Box>
                    <Typography variant="subtitle1">{widget.title}</Typography>
                    {widget.isCustom && (
                      <Typography variant="caption" color="text.secondary">
                        Custom Widget
                      </Typography>
                    )}
                  </Box>
                </Button>
              </Grid>
            ))}
          </Grid>
        );

      case 1:
        return (
          <Box sx={{ p: 2 }}>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Primary Data Source</InputLabel>
              <Select
                value={dataSources[0] || ''}
                onChange={(e) => handleDataSourceSelect([e.target.value, ...dataSources.slice(1)])}
              >
                <MenuItem value="camera_1">Camera 1</MenuItem>
                <MenuItem value="camera_2">Camera 2</MenuItem>
                <MenuItem value="camera_3">Camera 3</MenuItem>
              </Select>
            </FormControl>

            {selectedWidget?.supportsSecondarySource && (
              <FormControl fullWidth>
                <InputLabel>Secondary Data Source</InputLabel>
                <Select
                  value={dataSources[1] || ''}
                  onChange={(e) => handleDataSourceSelect([dataSources[0], e.target.value])}
                >
                  <MenuItem value="camera_1">Camera 1</MenuItem>
                  <MenuItem value="camera_2">Camera 2</MenuItem>
                  <MenuItem value="camera_3">Camera 3</MenuItem>
                </Select>
              </FormControl>
            )}
          </Box>
        );

      case 2:
        return (
          <Box sx={{ p: 2 }}>
            <TextField
              fullWidth
              label="Widget Title"
              value={config.title || selectedWidget.title || ''}
              onChange={handleConfigChange('title')}
              sx={{ mb: 2 }}
            />
            
            <TextField
              fullWidth
              label="Refresh Interval (seconds)"
              type="number"
              value={config.refreshInterval || ''}
              onChange={handleConfigChange('refreshInterval')}
              sx={{ mb: 2 }}
            />

            <TextField
              fullWidth
              label="Alert Threshold (%)"
              type="number"
              value={config.alertThreshold || ''}
              onChange={handleConfigChange('alertThreshold')}
              sx={{ mb: 2 }}
            />

            {selectedWidget?.customConfig?.map((field) => (
              <TextField
                key={field.name}
                fullWidth
                label={field.label}
                type={field.type || 'text'}
                value={config[field.name] || ''}
                onChange={handleConfigChange(field.name)}
                sx={{ mb: 2 }}
                select={field.type === 'select'}
              >
                {field.type === 'select' && field.options?.map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </TextField>
            ))}
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Add Widget</DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}
        <Stepper activeStep={activeStep} sx={{ py: 3 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        {renderStepContent(activeStep)}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        {activeStep > 0 && (
          <Button onClick={handleBack}>Back</Button>
        )}
        {activeStep === steps.length - 1 ? (
          <Button 
            onClick={handleSubmit}
            variant="contained"
            disabled={!selectedWidget || !config.title}
          >
            Add Widget
          </Button>
        ) : (
          <Button 
            onClick={handleNext}
            variant="contained"
            disabled={
              (activeStep === 0 && !selectedWidget) ||
              (activeStep === 1 && dataSources.length === 0)
            }
          >
            Next
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default WidgetConfigDialog;
