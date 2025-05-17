import React, { useEffect, useState } from "react";

const TopSellingProducts = ({ category }) => {
  const [products, setProducts] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    // Fetch top-selling products based on category
    // const fetchProducts = async () => {
    //   try {
    //     const response = await axios.get(
    //       `https://api.example.com/top-selling?category=${category}`
    //     );
    //     setProducts(response.data);
    //   } catch (error) {
    //     console.error("Error fetching top-selling products", error);
    //   }
    // };

    // fetchProducts();
    const dummyProducts = [
      {
        id: 1,
        name: "Yellow Puff Jacket",
        image: "https://via.placeholder.com/150",
      },
      { id: 2, name: "String Skirt", image: "https://via.placeholder.com/150" },
      {
        id: 3,
        name: "Blue Denim Jeans",
        image: "https://via.placeholder.com/150",
      },
      { id: 4, name: "Red Hoodie", image: "https://via.placeholder.com/150" },
      {
        id: 5,
        name: "Green Polo T-Shirt",
        image: "https://via.placeholder.com/150",
      },
      {
        id: 6,
        name: "Black Sneakers",
        image: "https://via.placeholder.com/150",
      },
      {
        id: 7,
        name: "White Formal Shirt",
        image: "https://via.placeholder.com/150",
      },
    ];

    setProducts(dummyProducts);
  }, [category]);

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % products.length);
  };

  const prevSlide = () => {
    setCurrentIndex(
      (prevIndex) => (prevIndex - 1 + products.length) % products.length
    );
  };

  return (
    <div className="container mt-3">
      <div className="row">
        <div className="col-md-8">
          <div className="text-start">
            <h4>{category}</h4>
          </div>
        </div>
        <div className="col-md-4">
          <div className="float-end">
            <button onClick={prevSlide}>❮</button>
            <button onClick={nextSlide}>❯</button>
          </div>
        </div>
      </div>
      <div style={{ position: "relative", overflow: "hidden", width: "100%" }}>
        <div
          style={{
            display: "flex",
            transition: "transform 0.5s ease-in-out",
            transform: `translateX(-${currentIndex * 50}%)`,
            width: "200%",
          }}
        >
          {products.map((product) => (
            <div key={product.id} style={{ minWidth: "50%" }}>
              <div
                style={{
                  border: "1px solid #ddd",
                  borderRadius: "8px",
                  padding: "10px",
                }}
              >
                <img
                  src={product.image}
                  alt={product.name}
                  style={{ width: "100%", borderRadius: "8px" }}
                />
                <h6>{product.name}</h6>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TopSellingProducts;
