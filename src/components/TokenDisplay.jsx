import { Box, Typography, Paper } from '@mui/material';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';

/**
 * TokenDisplay - shows the student's digital token
 * The token is a feature, NOT the main product.
 * It's shown alongside the actual estimation data.
 */
export default function TokenDisplay({ tokenNumber, position, compact = false }) {
  if (!tokenNumber) return null;

  if (compact) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <ConfirmationNumberIcon color="primary" fontSize="small" />
        <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main' }}>
          {tokenNumber}
        </Typography>
        {position !== undefined && (
          <Typography variant="body2" color="text.secondary">
            · Position {position}
          </Typography>
        )}
      </Box>
    );
  }

  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        borderRadius: 3,
        background: 'linear-gradient(135deg, #1a73e8 0%, #7c4dff 100%)',
        color: 'white',
        textAlign: 'center',
      }}
    >
      <Typography variant="overline" sx={{ opacity: 0.85, letterSpacing: '0.1em', fontWeight: 600 }}>
        Your Token
      </Typography>
      <Typography variant="h2" sx={{ fontWeight: 800, my: 1, letterSpacing: '0.02em' }}>
        {tokenNumber}
      </Typography>
      {position !== undefined && (
        <Typography variant="body1" sx={{ opacity: 0.9, fontWeight: 500 }}>
          Position {position} in queue
        </Typography>
      )}
    </Paper>
  );
}
