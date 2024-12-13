import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  IconButton,
  Collapse,
  Typography,
  useTheme,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Settings as SettingsIcon,
  Close as CloseIcon,
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';
import Draggable from 'react-draggable';

const BaseWidget = ({
  title,
  icon: Icon,
  onClose,
  onSettings,
  onBack,
  expanded: controlledExpanded,
  onExpandChange,
  children,
  headerProps = {},
  contentProps = {},
  size = 'medium',
}) => {
  const theme = useTheme();
  const [internalExpanded, setInternalExpanded] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const isControlled = controlledExpanded !== undefined;
  const expanded = isControlled ? controlledExpanded : internalExpanded;

  const handleExpandClick = () => {
    if (isControlled) {
      onExpandChange?.(!expanded);
    } else {
      setInternalExpanded(!expanded);
    }
  };

  const handleDrag = (e, data) => {
    setPosition({ x: data.x, y: data.y });
  };

  const sizes = {
    small: { width: '300px', minHeight: '180px', expandedHeight: '400px' },
    medium: { width: '400px', minHeight: '250px', expandedHeight: '500px' },
    large: { width: '600px', minHeight: '300px', expandedHeight: '600px' },
  };

  const currentSize = sizes[size] || sizes.medium;

  const cardContent = (
    <Card
      sx={{
        width: currentSize.width,
        minHeight: currentSize.minHeight,
        height: expanded ? currentSize.expandedHeight : currentSize.minHeight,
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        transition: theme.transitions.create(['height', 'width'], {
          duration: theme.transitions.duration.standard,
        }),
        overflow: 'hidden',
        '&:hover': {
          boxShadow: theme.shadows[8],
        },
      }}
    >
      <CardHeader
        sx={{
          flexShrink: 0,
          height: '64px',
          p: 2,
          bgcolor: theme.palette.primary.light,
          color: theme.palette.primary.contrastText,
        }}
        avatar={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {onBack && (
              <IconButton 
                onClick={onBack} 
                size="small" 
                sx={{ color: theme.palette.primary.contrastText }}
              >
                <ArrowBackIcon />
              </IconButton>
            )}
            {Icon && <Icon />}
          </Box>
        }
        action={
          <Box>
            {onSettings && (
              <IconButton 
                onClick={onSettings} 
                size="small"
                sx={{ color: theme.palette.primary.contrastText }}
              >
                <SettingsIcon />
              </IconButton>
            )}
            <IconButton
              onClick={handleExpandClick}
              sx={{
                transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: theme.transitions.create('transform', {
                  duration: theme.transitions.duration.shortest,
                }),
                color: theme.palette.primary.contrastText,
              }}
              size="small"
            >
              <ExpandMoreIcon />
            </IconButton>
            {onClose && (
              <IconButton 
                onClick={onClose} 
                size="small"
                sx={{ color: theme.palette.primary.contrastText }}
              >
                <CloseIcon />
              </IconButton>
            )}
          </Box>
        }
        title={
          <Typography variant="subtitle1" component="div" sx={{ color: theme.palette.primary.contrastText }}>
            {title}
          </Typography>
        }
        {...headerProps}
      />
      <Collapse 
        in={expanded} 
        timeout="auto" 
        sx={{
          flexGrow: 1,
          overflowY: 'auto',
        }}
      >
        <CardContent
          sx={{
            height: '100%',
            p: 2,
            '&:last-child': {
              pb: 2,
            },
          }}
          {...contentProps}
        >
          {children}
        </CardContent>
      </Collapse>
      {!expanded && (
        <CardContent
          sx={{
            flexGrow: 1,
            p: 2,
            '&:last-child': {
              pb: 2,
            },
          }}
          {...contentProps}
        >
          {children}
        </CardContent>
      )}
    </Card>
  );

  return (
    <Draggable
      position={position}
      onDrag={handleDrag}
      bounds="parent"
      handle=".MuiCardHeader-root"
    >
      <div style={{ position: 'absolute' }}>
        {cardContent}
      </div>
    </Draggable>
  );
};

export default BaseWidget;
