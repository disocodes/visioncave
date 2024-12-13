import React, { useState, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import ReactFlow, {
  addEdge,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
} from 'reactflow';
import 'reactflow/dist/style.css';
import {
  Box,
  Paper,
  Typography,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  VideoCamera,
  Analytics,
  Person,
  LocalParking,
  Warning,
} from '@mui/icons-material';
import NodeLibrary from './NodeLibrary';
import CustomNode from './CustomNode';
import { useSnackbar } from 'notistack';

const nodeTypes = {
  customNode: CustomNode,
};

const TaskFlowEditor = ({ type = 'widget' }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const editorType = location.pathname === '/task-builder' ? 'task' : 'widget';
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [libraryOpen, setLibraryOpen] = useState(true);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [name, setName] = useState('');
  const [targetType, setTargetType] = useState('dashboard'); // 'dashboard' or 'camera-feed'
  const { enqueueSnackbar } = useSnackbar();

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event) => {
      event.preventDefault();

      const type = event.dataTransfer.getData('application/reactflow');
      const name = event.dataTransfer.getData('nodeName');

      if (typeof type === 'undefined' || !type) {
        return;
      }

      const position = {
        x: event.clientX - event.target.getBoundingClientRect().left,
        y: event.clientY - event.target.getBoundingClientRect().top,
      };

      const newNode = {
        id: `${type}-${nodes.length + 1}`,
        type: 'customNode',
        position,
        data: { label: name, type },
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [nodes, setNodes]
  );

  const handleSave = async () => {
    if (!name.trim()) {
      enqueueSnackbar(`Please enter a ${editorType} name`, { variant: 'warning' });
      return;
    }

    try {
      const config = {
        name,
        type: editorType,
        targetType: editorType === 'task' ? targetType : 'dashboard',
        nodes,
        edges,
        createdAt: new Date().toISOString(),
      };

      // Save configuration
      await fetch(`/api/${editorType}s`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(config),
      });

      enqueueSnackbar(`${editorType} saved successfully`, { variant: 'success' });
      setSaveDialogOpen(false);
      
      // Navigate back to the appropriate list view
      navigate(editorType === 'task' ? '/tasks' : '/widgets');
    } catch (error) {
      enqueueSnackbar(`Error saving ${editorType}`, { variant: 'error' });
    }
  };

  const handleClear = () => {
    setNodes([]);
    setEdges([]);
  };

  return (
    <Box sx={{ display: 'flex', height: 'calc(100vh - 64px)' }}>
      <Drawer
        variant="persistent"
        anchor="left"
        open={libraryOpen}
        sx={{
          width: 240,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: 240,
            boxSizing: 'border-box',
            position: 'relative',
          },
        }}
      >
        <NodeLibrary editorType={editorType} />
      </Drawer>

      <Box sx={{ flexGrow: 1, p: 3 }}>
        <Paper
          sx={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Typography variant="h6">
                {editorType === 'task' ? 'Task Builder' : 'Widget Builder'}
              </Typography>
            </Box>
            <Box sx={{ mt: 1 }}>
              <Button
                variant="contained"
                onClick={() => setSaveDialogOpen(true)}
                sx={{ mr: 1 }}
              >
                Save {editorType === 'task' ? 'Task' : 'Widget'}
              </Button>
              <Button
                variant="outlined"
                onClick={handleClear}
              >
                Clear
              </Button>
            </Box>
          </Box>

          <Box sx={{ flexGrow: 1 }}>
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              onDrop={onDrop}
              onDragOver={onDragOver}
              nodeTypes={nodeTypes}
              fitView
            >
              <Controls />
              <MiniMap />
              <Background variant="dots" gap={12} size={1} />
            </ReactFlow>
          </Box>
        </Paper>
      </Box>

      <Dialog
        open={saveDialogOpen}
        onClose={() => setSaveDialogOpen(false)}
      >
        <DialogTitle>
          Save {editorType === 'task' ? 'Task' : 'Widget'}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label={`${editorType === 'task' ? 'Task' : 'Widget'} Name`}
            fullWidth
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          {editorType === 'task' && (
            <FormControl fullWidth margin="dense">
              <InputLabel>Target Type</InputLabel>
              <Select
                value={targetType}
                onChange={(e) => setTargetType(e.target.value)}
                label="Target Type"
              >
                <MenuItem value="dashboard">Dashboard Widget</MenuItem>
                <MenuItem value="camera-feed">Camera Feed</MenuItem>
              </Select>
            </FormControl>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSaveDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSave} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TaskFlowEditor;
