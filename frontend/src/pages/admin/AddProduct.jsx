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

        <span style={{ minWidth: 0 }}>{t.message}</span>
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

      <div className="aa-root">
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap');

          .aa-root {
            --aa-red:        #ff2d3f;
            --aa-line:       rgba(255, 45, 63, 0.22);
            --aa-line-hover: rgba(255, 45, 63, 0.6);
            --aa-white:      #ffffff;
            --aa-white-soft: rgba(255, 255, 255, 0.7);

            /* responsive scale (overridden per breakpoint below).
               --aa-max and --aa-px match the navbar so edges line up. */
            --aa-max:       1400px;
            --aa-px:        0.875rem;
            --aa-py:        1rem;
            --aa-gap:       0.75rem;
            --aa-pad:       0.9rem;
            --aa-radius:    14px;
            --aa-ctl:       2.75rem;
            --aa-fs:        1rem;
            --aa-label:     0.68rem;
            --aa-over:      0.68rem;
            --aa-title:     1.9rem;
            --aa-panel:     1rem;
            --aa-upload:    7rem;
            --aa-aside:     250px;
            --aa-sticky:    5.5rem;
            --aa-chip-cols: 5;

            position: relative;
            overflow-x: hidden;
            min-height: 100vh;
            background: #000000;
            color: var(--aa-white);
            font-family: 'Manrope', 'Inter', system-ui, sans-serif;
            -webkit-font-smoothing: antialiased;
            padding:
              var(--aa-py)
              max(var(--aa-px), env(safe-area-inset-right))
              calc(var(--aa-py) + 1rem + env(safe-area-inset-bottom))
              max(var(--aa-px), env(safe-area-inset-left));
          }

          .aa-shell {
            width: 100%;
            max-width: var(--aa-max);
            margin: 0 auto;
            min-width: 0;
          }

          @keyframes aa-spin { to { transform: rotate(360deg); } }

          /* ── Entrance ── */
          .aa-rise {
            opacity: 0;
            animation: aa-rise 0.7s cubic-bezier(0.22, 1, 0.36, 1) forwards;
          }

          @keyframes aa-rise {
            from { opacity: 0; transform: translateY(14px); }
            to   { opacity: 1; transform: translateY(0); }
          }

          /* ── Page header: title left, Back button right ── */
          .aa-head {
            display: flex;
            align-items: flex-start;
            justify-content: space-between;
            gap: var(--aa-gap);
            margin-bottom: calc(var(--aa-gap) * 1.5);
          }

          .aa-head-text { min-width: 0; }

          .aa-overline {
            display: inline-flex;
            align-items: center;
            gap: 0.6rem;
            color: var(--aa-red);
            font-size: var(--aa-over);
            font-weight: 700;
            letter-spacing: 0.22em;
            text-transform: uppercase;
            margin-bottom: 0.4rem;
          }

          .aa-overline::before {
            content: '';
            width: 1.75rem;
            height: 2px;
            background: var(--aa-red);
          }

          .aa-title {
            color: var(--aa-white);
            font-weight: 800;
            letter-spacing: -0.03em;
            line-height: 1.05;
            font-size: var(--aa-title);
            overflow-wrap: anywhere;
          }

          .aa-title-bar {
            margin-top: 0.85rem;
            height: 2px;
            width: 5rem;
            border-radius: 2px;
            background: var(--aa-red);
            transform-origin: left center;
            animation: aa-draw 0.9s cubic-bezier(0.22, 1, 0.36, 1) 0.3s both;
          }

          @keyframes aa-draw {
            from { transform: scaleX(0); }
            to   { transform: scaleX(1); }
          }

          /* ── Page grid:
                phones / small tablets: one column (image, details, sizes)
                ≥ 768px: image sidebar + form column ── */
          .aa-layout {
            display: grid;
            grid-template-columns: minmax(0, 1fr);
            gap: var(--aa-gap);
            align-items: start;
          }

          .aa-col {
            display: grid;
            grid-template-columns: minmax(0, 1fr);
            gap: var(--aa-gap);
            min-width: 0;
          }

          /* ── Panel ── */
          .aa-panel {
            position: relative;
            min-width: 0;
            background: transparent;
            border: 1px solid var(--aa-line);
            border-radius: var(--aa-radius);
            padding: var(--aa-pad);
            transition: border-color 0.3s ease;
          }

          .aa-panel:hover,
          .aa-panel:focus-within {
            border-color: var(--aa-line-hover);
          }

          .aa-panel-title {
            display: flex;
            align-items: center;
            gap: 0.6rem;
            margin-bottom: calc(var(--aa-pad) * 1.1);
            color: var(--aa-white);
            font-weight: 700;
            letter-spacing: -0.015em;
            line-height: 1.2;
            font-size: var(--aa-panel);
          }

          .aa-panel-title::before {
            content: '';
            flex: 0 0 auto;
            width: 3px;
            height: 1.1em;
            border-radius: 2px;
            background: var(--aa-red);
          }

          /* ── Back button ── */
          .aa-back {
            flex: 0 0 auto;
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

          .aa-back svg { transition: transform 0.3s cubic-bezier(0.22, 1, 0.36, 1); }

          .aa-back:hover {
            background: #ffffff;
            color: #000000;
            border-color: #ffffff;
          }

          .aa-back:hover svg { transform: translateX(-3px); }

          /* ── Form layout inside panels ── */
          .aa-fields {
            display: grid;
            grid-template-columns: minmax(0, 1fr);
            gap: calc(var(--aa-gap) * 1.25);
          }

          .aa-row {
            display: grid;
            grid-template-columns: minmax(0, 1fr);
            gap: calc(var(--aa-gap) * 1.25);
          }

          .aa-block { min-width: 0; }

          /* ── Labels + fields ── */
          .aa-label {
            display: block;
            margin-bottom: 0.5rem;
            color: var(--aa-white-soft);
            font-size: var(--aa-label);
            font-weight: 700;
            letter-spacing: 0.12em;
            text-transform: uppercase;
          }

          .aa-req { color: var(--aa-red); }

          .aa-field {
            display: block;
            width: 100%;
            min-width: 0;
            min-height: var(--aa-ctl);
            background: transparent;
            border: 1px solid rgba(255, 255, 255, 0.22);
            border-radius: 12px;
            padding: 0.6rem 1rem;
            color: #ffffff;
            font-family: inherit;
            font-size: var(--aa-fs);
            font-weight: 500;
            outline: none;
            transition: border-color 0.25s ease, box-shadow 0.25s ease, background 0.25s ease;
          }

          .aa-field:hover { border-color: rgba(255, 255, 255, 0.4); }

          .aa-field:focus {
            border-color: var(--aa-red);
            background: rgba(255, 45, 63, 0.04);
            box-shadow: 0 0 0 3px rgba(255, 45, 63, 0.18);
          }

          .aa-field::placeholder { color: rgba(255, 255, 255, 0.35); }

          .aa-field option { background: #000000; color: #ffffff; }

          select.aa-field {
            cursor: pointer;
            appearance: none;
            -webkit-appearance: none;
            padding-right: 2.5rem;
            background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='%23ff2d3f' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");
            background-repeat: no-repeat;
            background-position: right 1rem center;
          }

          textarea.aa-field {
            resize: none;
            line-height: 1.6;
            min-height: 6.5rem;
          }

          .aa-root input[type=number]::-webkit-inner-spin-button,
          .aa-root input[type=number]::-webkit-outer-spin-button { -webkit-appearance: none; }

          .aa-root input[type=number] { -moz-appearance: textfield; }

          /* ── Image panel (row on phones/small tablets, column in the sidebar) ── */
          .aa-media-body {
            display: flex;
            flex-wrap: wrap;
            align-items: center;
            gap: var(--aa-gap);
          }

          .aa-upload {
            position: relative;
            display: block;
            flex: 0 0 auto;
            width: var(--aa-upload);
            aspect-ratio: 1 / 1;
            border-radius: 14px;
            overflow: hidden;
            cursor: pointer;
            background: transparent;
            color: var(--aa-white-soft);
            transition: border-color 0.3s ease, color 0.3s ease, background 0.3s ease, transform 0.3s ease;
          }

          .aa-upload--empty { border: 2px dashed var(--aa-line-hover); }

          .aa-upload--empty:hover {
            color: #ffffff;
            background: rgba(255, 45, 63, 0.08);
            border-color: var(--aa-red);
            transform: translateY(-2px);
          }

          .aa-upload--filled { border: 1px solid var(--aa-line-hover); }

          .aa-preview {
            display: block;
            width: 100%;
            height: 100%;
            object-fit: cover;
          }

          .aa-upload-inner {
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

          .aa-upload-inner svg { color: var(--aa-red); }

          .aa-upload-overlay {
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

          .aa-upload:hover .aa-upload-overlay { opacity: 1; }

          /* touch screens have no hover: keep the "Change" hint visible */
          @media (hover: none) {
            .aa-upload--filled .aa-upload-overlay {
              opacity: 1;
              inset: auto 0 0 0;
              flex-direction: row;
              padding: 0.35rem;
              background: rgba(0, 0, 0, 0.65);
            }

            .aa-upload--empty:hover { transform: none; }
          }

          .aa-hint {
            flex: 1 1 9rem;
            min-width: 0;
            color: var(--aa-white-soft);
            font-size: 0.8rem;
            font-weight: 500;
            line-height: 1.5;
          }

          .aa-hint strong {
            display: block;
            margin-bottom: 0.2rem;
            color: #ffffff;
            font-size: 0.88rem;
            font-weight: 700;
          }

          /* ── Size chips ── */
          .aa-sizes {
            display: grid;
            grid-template-columns: repeat(var(--aa-chip-cols), minmax(0, 1fr));
            gap: 0.5rem;
          }

          .aa-chip {
            min-height: var(--aa-ctl);
            padding: 0.4rem 0.5rem;
            border-radius: 10px;
            font-family: inherit;
            font-size: 0.88rem;
            font-weight: 700;
            cursor: pointer;
            transition: background 0.25s ease, color 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease, transform 0.25s ease;
          }

          .aa-chip--off {
            background: transparent;
            color: #ffffff;
            border: 1px solid rgba(255, 255, 255, 0.3);
          }

          .aa-chip--off:hover {
            border-color: var(--aa-red);
            color: var(--aa-red);
            transform: translateY(-1px);
          }

          .aa-chip--on {
            background: var(--aa-red);
            color: #ffffff;
            border: 1px solid var(--aa-red);
            box-shadow: 0 0 20px rgba(255, 45, 63, 0.4);
          }

          /* ── Per-size stock cards ── */
          .aa-stock-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(min(100%, 15rem), 1fr));
            gap: calc(var(--aa-gap) * 0.8);
            margin-top: var(--aa-gap);
          }

          .aa-stock {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 0.75rem;
            min-width: 0;
            padding: 0.7rem 0.85rem;
            border: 1px solid var(--aa-line);
            border-radius: 12px;
            background: transparent;
            animation: aa-rise 0.4s cubic-bezier(0.22, 1, 0.36, 1) both;
            transition: border-color 0.3s ease;
          }

          .aa-stock:hover,
          .aa-stock:focus-within { border-color: var(--aa-line-hover); }

          .aa-stock-info {
            display: flex;
            align-items: center;
            gap: 0.65rem;
            min-width: 0;
          }

          .aa-stock-text { min-width: 0; }

          .aa-stock-badge {
            width: 2.25rem;
            height: 2.25rem;
            flex-shrink: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 10px;
            color: var(--aa-red);
            background: rgba(255, 45, 63, 0.1);
            border: 1px solid var(--aa-line);
            font-size: 0.8rem;
            font-weight: 800;
          }

          .aa-stock-name {
            color: #ffffff;
            font-size: 0.92rem;
            font-weight: 700;
            white-space: nowrap;
          }

          .aa-stock-sub {
            margin-top: 2px;
            color: var(--aa-white-soft);
            font-size: 0.74rem;
            font-weight: 500;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }

          .aa-stock-qty {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            flex-shrink: 0;
          }

          .aa-stock-input {
            width: 5rem;
            text-align: center;
            padding: 0.4rem 0.5rem;
            font-weight: 700;
          }

          .aa-unit {
            color: var(--aa-white-soft);
            font-size: 0.78rem;
            font-weight: 600;
          }

          /* ── Sticky action bar ── */
          .aa-actions {
            position: sticky;
            bottom: max(0.5rem, env(safe-area-inset-bottom));
            z-index: 5;
            display: flex;
            align-items: center;
            justify-content: stretch;
            gap: var(--aa-gap);
            padding: 0.6rem;
            border: 1px solid var(--aa-line);
            border-radius: var(--aa-radius);
            background: rgba(0, 0, 0, 0.78);
            -webkit-backdrop-filter: blur(16px);
            backdrop-filter: blur(16px);
          }

          .aa-actions-note {
            display: none;
            flex: 1 1 auto;
            min-width: 0;
            padding-left: 0.5rem;
            color: var(--aa-white-soft);
            font-size: 0.8rem;
            font-weight: 500;
          }

          .aa-submit {
            flex: 1 1 auto;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 0.6rem;
            min-height: var(--aa-ctl);
            padding: 0.6rem 1.6rem;
            border-radius: 12px;
            color: #ffffff;
            background: var(--aa-red);
            border: 1px solid var(--aa-red);
            font-family: inherit;
            font-size: 0.95rem;
            font-weight: 800;
            letter-spacing: 0.02em;
            cursor: pointer;
            transition: transform 0.25s ease, box-shadow 0.25s ease, background 0.25s ease, color 0.25s ease;
          }

          .aa-submit:hover:not(:disabled) {
            transform: translateY(-2px);
            box-shadow: 0 0 30px rgba(255, 45, 63, 0.55);
          }

          .aa-submit:active:not(:disabled) { transform: translateY(0); }

          .aa-submit:disabled {
            opacity: 0.6;
            cursor: not-allowed;
          }

          .aa-back:focus-visible,
          .aa-chip:focus-visible,
          .aa-submit:focus-visible,
          .aa-upload:focus-within {
            outline: 2px solid #ffffff;
            outline-offset: 2px;
          }

          /* ══════════ Responsive scale ══════════ */

          /* ≥ 375px: iPhone-size phones */
          @media (min-width: 375px) {
            .aa-root {
              --aa-px:    1rem;
              --aa-py:    1.1rem;
              --aa-pad:   1rem;
              --aa-title: 2.05rem;
              --aa-label: 0.7rem;
            }

            .aa-stock-input { width: 5.5rem; }
          }

          /* ≥ 480px: category + price side by side, bigger upload */
          @media (min-width: 480px) {
            .aa-root {
              --aa-py:     1.25rem;
              --aa-gap:    0.875rem;
              --aa-pad:    1.1rem;
              --aa-panel:  1.05rem;
              --aa-upload: 8.5rem;
            }

            .aa-row { grid-template-columns: repeat(2, minmax(0, 1fr)); }
            .aa-stock-sub { overflow: visible; }
          }

          /* ≥ 640px: inline action bar, chips keep a sensible width */
          @media (min-width: 640px) {
            .aa-root {
              --aa-px:     1.5rem;
              --aa-py:     1.5rem;
              --aa-gap:    1rem;
              --aa-pad:    1.25rem;
              --aa-over:   0.74rem;
              --aa-title:  2.4rem;
              --aa-label:  0.72rem;
              --aa-panel:  1.1rem;
              --aa-upload: 10rem;
            }

            .aa-sizes {
              grid-template-columns: repeat(var(--aa-chip-cols), minmax(0, 4.75rem));
            }

            .aa-actions { padding: 0.65rem 0.65rem 0.65rem 1rem; }
            .aa-actions-note { display: block; }
            .aa-submit { flex: 0 0 auto; min-width: 12rem; }

            .aa-stock-input { width: 6rem; }
          }

          /* ≥ 768px: image becomes a sidebar next to the form */
          @media (min-width: 768px) {
            .aa-root {
              --aa-py:     1.75rem;
              --aa-ctl:    2.6rem;
              --aa-fs:     0.95rem;
              --aa-title:  2.55rem;
              --aa-panel:  1.1rem;
              --aa-aside:  250px;
              --aa-sticky: 5.75rem;
            }

            .aa-layout {
              grid-template-columns: var(--aa-aside) minmax(0, 1fr);
            }

            .aa-aside {
              position: sticky;
              top: var(--aa-sticky);
            }

            .aa-media-body {
              flex-direction: column;
              align-items: stretch;
            }

            .aa-upload { width: 100%; }
            .aa-hint { flex: 0 1 auto; }

            .aa-actions { grid-column: 1 / -1; }

            /* the sizes row is cramped next to the sidebar: keep chips fluid */
            .aa-sizes {
              grid-template-columns: repeat(var(--aa-chip-cols), minmax(0, 1fr));
            }
          }

          /* ≥ 1024px: laptops */
          @media (min-width: 1024px) {
            .aa-root {
              --aa-px:     2rem;
              --aa-py:     2rem;
              --aa-gap:    1.25rem;
              --aa-pad:    1.4rem;
              --aa-radius: 16px;
              --aa-panel:  1.15rem;
              --aa-aside:  300px;
              --aa-sticky: 6rem;
            }

            .aa-sizes {
              grid-template-columns: repeat(var(--aa-chip-cols), minmax(0, 5rem));
            }
          }

          /* ≥ 1280px: desktops */
          @media (min-width: 1280px) {
            .aa-root {
              --aa-py:     2.25rem;
              --aa-pad:    1.6rem;
              --aa-fs:     0.97rem;
              --aa-title:  2.8rem;
              --aa-panel:  1.2rem;
              --aa-aside:  340px;
              --aa-sticky: 6.25rem;
            }
          }

          /* ≥ 1536px: large monitors */
          @media (min-width: 1536px) {
            .aa-root {
              --aa-max:   1680px;
              --aa-px:    2.5rem;
              --aa-py:    2.5rem;
              --aa-gap:   1.5rem;
              --aa-pad:   1.85rem;
              --aa-ctl:   2.75rem;
              --aa-fs:    1rem;
              --aa-over:  0.8rem;
              --aa-label: 0.78rem;
              --aa-title: 3rem;
              --aa-panel: 1.3rem;
              --aa-aside: 380px;
            }

            .aa-chip { font-size: 0.95rem; }
            .aa-stock-name { font-size: 0.98rem; }
          }

          /* ≥ 1920px: ultra-wide */
          @media (min-width: 1920px) {
            .aa-root { --aa-max: 1840px; }
          }

          /* ── Reduced motion ── */
          @media (prefers-reduced-motion: reduce) {
            .aa-rise,
            .aa-title-bar,
            .aa-stock {
              animation: none !important;
              opacity: 1 !important;
              transform: none !important;
            }

            .aa-back,
            .aa-back svg,
            .aa-field,
            .aa-upload,
            .aa-upload-overlay,
            .aa-chip,
            .aa-submit {
              transition: none !important;
            }
          }
        `}</style>

        <div className="aa-shell">
          {/* Page heading + back button */}
          <div className="aa-head aa-rise">
            <div className="aa-head-text">
              <p className="aa-overline">Inventory</p>
              <h1 className="aa-title">Add Product</h1>
              <div className="aa-title-bar" />
            </div>

            <button
              type="button"
              onClick={() => navigate("/admin/products")}
              className="aa-back"
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
          </div>

          <div className="aa-layout">
            {/* Image panel */}
            <aside
              className="aa-panel aa-rise aa-aside"
              style={{ animationDelay: "0.1s" }}
            >
              <h2 className="aa-panel-title">Product Image</h2>

              <div className="aa-media-body">
                <label
                  className={`aa-upload ${
                    images[0] ? "aa-upload--filled" : "aa-upload--empty"
                  }`}
                >
                  {images[0] ? (
                    <>
                      <img
                        src={imagePreview}
                        alt="Product preview"
                        className="aa-preview"
                      />

                      <div className="aa-upload-overlay">
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
                    <div className="aa-upload-inner">
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

                <p className="aa-hint">
                  <strong>
                    Main photo <span className="aa-req">*</span>
                  </strong>
                  Any image file up to 5 MB. A square photo works best.
                </p>
              </div>
            </aside>

            {/* Form column */}
            <div className="aa-col">
              {/* Details */}
              <section
                className="aa-panel aa-rise"
                style={{ animationDelay: "0.15s" }}
              >
                <h2 className="aa-panel-title">Product Details</h2>

                <div className="aa-fields">
                  {/* Name */}
                  <div className="aa-block">
                    <label className="aa-label" htmlFor="aa-name">
                      Product Name <span className="aa-req">*</span>
                    </label>

                    <input
                      id="aa-name"
                      className="aa-field"
                      value={product.name}
                      placeholder="e.g. Oversized Black Hoodie"
                      onChange={(e) =>
                        setProduct({ ...product, name: e.target.value })
                      }
                    />
                  </div>

                  {/* Description */}
                  <div className="aa-block">
                    <label className="aa-label" htmlFor="aa-desc">
                      Description <span className="aa-req">*</span>
                    </label>

                    <textarea
                      id="aa-desc"
                      className="aa-field"
                      value={product.description}
                      placeholder="Describe the product..."
                      rows={4}
                      onChange={(e) =>
                        setProduct({ ...product, description: e.target.value })
                      }
                    />
                  </div>

                  {/* Category + Price */}
                  <div className="aa-row">
                    <div className="aa-block">
                      <label className="aa-label" htmlFor="aa-cat">
                        Category
                      </label>

                      <select
                        id="aa-cat"
                        className="aa-field"
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

                    <div className="aa-block">
                      <label className="aa-label" htmlFor="aa-price">
                        Price (₹) <span className="aa-req">*</span>
                      </label>

                      <input
                        id="aa-price"
                        className="aa-field"
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
                className="aa-panel aa-rise"
                style={{ animationDelay: "0.2s" }}
              >
                <h2 className="aa-panel-title">Sizes &amp; Stock</h2>

                <div className="aa-sizes">
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
                        className={`aa-chip ${
                          isSelected ? "aa-chip--on" : "aa-chip--off"
                        }`}
                      >
                        {size}
                      </button>
                    );
                  })}
                </div>

                {product.sizes.length > 0 && (
                  <div className="aa-stock-grid">
                    {product.sizes.map((item) => (
                      <div key={item.size} className="aa-stock">
                        <div className="aa-stock-info">
                          <div className="aa-stock-badge">{item.size}</div>

                          <div className="aa-stock-text">
                            <div className="aa-stock-name">Size {item.size}</div>
                            <div className="aa-stock-sub">Available stock</div>
                          </div>
                        </div>

                        <div className="aa-stock-qty">
                          <input
                            className="aa-field aa-stock-input"
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

                          <span className="aa-unit">pcs</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </div>

            {/* Sticky action bar */}
            <div className="aa-actions aa-rise" style={{ animationDelay: "0.25s" }}>
              <span className="aa-actions-note">
                Fields marked <span className="aa-req">*</span> are required.
              </span>

              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSaving}
                className="aa-submit"
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
                      style={{ animation: "aa-spin 1s linear infinite" }}
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