import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  IconButton,
} from '@mui/material';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import SchoolIcon from '@mui/icons-material/School';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import {
  Videocam as VideocamIcon,
  VideocamOff as VideocamOffIcon,
  CameraAlt as CameraIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';
import BaseWidget from '../BaseWidget';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

const COLORS = ['#0088FE', '#FF8042'];

const StudentAttendanceWidget = ({ socketUrl }) => {
  const [attendanceData, setAttendanceData] = useState({
    present: 0,
    absent: 0,
    recentActivity: [],
    weeklyData: []
  });
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000));
  const [endDate, setEndDate] = useState(new Date());
  const [filterType, setFilterType] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isStreaming, setIsStreaming] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    const ws = new WebSocket(socketUrl);

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'attendance_update') {
        setAttendanceData(prevData => ({
          ...prevData,
          present: data.present,
          absent: data.absent,
          recentActivity: [
            {
              time: new Date().toLocaleTimeString(),
              action: data.action,
              student: data.student
            },
            ...prevData.recentActivity.slice(0, 4)
          ],
          weeklyData: data.weeklyData || prevData.weeklyData
        }));
        setLoading(false);
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
      
      // You can send this snapshot to your backend for processing
      const snapshot = canvasRef.current.toDataURL('image/jpeg');
      // TODO: Send snapshot to backend for attendance processing
    }
  };

  const pieData = [
    { name: 'Present', value: attendanceData.present },
    { name: 'Absent', value: attendanceData.absent }
  ];

  const handleExport = () => {
    const csvContent = [
      ['Time', 'Student', 'Action'],
      ...attendanceData.recentActivity.map(activity => 
        [activity.time, activity.student, activity.action]
      )
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'attendance_report.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const filteredActivity = attendanceData.recentActivity.filter(activity => {
    const matchesSearch = activity.student.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterType === 'all' || activity.action.toLowerCase() === filterType;
    return matchesSearch && matchesFilter;
  });

  const summaryContent = (
    <Box sx={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center' }}>
      <Typography color="primary">Present: {attendanceData.present}</Typography>
      <Typography color="error">Absent: {attendanceData.absent}</Typography>
    </Box>
  );

  const expandedContent = (
    <Box sx={{ height: '100%' }}>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Paper sx={{ p: 2, mb: 2 }}>
            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Start Date"
                  value={startDate}
                  onChange={setStartDate}
                  renderInput={(params) => <TextField {...params} />}
                />
                <DatePicker
                  label="End Date"
                  value={endDate}
                  onChange={setEndDate}
                  renderInput={(params) => <TextField {...params} />}
                />
              </LocalizationProvider>
              <FormControl sx={{ minWidth: 120 }}>
                <InputLabel>Filter</InputLabel>
                <Select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  label="Filter"
                >
                  <MenuItem value="all">All</MenuItem>
                  <MenuItem value="present">Present</MenuItem>
                  <MenuItem value="absent">Absent</MenuItem>
                </Select>
              </FormControl>
              <TextField
                label="Search Student"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Button
                variant="contained"
                startIcon={<FileDownloadIcon />}
                onClick={handleExport}
              >
                Export
              </Button>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="subtitle1">
                Camera Feed
              </Typography>
              <Box>
                <IconButton onClick={toggleStream} size="small">
                  {isStreaming ? <VideocamOffIcon /> : <VideocamIcon />}
                </IconButton>
                <IconButton onClick={captureSnapshot} size="small">
                  <CameraIcon />
                </IconButton>
                <IconButton onClick={() => setShowSettings(!showSettings)} size="small">
                  <SettingsIcon />
                </IconButton>
              </Box>
            </Box>
            <Box sx={{ position: 'relative', width: '100%', height: 300, bgcolor: 'black' }}>
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

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Typography variant="subtitle1" align="center" gutterBottom>
              Attendance Overview
            </Typography>
            <Box sx={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle1" align="center" gutterBottom>
              Weekly Attendance Trend
            </Typography>
            <Box sx={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={attendanceData.weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="present" fill="#0088FE" name="Present" />
                  <Bar dataKey="absent" fill="#FF8042" name="Absent" />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Detailed Activity Log
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Time</TableCell>
                    <TableCell>Student</TableCell>
                    <TableCell>Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredActivity.map((activity, index) => (
                    <TableRow key={index}>
                      <TableCell>{activity.time}</TableCell>
                      <TableCell>{activity.student}</TableCell>
                      <TableCell>{activity.action}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );

  if (loading) {
    return (
      <BaseWidget title="Student Attendance" icon={<SchoolIcon />}>
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      </BaseWidget>
    );
  }

  return (
    <BaseWidget
      title="Student Attendance"
      icon={<SchoolIcon />}
      summary={summaryContent}
      expandable={true}
    >
      {expandedContent}
    </BaseWidget>
  );
};

export default StudentAttendanceWidget;
