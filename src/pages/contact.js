import React from 'react';
import { Container, Typography, Box, Grid, Paper } from '@mui/material';
import { Email, LocationOn, Phone } from '@mui/icons-material';

const ContactUs = () => {
  return (
    <Container maxWidth="lg" sx={{ py: 8 }}>
      <Typography variant="h2" component="h1" gutterBottom align="center" sx={{ mb: 6 }}>
        Contact Us
      </Typography>

      <Grid container spacing={6} justifyContent="center">
        <Grid item xs={12} md={8}>
          <Paper elevation={3} sx={{ p: 4 }}>
            <Box sx={{ mb: 4 }}>
              <Typography variant="h4" gutterBottom>
                Contact Information
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                <LocationOn sx={{ mr: 2, color: 'primary.main', mt: 0.5 }} />
                <Typography variant="body1">
                  Building No./Flat No.: 14-300/36/A/1,<br />
                  Road/Street: Bollaramm Village Road<br />
                  City/Town/Village: Hyderabad<br />
                  District: Sangareddy<br />
                  State: Telangana<br />
                  PIN Code: 502325
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Email sx={{ mr: 2, color: 'primary.main' }} />
                <Typography variant="body1">
                  support@thathvauniforms.com
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Phone sx={{ mr: 2, color: 'primary.main' }} />
                <Typography variant="body1">
                  +91 90100 38559
                </Typography>
              </Box>
            </Box>

            <Box>
              <Typography variant="h4" gutterBottom>
                Business Hours
              </Typography>
              <Typography variant="body1" paragraph>
                Monday - Friday: 9:00 AM - 6:00 PM<br />
                Saturday: 10:00 AM - 4:00 PM<br />
                Sunday: Closed
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default ContactUs; 