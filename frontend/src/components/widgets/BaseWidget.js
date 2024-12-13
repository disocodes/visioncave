import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  IconButton,
  Typography,
  Menu,
  MenuItem,
  Collapse,
  Tooltip,
} from '@mui/material';
import {
  MoreVert as MoreIcon,
  Delete as DeleteIcon,
  OpenInFull as ExpandIcon,
  CloseFullscreen as CollapseIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';

const BaseWidget = ({
  title,
  summary,
  children,
  onDelete,
  expandable = true,
  configurable = true,
  className,
  sx = {},
}) => {
  const [expanded, setExpanded] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [showSettings, setShowSettings] = useState(false);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleDelete = () => {
    handleMenuClose();
    onDelete?.();
  };

  const handleExpand = () => {
    setExpanded(!expanded);
  };

  const handleSettings = () => {
    handleMenuClose();
    setShowSettings(!showSettings);
  };

  return (
    <Card
      className={className}
      sx={{
        position: 'relative',
        height: expanded ? 'calc(100% - 16px)' : 'auto',
        minHeight: '300px',
        display: 'flex',
        flexDirection: 'column',
        transition: 'all 0.3s ease',
        ...sx,
      }}
    >
      <CardContent sx={{ p: 0, '&:last-child': { pb: 0 }, flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Widget Header */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            p: 2,
            borderBottom: 1,
            borderColor: 'divider',
            flexShrink: 0,
          }}
        >
          <Typography variant="h6" component="div" gutterBottom>
            {title}
          </Typography>
          <Box>
            {expandable && (
              <Tooltip title={expanded ? 'Collapse' : 'Expand'}>
                <IconButton onClick={handleExpand} size="small">
                  {expanded ? <CollapseIcon /> : <ExpandIcon />}
                </IconButton>
              </Tooltip>
            )}
            <IconButton
              aria-label="widget menu"
              aria-controls="widget-menu"
              aria-haspopup="true"
              onClick={handleMenuOpen}
              size="small"
            >
              <MoreIcon />
            </IconButton>
          </Box>
        </Box>

        {/* Widget Menu */}
        <Menu
          id="widget-menu"
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
        >
          {configurable && (
            <MenuItem onClick={handleSettings}>
              <SettingsIcon fontSize="small" sx={{ mr: 1 }} />
              Settings
            </MenuItem>
          )}
          <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
            <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
            Delete
          </MenuItem>
        </Menu>

        {/* Widget Content Container */}
        <Box sx={{ 
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}>
          {/* Widget Summary (shown when not expanded) */}
          {!expanded && summary && (
            <Box sx={{ px: 2, py: 1, flexShrink: 0 }}>
              {summary}
            </Box>
          )}

          {/* Widget Content */}
          <Collapse 
            in={expanded || !summary} 
            collapsedSize={0}
            sx={{ 
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              overflow: 'auto'
            }}
          >
            <Box sx={{ 
              p: 2,
              flex: 1,
              display: 'flex',
              flexDirection: 'column'
            }}>
              {children}
            </Box>
          </Collapse>
        </Box>
      </CardContent>
    </Card>
  );
};

export default BaseWidget;
