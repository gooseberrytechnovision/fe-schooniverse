import React from 'react';
import { Container, Typography, Box, Paper } from '@mui/material';

const TermsAndConditions = () => {
  return (
    <Container maxWidth="lg" sx={{ py: 8 }}>
      <Typography variant="h2" component="h1" gutterBottom align="center" sx={{ mb: 6 }}>
        Terms & Conditions
      </Typography>

      <Paper elevation={3} sx={{ p: 4 }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="body1" paragraph>
            Welcome to our website. By using this site, you agree to the following terms and conditions:
          </Typography>
        </Box>

        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" gutterBottom>
            1. Eligibility
          </Typography>
          <Typography variant="body1" paragraph>
            You must be legally competent to enter into a contract under Indian law. If you're under 18 or otherwise ineligible, you should not use this site.
          </Typography>
        </Box>

        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" gutterBottom>
            2. Registration
          </Typography>
          <Typography variant="body1" paragraph>
            You may shop as a guest or register on the site. If you register, you must provide accurate and complete information.
          </Typography>
        </Box>

        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" gutterBottom>
            3. Communication
          </Typography>
          <Typography variant="body1" paragraph>
            By using the site or contacting us electronically, you consent to receive communications from us electronically as needed.
          </Typography>
        </Box>

        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" gutterBottom>
            4. User Submissions
          </Typography>
          <Typography variant="body1" paragraph>
            Any reviews, feedback, or suggestions you share with us may be used by us in any form. We are not obligated to keep them confidential or compensate you.
          </Typography>
        </Box>

        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" gutterBottom>
            5. Content Ownership
          </Typography>
          <Typography variant="body1" paragraph>
            Once submitted, your content becomes our property and may be used, modified, or published by us for any purpose.
          </Typography>
        </Box>

        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" gutterBottom>
            6. Product Information
          </Typography>
          <Typography variant="body1" paragraph>
            We do our best to ensure accuracy in product details and pricing. However, errors may occur. We reserve the right to correct any information and cancel orders if needed.
          </Typography>
        </Box>

        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" gutterBottom>
            7. Policy Changes
          </Typography>
          <Typography variant="body1" paragraph>
            We may update our terms and policies at any time. Continued use of the website implies acceptance of any such changes.
          </Typography>
        </Box>

        <Box>
          <Typography variant="h4" gutterBottom>
            8. Contact Information
          </Typography>
          <Typography variant="body1" paragraph>
            If you have any questions about these Terms and Conditions, please contact us at support@thathvauniforms.com
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default TermsAndConditions; 