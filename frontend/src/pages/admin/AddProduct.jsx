import React, {
  useState,
  useContext,
  useCallback,
  useEffect
} from "react";

import axios from "axios";

import {
  ShopContext
} from "../../context/ShopContext";

import {
  useNavigate
} from "react-router-dom";

import API_URL from "../../config/api";


/* ── Shared keyframes ── */

const GlobalStyles = () => (
  <style>{`
    @keyframes toastIn {
      from {
        opacity: 0;
        transform: translateY(-10px) scale(0.95);
      }

      to {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }

    @keyframes toastOut {
      from {
        opacity: 1;
        transform: translateY(0) scale(1);
      }

      to {
        opacity: 0;
        transform: translateY(-8px) scale(0.95);
      }
    }

    @keyframes spin {
      to {
        transform: rotate(360deg);
      }
    }

    input[type=number]::-webkit-inner-spin-button,
    input[type=number]::-webkit-outer-spin-button {
      -webkit-appearance: none;
    }

    input::placeholder,
    textarea::placeholder {
      color: rgba(255,255,255,0.2);
    }
  `}</style>
);


/* ── Glassy Toast ── */

const ToastContainer = ({
  toasts
}) => (
  <div
    style={{
      position: "fixed",
      top: "100px",
      left: 0,
      right: 0,
      marginLeft: "auto",
      marginRight: "auto",
      zIndex: 9999,
      display: "flex",
      flexDirection: "column",
      alignItems: "stretch",
      gap: "10px",
      width: "320px",
      maxWidth: "calc(100vw - 32px)",
      pointerEvents: "none",
    }}
  >
    {toasts.map((t) => (
      <div
        key={t.id}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          padding: "13px 18px",
          background:
            "rgba(255,255,255,0.05)",
          border:
            "1px solid rgba(255,255,255,0.15)",
          backdropFilter:
            "blur(25px)",
          WebkitBackdropFilter:
            "blur(25px)",
          borderRadius: "16px",
          boxShadow:
            "0 8px 32px rgba(0,0,0,0.5)",
          color: "#ffffff",
          fontSize: "14px",
          fontWeight: 500,
          pointerEvents: "auto",
          animation: t.leaving
            ? "toastOut 0.3s ease forwards"
            : "toastIn 0.35s cubic-bezier(0.2,1.3,0.4,1) forwards",
        }}
      >
        <span
          style={{
            width: 20,
            height: 20,
            borderRadius: "50%",
            flexShrink: 0,
            background:
              t.type === "error"
                ? "rgba(239,68,68,0.15)"
                : "rgba(249,115,22,0.15)",
            border:
              t.type === "error"
                ? "1.5px solid rgba(239,68,68,0.5)"
                : "1.5px solid rgba(249,115,22,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {t.type === "error" ? (
            <svg
              width="10"
              height="10"
              viewBox="0 0 12 12"
              fill="none"
            >
              <line
                x1="2"
                y1="2"
                x2="10"
                y2="10"
                stroke="rgba(239,68,68,0.95)"
                strokeWidth="1.8"
                strokeLinecap="round"
              />

              <line
                x1="10"
                y1="2"
                x2="2"
                y2="10"
                stroke="rgba(239,68,68,0.95)"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </svg>
          ) : (
            <svg
              width="10"
              height="10"
              viewBox="0 0 12 12"
              fill="none"
            >
              <polyline
                points="2,6 5,9 10,3"
                stroke="rgba(249,115,22,0.95)"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </span>

        <span>
          {t.message}
        </span>
      </div>
    ))}
  </div>
);


