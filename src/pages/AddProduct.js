import { useState } from "react";
import axios from "axios";

function AddProduct() {

  const [product, setProduct] = useState({
    name: "",
    description: "",
    price: "",
    quantity: ""
  });

  const handleChange = (e) => {
    setProduct({
      ...product,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("token");

      const response = await axios.post(
        "https://ecommerce-backend-1-tsra.onrender.com/api/products",
        product,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      alert("Product Added Successfully");
      console.log(response.data);

      setProduct({
        name: "",
        description: "",
        price: "",
        quantity: ""
      });

    } catch (error) {
      console.error(error);
      alert("Failed to add product");
    }
  };

  return (
    <div className="container mt-5" style={{ maxWidth: "500px" }}>
      <div className="card p-4 shadow">
        <h3 className="text-center mb-3">Add Product</h3>

        <form onSubmit={handleSubmit}>
          <input className="form-control mb-3" name="name" placeholder="Product Name" value={product.name} onChange={handleChange} required />
          <input className="form-control mb-3" name="description" placeholder="Description" value={product.description} onChange={handleChange} required />
          <input className="form-control mb-3" type="number" name="price" placeholder="Price" value={product.price} onChange={handleChange} required />
          <input className="form-control mb-3" type="number" name="quantity" placeholder="Quantity" value={product.quantity} onChange={handleChange} required />

          <button type="submit" className="btn btn-dark w-100">
            Add Product
          </button>
        </form>
      </div>
    </div>
  );
}

export default AddProduct;  