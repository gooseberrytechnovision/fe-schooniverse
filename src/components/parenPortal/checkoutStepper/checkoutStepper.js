import React from "react";
import { Stepper, Step, StepLabel } from "@mui/material";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import PaymentIcon from "@mui/icons-material/Payment";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

const steps = ["Cart", "Place Order"];

const StepIcons = {
  1: <ShoppingCartIcon />,
  2: <CheckCircleIcon />,
};

const CustomStepIcon = ({ step, active, completed }) => {
  return (
    <div
      style={{
        backgroundColor: active || completed ? "#1976d2" : "#e0e0e0",
        color: "#fff",
        borderRadius: "50%",
        padding: "10px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {StepIcons[step]}
    </div>
  );
};

export default function CheckoutStepper({ activeStep }) {
  return (
    <div style={{ padding: 20, margin: "auto" }}>
      <Stepper alternativeLabel activeStep={activeStep}>
        {steps.map((label, index) => (
          <Step key={label}>
            <StepLabel
              StepIconComponent={(props) => (
                <CustomStepIcon step={index + 1} {...props} />
              )}
            >
              {label}
            </StepLabel>
          </Step>
        ))}
      </Stepper>
    </div>
  );
}
