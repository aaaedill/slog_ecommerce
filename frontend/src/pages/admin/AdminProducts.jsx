import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const AdminProducts = () => {

  const [products, setProducts] = useState([]);
  const navigate = useNavigate();

  // FETCH PRODUCTS
  const fetchProducts = () => {
    axios
      .get("http://localhost:4000/products")
      .then(res => setProducts(res.data))
      .catch(err => console.log(err));
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // ✅ ADD PRODUCT BUTTON ROUTE
  const addProduct = () => {

    navigate("/admin/add");
  };

  // DELETE PRODUCT
  const deleteProduct = (id) => {

    toast(
      ({ closeToast }) => (

        <div className="text-white">

          {/* TITLE */}
          <p className="text-base font-semibold mb-2">
            Delete this product?
          </p>

          {/* SUBTEXT */}
          <p className="text-sm text-white/60 mb-4">
            This action cannot be undone.
          </p>

          {/* BUTTONS */}
          <div className="flex justify-end gap-3">

            {/* CANCEL */}
            <button
              onClick={closeToast}
              className="
                px-4 py-1.5
                rounded-lg
                bg-white/10
                hover:bg-white/20
                border border-white/20
                transition
              "
            >
              Cancel
            </button>

            {/* DELETE */}
            <button
              onClick={() => {

                axios
                  .delete(`http://localhost:4000/products/${id}`)
                  .then(() => {

                    fetchProducts();

                    toast.success(
                      "Product deleted successfully",
                      {
                        position: "top-center",
                        autoClose: 2000,
                        hideProgressBar: true,
                        closeOnClick: true,
                        pauseOnHover: true,
                        draggable: false,

                        style: {
                          background: "rgba(255,255,255,0.05)",
                          border: "1px solid rgba(255,255,255,0.15)",
                          backdropFilter: "blur(25px)",
                          borderRadius: "16px",
                          boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
                          color: "#ffffff"
                        }
                      }
                    );

                  })
                  .catch(() =>
                    toast.error(
                      "Delete failed",
                      {
                        position: "top-center",
                        autoClose: 2000,
                        hideProgressBar: true,
                        closeOnClick: true,
                        pauseOnHover: true,
                        draggable: false,
                        style: {
                          background: "rgba(255,255,255,0.05)",
                          border: "1px solid rgba(255,255,255,0.15)",
                          backdropFilter: "blur(25px)",
                          borderRadius: "16px",
                          boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
                          color: "#ffffff"
                        }
                      }
                    )
                  );

                closeToast();

              }}

              className="
                px-4 py-1.5
                rounded-lg
                bg-red-500/20
                hover:bg-red-500
                border border-red-500/40
                text-red-300
                hover:text-white
                transition
              "
            >
              Delete
            </button>
          </div>
        </div>
      ),
      {
        position: "top-center",
        autoClose: false,
        closeOnClick: false,
        draggable: false,
        closeButton: true,

        style: {
          background:
            "rgba(255,255,255,0.05)",
          border:
            "1px solid rgba(255,255,255,0.15)",
          backdropFilter:
            "blur(25px)",
          borderRadius:
            "16px",
          boxShadow:
            "0 8px 32px rgba(0,0,0,0.4)"
        }
      }
    );
  };

  // EDIT PRODUCT
  const editProduct = (id) => {

    navigate(`/admin/edit-product/${id}`);
  };

  return (

    <div className="min-h-screen bg-[#0b1120] flex justify-center items-start p-3 sm:p-6 md:p-8 rounded-3xl pb-20">
      <div className="w-full max-w-6xl bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] p-4 sm:p-6 md:p-8 relative overflow-hidden">

        {/* BLOBS */}
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-orange-500/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"></div>
        <div className="relative z-10">

          {/* TITLE AND BUTTON */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg sm:text-xl font-semibold text-white cursor-pointer">
              All Products List
            </h2>

            {/* ADD PRODUCT BUTTON */}
            <button
              onClick={addProduct}
              className="
                bg-orange-500/20
                hover:bg-orange-500
                border border-orange-500/40
                text-orange-300
                hover:text-white
                px-4 py-2
                rounded-lg
                transition
                cursor-pointer
              "
            >
              + Add Product
            </button>
          </div>

          {/* HEADER */}
          <div className="hidden sm:grid grid-cols-[80px_2fr_1fr_1fr_140px] text-white border-b border-white/20 pb-3 font-medium">
            <p>Image</p>
            <p>Name</p>
            <p>Category</p>
            <p>Price</p>
            <p className="text-center">Action</p>
          </div>

          {/* PRODUCTS LIST */}
          {
            products.map(product => (
              <div
                key={product.id}
                className="grid grid-cols-1 sm:grid-cols-[80px_2fr_1fr_1fr_140px] gap-4 sm:gap-0 items-center text-white border-b border-white/10 py-4 hover:bg-white/5 transition"
              >
                <div className="flex items-center gap-4 sm:contents">
                  <img
                    src={product.image}
                    className="w-14 h-14 object-cover rounded border border-white/20"
                    alt=""
                  />
                  <div className="sm:hidden">
                    <p className="font-medium">{product.name}</p>
                    <p className="text-sm text-white/60 capitalize">
                      {product.category}
                    </p>
                    <p className="text-sm text-white/80">
                      ₹{product.price}
                    </p>
                  </div>
                </div>
                <div className="hidden sm:block">
                  {product.name}
                </div>
                <p className="hidden sm:block capitalize">
                  {product.category}
                </p>
                <p className="hidden sm:block">
                  ₹{product.price}
                </p>
                <div className="flex justify-start sm:justify-center gap-4 mt-2 sm:mt-0">
                  <button
                    onClick={() => editProduct(product.id)}
                    className="bg-blue-500/20 hover:bg-blue-500 px-3 py-1 rounded transition cursor-pointer"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => deleteProduct(product.id)}
                    className="bg-orange-500/20 hover:bg-orange-500 px-3 py-1 rounded transition cursor-pointer"
                  >
                    ❌
                  </button>
                </div>
              </div>
            ))
          }
        </div>
      </div>
    </div>
  );
};

export default AdminProducts;