const AddProduct = () => {

  const navigate =
    useNavigate();


  const {
    fetchProducts
  } = useContext(
    ShopContext
  );


  const [
    images,
    setImages
  ] = useState([]);


  const [
    imagePreview,
    setImagePreview
  ] = useState("");


  const [
    isSaving,
    setIsSaving
  ] = useState(false);


  const [
    toasts,
    setToasts
  ] = useState([]);


  const [
    product,
    setProduct
  ] = useState({
    name: "",
    description: "",
    category: "tshirt",
    price: "",
    sizes: []
  });


  /* ── Toast ── */

  const showToast =
    useCallback(
      (
        message,
        type = "success"
      ) => {

        const id =
          Date.now();


        setToasts(
          prev => [
            ...prev,
            {
              id,
              message,
              type,
              leaving: false
            }
          ]
        );


        setTimeout(() => {

          setToasts(
            prev =>
              prev.map(
                t =>
                  t.id === id
                    ? {
                        ...t,
                        leaving: true
                      }
                    : t
              )
          );


          setTimeout(() => {

            setToasts(
              prev =>
                prev.filter(
                  t =>
                    t.id !== id
                )
            );

          }, 320);

        }, 2500);

      },
      []
    );


  /* ── Cleanup image preview ── */

  useEffect(() => {

    return () => {

      if (imagePreview) {

        URL.revokeObjectURL(
          imagePreview
        );

      }

    };

  }, [
    imagePreview
  ]);


  /* ── Image Upload / Selection ── */

  const handleImage = (
    e,
    index
  ) => {

    const file =
      e.target.files?.[0];


    if (!file) {
      return;
    }


    /* ── Validate image type ── */

    if (
      !file.type.startsWith(
        "image/"
      )
    ) {

      showToast(
        "Please upload a valid image file",
        "error"
      );


      e.target.value =
        "";


      return;
    }


    /* ── Validate image size ── */

    const maxSize =
      5 * 1024 * 1024;


    if (
      file.size > maxSize
    ) {

      showToast(
        "Image size must be less than 5 MB",
        "error"
      );


      e.target.value =
        "";


      return;
    }


    /* ── Store selected File ── */

    const newImages = [
      ...images
    ];


    newImages[index] =
      file;


    setImages(
      newImages
    );


    /* ── Replace previous preview ── */

    if (
      imagePreview
    ) {

      URL.revokeObjectURL(
        imagePreview
      );

    }


    /* ── Create local preview ── */

    const previewUrl =
      URL.createObjectURL(
        file
      );


    setImagePreview(
      previewUrl
    );


    /*
     * Clear the input value after storing
     * the File so that selecting the same
     * image again can trigger onChange.
     */

    e.target.value =
      "";

  };


  /* ── Toggle Size ── */

  const toggleSize = (
    size
  ) => {

    setProduct(
      prev => {

        const alreadySelected =
          prev.sizes.some(
            item =>
              item.size === size
          );


        if (
          alreadySelected
        ) {

          return {
            ...prev,

            sizes:
              prev.sizes.filter(
                item =>
                  item.size !==
                  size
              )
          };

        }


        return {
          ...prev,

          sizes: [
            ...prev.sizes,
            {
              size,
              stock: 0
            }
          ]
        };

      }
    );

  };


  /* ── Update Size Stock ── */

  const updateSizeStock = (
    size,
    value
  ) => {

    setProduct(
      prev => ({
        ...prev,

        sizes:
          prev.sizes.map(
            item =>
              item.size === size
                ? {
                    ...item,
                    stock:
                      value === ""
                        ? ""
                        : Number(
                            value
                          )
                  }
                : item
          )
      })
    );

  };


  /* ── Get Size Stock ── */

  const getSizeStock = (
    size
  ) => {

    const selectedSize =
      product.sizes.find(
        item =>
          item.size === size
      );


    return selectedSize
      ? selectedSize.stock
      : "";

  };


  /* ── Upload Image To Cloudinary ── */

  const uploadImage =
    async (
      imageFile
    ) => {

      if (
        !imageFile
      ) {

        throw new Error(
          "Please select a product image."
        );

      }


      /*
       * FormData is required because the
       * backend Multer middleware expects
       * multipart/form-data.
       */

      const formData =
        new FormData();


      formData.append(
        "image",
        imageFile
      );


      /*
       * Send the image to the protected
       * backend upload endpoint.
       *
       * withCredentials sends the HTTP-only
       * admin authentication cookie.
       */

      const response =
        await axios.post(
          `${API_URL}/uploads/product-image`,
          formData,
          {
            withCredentials:
              true
          }
        );


      const imageUrl =
        response.data?.image?.url;


      /*
       * Make sure Cloudinary returned
       * a usable secure URL.
       */

      if (
        !imageUrl
      ) {

        throw new Error(
          "Image upload completed but no image URL was returned."
        );

      }


      return imageUrl;

    };


  /* ── Submit Product ── */

  const handleSubmit =
    async () => {

      if (
        isSaving
      ) {
        return;
      }


      const trimmedName =
        product.name.trim();


      const trimmedDescription =
        product.description.trim();


      const numericPrice =
        Number(
          product.price
        );


      const selectedImage =
        images[0];


      /* ── Validation ── */

      if (
        !trimmedName ||
        !trimmedDescription ||
        !product.price ||
        !selectedImage
      ) {

        showToast(
          "Please fill all fields and upload image",
          "error"
        );


        return;
      }


      if (
        !Number.isFinite(
          numericPrice
        ) ||
        numericPrice <= 0
      ) {

        showToast(
          "Please enter a valid price",
          "error"
        );


        return;
      }


      /* ── Validate selected sizes ── */

      const invalidSize =
        product.sizes.some(
          item => {

            if (
              !item ||
              typeof item !==
                "object"
            ) {
              return true;
            }


            if (
              !item.size ||
              typeof item.size !==
                "string"
            ) {
              return true;
            }


            const stock =
              Number(
                item.stock
              );


            return (
              !Number.isInteger(
                stock
              ) ||
              stock < 0 ||
              stock > 1000000
            );

          }
        );


      if (
        invalidSize
      ) {

        showToast(
          "Please enter a valid stock value for every selected size",
          "error"
        );


        return;
      }


      try {

        setIsSaving(
          true
        );


        /*
         * STEP 1
         *
         * Upload the selected image to
         * Cloudinary through our backend.
         */

        showToast(
          "Uploading image...",
          "success"
        );


        const imageUrl =
          await uploadImage(
            selectedImage
          );


        /*
         * STEP 2
         *
         * Get existing products from the
         * MERN backend.
         */

        const res =
          await axios.get(
            `${API_URL}/products`,
            {
              withCredentials:
                true
            }
          );


        const products =
          Array.isArray(
            res.data?.products
          )
            ? res.data.products
            : [];


        /*
         * STEP 3
         *
         * Find the highest existing
         * numeric ID.
         */

        const validIds =
          products
            .map(
              existingProduct =>
                Number(
                  existingProduct.id
                )
            )
            .filter(
              id =>
                Number.isFinite(
                  id
                )
            );


        const lastId =
          validIds.length > 0
            ? Math.max(
                ...validIds
              )
            : 0;


        const newId =
          String(
            lastId + 1
          );


        /*
         * STEP 4
         *
         * Normalize size inventory
         * before sending it to MongoDB.
         *
         * Every selected size becomes:
         *
         * {
         *   size: "S",
         *   stock: 10
         * }
         */

        const normalizedSizes =
          product.sizes.map(
            item => ({
              size:
                item.size.trim(),
              stock:
                Number(
                  item.stock
                )
            })
          );


        /*
         * STEP 5
         *
         * Prepare product for MongoDB.
         *
         * IMPORTANT:
         *
         * image is the Cloudinary URL.
         *
         * The Base64 image data is no
         * longer stored in MongoDB.
         */

        const newProduct = {

          id:
            newId,

          name:
            trimmedName,

          description:
            trimmedDescription,

          price:
            numericPrice,

          image:
            imageUrl,

          category:
            product.category,

          sizes:
            normalizedSizes,

          rating:
            4.5

        };


        /*
         * STEP 6
         *
         * Create product using the secured
         * MERN backend.
         *
         * withCredentials sends the HTTP-only
         * admin authentication cookie.
         */

        await axios.post(
          `${API_URL}/products`,
          newProduct,
          {
            withCredentials:
              true
          }
        );


        /*
         * STEP 7
         *
         * Refresh the global product list.
         */

        try {

          await fetchProducts();

        } catch {

          /*
           * Product was already created
           * successfully.
           *
           * A refresh failure should not
           * incorrectly show "failed".
           */

        }


        showToast(
          "Product Added Successfully",
          "success"
        );


        /*
         * STEP 8
         *
         * Reset form.
         */

        setProduct({
          name: "",
          description: "",
          category: "tshirt",
          price: "",
          sizes: []
        });


        setImages(
          []
        );


        if (
          imagePreview
        ) {

          URL.revokeObjectURL(
            imagePreview
          );

          setImagePreview(
            ""
          );

        }

      } catch (
        error
      ) {

        console.error(
          "Add product error:",
          error
        );


        /*
         * Show the actual backend error
         * when available.
         */

        showToast(
          error?.response?.data?.message ||
          error?.message ||
          "Failed to add product",
          "error"
        );

      } finally {

        setIsSaving(
          false
        );

      }

    };


  /* ── Input Style ── */

  const inputStyle = {

    width: "100%",

    background:
      "rgba(255,255,255,0.04)",

    border:
      "1px solid rgba(255,255,255,0.1)",

    padding:
      "11px 16px",

    color:
      "#f1f5f9",

    borderRadius:
      "12px",

    outline:
      "none",

    fontSize:
      "14px",

  };


  /* ── Label Style ── */

  const labelStyle = {

    display:
      "block",

    fontSize:
      "12px",

    fontWeight:
      600,

    color:
      "#64748b",

    letterSpacing:
      "0.1em",

    textTransform:
      "uppercase",

    marginBottom:
      "8px",

  };


  return (
    <>

      <GlobalStyles />


      <ToastContainer
        toasts={
          toasts
        }
      />


      <div
        className="min-h-screen flex justify-center items-start p-3 sm:p-6 md:p-8 rounded-3xl pb-20"
        style={{
          background:
            "#0b1120"
        }}
      >

        <div
          className="w-full max-w-4xl relative overflow-hidden rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8"
          style={{
            background:
              "linear-gradient(145deg,#0f1623 0%,#131a28 100%)",

            border:
              "1px solid rgba(255,255,255,0.07)",

            boxShadow:
              "0 24px 64px rgba(0,0,0,0.5), 0 1px 0 rgba(255,255,255,0.05) inset",
          }}
        >

          {/* Glows */}

          <div
            className="absolute -top-40 -left-40 w-96 h-96 rounded-full blur-3xl pointer-events-none"
            style={{
              background:
                "rgba(249,115,22,0.08)"
            }}
          />


          <div
            className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full blur-3xl pointer-events-none"
            style={{
              background:
                "rgba(99,102,241,0.08)"
            }}
          />


          <div className="relative z-10">

            {/* Back button */}

            <button
              onClick={() =>
                navigate(
                  "/admin/products"
                )
              }
              className="group flex items-center gap-2 mb-6 cursor-pointer"
              style={{
                padding:
                  "7px 14px 7px 10px",

                borderRadius:
                  "10px",

                background:
                  "rgba(255,255,255,0.05)",

                border:
                  "1px solid rgba(255,255,255,0.1)",

                color:
                  "#94a3b8",

                fontSize:
                  "13px",

                fontWeight:
                  500,
              }}
              onMouseEnter={e => {

                e.currentTarget.style.background =
                  "rgba(249,115,22,0.1)";

                e.currentTarget.style.borderColor =
                  "rgba(249,115,22,0.25)";

                e.currentTarget.style.color =
                  "#f97316";

              }}
              onMouseLeave={e => {

                e.currentTarget.style.background =
                  "rgba(255,255,255,0.05)";

                e.currentTarget.style.borderColor =
                  "rgba(255,255,255,0.1)";

                e.currentTarget.style.color =
                  "#94a3b8";

              }}
            >

              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >

                <path d="M15 19l-7-7 7-7"/>

              </svg>


              Back

            </button>


            {/* Page heading */}

            <div className="mb-8">

              <p
                className="text-xs font-semibold uppercase mb-1"
                style={{
                  color:
                    "#f97316",

                  letterSpacing:
                    "0.18em"
                }}
              >

                Inventory

              </p>


              <h1
                className="text-2xl sm:text-3xl font-bold"
                style={{
                  color:
                    "#f1f5f9",

                  letterSpacing:
                    "-0.02em"
                }}
              >

                Add Product

              </h1>

            </div>


            {/* Image upload */}

            <div className="mb-8">

              <span
                style={
                  labelStyle
                }
              >

                Product Image{" "}

                <span
                  style={{
                    color:
                      "#f97316"
                  }}
                >

                  *

                </span>

              </span>


              <label
                className="group relative cursor-pointer inline-block"
                style={{
                  width:
                    "100px",

                  height:
                    "100px",

                  border:
                    images[0]
                      ? "1px solid rgba(255,255,255,0.12)"
                      : "2px dashed rgba(255,255,255,0.12)",

                  borderRadius:
                    "14px",

                  background:
                    "rgba(255,255,255,0.03)",

                  overflow:
                    "hidden",

                  display:
                    "block",
                }}
              >

                {images[0] ? (

                  <>

                    <img
                      src={
                        imagePreview
                      }
                      alt="Product preview"
                      className="w-full h-full object-cover"
                    />


                    <div
                      style={{
                        position:
                          "absolute",

                        inset:
                          0,

                        background:
                          "rgba(0,0,0,0.55)",

                        display:
                          "flex",

                        flexDirection:
                          "column",

                        alignItems:
                          "center",

                        justifyContent:
                          "center",

                        gap:
                          4,

                        color:
                          "#fff",

                        fontSize:
                          "11px",

                        fontWeight:
                          600,

                        opacity:
                          0,

                        transition:
                          "opacity 0.2s",

                        backdropFilter:
                          "blur(4px)",
                      }}
                      className="group-hover:opacity-100"
                    >

                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >

                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>

                        <polyline points="17 8 12 3 7 8"/>

                        <line
                          x1="12"
                          y1="3"
                          x2="12"
                          y2="15"
                        />

                      </svg>


                      Change

                    </div>

                  </>

                ) : (

                  <div
                    style={{
                      width:
                        "100%",

                      height:
                        "100%",

                      display:
                        "flex",

                      flexDirection:
                        "column",

                      alignItems:
                        "center",

                      justifyContent:
                        "center",

                      gap:
                        6,

                      color:
                        "#475569",

                      fontSize:
                        "11px",

                      fontWeight:
                        500,

                      transition:
                        "color 0.2s",
                    }}
                    className="group-hover:text-orange-400"
                  >

                    <svg
                      width="22"
                      height="22"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >

                      <rect
                        x="3"
                        y="3"
                        width="18"
                        height="18"
                        rx="2"
                      />

                      <circle
                        cx="8.5"
                        cy="8.5"
                        r="1.5"
                      />

                      <polyline points="21 15 16 10 5 21"/>

                    </svg>


                    Upload

                  </div>

                )}


                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={e =>
                    handleImage(
                      e,
                      0
                    )
                  }
                />

              </label>

            </div>


            {/* Name */}

            <div className="mb-6">

              <span
                style={
                  labelStyle
                }
              >

                Product Name{" "}

                <span
                  style={{
                    color:
                      "#f97316"
                  }}
                >

                  *

                </span>

              </span>


              <input
                value={
                  product.name
                }
                placeholder="e.g. Oversized Black Hoodie"
                style={
                  inputStyle
                }
                onFocus={e =>
                  e.target.style.borderColor =
                    "rgba(249,115,22,0.5)"
                }
                onBlur={e =>
                  e.target.style.borderColor =
                    "rgba(255,255,255,0.1)"
                }
                onChange={e =>
                  setProduct({
                    ...product,
                    name:
                      e.target.value
                  })
                }
              />

            </div>


            {/* Description */}

            <div className="mb-6">

              <span
                style={
                  labelStyle
                }
              >

                Description{" "}

                <span
                  style={{
                    color:
                      "#f97316"
                  }}
                >

                  *

                </span>

              </span>


              <textarea
                value={
                  product.description
                }
                placeholder="Describe the product..."
                rows={4}
                style={{
                  ...inputStyle,

                  resize:
                    "none",

                  lineHeight:
                    "1.6"
                }}
                onFocus={e =>
                  e.target.style.borderColor =
                    "rgba(249,115,22,0.5)"
                }
                onBlur={e =>
                  e.target.style.borderColor =
                    "rgba(255,255,255,0.1)"
                }
                onChange={e =>
                  setProduct({
                    ...product,

                    description:
                      e.target.value
                  })
                }
              />

            </div>


            {/* Category + Price */}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-6">

              <div>

                <span
                  style={
                    labelStyle
                  }
                >

                  Category

                </span>


                <select
                  value={
                    product.category
                  }
                  style={{
                    ...inputStyle,

                    cursor:
                      "pointer"
                  }}
                  onFocus={e =>
                    e.target.style.borderColor =
                      "rgba(249,115,22,0.5)"
                  }
                  onBlur={e =>
                    e.target.style.borderColor =
                      "rgba(255,255,255,0.1)"
                  }
                  onChange={e =>
                    setProduct({
                      ...product,

                      category:
                        e.target.value
                    })
                  }
                >

                  {[
                    "shirt",
                    "tshirt",
                    "hoodie",
                    "pants"
                  ].map(
                    c => (

                      <option
                        key={c}
                        value={c}
                        style={{
                          background:
                            "#1e2535",

                          color:
                            "#f1f5f9"
                        }}
                      >

                        {
                          c.charAt(
                            0
                          ).toUpperCase() +
                          c.slice(
                            1
                          )
                        }

                      </option>

                    )
                  )}

                </select>

              </div>


              <div>

                <span
                  style={
                    labelStyle
                  }
                >

                  Price (₹){" "}

                  <span
                    style={{
                      color:
                        "#f97316"
                    }}
                  >

                    *

                  </span>

                </span>


                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={
                    product.price
                  }
                  placeholder="e.g. 999"
                  style={
                    inputStyle
                  }
                  onFocus={e =>
                    e.target.style.borderColor =
                      "rgba(249,115,22,0.5)"
                  }
                  onBlur={e =>
                    e.target.style.borderColor =
                      "rgba(255,255,255,0.1)"
                  }
                  onChange={e =>
                    setProduct({
                      ...product,

                      price:
                        e.target.value
                    })
                  }
                />

              </div>

            </div>


            {/* Sizes */}

            <div className="mb-8">

              <span
                style={
                  labelStyle
                }
              >

                Sizes

              </span>


              <div className="flex flex-wrap gap-2.5">

                {[
                  "S",
                  "M",
                  "L",
                  "XL",
                  "XXL"
                ].map(
                  size => {

                    const isSelected =
                      product.sizes.some(
                        item =>
                          item.size ===
                          size
                      );


                    return (

                      <button
                        key={size}
                        type="button"
                        onClick={() =>
                          toggleSize(
                            size
                          )
                        }
                        className="cursor-pointer transition-all duration-200"
                        style={
                          isSelected
                            ? {
                                padding:
                                  "8px 18px",

                                borderRadius:
                                  "10px",

                                fontSize:
                                  "13px",

                                fontWeight:
                                  700,

                                background:
                                  "linear-gradient(135deg,#f97316,#ea580c)",

                                border:
                                  "1px solid transparent",

                                color:
                                  "#fff",

                                boxShadow:
                                  "0 4px 12px rgba(249,115,22,0.35)",
                              }
                            : {
                                padding:
                                  "8px 18px",

                                borderRadius:
                                  "10px",

                                fontSize:
                                  "13px",

                                fontWeight:
                                  600,

                                background:
                                  "rgba(255,255,255,0.04)",

                                border:
                                  "1px solid rgba(255,255,255,0.12)",

                                color:
                                  "#94a3b8",
                              }
                        }
                        onMouseEnter={e => {

                          if (
                            !isSelected
                          ) {

                            e.currentTarget.style.borderColor =
                              "rgba(249,115,22,0.4)";

                            e.currentTarget.style.color =
                              "#f97316";

                          }

                        }}
                        onMouseLeave={e => {

                          if (
                            !isSelected
                          ) {

                            e.currentTarget.style.borderColor =
                              "rgba(255,255,255,0.12)";

                            e.currentTarget.style.color =
                              "#94a3b8";

                          }

                        }}
                      >

                        {size}

                      </button>

                    );

                  }
                )}

              </div>


              {/* Per-size stock inputs */}

              {product.sizes.length >
                0 && (

                <div
                  className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3"
                >

                  {product.sizes.map(
                    item => (

                      <div
                        key={
                          item.size
                        }
                        style={{
                          display:
                            "flex",

                          alignItems:
                            "center",

                          justifyContent:
                            "space-between",

                          gap:
                            "14px",

                          padding:
                            "12px 14px",

                          background:
                            "rgba(255,255,255,0.025)",

                          border:
                            "1px solid rgba(255,255,255,0.08)",

                          borderRadius:
                            "12px",
                        }}
                      >

                        <div
                          style={{
                            display:
                              "flex",

                            alignItems:
                              "center",

                            gap:
                              "10px",

                            minWidth:
                              0
                          }}
                        >

                          <div
                            style={{
                              width:
                                "34px",

                              height:
                                "34px",

                              flexShrink:
                                0,

                              display:
                                "flex",

                              alignItems:
                                "center",

                              justifyContent:
                                "center",

                              borderRadius:
                                "9px",

                              background:
                                "rgba(249,115,22,0.12)",

                              border:
                                "1px solid rgba(249,115,22,0.2)",

                              color:
                                "#f97316",

                              fontSize:
                                "12px",

                              fontWeight:
                                700
                            }}
                          >

                            {item.size}

                          </div>


                          <div>

                            <div
                              style={{
                                color:
                                  "#f1f5f9",

                                fontSize:
                                  "13px",

                                fontWeight:
                                  600
                              }}
                            >

                              Size {item.size}

                            </div>


                            <div
                              style={{
                                color:
                                  "#64748b",

                                fontSize:
                                  "11px",

                                marginTop:
                                  "2px"
                              }}
                            >

                              Available stock

                            </div>

                          </div>

                        </div>


                        <div
                          style={{
                            display:
                              "flex",

                            alignItems:
                              "center",

                            gap:
                              "8px",

                            flexShrink:
                              0
                          }}
                        >

                          <input
                            type="number"
                            min="0"
                            max="1000000"
                            step="1"
                            value={
                              item.stock
                            }
                            placeholder="0"
                            aria-label={`Stock for size ${item.size}`}
                            style={{
                              width:
                                "100px",

                              background:
                                "rgba(255,255,255,0.04)",

                              border:
                                "1px solid rgba(255,255,255,0.1)",

                              padding:
                                "9px 12px",

                              color:
                                "#f1f5f9",

                              borderRadius:
                                "10px",

                              outline:
                                "none",

                              fontSize:
                                "13px",

                              textAlign:
                                "center"
                            }}
                            onFocus={e =>
                              e.target.style.borderColor =
                                "rgba(249,115,22,0.5)"
                            }
                            onBlur={e =>
                              e.target.style.borderColor =
                                "rgba(255,255,255,0.1)"
                            }
                            onChange={e =>
                              updateSizeStock(
                                item.size,
                                e.target.value
                              )
                            }
                          />

                          <span
                            style={{
                              color:
                                "#64748b",

                              fontSize:
                                "11px",

                              fontWeight:
                                500
                            }}
                          >

                            pcs

                          </span>

                        </div>

                      </div>

                    )
                  )}

                </div>

              )}

            </div>


            {/* Divider */}

            <div
              style={{
                height:
                  "1px",

                background:
                  "rgba(255,255,255,0.06)",

                marginBottom:
                  "24px"
              }}
            />


            {/* Submit */}

            <button
              onClick={
                handleSubmit
              }
              disabled={
                isSaving
              }
              className="flex items-center justify-center gap-2 cursor-pointer"
              style={{
                padding:
                  "12px 36px",

                borderRadius:
                  "12px",

                fontSize:
                  "14px",

                fontWeight:
                  600,

                background:
                  isSaving
                    ? "rgba(249,115,22,0.4)"
                    : "linear-gradient(135deg,#f97316,#ea580c)",

                color:
                  "#fff",

                border:
                  "none",

                boxShadow:
                  isSaving
                    ? "none"
                    : "0 4px 16px rgba(249,115,22,0.4)",

                opacity:
                  isSaving
                    ? 0.7
                    : 1,

                transition:
                  "all 0.2s",
              }}
              onMouseEnter={e => {

                if (
                  !isSaving
                ) {

                  e.currentTarget.style.boxShadow =
                    "0 6px 22px rgba(249,115,22,0.55)";

                  e.currentTarget.style.transform =
                    "translateY(-1px)";

                }

              }}
              onMouseLeave={e => {

                e.currentTarget.style.boxShadow =
                  "0 4px 16px rgba(249,115,22,0.4)";

                e.currentTarget.style.transform =
                  "translateY(0)";

              }}
            >

              {isSaving ? (

                <>

                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    style={{
                      animation:
                        "spin 1s linear infinite"
                    }}
                  >

                    <path d="M21 12a9 9 0 1 1-6.219-8.56"/>

                  </svg>


                  Adding...

                </>

              ) : (

                <>

                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >

                    <line
                      x1="12"
                      y1="5"
                      x2="12"
                      y2="19"
                    />

                    <line
                      x1="5"
                      y1="12"
                      x2="19"
                      y2="12"
                    />

                  </svg>


                  Add Product

                </>

              )}

            </button>

          </div>

        </div>

      </div>

    </>
  );

};


export default AddProduct;