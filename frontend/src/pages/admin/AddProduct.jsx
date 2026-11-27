import React, { useState, useContext, useCallback, useEffect } from "react";
import axios from "axios";
import { ShopContext } from "../../context/ShopContext";
import { useNavigate } from "react-router-dom";
import API_URL from "../../config/api";

/* ── Glass Toast (black + red theme) ── */

const ToastContainer = ({ toasts }) => (
  <div
    style={{
      position: "fixed",
      top: "calc(env(safe-area-inset-top, 0px) + clamp(4.25rem, 9vw, 6.25rem))",
      left: "50%",
      transform: "translateX(-50%)",
      zIndex: 9999,
      display: "flex",
      flexDirection: "column",
      alignItems: "stretch",
      gap: "clamp(8px, 1.2vw, 10px)",
      width: "min(360px, calc(100vw - 24px))",
      pointerEvents: "none",
    }}
  >
    <style>{`
      @keyframes toastIn  { from{opacity:0;transform:translateY(-10px) scale(0.97)} to{opacity:1;transform:translateY(0) scale(1)} }
      @keyframes toastOut { from{opacity:1;transform:translateY(0) scale(1)} to{opacity:0;transform:translateY(-8px) scale(0.97)} }
    `}</style>

    {toasts.map((t) => (
      <div
        key={t.id}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "clamp(10px, 1.5vw, 12px)",
          padding: "clamp(10px, 1.6vw, 13px) clamp(14px, 2vw, 18px)",
          background: "rgba(0,0,0,0.6)",
          border:
            t.type === "error"
              ? "1px solid rgba(255,45,63,0.6)"
              : "1px solid rgba(255,255,255,0.22)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          borderRadius: "14px",
          color: "#ffffff",
          fontSize: "clamp(13px, 1.6vw, 14px)",
          fontWeight: 600,
          lineHeight: 1.35,
          fontFamily: "'Manrope', 'Inter', system-ui, sans-serif",
          pointerEvents: "auto",
          overflowWrap: "anywhere",
          animation: t.leaving
            ? "toastOut 0.3s ease forwards"
            : "toastIn 0.35s cubic-bezier(0.22,1,0.36,1) forwards",
        }}
      >
        <span
          style={{
            width: 20,
            height: 20,
            borderRadius: "50%",
            background: t.type === "error" ? "#ff2d3f" : "#ffffff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
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
  const navigate = useNavigate();
  const { fetchProducts } = useContext(ShopContext);

  const [images, setImages] = useState([]);
  const [imagePreview, setImagePreview] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [toasts, setToasts] = useState([]);

  const [product, setProduct] = useState({
    name: "",
    description: "",
    category: "tshirt",
    price: "",
    sizes: [],
  });

  /* ── Toast ── */

  const showToast = useCallback((message, type = "success") => {
    const id = Date.now();

    setToasts((prev) => [...prev, { id, message, type, leaving: false }]);

    setTimeout(() => {
      setToasts((prev) =>
        prev.map((t) => (t.id === id ? { ...t, leaving: true } : t))
      );

      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 320);
    }, 2500);
  }, []);

  /* ── Cleanup image preview ── */

  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  /* ── Image Upload / Selection ── */

  const handleImage = (e, index) => {
    const file = e.target.files?.[0];

    if (!file) {
      return;
    }

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

    const newImages = [...images];
    newImages[index] = file;
    setImages(newImages);

    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }

    const previewUrl = URL.createObjectURL(file);
    setImagePreview(previewUrl);

    /* Clear the input so selecting the same image again triggers onChange. */
    e.target.value = "";
  };

  /* ── Toggle Size ── */

  const toggleSize = (size) => {
    setProduct((prev) => {
      const alreadySelected = prev.sizes.some((item) => item.size === size);

      if (alreadySelected) {
        return {
          ...prev,
          sizes: prev.sizes.filter((item) => item.size !== size),
        };
      }

      return {
        ...prev,
        sizes: [...prev.sizes, { size, stock: 0 }],
      };
    });
  };

  /* ── Update Size Stock ── */

  const updateSizeStock = (size, value) => {
    setProduct((prev) => ({
      ...prev,
      sizes: prev.sizes.map((item) =>
        item.size === size
          ? { ...item, stock: value === "" ? "" : Number(value) }
          : item
      ),
    }));
  };

  /* ── Get Size Stock ── */

  const getSizeStock = (size) => {
    const selectedSize = product.sizes.find((item) => item.size === size);
    return selectedSize ? selectedSize.stock : "";
  };

  /* ── Upload Image To Cloudinary ── */

  const uploadImage = async (imageFile) => {
    if (!imageFile) {
      throw new Error("Please select a product image.");
    }

    /* FormData is required because Multer expects multipart/form-data. */
    const formData = new FormData();
    formData.append("image", imageFile);

    /* withCredentials sends the HTTP-only admin authentication cookie. */
    const response = await axios.post(
      `${API_URL}/uploads/product-image`,
      formData,
      { withCredentials: true }
    );

    const imageUrl = response.data?.image?.url;

    if (!imageUrl) {
      throw new Error("Image upload completed but no image URL was returned.");
    }

    return imageUrl;
  };

  /* ── Submit Product ── */

  const handleSubmit = async () => {
    if (isSaving) {
      return;
    }

    const trimmedName = product.name.trim();
    const trimmedDescription = product.description.trim();
    const numericPrice = Number(product.price);
    const selectedImage = images[0];

    /* ── Validation ── */

    if (
      !trimmedName ||
      !trimmedDescription ||
      !product.price ||
      !selectedImage
    ) {
      showToast("Please fill all fields and upload image", "error");
      return;
    }

    if (!Number.isFinite(numericPrice) || numericPrice <= 0) {
      showToast("Please enter a valid price", "error");
      return;
    }

    const invalidSize = product.sizes.some((item) => {
      if (!item || typeof item !== "object") {
        return true;
      }

      if (!item.size || typeof item.size !== "string") {
        return true;
      }

      const stock = Number(item.stock);

      return !Number.isInteger(stock) || stock < 0 || stock > 1000000;
    });

    if (invalidSize) {
      showToast(
        "Please enter a valid stock value for every selected size",
        "error"
      );
      return;
    }

    try {
      setIsSaving(true);

      /* STEP 1: upload the image to Cloudinary through the backend. */
      showToast("Uploading image...", "success");

      const imageUrl = await uploadImage(selectedImage);

      /* STEP 2: get existing products. */
      const res = await axios.get(`${API_URL}/products`, {
        withCredentials: true,
      });

      const products = Array.isArray(res.data?.products)
        ? res.data.products
        : [];

      /* STEP 3: find the highest existing numeric ID. */
      const validIds = products
        .map((existingProduct) => Number(existingProduct.id))
        .filter((id) => Number.isFinite(id));

      const lastId = validIds.length > 0 ? Math.max(...validIds) : 0;
      const newId = String(lastId + 1);

      /* STEP 4: normalize size inventory. */
      const normalizedSizes = product.sizes.map((item) => ({
        size: item.size.trim(),
        stock: Number(item.stock),
      }));

      /* STEP 5: prepare the product (image is the Cloudinary URL). */
      const newProduct = {
        id: newId,
        name: trimmedName,
        description: trimmedDescription,
        price: numericPrice,
        image: imageUrl,
        category: product.category,
        sizes: normalizedSizes,
        rating: 4.5,
      };

      /* STEP 6: create the product. */
      await axios.post(`${API_URL}/products`, newProduct, {
        withCredentials: true,
      });

      /* STEP 7: refresh the global product list. */
      try {
        await fetchProducts();
      } catch {
        /* Product already created; a refresh failure must not show "failed". */
      }

      showToast("Product Added Successfully", "success");

      /* STEP 8: reset form. */
      setProduct({
        name: "",
        description: "",
        category: "tshirt",
        price: "",
        sizes: [],
      });

      setImages([]);

      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
        setImagePreview("");
      }
    } catch (error) {
      console.error("Add product error:", error);

      showToast(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to add product",
        "error"
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <ToastContainer toasts={toasts} />

      <div className="ad-root">
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap');

          .ad-root {
            --ad-red:        #ff2d3f;
            --ad-line:       rgba(255, 45, 63, 0.22);
            --ad-line-hover: rgba(255, 45, 63, 0.6);
            --ad-white:      #ffffff;
            --ad-white-soft: rgba(255, 255, 255, 0.7);

            /* responsive scale (inherits gap / padding / radius from AdminLayout) */
            --ap-max: 1240px;
            --ap-gap: var(--al-gap, 0.75rem);
            --ap-pad: var(--al-card-pad, 0.875rem);
            --ap-radius: calc(var(--al-radius, 0.75rem) + 0.25rem);
            --ap-ctl: 2.75rem;
            --ap-fs: 1rem;
            --ap-label-fs: 0.7rem;
            --ap-panel-fs: 1.05rem;
            --ap-upload: 7rem;
            --ap-aside: 340px;
            --ap-sticky-top: 5.5rem;
            --ap-chip-cols: 5;

            position: relative;
            width: 100%;
            min-width: 0;
            color: var(--ad-white);
            font-family: 'Manrope', 'Inter', system-ui, sans-serif;
            -webkit-font-smoothing: antialiased;
          }

          .ap-shell {
            width: 100%;
            max-width: var(--ap-max);
            margin: 0 auto;
            min-width: 0;
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

          /* ── Page header: back button on top (phones), title left + back right (≥768) ── */
          .ap-head {
            display: flex;
            flex-direction: column;
            align-items: flex-start;
            gap: var(--ap-gap);
            margin-bottom: calc(var(--ap-gap) * 1.5);
          }

          .ad-overline {
            display: inline-flex;
            align-items: center;
            gap: 0.65rem;
            color: var(--ad-red);
            font-size: var(--ap-label-fs);
            font-weight: 700;
            letter-spacing: 0.2em;
            text-transform: uppercase;
            margin-bottom: 0.4rem;
          }

          .ad-overline::before {
            content: '';
            width: clamp(18px, 3vw, 28px);
            height: 2px;
            background: var(--ad-red);
          }

          .ad-title {
            color: var(--ad-white);
            font-weight: 800;
            letter-spacing: -0.03em;
            line-height: 1.05;
            font-size: clamp(1.9rem, 1.2rem + 2.6vw, 3rem);
            overflow-wrap: anywhere;
          }

          .ad-title-bar {
            margin-top: clamp(0.65rem, 1.4vw, 1rem);
            height: 2px;
            width: clamp(56px, 8vw, 84px);
            border-radius: 2px;
            background: var(--ad-red);
            transform-origin: left center;
            animation: ad-draw 0.9s cubic-bezier(0.22, 1, 0.36, 1) 0.3s both;
          }

          @keyframes ad-draw {
            from { transform: scaleX(0); }
            to   { transform: scaleX(1); }
          }

          /* ── Page grid: 1 column → sidebar + form (≥1024) ── */
          .ap-layout {
            display: grid;
            grid-template-columns: minmax(0, 1fr);
            gap: var(--ap-gap);
            align-items: start;
          }

          .ap-col {
            display: grid;
            grid-template-columns: minmax(0, 1fr);
            gap: var(--ap-gap);
            min-width: 0;
          }

          /* ── Panel ── */
          .ad-panel {
            position: relative;
            min-width: 0;
            background: transparent;
            border: 1px solid var(--ad-line);
            border-radius: var(--ap-radius);
            padding: var(--ap-pad);
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
            margin-bottom: calc(var(--ap-pad) * 1.1);
            color: var(--ad-white);
            font-weight: 700;
            letter-spacing: -0.015em;
            font-size: var(--ap-panel-fs);
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

          /* ── Form layout inside panels ── */
          .ap-fields {
            display: grid;
            grid-template-columns: minmax(0, 1fr);
            gap: calc(var(--ap-gap) * 1.25);
          }

          .ap-row {
            display: grid;
            grid-template-columns: minmax(0, 1fr);
            gap: calc(var(--ap-gap) * 1.25);
          }

          .ap-block { min-width: 0; }

          /* ── Labels + fields ── */
          .ap-label {
            display: block;
            margin-bottom: 0.5rem;
            color: var(--ad-white-soft);
            font-size: var(--ap-label-fs);
            font-weight: 700;
            letter-spacing: 0.12em;
            text-transform: uppercase;
          }

          .ap-req { color: var(--ad-red); }

          .ap-field {
            display: block;
            width: 100%;
            min-width: 0;
            min-height: var(--ap-ctl);
            background: transparent;
            border: 1px solid rgba(255, 255, 255, 0.22);
            border-radius: 12px;
            padding: 0.6rem 1rem;
            color: #ffffff;
            font-family: inherit;
            font-size: var(--ap-fs);
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

          textarea.ap-field {
            resize: none;
            line-height: 1.6;
            min-height: 6.5rem;
          }

          input[type=number]::-webkit-inner-spin-button,
          input[type=number]::-webkit-outer-spin-button { -webkit-appearance: none; }

          input[type=number] { -moz-appearance: textfield; }

          /* ── Image panel (row on phones/tablets, sticky sidebar on desktop) ── */
          .ap-media-body {
            display: flex;
            flex-wrap: wrap;
            align-items: center;
            gap: var(--ap-gap);
          }

          .ap-upload {
            position: relative;
            display: block;
            flex: 0 0 auto;
            width: var(--ap-upload);
            aspect-ratio: 1 / 1;
            border-radius: 14px;
            overflow: hidden;
            cursor: pointer;
            background: transparent;
            color: var(--ad-white-soft);
            transition: border-color 0.3s ease, color 0.3s ease, background 0.3s ease, transform 0.3s ease;
          }

          .ap-upload--empty { border: 2px dashed var(--ad-line-hover); }

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

          /* touch screens have no hover: keep the "Change" hint visible */
          @media (hover: none) {
            .ap-upload--filled .ap-upload-overlay {
              opacity: 1;
              inset: auto 0 0 0;
              flex-direction: row;
              padding: 0.35rem;
              background: rgba(0, 0, 0, 0.65);
            }
          }

          .ap-hint {
            flex: 1 1 9rem;
            min-width: 0;
            color: var(--ad-white-soft);
            font-size: 0.8rem;
            font-weight: 500;
            line-height: 1.5;
          }

          .ap-hint strong {
            display: block;
            margin-bottom: 0.2rem;
            color: #ffffff;
            font-size: 0.88rem;
            font-weight: 700;
          }

          /* ── Size chips ── */
          .ap-sizes {
            display: grid;
            grid-template-columns: repeat(var(--ap-chip-cols), minmax(0, 1fr));
            gap: 0.5rem;
          }

          .ap-chip {
            min-height: var(--ap-ctl);
            padding: 0.4rem 0.5rem;
            border-radius: 10px;
            font-family: inherit;
            font-size: 0.88rem;
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

          /* ── Per-size stock cards ── */
          .ap-stock-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(min(100%, 15rem), 1fr));
            gap: calc(var(--ap-gap) * 0.8);
            margin-top: var(--ap-gap);
          }

          .ap-stock {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 0.75rem;
            min-width: 0;
            padding: 0.7rem 0.85rem;
            border: 1px solid var(--ad-line);
            border-radius: 12px;
            background: transparent;
            animation: ad-rise 0.4s cubic-bezier(0.22, 1, 0.36, 1) both;
            transition: border-color 0.3s ease;
          }

          .ap-stock:hover,
          .ap-stock:focus-within { border-color: var(--ad-line-hover); }

          .ap-stock-info {
            display: flex;
            align-items: center;
            gap: 0.65rem;
            min-width: 0;
          }

          .ap-stock-text { min-width: 0; }

          .ap-stock-badge {
            width: 2.25rem;
            height: 2.25rem;
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
            white-space: nowrap;
          }

          .ap-stock-sub {
            margin-top: 2px;
            color: var(--ad-white-soft);
            font-size: 0.74rem;
            font-weight: 500;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }

          .ap-stock-qty {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            flex-shrink: 0;
          }

          .ap-stock-input {
            width: 5rem;
            text-align: center;
            padding: 0.4rem 0.5rem;
            font-weight: 700;
          }

          .ap-unit {
            color: var(--ad-white-soft);
            font-size: 0.78rem;
            font-weight: 600;
          }

          /* ── Sticky action bar ── */
          .ap-actions {
            position: sticky;
            bottom: max(0.5rem, env(safe-area-inset-bottom));
            z-index: 5;
            display: flex;
            align-items: center;
            justify-content: stretch;
            gap: var(--ap-gap);
            padding: 0.6rem;
            border: 1px solid var(--ad-line);
            border-radius: var(--ap-radius);
            background: rgba(0, 0, 0, 0.78);
            -webkit-backdrop-filter: blur(16px);
            backdrop-filter: blur(16px);
          }

          .ap-actions-note {
            display: none;
            flex: 1 1 auto;
            min-width: 0;
            padding-left: 0.5rem;
            color: var(--ad-white-soft);
            font-size: 0.8rem;
            font-weight: 500;
          }

          .ap-submit {
            flex: 1 1 auto;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 0.6rem;
            min-height: var(--ap-ctl);
            padding: 0.6rem 1.6rem;
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

          /* ══════════ Responsive scale ══════════ */

          /* ≥ 400px */
          @media (min-width: 400px) {
            .ad-root {
              --ap-label-fs: 0.72rem;
              --ap-chip-cols: 5;
            }
            .ap-stock-input { width: 5.5rem; }
          }

          /* ≥ 480px: 2-column category/price, bigger upload */
          @media (min-width: 480px) {
            .ad-root { --ap-upload: 8.5rem; --ap-panel-fs: 1.1rem; }
            .ap-row { grid-template-columns: repeat(2, minmax(0, 1fr)); }
            .ap-stock-sub { overflow: visible; }
          }

          /* ≥ 640px: inline action bar, chips keep a sensible width */
          @media (min-width: 640px) {
            .ad-root { --ap-upload: 10rem; --ap-label-fs: 0.74rem; }

            .ap-sizes {
              grid-template-columns: repeat(var(--ap-chip-cols), minmax(0, 4.75rem));
            }

            .ap-actions { padding: 0.65rem 0.65rem 0.65rem 1rem; }
            .ap-actions-note { display: block; }
            .ap-submit { flex: 0 0 auto; min-width: 12rem; }

            .ap-stock-input { width: 6rem; }
          }

          /* ≥ 768px: title left, back button right; desktop control sizes */
          @media (min-width: 768px) {
            .ad-root {
              --ap-ctl: 2.6rem;
              --ap-fs: 0.92rem;
              --ap-panel-fs: 1.15rem;
              --ap-sticky-top: 5.75rem;
            }

            .ap-head {
              flex-direction: row;
              align-items: flex-start;
              justify-content: space-between;
            }

            .ap-back { order: 2; }
          }

          /* ≥ 1024px: sidebar (image) + form column */
          @media (min-width: 1024px) {
            .ad-root {
              --ap-fs: 0.93rem;
              --ap-sticky-top: 6rem;
            }

            .ap-layout {
              grid-template-columns: var(--ap-aside) minmax(0, 1fr);
            }

            .ap-aside {
              position: sticky;
              top: var(--ap-sticky-top);
            }

            .ap-media-body {
              flex-direction: column;
              align-items: stretch;
            }

            .ap-upload { width: 100%; }
            .ap-hint { flex: 0 1 auto; }

            .ap-actions { grid-column: 1 / -1; }
          }

          /* ≥ 1280px */
          @media (min-width: 1280px) {
            .ad-root {
              --ap-aside: 360px;
              --ap-fs: 0.95rem;
              --ap-panel-fs: 1.2rem;
              --ap-sticky-top: 6.25rem;
            }
          }

          /* ≥ 1536px: large monitors */
          @media (min-width: 1536px) {
            .ad-root {
              --ap-max: 1360px;
              --ap-aside: 400px;
              --ap-ctl: 2.75rem;
              --ap-fs: 1rem;
              --ap-label-fs: 0.78rem;
              --ap-panel-fs: 1.3rem;
            }

            .ap-chip { font-size: 0.95rem; }
            .ap-stock-name { font-size: 0.98rem; }
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

        <div className="ap-shell">
          {/* Page heading + back button */}
          <div className="ap-head ad-rise">
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

            <div>
              <p className="ad-overline">Inventory</p>
              <h1 className="ad-title">Add Product</h1>
              <div className="ad-title-bar" />
            </div>
          </div>

          <div className="ap-layout">
            {/* Image panel */}
            <aside
              className="ad-panel ad-rise ap-aside"
              style={{ animationDelay: "0.1s" }}
            >
              <h2 className="ad-panel-title">Product Image</h2>

              <div className="ap-media-body">
                <label
                  className={`ap-upload ${
                    images[0] ? "ap-upload--filled" : "ap-upload--empty"
                  }`}
                >
                  {images[0] ? (
                    <>
                      <img
                        src={imagePreview}
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
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                          <polyline points="17 8 12 3 7 8" />
                          <line x1="12" y1="3" x2="12" y2="15" />
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
                        <rect x="3" y="3" width="18" height="18" rx="2" />
                        <circle cx="8.5" cy="8.5" r="1.5" />
                        <polyline points="21 15 16 10 5 21" />
                      </svg>
                      Upload
                    </div>
                  )}

                  <input
                    type="file"
                    hidden
                    accept="image/*"
                    onChange={(e) => handleImage(e, 0)}
                  />
                </label>

                <p className="ap-hint">
                  <strong>
                    Main photo <span className="ap-req">*</span>
                  </strong>
                  Any image file up to 5 MB. A square photo works best.
                </p>
              </div>
            </aside>

            {/* Form column */}
            <div className="ap-col">
              {/* Details */}
              <section
                className="ad-panel ad-rise"
                style={{ animationDelay: "0.15s" }}
              >
                <h2 className="ad-panel-title">Product Details</h2>

                <div className="ap-fields">
                  {/* Name */}
                  <div className="ap-block">
                    <label className="ap-label" htmlFor="ap-name">
                      Product Name <span className="ap-req">*</span>
                    </label>

                    <input
                      id="ap-name"
                      className="ap-field"
                      value={product.name}
                      placeholder="e.g. Oversized Black Hoodie"
                      onChange={(e) =>
                        setProduct({ ...product, name: e.target.value })
                      }
                    />
                  </div>

                  {/* Description */}
                  <div className="ap-block">
                    <label className="ap-label" htmlFor="ap-desc">
                      Description <span className="ap-req">*</span>
                    </label>

                    <textarea
                      id="ap-desc"
                      className="ap-field"
                      value={product.description}
                      placeholder="Describe the product..."
                      rows={4}
                      onChange={(e) =>
                        setProduct({ ...product, description: e.target.value })
                      }
                    />
                  </div>

                  {/* Category + Price */}
                  <div className="ap-row">
                    <div className="ap-block">
                      <label className="ap-label" htmlFor="ap-cat">
                        Category
                      </label>

                      <select
                        id="ap-cat"
                        className="ap-field"
                        value={product.category}
                        onChange={(e) =>
                          setProduct({ ...product, category: e.target.value })
                        }
                      >
                        {["shirt", "tshirt", "hoodie", "pants"].map((c) => (
                          <option key={c} value={c}>
                            {c.charAt(0).toUpperCase() + c.slice(1)}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="ap-block">
                      <label className="ap-label" htmlFor="ap-price">
                        Price (₹) <span className="ap-req">*</span>
                      </label>

                      <input
                        id="ap-price"
                        className="ap-field"
                        type="number"
                        inputMode="decimal"
                        min="0"
                        step="0.01"
                        value={product.price}
                        placeholder="e.g. 999"
                        onChange={(e) =>
                          setProduct({ ...product, price: e.target.value })
                        }
                      />
                    </div>
                  </div>
                </div>
              </section>

              {/* Sizes + stock */}
              <section
                className="ad-panel ad-rise"
                style={{ animationDelay: "0.2s" }}
              >
                <h2 className="ad-panel-title">Sizes &amp; Stock</h2>

                <div className="ap-sizes">
                  {["S", "M", "L", "XL", "XXL"].map((size) => {
                    const isSelected = product.sizes.some(
                      (item) => item.size === size
                    );

                    return (
                      <button
                        key={size}
                        type="button"
                        aria-pressed={isSelected}
                        onClick={() => toggleSize(size)}
                        className={`ap-chip ${
                          isSelected ? "ap-chip--on" : "ap-chip--off"
                        }`}
                      >
                        {size}
                      </button>
                    );
                  })}
                </div>

                {product.sizes.length > 0 && (
                  <div className="ap-stock-grid">
                    {product.sizes.map((item) => (
                      <div key={item.size} className="ap-stock">
                        <div className="ap-stock-info">
                          <div className="ap-stock-badge">{item.size}</div>

                          <div className="ap-stock-text">
                            <div className="ap-stock-name">Size {item.size}</div>
                            <div className="ap-stock-sub">Available stock</div>
                          </div>
                        </div>

                        <div className="ap-stock-qty">
                          <input
                            className="ap-field ap-stock-input"
                            type="number"
                            inputMode="numeric"
                            min="0"
                            max="1000000"
                            step="1"
                            value={getSizeStock(item.size)}
                            placeholder="0"
                            aria-label={`Stock for size ${item.size}`}
                            onChange={(e) =>
                              updateSizeStock(item.size, e.target.value)
                            }
                          />

                          <span className="ap-unit">pcs</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </div>

            {/* Sticky action bar */}
            <div className="ap-actions ad-rise" style={{ animationDelay: "0.25s" }}>
              <span className="ap-actions-note">
                Fields marked <span className="ap-req">*</span> are required.
              </span>

              <button
                type="button"
                onClick={handleSubmit}
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
                      <line x1="12" y1="5" x2="12" y2="19" />
                      <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                    Add Product
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AddProduct;