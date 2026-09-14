import React, {
  useEffect,
  useState,
  useContext,
  useCallback
} from "react";

import axios from "axios";

import {
  useParams,
  useNavigate
} from "react-router-dom";

import { ShopContext } from "../../context/ShopContext";
import API_URL from "../../config/api";


/* ── Shared keyframes ── */

const GlobalStyles = () => (
  <style>{`
    @keyframes toastIn  {
      from {
        opacity: 0;
        transform: translateY(-10px) scale(0.95)
      }

      to {
        opacity: 1;
        transform: translateY(0) scale(1)
      }
    }

    @keyframes toastOut {
      from {
        opacity: 1;
        transform: translateY(0) scale(1)
      }

      to {
        opacity: 0;
        transform: translateY(-8px) scale(0.95)
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

const ToastContainer = ({ toasts }) => (
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
          background: "rgba(255,255,255,0.05)",
          border: "1px solid rgba(255,255,255,0.15)",
          backdropFilter: "blur(25px)",
          WebkitBackdropFilter: "blur(25px)",
          borderRadius: "16px",
          boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
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


const EditProduct = () => {

  const { id } = useParams();

  const navigate = useNavigate();

  const { fetchProducts } =
    useContext(ShopContext);


  const [images, setImages] =
    useState([]);


  const [preview, setPreview] =
    useState("");


  const [isSaving, setIsSaving] =
    useState(false);


  const [toasts, setToasts] =
    useState([]);


  const [product, setProduct] =
    useState({
      name: "",
      description: "",
      category: "tshirt",
      price: "",
      sizes: [],
      image: ""
    });


  /* ── Toast ── */

  const showToast = useCallback(
    (message, type = "success") => {

      const toastId = Date.now();

      setToasts(prev => [
        ...prev,
        {
          id: toastId,
          message,
          type,
          leaving: false
        }
      ]);


      setTimeout(() => {

        setToasts(prev =>
          prev.map(t =>
            t.id === toastId
              ? {
                  ...t,
                  leaving: true
                }
              : t
          )
        );


        setTimeout(() => {

          setToasts(prev =>
            prev.filter(
              t => t.id !== toastId
            )
          );

        }, 320);

      }, 2500);

    },
    []
  );


  /* ── Normalize Sizes ── */

  const normalizeLoadedSizes = (
    sizes
  ) => {

    if (
      !Array.isArray(sizes)
    ) {
      return [];
    }


    /*
     * New backend format:
     *
     * {
     *   size: "S",
     *   stock: 10
     * }
     *
     * We also safely handle old
     * string-based size data:
     *
     * "S"
     *
     * Old sizes are given stock 0
     * because the old database did
     * not contain stock information.
     */

    return sizes
      .map(item => {

        if (
          typeof item === "string"
        ) {

          return {
            size:
              item.trim(),

            stock:
              0
          };

        }


        if (
          item &&
          typeof item === "object"
        ) {

          return {
            size:
              String(
                item.size || ""
              ).trim(),

            stock:
              Number.isInteger(
                item.stock
              )
                ? item.stock
                : 0
          };

        }


        return null;

      })
      .filter(
        item =>
          item &&
          item.size
      );

  };


  /* ── Load Product ── */

  useEffect(() => {

    let cancelled = false;


    const loadProduct = async () => {

      try {

        const res = await axios.get(
          `${API_URL}/products/${encodeURIComponent(id)}`,
          {
            withCredentials: true
          }
        );


        if (cancelled) return;


        /*
          Backend response:

          {
            success: true,
            product: {...}
          }
        */

        const data =
          res.data?.product;


        if (!data) {

          showToast(
            "Product not found",
            "error"
          );


          setTimeout(() => {

            if (!cancelled) {

              navigate(
                "/admin/products"
              );

            }

          }, 800);


          return;
        }


        setProduct({

          id:
            data.id,

          name:
            data.name || "",

          description:
            data.description || "",

          category:
            data.category || "tshirt",

          price:
            data.price ?? "",

          sizes:
            normalizeLoadedSizes(
              data.sizes
            ),

          image:
            data.image || "",

          rating:
            data.rating ?? 0

        });


        setPreview(
          data.image || ""
        );


      } catch (error) {

        if (cancelled) return;


        console.error(
          "Load product error:",
          error
        );


        const message =
          error?.response?.data?.message ||
          "Failed to load product";


        showToast(
          message,
          "error"
        );


        setTimeout(() => {

          if (!cancelled) {

            navigate(
              "/admin/products"
            );

          }

        }, 800);

      }

    };


    loadProduct();


    return () => {

      cancelled = true;

    };

  }, [
    id,
    navigate,
    showToast
  ]);


  /* ── Cleanup Preview ── */

  useEffect(() => {

    return () => {

      if (
        preview &&
        preview.startsWith("blob:")
      ) {

        URL.revokeObjectURL(
          preview
        );

      }

    };

  }, [preview]);


  /* ── Handle Image ── */

  const handleImage = (e) => {

    const file =
      e.target.files?.[0];


    if (!file) return;


    if (
      !file.type.startsWith("image/")
    ) {

      showToast(
        "Please upload a valid image file",
        "error"
      );


      e.target.value = "";


      return;

    }


    const maxSize =
      5 * 1024 * 1024;


    if (
      file.size > maxSize
    ) {

      showToast(
        "Image size must be less than 5 MB",
        "error"
      );


      e.target.value = "";


      return;

    }


    if (
      preview &&
      preview.startsWith("blob:")
    ) {

      URL.revokeObjectURL(
        preview
      );

    }


    setImages([
      file
    ]);


    const objectUrl =
      URL.createObjectURL(
        file
      );


    setPreview(
      objectUrl
    );


    /*
      The selected image remains
      a File object.

      It will be uploaded to
      Cloudinary only when the user
      clicks Save Changes.
    */

    e.target.value = "";

  };


  /* ── Remove Image ── */

  const removeImage = () => {

    if (
      preview &&
      preview.startsWith("blob:")
    ) {

      URL.revokeObjectURL(
        preview
      );

    }


    setImages([]);


    /*
      Keep the existing Cloudinary
      image when removing a newly
      selected image.
    */

    setPreview(
      product.image || ""
    );

  };


  /* ── Toggle Size ── */

  const toggleSize = (
    size
  ) => {

    setProduct(prev => {

      const existingSize =
        prev.sizes.find(
          item =>
            item.size === size
        );


      /*
       * If the size already exists,
       * remove it.
       */

      if (existingSize) {

        return {
          ...prev,

          sizes:
            prev.sizes.filter(
              item =>
                item.size !== size
            )
        };

      }


      /*
       * If the size does not exist,
       * add it with stock 0.
       */

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

    });

  };


  /* ── Update Size Stock ── */

  const updateSizeStock = (
    size,
    value
  ) => {

    setProduct(prev => ({

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

    }));

  };


  /* ── Get Size Object ── */

  const getSizeObject = (
    size
  ) => {

    return product.sizes.find(
      item =>
        item.size === size
    );

  };


  /* ── Upload Image To Cloudinary ── */

  const uploadImage = async (
    imageFile
  ) => {

    if (!imageFile) {

      return product.image;

    }


    const formData =
      new FormData();


    formData.append(
      "image",
      imageFile
    );


    const response =
      await axios.post(
        `${API_URL}/uploads/product-image`,
        formData,
        {
          withCredentials: true
        }
      );


    const imageUrl =
      response.data?.image?.url;


    if (!imageUrl) {

      throw new Error(
        "Image upload succeeded but no image URL was returned."
      );

    }


    return imageUrl;

  };


  /* ── Update Product ── */

  const handleUpdate = async () => {

    if (isSaving) return;


    const trimmedName =
      product.name.trim();


    const trimmedDescription =
      product.description.trim();


    const numericPrice =
      Number(
        product.price
      );


    /* ── Basic Validation ── */

    if (!trimmedName) {

      showToast(
        "Product name is required",
        "error"
      );


      return;

    }


    if (!trimmedDescription) {

      showToast(
        "Product description is required",
        "error"
      );


      return;

    }


    if (!product.price) {

      showToast(
        "Product price is required",
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


    if (!product.image) {

      showToast(
        "Product image is required",
        "error"
      );


      return;

    }


    /* ── Validate Sizes ── */

    if (
      !Array.isArray(
        product.sizes
      )
    ) {

      showToast(
        "Invalid product sizes",
        "error"
      );


      return;

    }


    for (
      const sizeItem
      of product.sizes
    ) {

      if (
        !sizeItem ||
        !sizeItem.size ||
        !String(
          sizeItem.size
        ).trim()
      ) {

        showToast(
          "Every selected size must have a valid name",
          "error"
        );


        return;

      }


      if (
        sizeItem.stock === "" ||
        sizeItem.stock === null ||
        sizeItem.stock === undefined
      ) {

        showToast(
          `Please enter stock for size ${sizeItem.size}`,
          "error"
        );


        return;

      }


      if (
        !Number.isInteger(
          Number(
            sizeItem.stock
          )
        )
      ) {

        showToast(
          `Stock for size ${sizeItem.size} must be a whole number`,
          "error"
        );


        return;

      }


      const numericStock =
        Number(
          sizeItem.stock
        );


      if (
        numericStock < 0
      ) {

        showToast(
          `Stock for size ${sizeItem.size} cannot be negative`,
          "error"
        );


        return;

      }


      if (
        numericStock >
        1000000
      ) {

        showToast(
          `Stock for size ${sizeItem.size} is too large`,
          "error"
        );


        return;

      }

    }


    try {

      setIsSaving(
        true
      );


      let imageUrl =
        product.image;


      /*
        If a new image was selected,
        upload it to Cloudinary first.

        If no new image was selected,
        keep the existing Cloudinary URL.
      */

      if (
        images.length > 0
      ) {

        showToast(
          "Uploading image...",
          "success"
        );


        imageUrl =
          await uploadImage(
            images[0]
          );

      }


      /*
        Normalize sizes before sending
        them to the backend.
      */

      const normalizedSizes =
        product.sizes.map(
          item => ({
            size:
              String(
                item.size
              ).trim(),

            stock:
              Number(
                item.stock
              )
          })
        );


      /*
        Only send fields accepted
        by the backend.
      */

      const updatedProduct = {

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
          product.rating ?? 4.5

      };


      await axios.put(

        `${API_URL}/products/${encodeURIComponent(id)}`,

        updatedProduct,

        {
          withCredentials:
            true
        }

      );


      /*
        Refresh the global product list
        after successful backend update.
      */

      try {

        await fetchProducts();

      } catch {

        /*
          Product was already updated
          successfully.

          A product-list refresh failure
          should not incorrectly report
          that the update failed.
        */

      }


      showToast(
        "Product Updated Successfully",
        "success"
      );


      setTimeout(() => {

        navigate(
          "/admin/products"
        );

      }, 800);


    } catch (error) {

      console.error(
        "Update product error:",
        error
      );


      showToast(

        error?.response?.data?.message ||
          "Update Failed",

        "error"

      );


    } finally {

      setIsSaving(
        false
      );

    }

  };


  /* ── Styles ── */

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

    transition:
      "border-color 0.2s",

  };


  const labelStyle = {

    display: "block",

    fontSize: "12px",

    fontWeight: 600,

    color: "#64748b",

    letterSpacing: "0.1em",

    textTransform: "uppercase",

    marginBottom: "8px",

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

        className="
          min-h-screen
          flex
          justify-center
          items-start
          p-3
          sm:p-6
          md:p-8
          rounded-3xl
          pb-20
        "

        style={{
          background:
            "#0b1120"
        }}

      >

        <div

          className="
            w-full
            max-w-4xl
            relative
            overflow-hidden
            rounded-2xl
            sm:rounded-3xl
            p-4
            sm:p-6
            md:p-8
          "

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

            className="
              absolute
              -top-40
              -left-40
              w-96
              h-96
              rounded-full
              blur-3xl
              pointer-events-none
            "

            style={{
              background:
                "rgba(249,115,22,0.08)"
            }}

          />


          <div

            className="
              absolute
              -bottom-40
              -right-40
              w-96
              h-96
              rounded-full
              blur-3xl
              pointer-events-none
            "

            style={{
              background:
                "rgba(99,102,241,0.08)"
            }}

          />


          <div
            className="relative z-10"
          >

            {/* Back button */}

            <button

              type="button"

              onClick={() =>
                navigate(
                  "/admin/products"
                )
              }

              className="
                group
                flex
                items-center
                gap-2
                mb-6
                cursor-pointer
              "

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

                className="
                  text-xs
                  font-semibold
                  uppercase
                  mb-1
                "

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

                className="
                  text-2xl
                  sm:text-3xl
                  font-bold
                "

                style={{

                  color:
                    "#f1f5f9",

                  letterSpacing:
                    "-0.02em"

                }}

              >

                Edit Product

              </h1>

            </div>


            {/* Image upload */}

            <div className="mb-8">

              <span
                style={labelStyle}
              >

                Product Image

              </span>


              <div
                className="
                  flex
                  items-center
                  gap-5
                "
              >

                <label
                  className="
                    group
                    relative
                    cursor-pointer
                  "
                >

                  <img

                    src={preview}

                    alt={
                      product.name ||
                      "Product preview"
                    }

                    className="
                      w-24
                      h-24
                      sm:w-28
                      sm:h-28
                      object-cover
                    "

                    style={{

                      borderRadius:
                        "14px",

                      border:
                        "1px solid rgba(255,255,255,0.12)"

                    }}

                  />


                  <input

                    type="file"

                    hidden

                    accept="image/*"

                    onChange={
                      handleImage
                    }

                  />


                  <div

                    style={{

                      position:
                        "absolute",

                      inset: 0,

                      borderRadius:
                        "14px",

                      background:
                        "rgba(0,0,0,0.55)",

                      opacity: 0,

                      display:
                        "flex",

                      alignItems:
                        "center",

                      justifyContent:
                        "center",

                      color:
                        "#fff",

                      fontSize:
                        "12px",

                      fontWeight:
                        600,

                      transition:
                        "opacity 0.2s",

                      backdropFilter:
                        "blur(4px)",

                    }}

                    className="
                      group-hover:opacity-100
                    "

                  >

                    <div
                      className="
                        flex
                        flex-col
                        items-center
                        gap-1
                      "
                    >

                      <svg

                        width="18"
                        height="18"
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

                  </div>

                </label>


                {images.length > 0 && (

                  <button

                    type="button"

                    onClick={
                      removeImage
                    }

                    className="
                      flex
                      items-center
                      gap-1.5
                      text-xs
                      font-semibold
                      px-3
                      py-1.5
                      rounded-lg
                      cursor-pointer
                    "

                    style={{

                      background:
                        "rgba(239,68,68,0.1)",

                      border:
                        "1px solid rgba(239,68,68,0.2)",

                      color:
                        "#f87171"

                    }}

                    onMouseEnter={e => {

                      e.currentTarget.style.background =
                        "#ef4444";

                      e.currentTarget.style.color =
                        "#fff";

                    }}

                    onMouseLeave={e => {

                      e.currentTarget.style.background =
                        "rgba(239,68,68,0.1)";

                      e.currentTarget.style.color =
                        "#f87171";

                    }}

                  >

                    <svg

                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"

                    >

                      <line
                        x1="18"
                        y1="6"
                        x2="6"
                        y2="18"
                      />

                      <line
                        x1="6"
                        y1="6"
                        x2="18"
                        y2="18"
                      />

                    </svg>


                    Remove

                  </button>

                )}

              </div>

            </div>


            {/* Name */}

            <div className="mb-6">

              <span
                style={labelStyle}
              >

                Name{" "}

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

                autoFocus

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
                style={labelStyle}
              >

                Description

              </span>


              <textarea

                value={
                  product.description
                }

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

            <div
              className="
                grid
                grid-cols-1
                sm:grid-cols-2
                gap-5
                mb-6
              "
            >

              <div>

                <span
                  style={labelStyle}
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

                  ].map(c => (

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

                  ))}

                </select>

              </div>


              <div>

                <span
                  style={labelStyle}
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


            {/* Sizes + Stock */}

            <div className="mb-8">

              <span
                style={labelStyle}
              >

                Sizes & Stock

              </span>


              <div
                className="
                  flex
                  flex-wrap
                  gap-2.5
                  mb-5
                "
              >

                {[

                  "S",
                  "M",
                  "L",
                  "XL",
                  "XXL"

                ].map(size => {

                  const selected =
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

                      className="
                        cursor-pointer
                        transition-all
                        duration-200
                      "

                      style={

                        selected

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
                          !selected
                        ) {

                          e.currentTarget.style.borderColor =
                            "rgba(249,115,22,0.4)";

                          e.currentTarget.style.color =
                            "#f97316";

                        }

                      }}

                      onMouseLeave={e => {

                        if (
                          !selected
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

                })}

              </div>


              {/* Stock inputs */}

              {product.sizes.length > 0 && (

                <div
                  className="
                    grid
                    grid-cols-1
                    sm:grid-cols-2
                    lg:grid-cols-3
                    gap-3
                  "
                >

                  {product.sizes.map(
                    sizeItem => {

                      const stockValue =
                        getSizeObject(
                          sizeItem.size
                        )?.stock;


                      return (

                        <div

                          key={
                            sizeItem.size
                          }

                          style={{

                            background:
                              "rgba(255,255,255,0.03)",

                            border:
                              "1px solid rgba(255,255,255,0.08)",

                            borderRadius:
                              "14px",

                            padding:
                              "14px",

                          }}

                        >

                          <div

                            className="
                              flex
                              items-center
                              justify-between
                              gap-3
                              mb-3
                            "

                          >

                            <div>

                              <p

                                style={{

                                  margin:
                                    0,

                                  color:
                                    "#f1f5f9",

                                  fontSize:
                                    "13px",

                                  fontWeight:
                                    700

                                }}

                              >

                                Size{" "}

                                {sizeItem.size}

                              </p>


                              <p

                                style={{

                                  margin:
                                    "3px 0 0",

                                  color:
                                    "#64748b",

                                  fontSize:
                                    "11px"

                                }}

                              >

                                Available stock

                              </p>

                            </div>


                            <span

                              style={{

                                width:
                                  "30px",

                                height:
                                  "30px",

                                borderRadius:
                                  "9px",

                                display:
                                  "flex",

                                alignItems:
                                  "center",

                                justifyContent:
                                  "center",

                                background:
                                  "rgba(249,115,22,0.1)",

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

                              {sizeItem.size}

                            </span>

                          </div>


                          <input

                            type="number"

                            min="0"

                            max="1000000"

                            step="1"

                            value={
                              stockValue ??
                              ""
                            }

                            placeholder="e.g. 10"

                            style={{

                              ...inputStyle,

                              padding:
                                "10px 12px"

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

                                sizeItem.size,

                                e.target.value

                              )
                            }

                          />

                        </div>

                      );

                    }
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


            {/* Action buttons */}

            <div
              className="
                flex
                flex-col
                sm:flex-row
                gap-3
              "
            >

              <button

                type="button"

                onClick={
                  handleUpdate
                }

                disabled={
                  isSaving
                }

                className="
                  flex
                  items-center
                  justify-center
                  gap-2
                  cursor-pointer
                "

                style={{

                  padding:
                    "12px 32px",

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

                  if (!isSaving) {

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


                    Updating...

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

                      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>

                      <polyline points="17 21 17 13 7 13 7 21"/>

                      <polyline points="7 3 7 8 15 8"/>

                    </svg>


                    Save Changes

                  </>

                )}

              </button>


              <button

                type="button"

                onClick={() =>
                  navigate(
                    "/admin/products"
                  )
                }

                className="
                  flex
                  items-center
                  justify-center
                  gap-2
                  cursor-pointer
                "

                style={{

                  padding:
                    "12px 32px",

                  borderRadius:
                    "12px",

                  fontSize:
                    "14px",

                  fontWeight:
                    500,

                  background:
                    "rgba(255,255,255,0.05)",

                  border:
                    "1px solid rgba(255,255,255,0.1)",

                  color:
                    "#94a3b8",

                  transition:
                    "all 0.2s",

                }}

                onMouseEnter={e => {

                  e.currentTarget.style.background =
                    "rgba(255,255,255,0.1)";

                  e.currentTarget.style.color =
                    "#f1f5f9";

                }}

                onMouseLeave={e => {

                  e.currentTarget.style.background =
                    "rgba(255,255,255,0.05)";

                  e.currentTarget.style.color =
                    "#94a3b8";

                }}

              >

                Cancel

              </button>

            </div>

          </div>

        </div>

      </div>

    </>

  );

};


export default EditProduct;