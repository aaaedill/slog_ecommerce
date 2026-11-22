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


/* ── Glass Toast (black + red theme) ── */

const ToastContainer = ({ toasts }) => (
  <div style={{
    position: "fixed", top: "100px", left: "50%", transform: "translateX(-50%)",
    zIndex: 9999, display: "flex", flexDirection: "column", alignItems: "stretch",
    gap: "10px", width: "min(340px, calc(100vw - 32px))", pointerEvents: "none",
  }}>
    <style>{`
      @keyframes toastIn  { from{opacity:0;transform:translateY(-10px) scale(0.97)} to{opacity:1;transform:translateY(0) scale(1)} }
      @keyframes toastOut { from{opacity:1;transform:translateY(0) scale(1)} to{opacity:0;transform:translateY(-8px) scale(0.97)} }
    `}</style>

    {toasts.map((t) => (
      <div key={t.id} style={{
        display: "flex", alignItems: "center", gap: "12px", padding: "13px 18px",
        background: "rgba(0,0,0,0.6)",
        border: t.type === "error"
          ? "1px solid rgba(255,45,63,0.6)"
          : "1px solid rgba(255,255,255,0.22)",
        backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)",
        borderRadius: "14px",
        color: "#ffffff", fontSize: "14px", fontWeight: 600,
        fontFamily: "'Manrope', 'Inter', system-ui, sans-serif",
        pointerEvents: "auto",
        animation: t.leaving
          ? "toastOut 0.3s ease forwards"
          : "toastIn 0.35s cubic-bezier(0.22,1,0.36,1) forwards",
      }}>
        <span style={{
          width: 20,
          height: 20,
          borderRadius: "50%",
          background: t.type === "error" ? "#ff2d3f" : "#ffffff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0
        }}>
          {t.type === "error" ? (
            <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
              <line x1="2" y1="2" x2="10" y2="10" stroke="#ffffff" strokeWidth="1.8" strokeLinecap="round" />
              <line x1="10" y1="2" x2="2" y2="10" stroke="#ffffff" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          ) : (
            <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
              <polyline points="2,6 5,9 10,3" stroke="#000000" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </span>

        <span>{t.message}</span>
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


  return (
    <>

      <ToastContainer
        toasts={
          toasts
        }
      />


      <div
        className="ad-root min-h-screen flex justify-center items-start p-3 sm:p-5 md:p-8 pb-20"
      >

        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap');

          .ad-root {
            --ad-red:        #ff2d3f;
            --ad-line:       rgba(255, 45, 63, 0.22);
            --ad-line-hover: rgba(255, 45, 63, 0.6);
            --ad-white:      #ffffff;
            --ad-white-soft: rgba(255, 255, 255, 0.7);

            position: relative;
            overflow: hidden;
            background: #000000;
            color: var(--ad-white);
            font-family: 'Manrope', 'Inter', system-ui, sans-serif;
            -webkit-font-smoothing: antialiased;
          }

          @keyframes spin { to { transform: rotate(360deg); } }

          /* ── Entrance ── */
          .ad-rise {
            opacity: 0;
            animation: ad-rise 0.7s cubic-bezier(0.22, 1, 0.36, 1) forwards;
          }

          @keyframes ad-rise {
            from { opacity: 0; transform: translateY(14px); }
            to   { opacity: 1; transform: translateY(0); }
          }

          /* ── Heading ── */
          .ad-overline {
            display: inline-flex;
            align-items: center;
            gap: 0.65rem;
            color: var(--ad-red);
            font-size: 0.78rem;
            font-weight: 700;
            letter-spacing: 0.22em;
            text-transform: uppercase;
            margin-bottom: 0.5rem;
          }

          .ad-overline::before {
            content: '';
            width: 28px;
            height: 2px;
            background: var(--ad-red);
          }

          .ad-title {
            color: var(--ad-white);
            font-weight: 800;
            letter-spacing: -0.03em;
            line-height: 1.05;
            font-size: clamp(2.2rem, 4vw, 3rem);
          }

          .ad-title-bar {
            margin-top: 1rem;
            height: 2px;
            width: 84px;
            border-radius: 2px;
            background: var(--ad-red);
            transform-origin: left center;
            animation: ad-draw 0.9s cubic-bezier(0.22, 1, 0.36, 1) 0.3s both;
          }

          @keyframes ad-draw {
            from { transform: scaleX(0); }
            to   { transform: scaleX(1); }
          }

          /* ── Panel ── */
          .ad-panel {
            position: relative;
            background: transparent;
            border: 1px solid var(--ad-line);
            border-radius: 16px;
            transition: border-color 0.3s ease;
          }

          .ad-panel:hover,
          .ad-panel:focus-within {
            border-color: var(--ad-line-hover);
          }

          .ad-panel-title {
            display: flex;
            align-items: center;
            gap: 0.65rem;
            color: var(--ad-white);
            font-weight: 700;
            letter-spacing: -0.015em;
            font-size: clamp(1.05rem, 1.4vw, 1.25rem);
          }

          .ad-panel-title::before {
            content: '';
            width: 3px;
            height: 1.1em;
            border-radius: 2px;
            background: var(--ad-red);
          }

          /* ── Back button ── */
          .ap-back {
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.45rem 0.95rem 0.45rem 0.7rem;
            border-radius: 10px;
            background: transparent;
            border: 1px solid rgba(255, 255, 255, 0.4);
            color: #ffffff;
            font-family: inherit;
            font-size: 0.82rem;
            font-weight: 700;
            letter-spacing: 0.02em;
            cursor: pointer;
            transition: background 0.25s ease, color 0.25s ease, border-color 0.25s ease;
          }

          .ap-back svg { transition: transform 0.3s cubic-bezier(0.22, 1, 0.36, 1); }

          .ap-back:hover {
            background: #ffffff;
            color: #000000;
            border-color: #ffffff;
          }

          .ap-back:hover svg { transform: translateX(-3px); }

          /* ── Form labels + fields ── */
          .ap-label {
            display: block;
            margin-bottom: 0.6rem;
            color: var(--ad-white-soft);
            font-size: 0.74rem;
            font-weight: 700;
            letter-spacing: 0.14em;
            text-transform: uppercase;
          }

          .ap-req { color: var(--ad-red); }

          .ap-field {
            width: 100%;
            background: transparent;
            border: 1px solid rgba(255, 255, 255, 0.22);
            border-radius: 12px;
            padding: 0.75rem 1rem;
            color: #ffffff;
            font-family: inherit;
            font-size: 0.95rem;
            font-weight: 500;
            outline: none;
            transition: border-color 0.25s ease, box-shadow 0.25s ease, background 0.25s ease;
          }

          .ap-field:hover { border-color: rgba(255, 255, 255, 0.4); }

          .ap-field:focus {
            border-color: var(--ad-red);
            background: rgba(255, 45, 63, 0.04);
            box-shadow: 0 0 0 3px rgba(255, 45, 63, 0.18);
          }

          .ap-field::placeholder { color: rgba(255, 255, 255, 0.35); }

          .ap-field option { background: #000000; color: #ffffff; }

          select.ap-field {
            cursor: pointer;
            appearance: none;
            -webkit-appearance: none;
            padding-right: 2.5rem;
            background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='%23ff2d3f' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");
            background-repeat: no-repeat;
            background-position: right 1rem center;
          }

          textarea.ap-field { resize: none; line-height: 1.6; }

          input[type=number]::-webkit-inner-spin-button,
          input[type=number]::-webkit-outer-spin-button { -webkit-appearance: none; }

          input[type=number] { -moz-appearance: textfield; }

          /* ── Image upload ── */
          .ap-upload {
            position: relative;
            display: block;
            width: 112px;
            height: 112px;
            border-radius: 14px;
            overflow: hidden;
            cursor: pointer;
            background: transparent;
            color: var(--ad-white-soft);
            transition: border-color 0.3s ease, color 0.3s ease, background 0.3s ease, transform 0.3s ease;
          }

          .ap-upload--empty {
            border: 2px dashed var(--ad-line-hover);
          }

          .ap-upload--empty:hover {
            color: #ffffff;
            background: rgba(255, 45, 63, 0.08);
            border-color: var(--ad-red);
            transform: translateY(-2px);
          }

          .ap-upload--filled { border: 1px solid var(--ad-line-hover); }

          .ap-upload-inner {
            width: 100%;
            height: 100%;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 6px;
            font-size: 0.78rem;
            font-weight: 700;
            letter-spacing: 0.03em;
          }

          .ap-upload-inner svg { color: var(--ad-red); }

          .ap-upload-overlay {
            position: absolute;
            inset: 0;
            background: rgba(0, 0, 0, 0.72);
            backdrop-filter: blur(4px);
            -webkit-backdrop-filter: blur(4px);
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 4px;
            color: #ffffff;
            font-size: 0.78rem;
            font-weight: 700;
            opacity: 0;
            transition: opacity 0.25s ease;
          }

          .ap-upload:hover .ap-upload-overlay { opacity: 1; }

          /* ── Size chips ── */
          .ap-chip {
            padding: 0.5rem 1.15rem;
            border-radius: 10px;
            font-family: inherit;
            font-size: 0.85rem;
            font-weight: 700;
            cursor: pointer;
            transition: background 0.25s ease, color 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease, transform 0.25s ease;
          }

          .ap-chip--off {
            background: transparent;
            color: #ffffff;
            border: 1px solid rgba(255, 255, 255, 0.3);
          }

          .ap-chip--off:hover {
            border-color: var(--ad-red);
            color: var(--ad-red);
            transform: translateY(-1px);
          }

          .ap-chip--on {
            background: var(--ad-red);
            color: #ffffff;
            border: 1px solid var(--ad-red);
            box-shadow: 0 0 20px rgba(255, 45, 63, 0.4);
          }

          /* ── Per-size stock card ── */
          .ap-stock {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 14px;
            padding: 0.8rem 1rem;
            border: 1px solid var(--ad-line);
            border-radius: 12px;
            background: transparent;
            animation: ad-rise 0.4s cubic-bezier(0.22, 1, 0.36, 1) both;
            transition: border-color 0.3s ease;
          }

          .ap-stock:hover,
          .ap-stock:focus-within { border-color: var(--ad-line-hover); }

          .ap-stock-badge {
            width: 36px;
            height: 36px;
            flex-shrink: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 10px;
            color: var(--ad-red);
            background: rgba(255, 45, 63, 0.1);
            border: 1px solid var(--ad-line);
            font-size: 0.8rem;
            font-weight: 800;
          }

          .ap-stock-name {
            color: #ffffff;
            font-size: 0.92rem;
            font-weight: 700;
          }

          .ap-stock-sub {
            color: var(--ad-white-soft);
            font-size: 0.76rem;
            font-weight: 500;
            margin-top: 2px;
          }

          .ap-stock-input {
            width: 96px;
            text-align: center;
            padding: 0.55rem 0.7rem;
            font-size: 0.9rem;
            font-weight: 700;
          }

          .ap-unit {
            color: var(--ad-white-soft);
            font-size: 0.78rem;
            font-weight: 600;
          }

          /* ── Divider ── */
          .ap-divider {
            height: 1px;
            background: var(--ad-line);
            margin-bottom: 1.5rem;
          }

          /* ── Submit ── */
          .ap-submit {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 0.6rem;
            padding: 0.8rem 2.4rem;
            border-radius: 12px;
            color: #ffffff;
            background: var(--ad-red);
            border: 1px solid var(--ad-red);
            font-family: inherit;
            font-size: 0.95rem;
            font-weight: 800;
            letter-spacing: 0.02em;
            cursor: pointer;
            transition: transform 0.25s ease, box-shadow 0.25s ease, background 0.25s ease, color 0.25s ease;
          }

          .ap-submit:hover:not(:disabled) {
            transform: translateY(-2px);
            box-shadow: 0 0 30px rgba(255, 45, 63, 0.55);
          }

          .ap-submit:active:not(:disabled) { transform: translateY(0); }

          .ap-submit:disabled {
            opacity: 0.6;
            cursor: not-allowed;
          }

          .ap-back:focus-visible,
          .ap-chip:focus-visible,
          .ap-submit:focus-visible,
          .ap-upload:focus-within {
            outline: 2px solid #ffffff;
            outline-offset: 2px;
          }

          /* ── Reduced motion ── */
          @media (prefers-reduced-motion: reduce) {
            .ad-rise,
            .ad-title-bar,
            .ap-stock {
              animation: none !important;
              opacity: 1 !important;
              transform: none !important;
            }

            .ap-back,
            .ap-back svg,
            .ap-field,
            .ap-upload,
            .ap-upload-overlay,
            .ap-chip,
            .ap-submit {
              transition: none !important;
            }
          }
        `}</style>

        {/* Content */}
        <div
          className="w-full max-w-4xl relative p-2 sm:p-4 md:p-6"
        >

          {/* Back button */}

          <button
            onClick={() =>
              navigate(
                "/admin/products"
              )
            }
            className="ap-back mb-6 ad-rise"
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

          <div className="mb-8 sm:mb-10 relative ad-rise">

            <p className="ad-overline">
              Inventory
            </p>

            <h1 className="ad-title">
              Add Product
            </h1>

            <div className="ad-title-bar" />

          </div>


          {/* Form panel */}

          <div
            className="ad-panel ad-rise rounded-xl p-5 sm:p-6 md:p-8 relative"
            style={{ animationDelay: "0.15s" }}
          >

            <h2 className="ad-panel-title mb-7">
              Product Details
            </h2>


            {/* Image upload */}

            <div className="mb-8">

              <span className="ap-label">

                Product Image{" "}

                <span className="ap-req">
                  *
                </span>

              </span>


              <label
                className={`ap-upload ${
                  images[0]
                    ? "ap-upload--filled"
                    : "ap-upload--empty"
                }`}
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


                    <div className="ap-upload-overlay">

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

                  </>

                ) : (

                  <div className="ap-upload-inner">

                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.6"
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

              <span className="ap-label">

                Product Name{" "}

                <span className="ap-req">
                  *
                </span>

              </span>


              <input
                className="ap-field"
                value={
                  product.name
                }
                placeholder="e.g. Oversized Black Hoodie"
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

              <span className="ap-label">

                Description{" "}

                <span className="ap-req">
                  *
                </span>

              </span>


              <textarea
                className="ap-field"
                value={
                  product.description
                }
                placeholder="Describe the product..."
                rows={4}
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

                <span className="ap-label">
                  Category
                </span>


                <select
                  className="ap-field"
                  value={
                    product.category
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

                <span className="ap-label">

                  Price (₹){" "}

                  <span className="ap-req">
                    *
                  </span>

                </span>


                <input
                  className="ap-field"
                  type="number"
                  min="0"
                  step="0.01"
                  value={
                    product.price
                  }
                  placeholder="e.g. 999"
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

              <span className="ap-label">
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
                        className={`ap-chip ${
                          isSelected
                            ? "ap-chip--on"
                            : "ap-chip--off"
                        }`}
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
                        className="ap-stock"
                      >

                        <div
                          className="flex items-center gap-2.5"
                          style={{
                            minWidth:
                              0
                          }}
                        >

                          <div className="ap-stock-badge">
                            {item.size}
                          </div>


                          <div>

                            <div className="ap-stock-name">
                              Size {item.size}
                            </div>

                            <div className="ap-stock-sub">
                              Available stock
                            </div>

                          </div>

                        </div>


                        <div
                          className="flex items-center gap-2"
                          style={{
                            flexShrink:
                              0
                          }}
                        >

                          <input
                            className="ap-field ap-stock-input"
                            type="number"
                            min="0"
                            max="1000000"
                            step="1"
                            value={
                              item.stock
                            }
                            placeholder="0"
                            aria-label={`Stock for size ${item.size}`}
                            onChange={e =>
                              updateSizeStock(
                                item.size,
                                e.target.value
                              )
                            }
                          />

                          <span className="ap-unit">
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

            <div className="ap-divider" />


            {/* Submit */}

            <button
              onClick={
                handleSubmit
              }
              disabled={
                isSaving
              }
              className="ap-submit"
            >

              {isSaving ? (

                <>

                  <svg
                    width="15"
                    height="15"
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
                    width="15"
                    height="15"
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