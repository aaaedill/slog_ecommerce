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
    position: "fixed",
    top: "clamp(72px, 10vw, 100px)",
    left: "50%",
    transform: "translateX(-50%)",
    zIndex: 9999,
    display: "flex",
    flexDirection: "column",
    alignItems: "stretch",
    gap: "10px",
    width: "min(360px, calc(100vw - 24px))",
    pointerEvents: "none",
  }}>
    <style>{`
      @keyframes toastIn  { from{opacity:0;transform:translateY(-10px) scale(0.97)} to{opacity:1;transform:translateY(0) scale(1)} }
      @keyframes toastOut { from{opacity:1;transform:translateY(0) scale(1)} to{opacity:0;transform:translateY(-8px) scale(0.97)} }
    `}</style>

    {toasts.map((t) => (
      <div key={t.id} style={{
        display: "flex", alignItems: "center", gap: "12px",
        padding: "clamp(10px, 2.4vw, 13px) clamp(14px, 3vw, 18px)",
        background: "rgba(0,0,0,0.6)",
        border: t.type === "error"
          ? "1px solid rgba(255,45,63,0.6)"
          : "1px solid rgba(255,255,255,0.22)",
        backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)",
        borderRadius: "14px",
        color: "#ffffff", fontSize: "clamp(13px, 2.4vw, 14px)", fontWeight: 600,
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

        <span style={{ minWidth: 0, overflowWrap: "anywhere" }}>{t.message}</span>
      </div>
    ))}
  </div>
);


