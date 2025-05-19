import React from "react";
import "./dashboard.css";
import ProductCarousel from "./ProductCarousel";

const Dashboard = () => {

  return (
    <div className="d-flex flex-column" style={{ minHeight: "50vh" }}>
      {/* Dashboard Content */}
      <div className="container">
        <div>
          <div className="my-4 pt-4 row">
            <h4 className="col-md-12 mb-4 text-primary">
              School Uniform Essentials
            </h4>
            <ProductCarousel type="bundle" />
          </div>
          {/* <div className="my-4 pt-4 row">
            <h4 className="col-md-12 mb-4 text-primary">Gallery</h4>
            <ProductCarousel type="gallery" />
          </div> */}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
