import { useState, useEffect, useCallback } from 'react';
import { Box, Typography, Paper, Divider, Stack, IconButton, Tooltip, Alert } from '@mui/material';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PeopleIcon from '@mui/icons-material/People';
import EventIcon from '@mui/icons-material/Event';
import BuildIcon from '@mui/icons-material/Build';
import DirectionsWalkIcon from '@mui/icons-material/DirectionsWalk';
import RefreshIcon from '@mui/icons-material/Refresh';
import { FeasibilityBadge, ConfidenceBadge } from './StatusBadge';
import { formatTime, formatDuration } from '../utils/formatters';

/**
 * EstimationCard - the primary component showing queue estimates.
 * Now features live auto-updating time and an interactive Refresh button
 * so students don't need to reload the page.
 */
export default function EstimationCard({ estimation, showDetails = true, onRefresh }) {
  const [now, setNow] = useState(() => new Date());
  const [spinning, setSpinning] = useState(false);

  // Auto-refresh the current time every 10 seconds so estimates remain live
  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 10000);
    return () => clearInterval(timer);
  }, []);

  const handleManualRefresh = useCallback(() => {
    setSpinning(true);
    setNow(new Date());
    if (onRefresh) {
      onRefresh();
    }
    setTimeout(() => setSpinning(false), 500);
  }, [onRefresh]);

  if (!estimation) return null;

  const {
    peopleAhead,
    estimatedWaitMinutes,
    estimatedServiceMinutes,
    feasibility,
    confidence,
    closingTime,
    isCounterClosed: propIsCounterClosed,
    isCounterPaused: propIsCounterPaused,
    counterStatus,
  } = estimation;

  const isClosed = propIsCounterClosed || counterStatus === 'CLOSED' || feasibility === 'CLOSED';
  const isPaused = propIsCounterPaused || counterStatus === 'PAUSED' || feasibility === 'PAUSED';

  // Calculate live times dynamically from current clock time `now`
  const dynamicServiceStart = new Date(now.getTime() + (estimatedWaitMinutes || 0) * 60000);
  const dynamicCompletion = new Date(now.getTime() + ((estimatedWaitMinutes || 0) + (estimatedServiceMinutes || 0)) * 60000);

  const formattedLastUpdated = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  // Metric display values based on counter operational status
  const waitTimeDisplay = isClosed
    ? 'Unavailable (Counter Closed)'
    : isPaused
    ? `${formatDuration(estimatedWaitMinutes)} (Paused)`
    : formatDuration(estimatedWaitMinutes);

  const serviceStartDisplay = isClosed
    ? 'Unavailable (Counter Closed)'
    : isPaused
    ? `${formatTime(dynamicServiceStart)} (Paused)`
    : formatTime(dynamicServiceStart);

  const completionDisplay = isClosed
    ? 'Unavailable (Counter Closed)'
    : isPaused
    ? `${formatTime(dynamicCompletion)} (Paused)`
    : formatTime(dynamicCompletion);

  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 3, sm: 4 },
        borderRadius: 4,
        border: '1px solid',
        borderColor: isClosed ? 'error.light' : isPaused ? 'warning.light' : 'divider',
        bgcolor: 'background.paper',
        boxShadow: '0 4px 20px rgba(15, 23, 42, 0.04)',
      }}
    >
      {/* Header bar with Live indicator and Refresh Button */}
      <Box
        sx={{
          display: 'flex',
          justify: 'space-between',
          alignItems: 'center',
          mb: 2.5,
          pb: 2,
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
          <Box
            sx={{
              width: 10,
              height: 10,
              borderRadius: '50%',
              bgcolor: isClosed ? 'error.main' : isPaused ? 'warning.main' : 'success.main',
              boxShadow: isClosed
                ? '0 0 10px rgba(239, 68, 68, 0.8)'
                : isPaused
                ? '0 0 10px rgba(245, 158, 11, 0.8)'
                : '0 0 10px rgba(76, 175, 80, 0.9)',
            }}
          />
          <Typography variant="h6" fontWeight={800} color="text.primary" sx={{ fontSize: '1.2rem' }}>
            {isClosed ? 'Counter Closed — Status' : 'Real-Time Estimates'}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.82rem', fontWeight: 600 }}>
            Updated {formattedLastUpdated}
          </Typography>
          <Tooltip title="Refresh Current Time & Estimates">
            <IconButton
              size="small"
              onClick={handleManualRefresh}
              color="primary"
              sx={{
                p: 0.75,
                bgcolor: 'action.hover',
                '&:hover': { bgcolor: 'action.selected' },
              }}
            >
              <RefreshIcon
                fontSize="small"
                sx={{
                  transition: 'transform 0.5s ease',
                  transform: spinning ? 'rotate(360deg)' : 'none',
                }}
              />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Operational status alerts */}
      {isClosed && (
        <Alert severity="error" sx={{ mb: 2.5, borderRadius: 2 }}>
          <strong>Counter is Currently Closed:</strong> This counter is not serving tokens right now. Service and wait estimates will resume once the counter is reopened.
        </Alert>
      )}
      {isPaused && (
        <Alert severity="warning" sx={{ mb: 2.5, borderRadius: 2 }}>
          <strong>Counter is Paused:</strong> Token calling is temporarily paused at this counter.
        </Alert>
      )}

      {/* Main Metrics */}
      <Stack spacing={3}>
        {/* People Ahead */}
        <MetricRow
          icon={<PeopleIcon color="action" sx={{ fontSize: '1.8rem' }} />}
          label="Current queue"
          value={`${peopleAhead} ${peopleAhead === 1 ? 'person' : 'people'}`}
        />

        {/* Estimated Wait */}
        <MetricRow
          icon={<AccessTimeIcon color={isClosed ? 'error' : 'action'} sx={{ fontSize: '1.8rem' }} />}
          label="Estimated waiting time"
          value={waitTimeDisplay}
          highlight={!isClosed && !isPaused}
        />

        {showDetails && (
          <>
            {/* Service Time */}
            <MetricRow
              icon={<BuildIcon color="action" sx={{ fontSize: '1.8rem' }} />}
              label="Your estimated service time"
              value={formatDuration(estimatedServiceMinutes)}
            />

            <Divider />

            {/* Estimated Counter Approach Time */}
            <MetricRow
              icon={<DirectionsWalkIcon color={isClosed ? 'disabled' : 'primary'} sx={{ fontSize: '2.2rem' }} />}
              label="Estimated counter approach time"
              value={serviceStartDisplay}
              highlight={!isClosed && !isPaused}
              large={!isClosed}
            />

            {/* Completion Time */}
            <MetricRow
              icon={<EventIcon color="action" sx={{ fontSize: '1.8rem' }} />}
              label="Estimated completion"
              value={completionDisplay}
            />

            {/* Counter Closing */}
            {closingTime && (
              <MetricRow
                icon={<EventIcon color="action" sx={{ fontSize: '1.8rem' }} />}
                label="Counter closes"
                value={formatTime(closingTime)}
              />
            )}

            <Divider />

            {/* Feasibility */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
              <FeasibilityBadge status={feasibility} showDescription />
            </Box>

            {/* Confidence */}
            <Box sx={{ display: 'flex', justifyContent: 'flex-start' }}>
              <ConfidenceBadge level={confidence} />
            </Box>
          </>
        )}
      </Stack>
    </Paper>
  );
}

function MetricRow({ icon, label, value, highlight = false, large = false }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5 }}>
      <Box sx={{ flexShrink: 0, display: 'flex', alignItems: 'center' }}>
        {icon}
      </Box>
      <Box sx={{ flex: 1 }}>
        <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.9rem', fontWeight: 600, mb: 0.25 }}>
          {label}
        </Typography>
        <Typography
          variant={large ? 'h4' : 'h5'}
          sx={{
            fontWeight: highlight ? 800 : 700,
            color: highlight ? 'primary.main' : 'text.primary',
            fontSize: large ? '2rem' : '1.35rem',
            lineHeight: 1.2,
          }}
        >
          {value}
        </Typography>
      </Box>
    </Box>
  );
}
