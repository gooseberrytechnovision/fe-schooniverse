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

        <Grid item xs={12} md={6}>
          <Box sx={{ mb: 4 }}>
            <Typography variant="h4" gutterBottom>
              Our Mission
            </Typography>
            <Typography variant="body1" paragraph>
              At Schooniverse, we are dedicated to revolutionizing the educational experience by providing innovative solutions that connect schools, students, and parents. Our mission is to create a seamless, efficient, and engaging platform that enhances the learning journey for everyone involved.
            </Typography>
          </Box>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Box sx={{ mb: 4 }}>
            <Typography variant="h4" gutterBottom>
              Our Vision
            </Typography>
            <Typography variant="body1" paragraph>
              We envision a world where education is accessible, efficient, and enjoyable for all. Through our comprehensive platform, we aim to bridge the gap between traditional education and modern technology, making learning more interactive and effective.
            </Typography>
          </Box>
        </Grid>

        <Grid item xs={12}>
          <Box sx={{ mb: 4 }}>
            <Typography variant="h4" gutterBottom>
              What We Do
            </Typography>
            <Typography variant="body1" paragraph>
              Schooniverse provides a comprehensive suite of tools and services designed to streamline school operations, enhance communication between stakeholders, and improve the overall educational experience. From student management to parent-teacher communication, we offer solutions that make education more efficient and effective.
            </Typography>
          </Box>
        </Grid>

        <Grid item xs={12}>
          <Box sx={{ mb: 4 }}>
            <Typography variant="h4" gutterBottom>
              Our Values
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <Typography variant="h6" gutterBottom>
                  Innovation
                </Typography>
                <Typography variant="body2">
                  We constantly strive to bring innovative solutions to the education sector.
                </Typography>
              </Grid>
              <Grid item xs={12} md={4}>
                <Typography variant="h6" gutterBottom>
                  Excellence
                </Typography>
                <Typography variant="body2">
                  We are committed to delivering excellence in everything we do.
                </Typography>
              </Grid>
              <Grid item xs={12} md={4}>
                <Typography variant="h6" gutterBottom>
                  Integrity
                </Typography>
                <Typography variant="body2">
                  We maintain the highest standards of integrity in all our operations.
                </Typography>
              </Grid>
            </Grid>
          </Box>
        </Grid>
      </Grid>
    </Container>
  );
};

export default AboutUs; 