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
            flex-shrink: 0;
            border-radius: 14px;
            overflow: hidden;
            cursor: pointer;
            border: 1px solid var(--ad-line-hover);
            transition: border-color 0.3s ease, transform 0.3s ease;
          }

          .ap-upload:hover {
            border-color: var(--ad-red);
            transform: translateY(-2px);
          }

          .ap-upload img { display: block; background: #000000; }

          .ap-upload-overlay {
            position: absolute;
            inset: 0;
            background: rgba(0, 0, 0, 0.72);
            backdrop-filter: blur(4px);
            -webkit-backdrop-filter: blur(4px);
            display: flex;
            align-items: center;
            justify-content: center;
            color: #ffffff;
            font-size: 0.78rem;
            font-weight: 700;
            opacity: 0;
            transition: opacity 0.25s ease;
          }

          .ap-upload:hover .ap-upload-overlay { opacity: 1; }

          /* ── Remove-image button ── */
          .ap-remove {
            display: inline-flex;
            align-items: center;
            gap: 0.4rem;
            padding: 0.4rem 0.85rem;
            border-radius: 10px;
            background: transparent;
            color: var(--ad-red);
            border: 1px solid rgba(255, 45, 63, 0.6);
            font-family: inherit;
            font-size: 0.78rem;
            font-weight: 700;
            cursor: pointer;
            transition: background 0.25s ease, color 0.25s ease, border-color 0.25s ease;
          }

          .ap-remove:hover {
            background: var(--ad-red);
            color: #ffffff;
            border-color: var(--ad-red);
          }

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
            padding: 0.9rem;
            border: 1px solid var(--ad-line);
            border-radius: 14px;
            background: transparent;
            animation: ad-rise 0.4s cubic-bezier(0.22, 1, 0.36, 1) both;
            transition: border-color 0.3s ease;
          }

          .ap-stock:hover,
          .ap-stock:focus-within { border-color: var(--ad-line-hover); }

          .ap-stock-badge {
            width: 32px;
            height: 32px;
            flex-shrink: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 10px;
            color: var(--ad-red);
            background: rgba(255, 45, 63, 0.1);
            border: 1px solid var(--ad-line);
            font-size: 0.78rem;
            font-weight: 800;
          }

          .ap-stock-name {
            margin: 0;
            color: #ffffff;
            font-size: 0.92rem;
            font-weight: 700;
          }

          .ap-stock-sub {
            margin: 3px 0 0;
            color: var(--ad-white-soft);
            font-size: 0.76rem;
            font-weight: 500;
          }

          /* ── Divider ── */
          .ap-divider {
            height: 1px;
            background: var(--ad-line);
            margin-bottom: 1.5rem;
          }

          /* ── Submit / Cancel ── */
          .ap-submit {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 0.6rem;
            padding: 0.8rem 2.2rem;
            border-radius: 12px;
            color: #ffffff;
            background: var(--ad-red);
            border: 1px solid var(--ad-red);
            font-family: inherit;
            font-size: 0.95rem;
            font-weight: 800;
            letter-spacing: 0.02em;
            cursor: pointer;
            transition: transform 0.25s ease, box-shadow 0.25s ease;
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

          .ap-cancel {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            padding: 0.8rem 2.2rem;
            border-radius: 12px;
            color: #ffffff;
            background: transparent;
            border: 1px solid rgba(255, 255, 255, 0.4);
            font-family: inherit;
            font-size: 0.95rem;
            font-weight: 700;
            letter-spacing: 0.02em;
            cursor: pointer;
            transition: background 0.25s ease, color 0.25s ease, border-color 0.25s ease;
          }

          .ap-cancel:hover {
            background: #ffffff;
            color: #000000;
            border-color: #ffffff;
          }

          .ap-back:focus-visible,
          .ap-chip:focus-visible,
          .ap-remove:focus-visible,
          .ap-submit:focus-visible,
          .ap-cancel:focus-visible,
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
            .ap-remove,
            .ap-chip,
            .ap-submit,
            .ap-cancel {
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

            type="button"

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
              Edit Product
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

                Product Image

              </span>


              <div
                className="
                  flex
                  items-center
                  gap-5
                "
              >

                <label className="ap-upload">

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

                  />


                  <input

                    type="file"

                    hidden

                    accept="image/*"

                    onChange={
                      handleImage
                    }

                  />


                  <div className="ap-upload-overlay">

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

                    className="ap-remove"

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

              <span className="ap-label">

                Name{" "}

                <span className="ap-req">
                  *
                </span>

              </span>


              <input

                className="ap-field"

                value={
                  product.name
                }

                autoFocus

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

                Description

              </span>


              <textarea

                className="ap-field"

                value={
                  product.description
                }

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

                  ].map(c => (

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

                  ))}

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

              <span className="ap-label">

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

                      className={`ap-chip ${
                        selected
                          ? "ap-chip--on"
                          : "ap-chip--off"
                      }`}

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

                          className="ap-stock"

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

                              <p className="ap-stock-name">

                                Size{" "}

                                {sizeItem.size}

                              </p>


                              <p className="ap-stock-sub">

                                Available stock

                              </p>

                            </div>


                            <span className="ap-stock-badge">

                              {sizeItem.size}

                            </span>

                          </div>


                          <input

                            className="ap-field"

                            type="number"

                            min="0"

                            max="1000000"

                            step="1"

                            value={
                              stockValue ??
                              ""
                            }

                            placeholder="e.g. 10"

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

            <div className="ap-divider" />


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


                    Updating...

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

                className="ap-cancel"

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