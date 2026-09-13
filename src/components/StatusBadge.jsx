import { Chip, Box, Typography } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import ErrorIcon from '@mui/icons-material/Error';
import InfoIcon from '@mui/icons-material/Info';
import CircleIcon from '@mui/icons-material/Circle';
import {
  FEASIBILITY_CONFIG,
  CONFIDENCE_CONFIG,
  COUNTER_STATUS_CONFIG,
  QUEUE_STATUS_CONFIG,
} from '../utils/constants';

/**
 * StatusBadge - displays status indicators with icon + text
 * Supports: feasibility, confidence, counter status, queue status
 */

export function FeasibilityBadge({ status, showDescription = false, size = 'medium' }) {
  const config = FEASIBILITY_CONFIG[status];
  if (!config) return null;

  const icons = {
    success: <CheckCircleIcon fontSize="small" />,
    warning: <WarningAmberIcon fontSize="small" />,
    error: <ErrorIcon fontSize="small" />,
  };

  return (
    <Box>
      <Chip
        icon={icons[config.color]}
        label={config.label}
        color={config.color}
        variant="outlined"
        size={size}
        sx={{
          fontWeight: 600,
          borderWidth: 2,
          '& .MuiChip-icon': { fontSize: size === 'small' ? 16 : 20 },
        }}
      />
      {showDescription && (
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          {config.description}
        </Typography>
      )}
    </Box>
  );
}

export function ConfidenceBadge({ level, size = 'small' }) {
  const config = CONFIDENCE_CONFIG[level];
  if (!config) return null;

  return (
    <Chip
      label={`${config.icon} ${config.label}`}
      size={size}
      variant="outlined"
      sx={{
        fontWeight: 500,
        color: 'text.secondary',
        borderColor: 'divider',
      }}
    />
  );
}

export function CounterStatusBadge({ status, size = 'small' }) {
  const config = COUNTER_STATUS_CONFIG[status];
  if (!config) return null;

  return (
    <Chip
      icon={<CircleIcon sx={{ fontSize: '10px !important' }} />}
      label={config.label}
      color={config.color}
      variant="outlined"
      size={size}
      sx={{ fontWeight: 600 }}
    />
  );
}

export function QueueStatusBadge({ status, size = 'small' }) {
  const config = QUEUE_STATUS_CONFIG[status];
  if (!config) return null;

  return (
    <Chip
      label={config.label}
      color={config.color}
      size={size}
      sx={{ fontWeight: 600 }}
    />
  );
}

export function LiveBadge() {
  return (
    <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.75 }}>
      <Box
        sx={{
          width: 8,
          height: 8,
          borderRadius: '50%',
          bgcolor: 'success.main',
          animation: 'pulse 1.5s ease-in-out infinite',
          '@keyframes pulse': {
            '0%, 100%': { opacity: 1 },
            '50%': { opacity: 0.4 },
          },
        }}
      />
      <Typography variant="caption" sx={{ fontWeight: 700, color: 'success.main', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        Live
      </Typography>
    </Box>
  );
}
