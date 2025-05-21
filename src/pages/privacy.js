import React from 'react';
import { Container, Typography, Box, Paper } from '@mui/material';

const PrivacyPolicy = () => {
  return (
    <Container maxWidth="lg" sx={{ py: 8 }}>
      <Typography variant="h2" component="h1" gutterBottom align="center" sx={{ mb: 6 }}>
        Privacy Policy
      </Typography>

      <Paper elevation={3} sx={{ p: 4 }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="body1" paragraph>
            Gray quest is our payment gateway partner.
          </Typography>
          <Typography variant="body1" paragraph>
            We value your privacy and are committed to protecting your personal data. This policy explains how we collect, use, and protect the information you share with us.
          </Typography>
        </Box>

        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" gutterBottom>
            Information Collection & Use
          </Typography>
          <Typography variant="body1" paragraph>
            We collect personal information to process your orders and provide better services. This may include your name, contact details, and usage patterns on our website.
          </Typography>
        </Box>

        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" gutterBottom>
            Use of Cookies
          </Typography>
          <Typography variant="body1" paragraph>
            We use cookies to improve your browsing experience. Cookies help us remember your preferences, analyze site traffic, and show relevant content. You can manage or disable cookies in your browser settings.
          </Typography>
        </Box>

        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" gutterBottom>
            Data Protection
          </Typography>
          <Typography variant="body1" paragraph>
            Your data is stored securely. Only authorized staff have access to personal information, and misuse is subject to strict disciplinary action.
          </Typography>
        </Box>

        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" gutterBottom>
            IP Address
          </Typography>
          <Typography variant="body1" paragraph>
            We may use your IP address to diagnose server problems and to manage the website more effectively.
          </Typography>
        </Box>

        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" gutterBottom>
            Third-Party Sites
          </Typography>
          <Typography variant="body1" paragraph>
            This policy applies only to our website. We are not responsible for the privacy practices of other websites linked from ours.
          </Typography>
        </Box>

        <Box>
          <Typography variant="body1" paragraph>
            By using this site, you consent to the terms of this Privacy Policy.
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default PrivacyPolicy; 