import React, { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "./ProductCarousel.css";

const ProductCarousel = ({ type }) => {
  const [images, setImages] = useState([]);
  useEffect(() => {
    const bundleImages = [
      "https://images-bundle.s3.ap-south-1.amazonaws.com/1.png",
      "https://images-bundle.s3.ap-south-1.amazonaws.com/2.png",
      "https://images-bundle.s3.ap-south-1.amazonaws.com/3.png",
    ];
    const galleryImages = [
      "https://schoolimagesdata.s3.ap-south-1.amazonaws.com/The_Gaudium_International_School_Hyderabad_Gallery_2023_05-12.webp",
      "https://schoolimagesdata.s3.ap-south-1.amazonaws.com/The_Gaudium_International_School_Hyderabad_Gallery_2023_05-13.webp",
      "https://schoolimagesdata.s3.ap-south-1.amazonaws.com/The_Gaudium_International_School_Hyderabad_Gallery_2023_05-2.webp",
      "https://schoolimagesdata.s3.ap-south-1.amazonaws.com/The_Gaudium_International_School_Hyderabad_Gallery_2023_05-5.webp",
      "https://schoolimagesdata.s3.ap-south-1.amazonaws.com/The_Gaudium_International_School_Hyderabad_Gallery_2023_05-6.webp",
    ];
    console.log(type);
    if (type === "bundle") {
      setImages(bundleImages);
    } else if (type === "gallery") {
      setImages(galleryImages);
    }
  }, [type]);
  return (
    <Swiper
      modules={[Navigation, Pagination, Autoplay]}
      spaceBetween={20}
      slidesPerView={3} // Default: 2 images at a time
      breakpoints={{
        0: { slidesPerView: 1 }, // Mobile: Show 1 image
        768: { slidesPerView: 3 }, // Tablet/Desktop: Show 2 images
      }}
      navigation
      pagination={{ clickable: true }}
      autoplay={{ delay: 3000 }}
      loop
      style={{ width: "100%", maxWidth: "100%", margin: "auto" }}
    >
      {images.map((image, index) => (
        <SwiperSlide key={index}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              height: "250px",
            }}
          >
            <img
              src={image}
              alt={`Product ${index + 1}`}
              style={{
                maxWidth: "100%",
                maxHeight: "100%",
                objectFit: "contain",
              }}
            />
          </div>
        </SwiperSlide>
      ))}
    </Swiper>
  );
};

export default ProductCarousel;
