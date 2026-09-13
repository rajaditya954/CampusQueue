import { Container, Box, Typography, Button, Paper } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import HomeIcon from '@mui/icons-material/Home';

export function NotFound() {
  const navigate = useNavigate();

  return (
    <Container maxWidth="sm" sx={{ py: 8, textAlign: 'center' }}>
      <Paper elevation={0} sx={{ p: 5, borderRadius: 4, border: '1px solid', borderColor: 'divider' }}>
        <Typography variant="h1" fontWeight={800} color="primary.main" gutterBottom>
          404
        </Typography>
        <Typography variant="h5" fontWeight={700} gutterBottom>
          Page Not Found
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          The requested campus queue page does not exist or has been moved.
        </Typography>
        <Button
          variant="contained"
          size="large"
          startIcon={<HomeIcon />}
          onClick={() => navigate('/')}
          sx={{ borderRadius: 3, fontWeight: 700, textTransform: 'none' }}
        >
          Return to Home
        </Button>
      </Paper>
    </Container>
  );
}

export default NotFound;