const EditProduct = () => {

  const { id } = useParams();

  const navigate = useNavigate();

  const { fetchProducts } = useContext(ShopContext);

  const [images, setImages] = useState([]);

  const [preview, setPreview] = useState("");

  const [isSaving, setIsSaving] = useState(false);

  const [toasts, setToasts] = useState([]);

  const [product, setProduct] = useState({
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
              ? { ...t, leaving: true }
              : t
          )
        );

        setTimeout(() => {

          setToasts(prev =>
            prev.filter(t => t.id !== toastId)
          );

        }, 320);

      }, 2500);

    },
    []
  );


  /* ── Normalize Sizes ── */

  const normalizeLoadedSizes = (sizes) => {

    if (!Array.isArray(sizes)) {
      return [];
    }

    /*
     * New backend format: { size: "S", stock: 10 }
     * Old string-based data ("S") is handled safely with stock 0
     * because the old database did not contain stock information.
     */

    return sizes
      .map(item => {

        if (typeof item === "string") {
          return {
            size: item.trim(),
            stock: 0
          };
        }

        if (item && typeof item === "object") {
          return {
            size: String(item.size || "").trim(),
            stock: Number.isInteger(item.stock) ? item.stock : 0
          };
        }

        return null;

      })
      .filter(item => item && item.size);

  };


  /* ── Load Product ── */

  useEffect(() => {

    let cancelled = false;

    const loadProduct = async () => {

      try {

        const res = await axios.get(
          `${API_URL}/products/${encodeURIComponent(id)}`,
          { withCredentials: true }
        );

        if (cancelled) return;

        /* Backend response: { success: true, product: {...} } */

        const data = res.data?.product;

        if (!data) {

          showToast("Product not found", "error");

          setTimeout(() => {
            if (!cancelled) {
              navigate("/admin/products");
            }
          }, 800);

          return;
        }

        setProduct({
          id: data.id,
          name: data.name || "",
          description: data.description || "",
          category: data.category || "tshirt",
          price: data.price ?? "",
          sizes: normalizeLoadedSizes(data.sizes),
          image: data.image || "",
          rating: data.rating ?? 0
        });

        setPreview(data.image || "");

      } catch (error) {

        if (cancelled) return;

        console.error("Load product error:", error);

        const message =
          error?.response?.data?.message ||
          "Failed to load product";

        showToast(message, "error");

        setTimeout(() => {
          if (!cancelled) {
            navigate("/admin/products");
          }
        }, 800);

      }

    };

    loadProduct();

    return () => {
      cancelled = true;
    };

  }, [id, navigate, showToast]);


  /* ── Cleanup Preview ── */

  useEffect(() => {

    return () => {
      if (preview && preview.startsWith("blob:")) {
        URL.revokeObjectURL(preview);
      }
    };

  }, [preview]);


  /* ── Handle Image ── */

  const handleImage = (e) => {

    const file = e.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      showToast("Please upload a valid image file", "error");
      e.target.value = "";
      return;
    }

    const maxSize = 5 * 1024 * 1024;

    if (file.size > maxSize) {
      showToast("Image size must be less than 5 MB", "error");
      e.target.value = "";
      return;
    }

    if (preview && preview.startsWith("blob:")) {
      URL.revokeObjectURL(preview);
    }

    setImages([file]);

    const objectUrl = URL.createObjectURL(file);

    setPreview(objectUrl);

    /*
      The selected image remains a File object.
      It will be uploaded to Cloudinary only when the user
      clicks Save Changes.
    */

    e.target.value = "";

  };


  /* ── Remove Image ── */

  const removeImage = () => {

    if (preview && preview.startsWith("blob:")) {
      URL.revokeObjectURL(preview);
    }

    setImages([]);

    /*
      Keep the existing Cloudinary image when removing a newly
      selected image.
    */

    setPreview(product.image || "");

  };


  /* ── Toggle Size ── */

  const toggleSize = (size) => {

    setProduct(prev => {

      const existingSize = prev.sizes.find(
        item => item.size === size
      );

      /* If the size already exists, remove it. */

      if (existingSize) {
        return {
          ...prev,
          sizes: prev.sizes.filter(item => item.size !== size)
        };
      }

      /* If the size does not exist, add it with stock 0. */

      return {
        ...prev,
        sizes: [
          ...prev.sizes,
          { size, stock: 0 }
        ]
      };

    });

  };


  /* ── Update Size Stock ── */

  const updateSizeStock = (size, value) => {

    setProduct(prev => ({
      ...prev,
      sizes: prev.sizes.map(item =>
        item.size === size
          ? {
              ...item,
              stock: value === "" ? "" : Number(value)
            }
          : item
      )
    }));

  };


  /* ── Get Size Object ── */

  const getSizeObject = (size) => {

    return product.sizes.find(item => item.size === size);

  };


  /* ── Upload Image To Cloudinary ── */

  const uploadImage = async (imageFile) => {

    if (!imageFile) {
      return product.image;
    }

    const formData = new FormData();

    formData.append("image", imageFile);

    const response = await axios.post(
      `${API_URL}/uploads/product-image`,
      formData,
      { withCredentials: true }
    );

    const imageUrl = response.data?.image?.url;

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

    const trimmedName = product.name.trim();

    const trimmedDescription = product.description.trim();

    const numericPrice = Number(product.price);

    /* ── Basic Validation ── */

    if (!trimmedName) {
      showToast("Product name is required", "error");
      return;
    }

    if (!trimmedDescription) {
      showToast("Product description is required", "error");
      return;
    }

    if (!product.price) {
      showToast("Product price is required", "error");
      return;
    }

    if (!Number.isFinite(numericPrice) || numericPrice <= 0) {
      showToast("Please enter a valid price", "error");
      return;
    }

    if (!product.image) {
      showToast("Product image is required", "error");
      return;
    }

    /* ── Validate Sizes ── */

    if (!Array.isArray(product.sizes)) {
      showToast("Invalid product sizes", "error");
      return;
    }

    for (const sizeItem of product.sizes) {

      if (
        !sizeItem ||
        !sizeItem.size ||
        !String(sizeItem.size).trim()
      ) {
        showToast("Every selected size must have a valid name", "error");
        return;
      }

      if (
        sizeItem.stock === "" ||
        sizeItem.stock === null ||
        sizeItem.stock === undefined
      ) {
        showToast(`Please enter stock for size ${sizeItem.size}`, "error");
        return;
      }

      if (!Number.isInteger(Number(sizeItem.stock))) {
        showToast(
          `Stock for size ${sizeItem.size} must be a whole number`,
          "error"
        );
        return;
      }

      const numericStock = Number(sizeItem.stock);

      if (numericStock < 0) {
        showToast(
          `Stock for size ${sizeItem.size} cannot be negative`,
          "error"
        );
        return;
      }

      if (numericStock > 1000000) {
        showToast(
          `Stock for size ${sizeItem.size} is too large`,
          "error"
        );
        return;
      }

    }

    try {

      setIsSaving(true);

      let imageUrl = product.image;

      /*
        If a new image was selected, upload it to Cloudinary first.
        If no new image was selected, keep the existing Cloudinary URL.
      */

      if (images.length > 0) {

        showToast("Uploading image...", "success");

        imageUrl = await uploadImage(images[0]);

      }

      /* Normalize sizes before sending them to the backend. */

      const normalizedSizes = product.sizes.map(item => ({
        size: String(item.size).trim(),
        stock: Number(item.stock)
      }));

      /* Only send fields accepted by the backend. */

      const updatedProduct = {
        name: trimmedName,
        description: trimmedDescription,
        price: numericPrice,
        image: imageUrl,
        category: product.category,
        sizes: normalizedSizes,
        rating: product.rating ?? 4.5
      };

      await axios.put(
        `${API_URL}/products/${encodeURIComponent(id)}`,
        updatedProduct,
        { withCredentials: true }
      );

      /* Refresh the global product list after successful backend update. */

      try {

        await fetchProducts();

      } catch {

        /*
          Product was already updated successfully.
          A product-list refresh failure should not incorrectly
          report that the update failed.
        */

      }

      showToast("Product Updated Successfully", "success");

      setTimeout(() => {
        navigate("/admin/products");
      }, 800);

    } catch (error) {

      console.error("Update product error:", error);

      showToast(
        error?.response?.data?.message || "Update Failed",
        "error"
      );

    } finally {

      setIsSaving(false);

    }

  };


  return (

    <>

      <ToastContainer toasts={toasts} />

      <div className="ad-root min-h-screen flex justify-center items-start">

        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap');

          .ad-root {
            --ad-red:        #ff2d3f;
            --ad-line:       rgba(255, 45, 63, 0.22);
            --ad-line-hover: rgba(255, 45, 63, 0.6);
            --ad-white:      #ffffff;
            --ad-white-soft: rgba(255, 255, 255, 0.7);

            /* ── responsive scale (overridden per breakpoint below) ── */
            --ad-max:        100%;
            --ad-px:         0.625rem;
            --ad-py:         0.75rem;
            --ad-pb:         4rem;
            --ad-panel-p:    1rem;
            --ad-panel-r:    14px;
            --ad-gap:        1rem;
            --ad-gap-lg:     1.25rem;
            --ad-sect:       1.25rem;
            --ad-title:      1.85rem;
            --ad-over:       0.68rem;
            --ad-panel-fs:   1.05rem;
            --ad-label-fs:   0.68rem;
            --ad-field-fs:   1rem;
            --ad-field-px:   0.85rem;
            --ad-field-py:   0.7rem;
            --ad-img:        5.5rem;
            --ad-chip-px:    0.9rem;
            --ad-chip-py:    0.5rem;
            --ad-chip-fs:    0.8rem;
            --ad-btn-px:     1.25rem;
            --ad-btn-py:     0.8rem;
            --ad-btn-fs:     0.92rem;
            --ad-stock-min:  7.25rem;

            position: relative;
            overflow: hidden;
            width: 100%;
            background: #000000;
            color: var(--ad-white);
            font-family: 'Manrope', 'Inter', system-ui, sans-serif;
            -webkit-font-smoothing: antialiased;
            padding:
              var(--ad-py)
              max(var(--ad-px), env(safe-area-inset-right))
              var(--ad-pb)
              max(var(--ad-px), env(safe-area-inset-left));
          }

          @keyframes spin { to { transform: rotate(360deg); } }

          /* ── Layout skeleton ── */
          .ep-wrap {
            position: relative;
            width: 100%;
            max-width: var(--ad-max);
            margin: 0 auto;
          }

          /* header: back + title (stack on phones, one row from 640) */
          .ep-head {
            display: flex;
            flex-direction: column;
            align-items: flex-start;
            gap: 1rem;
            margin-bottom: var(--ad-sect);
          }

          .ep-head-text { min-width: 0; }

          /* two-column body on laptops: image card | fields */
          .ep-grid {
            display: grid;
            grid-template-columns: minmax(0, 1fr);
            gap: var(--ad-gap-lg);
          }

          .ep-aside { min-width: 0; }

          .ep-main { min-width: 0; }

          .ep-media {
            display: flex;
            flex-direction: row;
            align-items: center;
            gap: var(--ad-gap);
          }

          .ep-media-info {
            display: flex;
            flex-direction: column;
            align-items: flex-start;
            gap: 0.6rem;
            min-width: 0;
          }

          .ep-hint {
            margin: 0;
            color: var(--ad-white-soft);
            font-size: 0.78rem;
            font-weight: 500;
            line-height: 1.5;
          }

          /* category + price */
          .ep-two {
            display: grid;
            grid-template-columns: minmax(0, 1fr);
            gap: var(--ad-gap);
          }

          /* size chips: share the row evenly on phones */
          .ep-chips {
            display: grid;
            grid-template-columns: repeat(5, minmax(0, 1fr));
            gap: 0.4rem;
          }

          /* stock cards: auto-fit so columns grow with available width */
          .ep-stocks {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(var(--ad-stock-min), 1fr));
            gap: 0.65rem;
          }

          /* actions */
          .ep-actions {
            display: flex;
            flex-direction: column-reverse;
            gap: 0.65rem;
          }

          .ep-field-block { margin-bottom: var(--ad-sect); }

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
            font-size: var(--ad-over);
            font-weight: 700;
            letter-spacing: 0.22em;
            text-transform: uppercase;
            margin: 0 0 0.5rem;
          }

          .ad-overline::before {
            content: '';
            width: 24px;
            height: 2px;
            background: var(--ad-red);
          }

          .ad-title {
            margin: 0;
            color: var(--ad-white);
            font-weight: 800;
            letter-spacing: -0.03em;
            line-height: 1.05;
            font-size: var(--ad-title);
          }

          .ad-title-bar {
            margin-top: 0.85rem;
            height: 2px;
            width: 72px;
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
            border-radius: var(--ad-panel-r);
            padding: var(--ad-panel-p);
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
            margin: 0 0 var(--ad-sect);
            color: var(--ad-white);
            font-weight: 700;
            letter-spacing: -0.015em;
            font-size: var(--ad-panel-fs);
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
            flex-shrink: 0;
            min-height: 2.5rem;
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
            margin-bottom: 0.55rem;
            color: var(--ad-white-soft);
            font-size: var(--ad-label-fs);
            font-weight: 700;
            letter-spacing: 0.14em;
            text-transform: uppercase;
          }

          .ap-req { color: var(--ad-red); }

          .ap-field {
            width: 100%;
            min-width: 0;
            background: transparent;
            border: 1px solid rgba(255, 255, 255, 0.22);
            border-radius: 12px;
            padding: var(--ad-field-py) var(--ad-field-px);
            color: #ffffff;
            font-family: inherit;
            font-size: var(--ad-field-fs);
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

          .ap-upload img {
            display: block;
            width: var(--ad-img);
            height: var(--ad-img);
            object-fit: cover;
            background: #000000;
          }

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

          /* touch devices have no hover: show a small persistent hint */
          @media (hover: none) {
            .ap-upload-overlay {
              opacity: 1;
              inset: auto 0 0 0;
              padding: 0.3rem 0;
              background: rgba(0, 0, 0, 0.7);
            }

            .ap-upload-overlay svg { display: none; }
          }

          /* ── Remove-image button ── */
          .ap-remove {
            display: inline-flex;
            align-items: center;
            gap: 0.4rem;
            min-height: 2.25rem;
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
            min-height: 2.5rem;
            padding: var(--ad-chip-py) var(--ad-chip-px);
            border-radius: 10px;
            font-family: inherit;
            font-size: var(--ad-chip-fs);
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
            min-width: 0;
            padding: 0.8rem;
            border: 1px solid var(--ad-line);
            border-radius: 14px;
            background: transparent;
            animation: ad-rise 0.4s cubic-bezier(0.22, 1, 0.36, 1) both;
            transition: border-color 0.3s ease;
          }

          .ap-stock:hover,
          .ap-stock:focus-within { border-color: var(--ad-line-hover); }

          .ap-stock-badge {
            width: 30px;
            height: 30px;
            flex-shrink: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 10px;
            color: var(--ad-red);
            background: rgba(255, 45, 63, 0.1);
            border: 1px solid var(--ad-line);
            font-size: 0.74rem;
            font-weight: 800;
          }

          .ap-stock-name {
            margin: 0;
            color: #ffffff;
            font-size: 0.9rem;
            font-weight: 700;
          }

          .ap-stock-sub {
            margin: 3px 0 0;
            color: var(--ad-white-soft);
            font-size: 0.74rem;
            font-weight: 500;
          }

          /* ── Divider ── */
          .ap-divider {
            height: 1px;
            background: var(--ad-line);
            margin-bottom: var(--ad-sect);
          }

          /* ── Submit / Cancel ── */
          .ap-submit,
          .ap-cancel {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 0.6rem;
            min-height: 2.9rem;
            padding: var(--ad-btn-py) var(--ad-btn-px);
            border-radius: 12px;
            font-family: inherit;
            font-size: var(--ad-btn-fs);
            letter-spacing: 0.02em;
            cursor: pointer;
          }

          .ap-submit {
            color: #ffffff;
            background: var(--ad-red);
            border: 1px solid var(--ad-red);
            font-weight: 800;
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
            color: #ffffff;
            background: transparent;
            border: 1px solid rgba(255, 255, 255, 0.4);
            font-weight: 700;
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

          /* ═══════════ Responsive scale ═══════════ */

          /* ≥ 360px: standard phones */
          @media (min-width: 360px) {
            .ad-root {
              --ad-px: 0.75rem;
              --ad-panel-p: 1.15rem;
              --ad-title: 2rem;
              --ad-img: 6rem;
              --ad-stock-min: 7.75rem;
            }
          }

          /* ≥ 480px: large phones / landscape */
          @media (min-width: 480px) {
            .ad-root {
              --ad-px: 1rem;
              --ad-py: 1rem;
              --ad-pb: 4.5rem;
              --ad-panel-p: 1.4rem;
              --ad-gap: 1.1rem;
              --ad-title: 2.25rem;
              --ad-over: 0.72rem;
              --ad-panel-fs: 1.1rem;
              --ad-label-fs: 0.7rem;
              --ad-img: 6.75rem;
              --ad-chip-fs: 0.85rem;
              --ad-stock-min: 8.5rem;
            }

            .ep-two { grid-template-columns: repeat(2, minmax(0, 1fr)); }

            .ep-chips {
              display: flex;
              flex-wrap: wrap;
              gap: 0.6rem;
            }

            .ap-chip { min-width: 3.25rem; }

            /* actions share the row: Save grows, Cancel hugs content */
            .ep-actions { flex-direction: row-reverse; }
            .ep-actions .ap-submit { flex: 1 1 auto; }
            .ep-actions .ap-cancel { flex: 0 0 auto; }
          }

          /* ≥ 640px: tablets (portrait) */
          @media (min-width: 640px) {
            .ad-root {
              --ad-px: 1.5rem;
              --ad-py: 1.25rem;
              --ad-panel-p: 1.75rem;
              --ad-panel-r: 16px;
              --ad-gap: 1.25rem;
              --ad-gap-lg: 1.5rem;
              --ad-sect: 1.5rem;
              --ad-title: 2.5rem;
              --ad-field-px: 1rem;
              --ad-field-py: 0.75rem;
              --ad-img: 7.5rem;
              --ad-chip-px: 1.1rem;
              --ad-stock-min: 9rem;
              --ad-btn-px: 1.75rem;
            }

            .ep-head {
              flex-direction: row-reverse;
              align-items: flex-start;
              justify-content: space-between;
              gap: 1.5rem;
            }
          }

          /* ≥ 768px: small laptops / tablets landscape */
          @media (min-width: 768px) {
            .ad-root {
              --ad-max: 56rem;
              --ad-px: 2rem;
              --ad-py: 1.75rem;
              --ad-pb: 5rem;
              --ad-panel-p: 2rem;
              --ad-sect: 1.75rem;
              --ad-title: 2.75rem;
              --ad-panel-fs: 1.15rem;
              --ad-field-fs: 0.95rem;
              --ad-img: 8.5rem;
              --ad-btn-px: 2.25rem;
              --ad-stock-min: 9.25rem;
            }

            /* buttons align to the end and stop stretching */
            .ep-actions { justify-content: flex-start; }
            .ep-actions .ap-submit { flex: 0 0 auto; }
          }

          /* ≥ 1024px: laptops — image card moves to a sticky left column */
          @media (min-width: 1024px) {
            .ad-root {
              --ad-max: 70rem;
              --ad-px: 2.5rem;
              --ad-py: 2rem;
              --ad-panel-p: 2.25rem;
              --ad-gap-lg: 2.25rem;
              --ad-title: 3rem;
              --ad-panel-fs: 1.2rem;
              --ad-label-fs: 0.72rem;
              --ad-stock-min: 8.5rem;
            }

            .ep-grid {
              grid-template-columns: minmax(15rem, 18rem) minmax(0, 1fr);
              align-items: start;
            }

            .ep-aside {
              position: sticky;
              top: 6.5rem;
              padding: 1rem;
              border: 1px solid var(--ad-line);
              border-radius: 16px;
            }

            .ep-media {
              flex-direction: column;
              align-items: stretch;
              gap: 1rem;
            }

            .ep-media .ap-upload { width: 100%; }

            .ep-media .ap-upload img {
              width: 100%;
              height: auto;
              aspect-ratio: 1 / 1;
            }

            .ep-media-info { align-items: stretch; }
            .ep-media-info .ap-remove { justify-content: center; }
          }

          /* ≥ 1280px: desktops */
          @media (min-width: 1280px) {
            .ad-root {
              --ad-max: 76rem;
              --ad-px: 3rem;
              --ad-py: 2.5rem;
              --ad-panel-p: 2.5rem;
              --ad-gap: 1.5rem;
              --ad-title: 3.25rem;
              --ad-field-fs: 1rem;
              --ad-field-py: 0.8rem;
              --ad-chip-px: 1.3rem;
              --ad-stock-min: 9.5rem;
            }

            .ep-grid { grid-template-columns: minmax(17rem, 20rem) minmax(0, 1fr); }
          }

          /* ≥ 1536px: large monitors */
          @media (min-width: 1536px) {
            .ad-root {
              --ad-max: 86rem;
              --ad-px: 3.5rem;
              --ad-panel-p: 3rem;
              --ad-gap-lg: 3rem;
              --ad-title: 3.5rem;
              --ad-panel-fs: 1.3rem;
              --ad-label-fs: 0.76rem;
              --ad-field-fs: 1.05rem;
              --ad-btn-fs: 1rem;
              --ad-stock-min: 10rem;
            }

            .ep-grid { grid-template-columns: minmax(20rem, 24rem) minmax(0, 1fr); }
          }

          /* ≥ 1920px: ultra-wide */
          @media (min-width: 1920px) {
            .ad-root {
              --ad-max: 96rem;
              --ad-title: 3.75rem;
              --ad-field-fs: 1.1rem;
            }
          }

          /* short landscape phones: keep the aside from sticking over content */
          @media (max-height: 520px) {
            .ep-aside { position: static; }
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
        <div className="ep-wrap">

          {/* Header: back + title */}

          <div className="ep-head ad-rise">

            <button
              type="button"
              onClick={() => navigate("/admin/products")}
              className="ap-back"
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
                <path d="M15 19l-7-7 7-7" />
              </svg>

              Back
            </button>

            <div className="ep-head-text">

              <p className="ad-overline">
                Inventory
              </p>

              <h1 className="ad-title">
                Edit Product
              </h1>

              <div className="ad-title-bar" />

            </div>

          </div>


          {/* Form panel */}

          <div
            className="ad-panel ad-rise"
            style={{ animationDelay: "0.15s" }}
          >

            <h2 className="ad-panel-title">
              Product Details
            </h2>

            <div className="ep-grid">

              {/* ── Left: image ── */}

              <aside className="ep-aside">

                <span className="ap-label">
                  Product Image
                </span>

                <div className="ep-media">

                  <label className="ap-upload">

                    <img
                      src={preview}
                      alt={product.name || "Product preview"}
                    />

                    <input
                      type="file"
                      hidden
                      accept="image/*"
                      onChange={handleImage}
                    />

                    <div className="ap-upload-overlay">

                      <div className="flex flex-col items-center gap-1">

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
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                          <polyline points="17 8 12 3 7 8" />
                          <line x1="12" y1="3" x2="12" y2="15" />
                        </svg>

                        Change
                      </div>

                    </div>

                  </label>

                  <div className="ep-media-info">

                    <p className="ep-hint">
                      Tap the image to change it. Max 5 MB.
                    </p>

                    {images.length > 0 && (

                      <button
                        type="button"
                        onClick={removeImage}
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
                          <line x1="18" y1="6" x2="6" y2="18" />
                          <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>

                        Remove
                      </button>

                    )}

                  </div>

                </div>

              </aside>


              {/* ── Right: fields ── */}

              <div className="ep-main">

                {/* Name */}

                <div className="ep-field-block">

                  <span className="ap-label">
                    Name{" "}
                    <span className="ap-req">*</span>
                  </span>

                  <input
                    className="ap-field"
                    value={product.name}
                    autoFocus
                    onChange={e =>
                      setProduct({
                        ...product,
                        name: e.target.value
                      })
                    }
                  />

                </div>


                {/* Description */}

                <div className="ep-field-block">

                  <span className="ap-label">
                    Description
                  </span>

                  <textarea
                    className="ap-field"
                    value={product.description}
                    rows={4}
                    onChange={e =>
                      setProduct({
                        ...product,
                        description: e.target.value
                      })
                    }
                  />

                </div>


                {/* Category + Price */}

                <div className="ep-two ep-field-block">

                  <div>

                    <span className="ap-label">
                      Category
                    </span>

                    <select
                      className="ap-field"
                      value={product.category}
                      onChange={e =>
                        setProduct({
                          ...product,
                          category: e.target.value
                        })
                      }
                    >
                      {[
                        "shirt",
                        "tshirt",
                        "hoodie",
                        "pants"
                      ].map(c => (
                        <option key={c} value={c}>
                          {c.charAt(0).toUpperCase() + c.slice(1)}
                        </option>
                      ))}
                    </select>

                  </div>

                  <div>

                    <span className="ap-label">
                      Price (₹){" "}
                      <span className="ap-req">*</span>
                    </span>

                    <input
                      className="ap-field"
                      type="number"
                      inputMode="decimal"
                      min="0"
                      step="0.01"
                      value={product.price}
                      onChange={e =>
                        setProduct({
                          ...product,
                          price: e.target.value
                        })
                      }
                    />

                  </div>

                </div>


                {/* Sizes + Stock */}

                <div className="ep-field-block">

                  <span className="ap-label">
                    Sizes & Stock
                  </span>

                  <div className="ep-chips" style={{ marginBottom: "1.1rem" }}>

                    {[
                      "S",
                      "M",
                      "L",
                      "XL",
                      "XXL"
                    ].map(size => {

                      const selected = product.sizes.some(
                        item => item.size === size
                      );

                      return (
                        <button
                          key={size}
                          type="button"
                          onClick={() => toggleSize(size)}
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

                    <div className="ep-stocks">

                      {product.sizes.map(sizeItem => {

                        const stockValue =
                          getSizeObject(sizeItem.size)?.stock;

                        return (

                          <div
                            key={sizeItem.size}
                            className="ap-stock"
                          >

                            <div className="flex items-center justify-between gap-3 mb-3">

                              <div style={{ minWidth: 0 }}>

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
                              inputMode="numeric"
                              min="0"
                              max="1000000"
                              step="1"
                              value={stockValue ?? ""}
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

                      })}

                    </div>

                  )}

                </div>

              </div>

            </div>


            {/* Divider */}

            <div className="ap-divider" style={{ marginTop: "0.25rem" }} />


            {/* Action buttons */}

            <div className="ep-actions">

              <button
                type="button"
                onClick={handleUpdate}
                disabled={isSaving}
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
                      style={{ animation: "spin 1s linear infinite" }}
                    >
                      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
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
                      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                      <polyline points="17 21 17 13 7 13 7 21" />
                      <polyline points="7 3 7 8 15 8" />
                    </svg>

                    Save Changes
                  </>

                )}

              </button>

              <button
                type="button"
                onClick={() => navigate("/admin/products")}
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