import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';

const VLMConfig = ({ onConfigChange, initialConfig = {} }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [availableModels, setAvailableModels] = useState([]);
  const [selectedModel, setSelectedModel] = useState(initialConfig.modelId || '');
  const [customEndpoint, setCustomEndpoint] = useState(initialConfig.endpoint || '');
  const [customModelPath, setCustomModelPath] = useState(initialConfig.modelPath || '');
  const [isCustomModel, setIsCustomModel] = useState(initialConfig.isCustom || false);

  useEffect(() => {
    fetchAvailableModels();
  }, []);

  const fetchAvailableModels = async () => {
    try {
      const response = await fetch('/api/vlm/models');
      const data = await response.json();
      setAvailableModels(data);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch available models');
      setLoading(false);
    }
  };

  const handleModelChange = (event) => {
    const modelId = event.target.value;
    setSelectedModel(modelId);
    if (modelId === 'custom') {
      setIsCustomModel(true);
    } else {
      setIsCustomModel(false);
      onConfigChange({
        modelId,
        isCustom: false,
      });
    }
  };

  const handleCustomConfigSave = () => {
    onConfigChange({
      modelId: 'custom',
      isCustom: true,
      endpoint: customEndpoint,
      modelPath: customModelPath,
    });
    setIsCustomModel(false);
  };

  if (loading) {
    return <CircularProgress />;
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  return (
    <Box>
      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel>Vision Language Model</InputLabel>
        <Select
          value={selectedModel}
          onChange={handleModelChange}
          label="Vision Language Model"
        >
          {availableModels.map((model) => (
            <MenuItem key={model.id} value={model.id}>
              {model.name} - {model.description}
            </MenuItem>
          ))}
          <MenuItem value="custom">Use Custom Model</MenuItem>
        </Select>
      </FormControl>

      <Dialog open={isCustomModel} onClose={() => setIsCustomModel(false)}>
        <DialogTitle>Custom Model Configuration</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Model Endpoint URL"
            value={customEndpoint}
            onChange={(e) => setCustomEndpoint(e.target.value)}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Model Path"
            value={customModelPath}
            onChange={(e) => setCustomModelPath(e.target.value)}
            margin="normal"
            helperText="Path to your self-hosted model"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsCustomModel(false)}>Cancel</Button>
          <Button onClick={handleCustomConfigSave} variant="contained">
            Save Configuration
          </Button>
        </DialogActions>
      </Dialog>

      {selectedModel && !isCustomModel && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            Model Settings
          </Typography>
          <TextField
            fullWidth
            label="Confidence Threshold"
            type="number"
            defaultValue={0.5}
            inputProps={{ min: 0, max: 1, step: 0.1 }}
            margin="normal"
            onChange={(e) => onConfigChange({
              ...initialConfig,
              modelId: selectedModel,
              threshold: parseFloat(e.target.value),
            })}
          />
        </Box>
      )}
    </Box>
  );
};

export default VLMConfig;
