import { Card, CardContent, CardActionArea, Box, Typography, Chip, Stack } from '@mui/material';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PeopleIcon from '@mui/icons-material/People';
import { SERVICE_ICONS } from '../utils/constants';
import { CounterStatusBadge } from './StatusBadge';
import { formatDurationRange } from '../utils/formatters';

/**
 * ServiceCard - displays a service with queue info on the student dashboard
 */
export default function ServiceCard({
  service,
  waitingCount = 0,
  estimatedWait = null,
  counterStatus = null,
  hasActiveToken = false,
  onClick,
}) {
  const icon = SERVICE_ICONS[service.name] || SERVICE_ICONS.default;

  return (
    <Card
      elevation={0}
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 3,
        border: '1px solid',
        borderColor: hasActiveToken ? '#2563eb' : 'rgba(226, 232, 240, 0.8)',
        bgcolor: 'background.paper',
        boxShadow: hasActiveToken ? '0 4px 14px rgba(37, 99, 235, 0.12)' : '0 1px 3px rgba(0,0,0,0.02)',
        transition: 'all 0.2s ease-in-out',
        '&:hover': onClick ? {
          transform: 'translateY(-3px)',
          boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.08)',
          borderColor: '#2563eb',
        } : {},
      }}
    >
      <CardActionArea
        onClick={onClick}
        disabled={!onClick}
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'stretch',
          p: 0,
        }}
      >
        <CardContent sx={{ p: 3, flex: 1, display: 'flex', flexDirection: 'column' }}>
          {/* Header */}
          <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 1.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box
                sx={{
                  width: 44,
                  height: 44,
                  borderRadius: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.5rem',
                  bgcolor: 'primary.main',
                  background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
                  color: 'white',
                  flexShrink: 0,
                }}
              >
                {icon}
              </Box>
              <Box>
                <Typography variant="h6" sx={{ fontSize: '1rem', lineHeight: 1.3 }}>
                  {service.name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Usually {formatDurationRange(service.minimumProcessingTime, service.maximumProcessingTime)}
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* Description */}
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2, flex: 1, fontSize: '0.8rem' }}>
            {service.description}
          </Typography>

          {/* Queue Info */}
          <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', mt: 'auto', flexWrap: 'wrap', gap: 0.5 }}>
            {hasActiveToken && (
              <Chip
                label="Token Active"
                size="small"
                color="info"
                sx={{ fontWeight: 700, fontSize: '0.7rem' }}
              />
            )}
            <Chip
              icon={<PeopleIcon sx={{ fontSize: '16px !important' }} />}
              label={`${waitingCount} waiting`}
              size="small"
              variant="outlined"
              sx={{ fontWeight: 500 }}
            />
            {estimatedWait !== null && (
              <Chip
                icon={<AccessTimeIcon sx={{ fontSize: '16px !important' }} />}
                label={`~${estimatedWait} min`}
                size="small"
                variant="outlined"
                color={estimatedWait > 30 ? 'warning' : 'default'}
                sx={{ fontWeight: 500 }}
              />
            )}
            {counterStatus && (
              <CounterStatusBadge status={counterStatus} />
            )}
          </Stack>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}
