
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


/* ── Optimize Cloudinary Images ── */

const getOptimizedImageUrl = (imageUrl) => {

  if (!imageUrl || typeof imageUrl !== "string") {
    return imageUrl;
  }

  const transformationMarker = "/image/upload/";

  if (
    !imageUrl.includes("res.cloudinary.com/") ||
    !imageUrl.includes(transformationMarker)
  ) {
    return imageUrl;
  }

  const [beforeUpload, afterUpload] =
    imageUrl.split(transformationMarker);

  if (!afterUpload) {
    return imageUrl;
  }

  return (
    beforeUpload +
    transformationMarker +
    "f_auto,q_auto,w_400,c_limit/" +
    afterUpload
  );

};


/* ── Glass Toast (black + red theme) ── */

const ToastContainer = ({ toasts }) => (
  <div style={{
    position: "fixed",
    top: "calc(env(safe-area-inset-top, 0px) + clamp(72px, 10vw, 100px))",
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
        lineHeight: 1.35,
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

      <div className="ae-root">

        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap');

          .ae-root {
            --ae-red:        #ff2d3f;
            --ae-line:       rgba(255, 45, 63, 0.22);
            --ae-line-hover: rgba(255, 45, 63, 0.6);
            --ae-white:      #ffffff;
            --ae-white-soft: rgba(255, 255, 255, 0.7);

            /* responsive scale (overridden per breakpoint below).
               --ae-max and --ae-px match the navbar so edges line up. */
            --ae-max:       1400px;
            --ae-px:        0.875rem;
            --ae-py:        1rem;
            --ae-gap:       0.75rem;
            --ae-pad:       0.9rem;
            --ae-radius:    14px;
            --ae-ctl:       2.75rem;
            --ae-fs:        1rem;
            --ae-label:     0.68rem;
            --ae-over:      0.68rem;
            --ae-title:     1.9rem;
            --ae-panel:     1rem;
            --ae-upload:    7rem;
            --ae-aside:     250px;
            --ae-sticky:    5.5rem;
            --ae-chip-cols: 5;

            position: relative;
            overflow-x: hidden;
            min-height: 100vh;
            background: #000000;
            color: var(--ae-white);
            font-family: 'Manrope', 'Inter', system-ui, sans-serif;
            -webkit-font-smoothing: antialiased;
            padding:
              var(--ae-py)
              max(var(--ae-px), env(safe-area-inset-right))
              calc(var(--ae-py) + 1rem + env(safe-area-inset-bottom))
              max(var(--ae-px), env(safe-area-inset-left));
          }

          .ae-shell {
            width: 100%;
            max-width: var(--ae-max);
            margin: 0 auto;
            min-width: 0;
          }

          @keyframes ae-spin { to { transform: rotate(360deg); } }

          /* ── Entrance ── */
          .ae-rise {
            opacity: 0;
            animation: ae-rise 0.7s cubic-bezier(0.22, 1, 0.36, 1) forwards;
          }

          @keyframes ae-rise {
            from { opacity: 0; transform: translateY(14px); }
            to   { opacity: 1; transform: translateY(0); }
          }

          /* ── Page header: title left, Back button right ── */
          .ae-head {
            display: flex;
            align-items: flex-start;
            justify-content: space-between;
            gap: var(--ae-gap);
            margin-bottom: calc(var(--ae-gap) * 1.5);
          }

          .ae-head-text { min-width: 0; }

          .ae-overline {
            display: inline-flex;
            align-items: center;
            gap: 0.6rem;
            color: var(--ae-red);
            font-size: var(--ae-over);
            font-weight: 700;
            letter-spacing: 0.22em;
            text-transform: uppercase;
            margin-bottom: 0.4rem;
          }

          .ae-overline::before {
            content: '';
            width: 1.75rem;
            height: 2px;
            background: var(--ae-red);
          }

          .ae-title {
            color: var(--ae-white);
            font-weight: 800;
            letter-spacing: -0.03em;
            line-height: 1.05;
            font-size: var(--ae-title);
            overflow-wrap: anywhere;
          }

          .ae-title-bar {
            margin-top: 0.85rem;
            height: 2px;
            width: 5rem;
            border-radius: 2px;
            background: var(--ae-red);
            transform-origin: left center;
            animation: ae-draw 0.9s cubic-bezier(0.22, 1, 0.36, 1) 0.3s both;
          }

          @keyframes ae-draw {
            from { transform: scaleX(0); }
            to   { transform: scaleX(1); }
          }

          /* ── Page grid:
                phones / small tablets: one column (image, details, sizes)
                ≥ 768px: image sidebar + form column ── */
          .ae-layout {
            display: grid;
            grid-template-columns: minmax(0, 1fr);
            gap: var(--ae-gap);
            align-items: start;
          }

          .ae-col {
            display: grid;
            grid-template-columns: minmax(0, 1fr);
            gap: var(--ae-gap);
            min-width: 0;
          }

          /* ── Panel ── */
          .ae-panel {
            position: relative;
            min-width: 0;
            background: transparent;
            border: 1px solid var(--ae-line);
            border-radius: var(--ae-radius);
            padding: var(--ae-pad);
            transition: border-color 0.3s ease;
          }

          .ae-panel:hover,
          .ae-panel:focus-within {
            border-color: var(--ae-line-hover);
          }

          .ae-panel-title {
            display: flex;
            align-items: center;
            gap: 0.6rem;
            margin-bottom: calc(var(--ae-pad) * 1.1);
            color: var(--ae-white);
            font-weight: 700;
            letter-spacing: -0.015em;
            line-height: 1.2;
            font-size: var(--ae-panel);
          }

          .ae-panel-title::before {
            content: '';
            flex: 0 0 auto;
            width: 3px;
            height: 1.1em;
            border-radius: 2px;
            background: var(--ae-red);
          }

          /* ── Back button ── */
          .ae-back {
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

          .ae-back svg { transition: transform 0.3s cubic-bezier(0.22, 1, 0.36, 1); }

          .ae-back:hover {
            background: #ffffff;
            color: #000000;
            border-color: #ffffff;
          }

          .ae-back:hover svg { transform: translateX(-3px); }

          /* ── Form layout inside panels ── */
          .ae-fields {
            display: grid;
            grid-template-columns: minmax(0, 1fr);
            gap: calc(var(--ae-gap) * 1.25);
          }

          .ae-row {
            display: grid;
            grid-template-columns: minmax(0, 1fr);
            gap: calc(var(--ae-gap) * 1.25);
          }

          .ae-block { min-width: 0; }

          /* ── Labels + fields ── */
          .ae-label {
            display: block;
            margin-bottom: 0.5rem;
            color: var(--ae-white-soft);
            font-size: var(--ae-label);
            font-weight: 700;
            letter-spacing: 0.12em;
            text-transform: uppercase;
          }

          .ae-req { color: var(--ae-red); }

          .ae-field {
            display: block;
            width: 100%;
            min-width: 0;
            min-height: var(--ae-ctl);
            background: transparent;
            border: 1px solid rgba(255, 255, 255, 0.22);
            border-radius: 12px;
            padding: 0.6rem 1rem;
            color: #ffffff;
            font-family: inherit;
            font-size: var(--ae-fs);
            font-weight: 500;
            outline: none;
            transition: border-color 0.25s ease, box-shadow 0.25s ease, background 0.25s ease;
          }

          .ae-field:hover { border-color: rgba(255, 255, 255, 0.4); }

          .ae-field:focus {
            border-color: var(--ae-red);
            background: rgba(255, 45, 63, 0.04);
            box-shadow: 0 0 0 3px rgba(255, 45, 63, 0.18);
          }

          .ae-field::placeholder { color: rgba(255, 255, 255, 0.35); }

          .ae-field option { background: #000000; color: #ffffff; }

          select.ae-field {
            cursor: pointer;
            appearance: none;
            -webkit-appearance: none;
            padding-right: 2.5rem;
            background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='%23ff2d3f' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");
            background-repeat: no-repeat;
            background-position: right 1rem center;
          }

          textarea.ae-field {
            resize: none;
            line-height: 1.6;
            min-height: 6.5rem;
          }

          .ae-root input[type=number]::-webkit-inner-spin-button,
          .ae-root input[type=number]::-webkit-outer-spin-button { -webkit-appearance: none; }

          .ae-root input[type=number] { -moz-appearance: textfield; }

          /* ── Image panel (row on phones/small tablets, column in the sidebar) ── */
          .ae-media-body {
            display: flex;
            flex-wrap: wrap;
            align-items: center;
            gap: var(--ae-gap);
          }

          .ae-upload {
            position: relative;
            display: block;
            flex: 0 0 auto;
            width: var(--ae-upload);
            aspect-ratio: 1 / 1;
            border-radius: 14px;
            overflow: hidden;
            cursor: pointer;
            background: #000000;
            border: 1px solid var(--ae-line-hover);
            transition: border-color 0.3s ease, transform 0.3s ease;
          }

          .ae-upload:hover {
            border-color: var(--ae-red);
            transform: translateY(-2px);
          }

          .ae-preview {
            display: block;
            width: 100%;
            height: 100%;
            object-fit: cover;
          }

          .ae-upload-overlay {
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

          .ae-upload:hover .ae-upload-overlay { opacity: 1; }

          /* touch screens have no hover: keep the "Change" hint visible */
          @media (hover: none) {
            .ae-upload-overlay {
              opacity: 1;
              inset: auto 0 0 0;
              flex-direction: row;
              padding: 0.35rem;
              background: rgba(0, 0, 0, 0.65);
            }

            .ae-upload:hover { transform: none; }
          }

          .ae-media-info {
            flex: 1 1 9rem;
            min-width: 0;
            display: flex;
            flex-direction: column;
            align-items: flex-start;
            gap: 0.6rem;
          }

          .ae-hint {
            color: var(--ae-white-soft);
            font-size: 0.8rem;
            font-weight: 500;
            line-height: 1.5;
          }

          .ae-hint strong {
            display: block;
            margin-bottom: 0.2rem;
            color: #ffffff;
            font-size: 0.88rem;
            font-weight: 700;
          }

          /* ── Remove-new-image button ── */
          .ae-remove {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 0.4rem;
            min-height: 2.25rem;
            padding: 0.4rem 0.85rem;
            border-radius: 10px;
            background: transparent;
            color: var(--ae-red);
            border: 1px solid rgba(255, 45, 63, 0.6);
            font-family: inherit;
            font-size: 0.78rem;
            font-weight: 700;
            cursor: pointer;
            transition: background 0.25s ease, color 0.25s ease, border-color 0.25s ease;
          }

          .ae-remove:hover {
            background: var(--ae-red);
            color: #ffffff;
            border-color: var(--ae-red);
          }

          /* ── Size chips ── */
          .ae-sizes {
            display: grid;
            grid-template-columns: repeat(var(--ae-chip-cols), minmax(0, 1fr));
            gap: 0.5rem;
          }

          .ae-chip {
            min-height: var(--ae-ctl);
            padding: 0.4rem 0.5rem;
            border-radius: 10px;
            font-family: inherit;
            font-size: 0.88rem;
            font-weight: 700;
            cursor: pointer;
            transition: background 0.25s ease, color 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease, transform 0.25s ease;
          }

          .ae-chip--off {
            background: transparent;
            color: #ffffff;
            border: 1px solid rgba(255, 255, 255, 0.3);
          }

          .ae-chip--off:hover {
            border-color: var(--ae-red);
            color: var(--ae-red);
            transform: translateY(-1px);
          }

          .ae-chip--on {
            background: var(--ae-red);
            color: #ffffff;
            border: 1px solid var(--ae-red);
            box-shadow: 0 0 20px rgba(255, 45, 63, 0.4);
          }

          /* ── Per-size stock cards ── */
          .ae-stock-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(min(100%, 15rem), 1fr));
            gap: calc(var(--ae-gap) * 0.8);
            margin-top: var(--ae-gap);
          }

          .ae-stock {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 0.75rem;
            min-width: 0;
            padding: 0.7rem 0.85rem;
            border: 1px solid var(--ae-line);
            border-radius: 12px;
            background: transparent;
            animation: ae-rise 0.4s cubic-bezier(0.22, 1, 0.36, 1) both;
            transition: border-color 0.3s ease;
          }

          .ae-stock:hover,
          .ae-stock:focus-within { border-color: var(--ae-line-hover); }

          .ae-stock-info {
            display: flex;
            align-items: center;
            gap: 0.65rem;
            min-width: 0;
          }

          .ae-stock-text { min-width: 0; }

          .ae-stock-badge {
            width: 2.25rem;
            height: 2.25rem;
            flex-shrink: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 10px;
            color: var(--ae-red);
            background: rgba(255, 45, 63, 0.1);
            border: 1px solid var(--ae-line);
            font-size: 0.8rem;
            font-weight: 800;
          }

          .ae-stock-name {
            color: #ffffff;
            font-size: 0.92rem;
            font-weight: 700;
            white-space: nowrap;
          }

          .ae-stock-sub {
            margin-top: 2px;
            color: var(--ae-white-soft);
            font-size: 0.74rem;
            font-weight: 500;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }

          .ae-stock-qty {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            flex-shrink: 0;
          }

          .ae-stock-input {
            width: 5rem;
            text-align: center;
            padding: 0.4rem 0.5rem;
            font-weight: 700;
          }

          .ae-unit {
            color: var(--ae-white-soft);
            font-size: 0.78rem;
            font-weight: 600;
          }

          /* ── Sticky action bar (Cancel + Save) ── */
          .ae-actions {
            position: sticky;
            bottom: max(0.5rem, env(safe-area-inset-bottom));
            z-index: 5;
            display: flex;
            align-items: center;
            gap: var(--ae-gap);
            padding: 0.6rem;
            border: 1px solid var(--ae-line);
            border-radius: var(--ae-radius);
            background: rgba(0, 0, 0, 0.78);
            -webkit-backdrop-filter: blur(16px);
            backdrop-filter: blur(16px);
          }

          .ae-actions-note {
            display: none;
            flex: 1 1 auto;
            min-width: 0;
            padding-left: 0.5rem;
            color: var(--ae-white-soft);
            font-size: 0.8rem;
            font-weight: 500;
          }

          .ae-submit,
          .ae-cancel {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 0.6rem;
            min-height: var(--ae-ctl);
            padding: 0.6rem 1.4rem;
            border-radius: 12px;
            font-family: inherit;
            font-size: 0.95rem;
            letter-spacing: 0.02em;
            white-space: nowrap;
            cursor: pointer;
          }

          .ae-submit {
            flex: 1 1 auto;
            order: 2;
            color: #ffffff;
            background: var(--ae-red);
            border: 1px solid var(--ae-red);
            font-weight: 800;
            transition: transform 0.25s ease, box-shadow 0.25s ease;
          }

          .ae-submit:hover:not(:disabled) {
            transform: translateY(-2px);
            box-shadow: 0 0 30px rgba(255, 45, 63, 0.55);
          }

          .ae-submit:active:not(:disabled) { transform: translateY(0); }

          .ae-submit:disabled {
            opacity: 0.6;
            cursor: not-allowed;
          }

          .ae-cancel {
            flex: 0 0 auto;
            order: 1;
            color: #ffffff;
            background: transparent;
            border: 1px solid rgba(255, 255, 255, 0.4);
            font-weight: 700;
            transition: background 0.25s ease, color 0.25s ease, border-color 0.25s ease;
          }

          .ae-cancel:hover {
            background: #ffffff;
            color: #000000;
            border-color: #ffffff;
          }

          .ae-back:focus-visible,
          .ae-chip:focus-visible,
          .ae-remove:focus-visible,
          .ae-submit:focus-visible,
          .ae-cancel:focus-visible,
          .ae-upload:focus-within {
            outline: 2px solid #ffffff;
            outline-offset: 2px;
          }

          /* ══════════ Responsive scale ══════════ */

          /* ≥ 375px: iPhone-size phones */
          @media (min-width: 375px) {
            .ae-root {
              --ae-px:    1rem;
              --ae-py:    1.1rem;
              --ae-pad:   1rem;
              --ae-title: 2.05rem;
              --ae-label: 0.7rem;
            }

            .ae-stock-input { width: 5.5rem; }
          }

          /* ≥ 480px: category + price side by side, bigger upload */
          @media (min-width: 480px) {
            .ae-root {
              --ae-py:     1.25rem;
              --ae-gap:    0.875rem;
              --ae-pad:    1.1rem;
              --ae-panel:  1.05rem;
              --ae-upload: 8.5rem;
            }

            .ae-row { grid-template-columns: repeat(2, minmax(0, 1fr)); }
            .ae-stock-sub { overflow: visible; }
          }

          /* ≥ 640px: chips keep a sensible width, action bar note appears */
          @media (min-width: 640px) {
            .ae-root {
              --ae-px:     1.5rem;
              --ae-py:     1.5rem;
              --ae-gap:    1rem;
              --ae-pad:    1.25rem;
              --ae-over:   0.74rem;
              --ae-title:  2.4rem;
              --ae-label:  0.72rem;
              --ae-panel:  1.1rem;
              --ae-upload: 10rem;
            }

            .ae-sizes {
              grid-template-columns: repeat(var(--ae-chip-cols), minmax(0, 4.75rem));
            }

            .ae-actions { padding: 0.65rem 0.65rem 0.65rem 1rem; }
            .ae-actions-note { display: block; }
            .ae-submit { flex: 0 0 auto; min-width: 12rem; }

            .ae-stock-input { width: 6rem; }
          }

          /* ≥ 768px: image becomes a sidebar next to the form */
          @media (min-width: 768px) {
            .ae-root {
              --ae-py:     1.75rem;
              --ae-ctl:    2.6rem;
              --ae-fs:     0.95rem;
              --ae-title:  2.55rem;
              --ae-panel:  1.1rem;
              --ae-aside:  250px;
              --ae-sticky: 5.75rem;
            }

            .ae-layout {
              grid-template-columns: var(--ae-aside) minmax(0, 1fr);
            }

            .ae-aside {
              position: sticky;
              top: var(--ae-sticky);
            }

            .ae-media-body {
              flex-direction: column;
              align-items: stretch;
            }

            .ae-upload { width: 100%; }
            .ae-media-info { flex: 0 1 auto; align-items: stretch; }

            .ae-actions { grid-column: 1 / -1; }

            /* the sizes row is cramped next to the sidebar: keep chips fluid */
            .ae-sizes {
              grid-template-columns: repeat(var(--ae-chip-cols), minmax(0, 1fr));
            }
          }

          /* ≥ 1024px: laptops */
          @media (min-width: 1024px) {
            .ae-root {
              --ae-px:     2rem;
              --ae-py:     2rem;
              --ae-gap:    1.25rem;
              --ae-pad:    1.4rem;
              --ae-radius: 16px;
              --ae-panel:  1.15rem;
              --ae-aside:  300px;
              --ae-sticky: 6rem;
            }

            .ae-sizes {
              grid-template-columns: repeat(var(--ae-chip-cols), minmax(0, 5rem));
            }
          }

          /* ≥ 1280px: desktops */
          @media (min-width: 1280px) {
            .ae-root {
              --ae-py:     2.25rem;
              --ae-pad:    1.6rem;
              --ae-fs:     0.97rem;
              --ae-title:  2.8rem;
              --ae-panel:  1.2rem;
              --ae-aside:  340px;
              --ae-sticky: 6.25rem;
            }
          }

          /* ≥ 1536px: large monitors */
          @media (min-width: 1536px) {
            .ae-root {
              --ae-max:   1680px;
              --ae-px:    2.5rem;
              --ae-py:    2.5rem;
              --ae-gap:   1.5rem;
              --ae-pad:   1.85rem;
              --ae-ctl:   2.75rem;
              --ae-fs:    1rem;
              --ae-over:  0.8rem;
              --ae-label: 0.78rem;
              --ae-title: 3rem;
              --ae-panel: 1.3rem;
              --ae-aside: 380px;
            }

            .ae-chip { font-size: 0.95rem; }
            .ae-stock-name { font-size: 0.98rem; }
          }

          /* ≥ 1920px: ultra-wide */
          @media (min-width: 1920px) {
            .ae-root { --ae-max: 1840px; }
          }

          /* short landscape phones: don't let the sidebar stick over content */
          @media (max-height: 520px) {
            .ae-aside { position: static; }
          }

          /* ── Reduced motion ── */
          @media (prefers-reduced-motion: reduce) {
            .ae-rise,
            .ae-title-bar,
            .ae-stock {
              animation: none !important;
              opacity: 1 !important;
              transform: none !important;
            }

            .ae-back,
            .ae-back svg,
            .ae-field,
            .ae-upload,
            .ae-upload-overlay,
            .ae-remove,
            .ae-chip,
            .ae-submit,
            .ae-cancel {
              transition: none !important;
            }
          }
        `}</style>

        <div className="ae-shell">

          {/* Header: title + back */}

          <div className="ae-head ae-rise">

            <div className="ae-head-text">

              <p className="ae-overline">
                Inventory
              </p>

              <h1 className="ae-title">
                Edit Product
              </h1>

              <div className="ae-title-bar" />

            </div>

            <button
              type="button"
              onClick={() => navigate("/admin/products")}
              className="ae-back"
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


          <div className="ae-layout">

            {/* Image panel */}

            <aside
              className="ae-panel ae-rise ae-aside"
              style={{ animationDelay: "0.1s" }}
            >

              <h2 className="ae-panel-title">
                Product Image
              </h2>

              <div className="ae-media-body">

                <label className="ae-upload">

                  {preview && (
                    <img
                      src={getOptimizedImageUrl(preview)}
                      alt={product.name || "Product preview"}
                      className="ae-preview"
                      loading="eager"
                      decoding="async"
                    />
                  )}

                  <input
                    type="file"
                    hidden
                    accept="image/*"
                    onChange={handleImage}
                  />

                  <div className="ae-upload-overlay">

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

                </label>

                <div className="ae-media-info">

                  <p className="ae-hint">
                    <strong>Main photo</strong>
                    Tap the image to change it. Max 5 MB.
                  </p>

                  {images.length > 0 && (

                    <button
                      type="button"
                      onClick={removeImage}
                      className="ae-remove"
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


            {/* Form column */}

            <div className="ae-col">

              {/* Details */}

              <section
                className="ae-panel ae-rise"
                style={{ animationDelay: "0.15s" }}
              >

                <h2 className="ae-panel-title">
                  Product Details
                </h2>

                <div className="ae-fields">

                  {/* Name */}

                  <div className="ae-block">

                    <label className="ae-label" htmlFor="ae-name">
                      Name{" "}
                      <span className="ae-req">*</span>
                    </label>

                    <input
                      id="ae-name"
                      className="ae-field"
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

                  <div className="ae-block">

                    <label className="ae-label" htmlFor="ae-desc">
                      Description
                    </label>

                    <textarea
                      id="ae-desc"
                      className="ae-field"
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

                  <div className="ae-row">

                    <div className="ae-block">

                      <label className="ae-label" htmlFor="ae-cat">
                        Category
                      </label>

                      <select
                        id="ae-cat"
                        className="ae-field"
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

                    <div className="ae-block">

                      <label className="ae-label" htmlFor="ae-price">
                        Price (₹){" "}
                        <span className="ae-req">*</span>
                      </label>

                      <input
                        id="ae-price"
                        className="ae-field"
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

                </div>

              </section>


              {/* Sizes + Stock */}

              <section
                className="ae-panel ae-rise"
                style={{ animationDelay: "0.2s" }}
              >

                <h2 className="ae-panel-title">
                  Sizes &amp; Stock
                </h2>

                <div className="ae-sizes">

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
                        aria-pressed={selected}
                        onClick={() => toggleSize(size)}
                        className={`ae-chip ${
                          selected
                            ? "ae-chip--on"
                            : "ae-chip--off"
                        }`}
                      >
                        {size}
                      </button>
                    );

                  })}

                </div>

                {/* Stock inputs */}

                {product.sizes.length > 0 && (

                  <div className="ae-stock-grid">

                    {product.sizes.map(sizeItem => {

                      const stockValue =
                        getSizeObject(sizeItem.size)?.stock;

                      return (

                        <div
                          key={sizeItem.size}
                          className="ae-stock"
                        >

                          <div className="ae-stock-info">

                            <div className="ae-stock-badge">
                              {sizeItem.size}
                            </div>

                            <div className="ae-stock-text">

                              <div className="ae-stock-name">
                                Size{" "}
                                {sizeItem.size}
                              </div>

                              <div className="ae-stock-sub">
                                Available stock
                              </div>

                            </div>

                          </div>

                          <div className="ae-stock-qty">

                            <input
                              className="ae-field ae-stock-input"
                              type="number"
                              inputMode="numeric"
                              min="0"
                              max="1000000"
                              step="1"
                              value={stockValue ?? ""}
                              placeholder="0"
                              aria-label={`Stock for size ${sizeItem.size}`}
                              onChange={e =>
                                updateSizeStock(
                                  sizeItem.size,
                                  e.target.value
                                )
                              }
                            />

                            <span className="ae-unit">pcs</span>

                          </div>

                        </div>

                      );

                    })}

                  </div>

                )}

              </section>

            </div>


            {/* Sticky action bar */}

            <div
              className="ae-actions ae-rise"
              style={{ animationDelay: "0.25s" }}
            >

              <span className="ae-actions-note">
                Fields marked <span className="ae-req">*</span> are required.
              </span>

              <button
                type="button"
                onClick={() => navigate("/admin/products")}
                className="ae-cancel"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleUpdate}
                disabled={isSaving}
                className="ae-submit"
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
                      style={{ animation: "ae-spin 1s linear infinite" }}
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

            </div>

          </div>

        </div>

      </div>

    </>

  );

};


export default EditProduct;