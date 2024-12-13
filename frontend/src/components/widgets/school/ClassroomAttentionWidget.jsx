import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  CircularProgress,
  IconButton,
  Tooltip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  TextField,
  Chip,
} from '@mui/material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
  BarChart,
  Bar,
} from 'recharts';
import PsychologyIcon from '@mui/icons-material/Psychology';
import InfoIcon from '@mui/icons-material/Info';
import NotificationsIcon from '@mui/icons-material/Notifications';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import {
  Videocam as VideocamIcon,
  VideocamOff as VideocamOffIcon,
  CameraAlt as CameraIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';
import BaseWidget from '../BaseWidget';

const ClassroomAttentionWidget = ({ socketUrl }) => {
  const [attentionData, setAttentionData] = useState({
    currentScore: 0,
    timeline: [],
    alerts: [],
    subjectBreakdown: [
      { subject: 'Math', attention: 85, engagement: 80 },
      { subject: 'Science', attention: 75, engagement: 78 },
      { subject: 'English', attention: 70, engagement: 72 },
    ]
  });
  const [loading, setLoading] = useState(true);
  const [selectedTimeframe, setSelectedTimeframe] = useState('1h');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [thresholdValue, setThresholdValue] = useState(60);
  const [isStreaming, setIsStreaming] = useState(true);
  const [selectedCamera, setSelectedCamera] = useState('main');

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const overlayRef = useRef(null);

  useEffect(() => {
    const ws = new WebSocket(socketUrl);

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'attention_update') {
        setAttentionData(prevData => ({
          ...prevData,
          currentScore: data.attention_score,
          timeline: [
            ...prevData.timeline,
            {
              time: new Date().toLocaleTimeString(),
              score: data.attention_score,
              engagement: data.engagement_level,
            }
          ].slice(-20),
          alerts: data.alerts || prevData.alerts,
        }));
        setLoading(false);
        updateAttentionOverlay(data.attention_score);
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      setLoading(false);
    };

    initializeCamera();

    return () => {
      ws.close();
      if (videoRef.current?.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      }
    };
  }, [socketUrl]);

  const initializeCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      setIsStreaming(false);
    }
  };

  const toggleStream = () => {
    if (videoRef.current?.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(track => {
        track.enabled = !isStreaming;
      });
      setIsStreaming(!isStreaming);
    }
  };

  const captureSnapshot = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      canvasRef.current.width = videoRef.current.videoWidth;
      canvasRef.current.height = videoRef.current.videoHeight;
      context.drawImage(videoRef.current, 0, 0);
      
      // Add attention score overlay to snapshot
      const score = attentionData.currentScore;
      context.fillStyle = `rgba(${score < 60 ? '255,0,0' : score < 80 ? '255,165,0' : '0,255,0'}, 0.3)`;
      context.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      
      const snapshot = canvasRef.current.toDataURL('image/jpeg');
      // TODO: Send snapshot to backend for attention analysis
    }
  };

  const updateAttentionOverlay = (score) => {
    if (overlayRef.current) {
      overlayRef.current.style.backgroundColor = `rgba(${
        score < 60 ? '255,0,0' : score < 80 ? '255,165,0' : '0,255,0'
      }, 0.3)`;
    }
  };

  const getAttentionColor = (score) => {
    if (score >= 80) return '#4caf50';
    if (score >= 60) return '#ff9800';
    return '#f44336';
  };

  const handleExport = () => {
    const csvContent = [
      ['Time', 'Attention Score', 'Engagement Level'],
      ...attentionData.timeline.map(data => 
        [data.time, data.score, data.engagement]
      )
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'attention_analysis.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const summaryContent = (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Box sx={{ position: 'relative', display: 'inline-flex' }}>
          <CircularProgress
            variant="determinate"
            value={attentionData.currentScore}
            size={40}
            thickness={4}
            sx={{ color: getAttentionColor(attentionData.currentScore) }}
          />
          <Box
            sx={{
              top: 0,
              left: 0,
              bottom: 0,
              right: 0,
              position: 'absolute',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Typography variant="caption" component="div">
              {Math.round(attentionData.currentScore)}%
            </Typography>
          </Box>
        </Box>
        <Typography>Current Attention Level</Typography>
      </Box>
      {attentionData.alerts.length > 0 && (
        <Chip
          icon={<NotificationsIcon />}
          label={`${attentionData.alerts.length} Alerts`}
          color="warning"
          size="small"
        />
      )}
    </Box>
  );

  const expandedContent = (
    <Box sx={{ height: '100%' }}>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Camera</InputLabel>
                <Select
                  value={selectedCamera}
                  onChange={(e) => setSelectedCamera(e.target.value)}
                  label="Camera"
                >
                  <MenuItem value="main">Main Camera</MenuItem>
                  <MenuItem value="back">Back Camera</MenuItem>
                  <MenuItem value="side">Side Camera</MenuItem>
                </Select>
              </FormControl>
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Timeframe</InputLabel>
                <Select
                  value={selectedTimeframe}
                  onChange={(e) => setSelectedTimeframe(e.target.value)}
                  label="Timeframe"
                >
                  <MenuItem value="1h">Last Hour</MenuItem>
                  <MenuItem value="4h">Last 4 Hours</MenuItem>
                  <MenuItem value="1d">Last Day</MenuItem>
                  <MenuItem value="1w">Last Week</MenuItem>
                </Select>
              </FormControl>
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Subject</InputLabel>
                <Select
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  label="Subject"
                >
                  <MenuItem value="all">All Subjects</MenuItem>
                  <MenuItem value="math">Math</MenuItem>
                  <MenuItem value="science">Science</MenuItem>
                  <MenuItem value="english">English</MenuItem>
                </Select>
              </FormControl>
              <TextField
                size="small"
                label="Alert Threshold"
                type="number"
                value={thresholdValue}
                onChange={(e) => setThresholdValue(e.target.value)}
                sx={{ width: 120 }}
              />
              <Button
                variant="outlined"
                startIcon={<FileDownloadIcon />}
                onClick={handleExport}
                size="small"
              >
                Export Data
              </Button>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="subtitle1">
                Live Classroom Feed
              </Typography>
              <Box>
                <IconButton onClick={toggleStream} size="small">
                  {isStreaming ? <VideocamOffIcon /> : <VideocamIcon />}
                </IconButton>
                <IconButton onClick={captureSnapshot} size="small">
                  <CameraIcon />
                </IconButton>
                <IconButton size="small">
                  <SettingsIcon />
                </IconButton>
              </Box>
            </Box>
            <Box sx={{ position: 'relative', width: '100%', height: 400, bgcolor: 'black' }}>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                  display: isStreaming ? 'block' : 'none'
                }}
              />
              <Box
                ref={overlayRef}
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  transition: 'background-color 0.3s ease',
                  pointerEvents: 'none',
                }}
              />
              <canvas
                ref={canvasRef}
                style={{ display: 'none' }}
              />
              {!isStreaming && (
                <Box sx={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  color: 'white'
                }}>
                  <Typography>Camera Paused</Typography>
                </Box>
              )}
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Box sx={{ position: 'relative', display: 'inline-flex' }}>
              <CircularProgress
                variant="determinate"
                value={attentionData.currentScore}
                size={120}
                thickness={4}
                sx={{
                  color: getAttentionColor(attentionData.currentScore),
                }}
              />
              <Box
                sx={{
                  top: 0,
                  left: 0,
                  bottom: 0,
                  right: 0,
                  position: 'absolute',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Typography variant="h4" component="div">
                  {Math.round(attentionData.currentScore)}%
                </Typography>
              </Box>
            </Box>
            <Typography variant="subtitle1" align="center" sx={{ mt: 2 }}>
              Current Attention Level
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Attention Timeline
              <Tooltip title="Shows attention and engagement levels over time">
                <InfoIcon fontSize="small" sx={{ ml: 1 }} />
              </Tooltip>
            </Typography>
            <Box sx={{ height: 200 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={attentionData.timeline}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="score"
                    stroke="#8884d8"
                    name="Attention"
                  />
                  <Line
                    type="monotone"
                    dataKey="engagement"
                    stroke="#82ca9d"
                    name="Engagement"
                  />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Subject-wise Analysis
            </Typography>
            <Box sx={{ height: 200 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={attentionData.subjectBreakdown}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="subject" />
                  <YAxis />
                  <Legend />
                  <Bar dataKey="attention" fill="#8884d8" name="Attention" />
                  <Bar dataKey="engagement" fill="#82ca9d" name="Engagement" />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>

        {attentionData.alerts.length > 0 && (
          <Grid item xs={12}>
            <Paper sx={{ p: 2, bgcolor: '#fff3e0' }}>
              <Typography variant="subtitle1" color="warning.main">
                Attention Alerts
              </Typography>
              {attentionData.alerts.map((alert, index) => (
                <Typography key={index} variant="body2" sx={{ mt: 1 }}>
                  • {alert}
                </Typography>
              ))}
            </Paper>
          </Grid>
        )}
      </Grid>
    </Box>
  );

  if (loading) {
    return (
      <BaseWidget title="Classroom Attention Analysis" icon={<PsychologyIcon />}>
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      </BaseWidget>
    );
  }

  return (
    <BaseWidget
      title="Classroom Attention Analysis"
      icon={<PsychologyIcon />}
      summary={summaryContent}
      expandable={true}
    >
      {expandedContent}
    </BaseWidget>
  );
};

export default ClassroomAttentionWidget;
