import React from 'react';
import { Container, Typography, Box, Grid } from '@mui/material';

const AboutUs = () => {
  return (
    <Container maxWidth="lg" sx={{ py: 8 }}>
      <Typography variant="h2" component="h1" gutterBottom align="center" sx={{ mb: 6 }}>
        About Us
      </Typography>
      
      <Grid container spacing={4}>
        <Grid item xs={12}>
          <Box sx={{ mb: 4 }}>
            <Typography variant="h4" gutterBottom>
              Legal Name
            </Typography>
            <Typography variant="body1" paragraph>
              Thathva Industries
            </Typography>
          </Box>
        </Grid>
      </Grid>
    </Container>
  );
};

export default AboutUs; 