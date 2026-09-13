import { Box, Typography, Avatar, Tooltip } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import PersonIcon from '@mui/icons-material/Person';
import { QUEUE_STATUS } from '../utils/constants';

/**
 * QueueProgress - visual progress indicator showing queue movement
 * Shows completed, current, and waiting entries
 */
export default function QueueProgress({ entries, currentEntryId, maxVisible = 8 }) {
  if (!entries || entries.length === 0) return null;

  // Sort by joinedAt
  const sorted = [...entries].sort((a, b) => new Date(a.joinedAt) - new Date(b.joinedAt));

  // Find current index
  const currentIndex = sorted.findIndex(e => e.id === currentEntryId);

  // Determine visible window
  let visibleEntries;
  if (sorted.length <= maxVisible) {
    visibleEntries = sorted;
  } else if (currentIndex >= 0) {
    const start = Math.max(0, currentIndex - 3);
    const end = Math.min(sorted.length, start + maxVisible);
    visibleEntries = sorted.slice(start, end);
  } else {
    visibleEntries = sorted.slice(0, maxVisible);
  }

  const getEntryState = (entry) => {
    if (entry.id === currentEntryId) return 'current';
    if ([QUEUE_STATUS.COMPLETED].includes(entry.status)) return 'completed';
    if ([QUEUE_STATUS.IN_SERVICE, QUEUE_STATUS.CALLED].includes(entry.status)) return 'active';
    if ([QUEUE_STATUS.SKIPPED, QUEUE_STATUS.CANCELLED, QUEUE_STATUS.NO_SHOW].includes(entry.status)) return 'skipped';
    return 'waiting';
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
      {visibleEntries.map((entry, index) => {
        const state = getEntryState(entry);
        return (
          <Box
            key={entry.id}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              py: 0.75,
              px: 1.5,
              borderRadius: 2,
              transition: 'all 0.2s ease',
              ...(state === 'current' && {
                bgcolor: 'primary.main',
                color: 'white',
                '& .MuiTypography-root': { color: 'white' },
              }),
              ...(state === 'completed' && {
                opacity: 0.5,
              }),
              ...(state === 'skipped' && {
                opacity: 0.3,
                textDecoration: 'line-through',
              }),
            }}
          >
            {/* Icon */}
            <Box sx={{ flexShrink: 0, display: 'flex', alignItems: 'center' }}>
              {state === 'completed' ? (
                <CheckCircleIcon sx={{ fontSize: 20, color: state === 'current' ? 'white' : 'success.main' }} />
              ) : state === 'current' ? (
                <PersonIcon sx={{ fontSize: 20, color: 'white' }} />
              ) : (
                <RadioButtonUncheckedIcon sx={{ fontSize: 20, color: 'text.disabled' }} />
              )}
            </Box>

            {/* Token */}
            <Typography
              variant="body2"
              sx={{
                fontWeight: state === 'current' ? 700 : 500,
                fontFamily: '"Inter", monospace',
                minWidth: 48,
              }}
            >
              {entry.tokenNumber}
            </Typography>

            {/* Status label */}
            {state === 'current' && (
              <Typography variant="caption" sx={{ fontWeight: 700, ml: 'auto' }}>
                YOU
              </Typography>
            )}
            {state === 'completed' && (
              <Typography variant="caption" color="text.secondary" sx={{ ml: 'auto' }}>
                ✓
              </Typography>
            )}
          </Box>
        );
      })}

      {sorted.length > maxVisible && (
        <Typography variant="caption" color="text.secondary" sx={{ textAlign: 'center', mt: 0.5 }}>
          {sorted.length - maxVisible} more in queue
        </Typography>
      )}
    </Box>
  );
}
