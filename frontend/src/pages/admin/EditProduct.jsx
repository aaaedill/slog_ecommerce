import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { ShopContext } from "../../context/ShopContext";
import { toast } from "react-toastify";

const EditProduct = () => {

  const { id } = useParams();
  const navigate = useNavigate();
  const { fetchProducts } = useContext(ShopContext);
  const [images, setImages] = useState([]);
  const [preview, setPreview] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const [product, setProduct] = useState({
    name: "",
    description: "",
    category: "tshirt",
    price: "",
    sizes: [],
    image: ""
  });

  useEffect(() => {
    axios
      .get(`http://localhost:4000/products/${id}`)
      .then(res => {
        setProduct(res.data);
        setPreview(res.data.image);
      });
  }, [id]);

  const handleImage = (e) => {

    const file = e.target.files[0];
    if (!file) return;
    setImages([file]);
    setPreview(URL.createObjectURL(file));
  };

  const removeImage = () => {

    setImages([]);
    setPreview(product.image);
  };

  const toggleSize = (size) => {

    if (product.sizes.includes(size)) {

      setProduct({
        ...product,
        sizes: product.sizes.filter(s => s !== size)
      });
    }
    else {
      setProduct({
        ...product,
        sizes: [...product.sizes, size]
      });
    }
  };

  const handleUpdate = async () => {

    if (isSaving) return;
    if (!product.name || !product.price) {
      toast.error("Fill required fields");
      return;
    }
    try {
      setIsSaving(true);
      let imagePath = product.image;
      if (images.length > 0) {
        imagePath = "/images/" + images[0].name;
      }
      await axios.put(
        `http://localhost:4000/products/${id}`,
        {
          ...product,
          image: imagePath,
          price: Number(product.price)
        }
      );
      fetchProducts();
      toast.success("Product Updated Successfully");
      setTimeout(() => {
        navigate("/admin/products");
      }, 800);
    }
    catch {
      toast.error("Update Failed");
    }
    finally {
      setIsSaving(false);
    }
  };

  return (

    <div className="min-h-screen flex justify-center items-start p-3 sm:p-6 md:p-8 bg-[#0b1120] rounded-3xl pb-20">
      <div
        className="
        w-full
        max-w-4xl
        bg-white/5
        backdrop-blur-xl
        border border-white/10
        rounded-3xl
        shadow-xl
        p-4 sm:p-6 md:p-8
        relative
        overflow-hidden
        transition duration-500
        hover:shadow-orange-500/10
        "
      >

        {/* GLOW EFFECT */}
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-orange-500/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"></div>
        <div className="relative z-10">

    {/* BACK BUTTON GLASS FULL */}
     <button
       onClick={() => navigate("/admin/products")}
       className="
        group
        flex items-center
        px-4 py-2
        mb-5
        rounded-full
        bg-white/10
        backdrop-blur-lg
        border border-white/20
        text-white/90
        hover:bg-orange-500/20
        hover:border-orange-500/40
        hover:text-orange-400
        transition duration-300
        w-fit
        cursor-pointer
        "
      >
       <svg
        xmlns="http://www.w3.org/2000/svg"
        className="
        w-4 h-4
        transition
        group-hover:-translate-x-1
        "
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
        >
        <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15 19l-7-7 7-7"
        />
       </svg>
        <span className="text-sm font-medium tracking-wide">
          Back
        </span>
       </button>
          {/* TITLE */}
          <h2 className="text-white text-xl sm:text-2xl font-semibold mb-6">
            Edit Product
          </h2>

          {/* IMAGE */}
          <p className="text-white mb-3">
            Product Image
          </p>
          <div className="flex flex-wrap items-center gap-4 sm:gap-6 mb-8">
            <label className="group relative cursor-pointer">
              <img
                src={preview}
                className="
                  w-24 h-24
                  sm:w-28 sm:h-28
                  object-cover
                  rounded-lg
                  border border-white/20
                  group-hover:scale-105
                  transition
                "
              />
              <input
                type="file"
                hidden
                onChange={handleImage}
              />
              <div
                className="
                  absolute inset-0
                  bg-black/40
                  opacity-0
                  group-hover:opacity-100
                  flex items-center justify-center
                  text-white text-sm
                  rounded-lg
                  transition
                "
              >
                Change
              </div>
            </label>
            {images.length > 0 && (
              <button
                onClick={removeImage}
                className="text-red-400 hover:text-red-600 transition"
              >
                Remove
              </button>
            )}
          </div>

          {/* NAME */}
          <p className="text-white mb-2">Name</p>
          <input
            value={product.name}
            autoFocus
            className="
              w-full
              bg-white/10
              border border-white/20
              px-4 py-3
              mb-6
              text-white
              rounded-lg
              focus:border-orange-500
              outline-none
              transition
            "
            onChange={(e) =>
              setProduct({
                ...product,
                name: e.target.value
              })
            }
          />

          {/* DESCRIPTION */}
          <p className="text-white mb-2">Description</p>
          <textarea
            value={product.description}
            className="
              w-full
              bg-white/10
              border border-white/20
              px-4 py-3
              mb-6
              text-white
              rounded-lg
              focus:border-orange-500
              outline-none
              transition
            "
            onChange={(e) =>
              setProduct({
                ...product,
                description: e.target.value
              })
            }
          />

          {/* CATEGORY + PRICE */}
          <div className="flex flex-col sm:flex-row gap-6 mb-6">
            <div className="flex-1">
              <p className="text-white mb-2">Category</p>
              <select
                value={product.category}
                className="
                  w-full
                  bg-white/10
                  border border-white/20
                  px-4 py-3
                  text-white
                  rounded-lg
                "
                onChange={(e) =>
                  setProduct({
                    ...product,
                    category: e.target.value
                  })
                }
              >
                <option className="text-black">shirt</option>
                <option className="text-black">tshirt</option>
                <option className="text-black">hoodie</option>
                <option className="text-black">pants</option>
              </select>
            </div>
            <div className="flex-1">
              <p className="text-white mb-2">Price</p>
              <input
                type="number"
                value={product.price}
                className="
                  w-full
                  bg-white/10
                  border border-white/20
                  px-4 py-3
                  text-white
                  rounded-lg
                "
                onChange={(e) =>
                  setProduct({
                    ...product,
                    price: e.target.value
                  })
                }
              />
            </div>
          </div>

          {/* SIZES */}
          <p className="text-white mb-2">Sizes</p>
          <div className="flex flex-wrap gap-3 mb-8">
            {["S", "M", "L", "XL", "XXL"].map(size => (
              <button
                key={size}
                onClick={() => toggleSize(size)}
                className={`
                  px-4 py-2
                  rounded-lg
                  border
                  transition
                  ${
                    product.sizes.includes(size)
                      ?
                      "bg-orange-500 text-white border-orange-500"
                      :
                      "bg-white/10 text-white border-white/20 hover:border-orange-500"
                  }
                `}
              >
                {size}
              </button>
            ))}
          </div>

          {/* BUTTONS */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={handleUpdate}
              disabled={isSaving}
              className="
                w-full sm:w-auto
                bg-orange-500
                hover:bg-orange-600
                text-white
                px-10 py-3
                rounded-lg
                transition
                active:scale-95
              "
            >
              {isSaving ? "Updating..." : "Finish"}
            </button>
            <button
              onClick={() => navigate("/admin/products")}
              className="
                w-full sm:w-auto
                bg-white/10
                hover:bg-white/20
                text-white
                px-10 py-3
                rounded-lg
                transition
              "
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditProduct;