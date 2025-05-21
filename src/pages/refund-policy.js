import React from 'react';
import { Container, Typography, Box, Paper } from '@mui/material';

const RefundPolicy = () => {
  return (
    <Container maxWidth="lg" sx={{ py: 8 }}>
      <Typography variant="h2" component="h1" gutterBottom align="center" sx={{ mb: 6 }}>
        Refund and Cancellation Policy
      </Typography>

      <Paper elevation={3} sx={{ p: 4 }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" gutterBottom>
            Return Policy
          </Typography>
          <Typography variant="body1" paragraph>
            Product must be returned to us within 7 days from the date it has been delivered to the customer. Product must be returned with all tags attached in its original condition along with all packing material, courier receipt, invoice & other papers.
          </Typography>
        </Box>

        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" gutterBottom>
            Refund Process
          </Typography>
          <Typography variant="body1" paragraph>
            Once the Product is received to the company successfully, Thathva Industries will instantly initiate the refund to your source account or chosen method of refund within 7 working days.
          </Typography>
        </Box>

        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" gutterBottom>
            Refund and Cancellation for Service Provider Company
          </Typography>
          <Typography variant="body1" paragraph>
            Due to service providers in nature "NO REFUND", "NO CANCELLATION" will be entertained once the Payment has been made.
          </Typography>
        </Box>

        <Box>
          <Typography variant="h4" gutterBottom>
            Cancellation Policy
          </Typography>
          <Typography variant="body1" paragraph>
            Please note an order can only be cancelled within 24 hours of placing the order. Once the order is processed after 24 hours, no cancellation request will be entertained. However, return is possible for all orders/products.
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default RefundPolicy; 