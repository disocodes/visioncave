import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  Card,
  CardContent,
  Typography,
  Grid,
  Box,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Switch,
  FormControlLabel,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
} from '@mui/icons-material';
import Konva from 'konva';
import { Stage, Layer, Line, Circle } from 'react-konva';
import { addZone, updateZone, removeZone } from '../../store/slices/widgetDataSlice';

const ZoneManagementWidget = () => {
  const dispatch = useDispatch();
  const zones = useSelector((state) => state.widgetData.zones) || [];
  const containerRef = useRef(null);
  const videoRef = useRef(null);
  
  const [selectedZone, setSelectedZone] = useState(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [points, setPoints] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [stageDimensions, setStageDimensions] = useState(null);
  const [zoneConfig, setZoneConfig] = useState({
    name: '',
    type: 'monitoring',
    rules: [],
    active: true,
  });

  const zoneTypes = [
    { value: 'monitoring', label: 'General Monitoring' },
    { value: 'restricted', label: 'Restricted Area' },
    { value: 'counting', label: 'People Counting' },
    { value: 'activity', label: 'Activity Analysis' },
    { value: 'safety', label: 'Safety Monitoring' },
  ];

  const availableRules = {
    monitoring: ['max_occupancy', 'time_limit'],
    restricted: ['no_entry', 'authorized_only'],
    counting: ['count_in', 'count_out'],
    activity: ['movement_detection', 'object_interaction'],
    safety: ['ppe_required', 'distance_check'],
  };

  useEffect(() => {
    const updateStageDimensions = () => {
      if (containerRef.current) {
        const { clientWidth, clientHeight } = containerRef.current;
        if (clientWidth && clientHeight) {
          setStageDimensions({
            width: Math.max(clientWidth, 1),
            height: Math.max(clientHeight, 1)
          });
        }
      }
    };

    // Initial update
    updateStageDimensions();

    // Add resize observer
    const resizeObserver = new ResizeObserver(() => {
      window.requestAnimationFrame(updateStageDimensions);
    });
    
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    // Cleanup
    return () => {
      if (containerRef.current) {
        resizeObserver.unobserve(containerRef.current);
      }
    };
  }, []);

  const handleStageClick = (e) => {
    if (!isDrawing) return;
    
    const stage = e.target.getStage();
    const point = stage.getPointerPosition();
    if (point) {
      setPoints([...points, point.x, point.y]);
    }
  };

  const handleZoneSelect = (zone) => {
    if (!zone) return;
    setSelectedZone(zone);
    setPoints(zone.points || []);
    setZoneConfig({
      name: zone.name || '',
      type: zone.type || 'monitoring',
      rules: zone.rules || [],
      active: zone.active ?? true,
    });
    setDialogOpen(true);
  };

  const handleSaveZone = () => {
    if (!zoneConfig.name) return;
    
    const newZone = {
      id: selectedZone?.id || Date.now().toString(),
      name: zoneConfig.name,
      type: zoneConfig.type,
      points: points,
      rules: zoneConfig.rules,
      active: zoneConfig.active,
    };

    dispatch(selectedZone ? updateZone(newZone) : addZone(newZone));
    handleCloseDialog();
  };

  const handleDeleteZone = (zoneId) => {
    if (!zoneId) return;
    dispatch(removeZone(zoneId));
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedZone(null);
    setPoints([]);
    setZoneConfig({
      name: '',
      type: 'monitoring',
      rules: [],
      active: true,
    });
    setIsDrawing(false);
  };

  const handleToggleZone = (zone) => {
    if (!zone) return;
    dispatch(updateZone({ ...zone, active: !zone.active }));
  };

  const renderStage = () => {
    if (!stageDimensions || !stageDimensions.width || !stageDimensions.height) {
      return null;
    }

    return (
      <Stage
        width={stageDimensions.width}
        height={stageDimensions.height}
        onClick={handleStageClick}
        style={{ position: 'absolute', top: 0, left: 0 }}
      >
        <Layer>
          {zones.map((zone) => (
            zone.points && zone.points.length >= 4 && (
              <Line
                key={zone.id}
                points={zone.points}
                closed
                stroke={zone.active ? '#2196f3' : '#bdbdbd'}
                fill={zone.active ? '#2196f320' : '#bdbdbd20'}
              />
            )
          ))}
          {points.length >= 4 && (
            <Line
              points={points}
              closed
              stroke="#4caf50"
              fill="#4caf5020"
            />
          )}
          {points.map((point, i) => (
            i % 2 === 0 && (
              <Circle
                key={i}
                x={point}
                y={points[i + 1]}
                radius={4}
                fill="#4caf50"
              />
            )
          ))}
        </Layer>
      </Stage>
    );
  };

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6">Zone Management</Typography>
          <Box>
            {isDrawing ? (
              <>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => setDialogOpen(true)}
                  sx={{ mr: 1 }}
                  disabled={points.length < 6}
                >
                  Save Zone
                </Button>
                <Button
                  variant="outlined"
                  color="secondary"
                  onClick={() => {
                    setIsDrawing(false);
                    setPoints([]);
                  }}
                >
                  Cancel
                </Button>
              </>
            ) : (
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setIsDrawing(true)}
              >
                Add Zone
              </Button>
            )}
          </Box>
        </Box>

        <Grid container spacing={2}>
          {/* Zone List */}
          <Grid item xs={4}>
            <List>
              {zones.map((zone) => (
                <ListItem key={zone.id}>
                  <ListItemText
                    primary={zone.name}
                    secondary={
                      <Box>
                        <Chip
                          label={zone.type}
                          size="small"
                          sx={{ mr: 1 }}
                        />
                        <Chip
                          label={`${zone.rules?.length || 0} rules`}
                          size="small"
                        />
                      </Box>
                    }
                  />
                  <ListItemSecondaryAction>
                    <IconButton
                      edge="end"
                      onClick={() => handleToggleZone(zone)}
                    >
                      {zone.active ? (
                        <VisibilityIcon />
                      ) : (
                        <VisibilityOffIcon />
                      )}
                    </IconButton>
                    <IconButton
                      edge="end"
                      onClick={() => handleZoneSelect(zone)}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      edge="end"
                      onClick={() => handleDeleteZone(zone.id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          </Grid>

          {/* Zone Preview */}
          <Grid item xs={8}>
            <Box
              ref={containerRef}
              sx={{
                width: '100%',
                height: 400,
                border: '1px solid #ccc',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <video
                ref={videoRef}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                }}
              />
              {renderStage()}
            </Box>
          </Grid>
        </Grid>

        {/* Zone Configuration Dialog */}
        <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="md">
          <DialogTitle>
            {selectedZone ? 'Edit Zone' : 'Create New Zone'}
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Zone Name"
                  value={zoneConfig.name}
                  onChange={(e) =>
                    setZoneConfig({ ...zoneConfig, name: e.target.value })
                  }
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Zone Type</InputLabel>
                  <Select
                    value={zoneConfig.type}
                    onChange={(e) =>
                      setZoneConfig({
                        ...zoneConfig,
                        type: e.target.value,
                        rules: [],
                      })
                    }
                  >
                    {zoneTypes.map((type) => (
                      <MenuItem key={type.value} value={type.value}>
                        {type.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Rules</InputLabel>
                  <Select
                    multiple
                    value={zoneConfig.rules}
                    onChange={(e) =>
                      setZoneConfig({ ...zoneConfig, rules: e.target.value })
                    }
                    renderValue={(selected) => (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {selected.map((value) => (
                          <Chip key={value} label={value} />
                        ))}
                      </Box>
                    )}
                  >
                    {availableRules[zoneConfig.type]?.map((rule) => (
                      <MenuItem key={rule} value={rule}>
                        {rule}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={zoneConfig.active}
                      onChange={(e) =>
                        setZoneConfig({
                          ...zoneConfig,
                          active: e.target.checked,
                        })
                      }
                    />
                  }
                  label="Active"
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog} startIcon={<CancelIcon />}>
              Cancel
            </Button>
            <Button
              onClick={handleSaveZone}
              variant="contained"
              startIcon={<SaveIcon />}
              disabled={!zoneConfig.name}
            >
              Save
            </Button>
          </DialogActions>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default ZoneManagementWidget;
