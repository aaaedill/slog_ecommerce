import React, { useContext, useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShopContext } from "../context/ShopContext";
import { toast } from "react-toastify";

const Wishlist = () => {
  const navigate = useNavigate();

  const {
    user,
    wishlist: wishlistProducts = [],
    wishlistLoading,
    fetchWishlist,
    removeFromWishlist,
    clearWishlist,
    addToCart,
  } = useContext(ShopContext);

  const [selectedSizes, setSelectedSizes] = useState({});
  const [addingProductId, setAddingProductId] = useState(null);
  const [removingProductId, setRemovingProductId] = useState(null);
  const [isClearing, setIsClearing] = useState(false);

  const fetchedUserRef = useRef(null);

  const userId = user?.id ?? user?._id ?? null;

  /* ── Fetch wishlist when the signed-in user changes ── */

  useEffect(() => {
    if (!userId) {
      fetchedUserRef.current = null;
      return;
    }

    if (String(fetchedUserRef.current) === String(userId)) {
      return;
    }

    fetchedUserRef.current = userId;

    if (typeof fetchWishlist === "function") {
      fetchWishlist();
    }
  }, [userId, fetchWishlist]);

  /* ── Helpers ── */

  const getProductId = (product) => {
    return product?.id ?? product?._id ?? null;
  };

  const getProductName = (product) => {
    return product?.name ?? product?.title ?? "Untitled product";
  };

  const getProductImage = (product) => {
    const imageSource =
      product?.image ??
      product?.images?.[0] ??
      product?.imageUrl ??
      "";

    if (Array.isArray(imageSource)) {
      return imageSource[0] ?? "";
    }

    if (typeof imageSource === "string") {
      return imageSource;
    }

    return "";
  };

  const getProductPrice = (product) => {
    const price = Number(product?.price);

    return Number.isFinite(price) && price >= 0
      ? price
      : null;
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(price);
  };

  const getProductSizes = (product) => {
    if (!Array.isArray(product?.sizes)) {
      return [];
    }

    return product.sizes
      .map((item) => {
        if (typeof item === "string") {
          return {
            size: item,
            stock: 0,
          };
        }

        if (item && typeof item === "object") {
          const stock = Number(item.stock);

          return {
            size: String(item.size ?? "").trim(),
            stock:
              Number.isFinite(stock) && stock > 0
                ? stock
                : 0,
          };
        }

        return null;
      })
      .filter((item) => item && item.size);
  };

  const getAvailableSizes = (product) => {
    return getProductSizes(product).filter(
      (item) => item.stock > 0
    );
  };

  const getSelectedSize = (product) => {
    const productId = getProductId(product);

    if (!productId) {
      return "";
    }

    return selectedSizes[String(productId)] ?? "";
  };

  const setProductSize = (productId, size) => {
    setSelectedSizes((previous) => ({
      ...previous,
      [String(productId)]: size,
    }));
  };

  /* ── Remove one product ── */

  const handleRemove = async (product) => {
    const productId = getProductId(product);

    if (!user) {
      navigate("/login");
      return;
    }

    if (!productId || typeof removeFromWishlist !== "function") {
      toast.error("Unable to remove this product right now.");
      return;
    }

    if (removingProductId !== null || isClearing) {
      return;
    }

    setRemovingProductId(String(productId));

    try {
      const result = await removeFromWishlist(productId);

      if (result?.success === false) {
        toast.error(result.message || "Could not remove the product.");
        return;
      }

      setSelectedSizes((previous) => {
        const updated = { ...previous };
        delete updated[String(productId)];
        return updated;
      });

      toast.success("Removed from your wishlist.");
    } catch (error) {
      console.error("Wishlist removal error:", error);
      toast.error("Could not remove the product. Please try again.");
    } finally {
      setRemovingProductId(null);
    }
  };

  /* ── Clear all products ── */

  const handleClearWishlist = async () => {
    if (!user) {
      navigate("/login");
      return;
    }

    if (
      !wishlistProducts.length ||
      typeof clearWishlist !== "function" ||
      isClearing ||
      removingProductId !== null
    ) {
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to clear your entire wishlist?"
    );

    if (!confirmed) {
      return;
    }

    setIsClearing(true);

    try {
      const result = await clearWishlist();

      if (result?.success === false) {
        toast.error(result.message || "Could not clear your wishlist.");
        return;
      }

      setSelectedSizes({});
      toast.success("Your wishlist has been cleared.");
    } catch (error) {
      console.error("Clear wishlist error:", error);
      toast.error("Could not clear your wishlist. Please try again.");
    } finally {
      setIsClearing(false);
    }
  };

  /* ── Add a wishlist product to the cart ── */

  const handleAddToCart = async (product) => {
    if (!user) {
      toast.info("Please log in to add products to your cart.");
      navigate("/login");
      return;
    }

    const productId = getProductId(product);

    if (!productId) {
      toast.error("This product has an invalid ID.");
      return;
    }

    if (typeof addToCart !== "function") {
      toast.error("The cart is currently unavailable.");
      return;
    }

    if (addingProductId !== null || isClearing) {
      return;
    }

    const availableSizes = getAvailableSizes(product);

    if (availableSizes.length === 0) {
      toast.error("This product is currently out of stock.");
      return;
    }

    const selectedSize = getSelectedSize(product);

    if (!selectedSize) {
      toast.info("Please select a size first.");
      return;
    }

    const sizeDetails = availableSizes.find(
      (item) => item.size === selectedSize
    );

    if (!sizeDetails || sizeDetails.stock <= 0) {
      toast.error("This size is currently out of stock.");
      return;
    }

    setAddingProductId(String(productId));

    try {
      await addToCart(productId, selectedSize);

      toast.success("Product added to your cart.");
    } catch (error) {
      console.error("Add to cart error:", error);
      toast.error("Could not add this product to your cart.");
    } finally {
      setAddingProductId(null);
    }
  };

  /* ── Unauthenticated view ── */

  if (!user) {
    return (
      <main className="wl-root">
        <style>{wishlistStyles}</style>

        <section className="wl-empty-state">
          <div className="wl-empty-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78Z" />
            </svg>
          </div>

          <p className="wl-eyebrow">YOUR PERSONAL EDIT</p>

          <h1 className="wl-empty-title">
            Your wishlist awaits.
          </h1>

          <p className="wl-empty-description">
            Sign in to save your favourite pieces and keep them
            together in one place.
          </p>

          <Link to="/login" className="wl-primary-btn">
            Sign in to continue
          </Link>

          <Link to="/collection" className="wl-text-link">
            Explore the collection
          </Link>
        </section>
      </main>
    );
  }

  /* ── Loading view ── */

  if (wishlistLoading) {
    return (
      <main className="wl-root">
        <style>{wishlistStyles}</style>

        <section className="wl-loading-state">
          <span className="wl-spinner" aria-hidden="true" />

          <p>Loading your wishlist...</p>
        </section>
      </main>
    );
  }

  /* ── Empty wishlist ── */

  if (!wishlistProducts.length) {
    return (
      <main className="wl-root">
        <style>{wishlistStyles}</style>

        <section className="wl-empty-state">
          <div className="wl-empty-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78Z" />
            </svg>
          </div>

          <p className="wl-eyebrow">YOUR PERSONAL EDIT</p>

          <h1 className="wl-empty-title">
            Nothing saved. Yet.
          </h1>

          <p className="wl-empty-description">
            When a piece catches your eye, tap the heart to save
            it here. Your next favourite might be waiting.
          </p>

          <Link to="/collection" className="wl-primary-btn">
            Explore the collection
          </Link>
        </section>
      </main>
    );
  }

  /* ── Wishlist page ── */

  return (
    <main className="wl-root">
      <style>{wishlistStyles}</style>

      <div className="wl-container">
        {/* Page heading */}

        <header className="wl-header">
          <div>
            <p className="wl-eyebrow">YOUR PERSONAL EDIT</p>

            <h1 className="wl-title">
              My Wishlist
            </h1>

            <p className="wl-subtitle">
              The pieces you love, all in one place.
            </p>
          </div>

          <div className="wl-header-actions">
            <span className="wl-item-count">
              {wishlistProducts.length}{" "}
              {wishlistProducts.length === 1 ? "ITEM" : "ITEMS"}
            </span>

            <button
              type="button"
              className="wl-clear-btn"
              onClick={handleClearWishlist}
              disabled={isClearing || removingProductId !== null}
            >
              {isClearing ? "Clearing..." : "Clear wishlist"}
            </button>
          </div>
        </header>

        {/* Product list */}

        <section
          className="wl-list"
          aria-label="Saved products"
        >
          {wishlistProducts.map((product, index) => {
            const productId = getProductId(product);
            const productKey = String(
              productId ?? `wishlist-product-${index}`
            );

            const productName = getProductName(product);
            const productImage = getProductImage(product);
            const productPrice = getProductPrice(product);
            const availableSizes = getAvailableSizes(product);
            const selectedSize = getSelectedSize(product);

            const isAdding =
              addingProductId === productKey;

            const isRemoving =
              removingProductId === productKey;

            const outOfStock = availableSizes.length === 0;

            return (
              <article
                className="wl-item"
                key={productKey}
              >
                {/* Product image */}

                <Link
                  to={
                    productId
                      ? `/product/${productId}`
                      : "/collection"
                  }
                  className="wl-image-link"
                  aria-label={`View ${productName}`}
                >
                  {productImage ? (
                    <img
                      className="wl-product-image"
                      src={productImage}
                      alt={productName}
                      loading="lazy"
                    />
                  ) : (
                    <div className="wl-image-placeholder">
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        aria-hidden="true"
                      >
                        <rect
                          x="3"
                          y="3"
                          width="18"
                          height="18"
                          rx="2"
                        />
                        <circle cx="8.5" cy="8.5" r="1.5" />
                        <path d="m21 15-5-5L5 21" />
                      </svg>

                      <span>No image available</span>
                    </div>
                  )}
                </Link>

                {/* Product information */}

                <div className="wl-product-info">
                  <div className="wl-product-heading">
                    <div>
                      {product.category && (
                        <p className="wl-category">
                          {product.category}
                        </p>
                      )}

                      <Link
                        to={
                          productId
                            ? `/product/${productId}`
                            : "/collection"
                        }
                        className="wl-product-name"
                      >
                        {productName}
                      </Link>
                    </div>

                    <button
                      type="button"
                      className="wl-remove-btn"
                      onClick={() => handleRemove(product)}
                      disabled={
                        isRemoving ||
                        isClearing ||
                        removingProductId !== null
                      }
                      aria-label={`Remove ${productName} from wishlist`}
                      title="Remove from wishlist"
                    >
                      {isRemoving ? (
                        <span className="wl-remove-loading">
                          Removing...
                        </span>
                      ) : (
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          aria-hidden="true"
                        >
                          <path d="M18 6 6 18M6 6l12 12" />
                        </svg>
                      )}
                    </button>
                  </div>

                  <div className="wl-price-row">
                    {productPrice !== null ? (
                      <span className="wl-price">
                        {formatPrice(productPrice)}
                      </span>
                    ) : (
                      <span className="wl-price-unavailable">
                        Price unavailable
                      </span>
                    )}

                    <span
                      className={`wl-stock ${
                        outOfStock
                          ? "wl-stock-out"
                          : "wl-stock-in"
                      }`}
                    >
                      <span className="wl-stock-dot" />
                      {outOfStock ? "Out of stock" : "In stock"}
                    </span>
                  </div>

                  {/* Size selection */}

                  <div className="wl-product-bottom">
                    <div className="wl-size-field">
                      <label
                        htmlFor={`wl-size-${productKey}`}
                        className="wl-size-label"
                      >
                        Select size
                      </label>

                      <select
                        id={`wl-size-${productKey}`}
                        className="wl-size-select"
                        value={selectedSize}
                        onChange={(event) =>
                          setProductSize(
                            productKey,
                            event.target.value
                          )
                        }
                        disabled={
                          outOfStock ||
                          isAdding ||
                          isRemoving ||
                          isClearing
                        }
                      >
                        <option value="">
                          {outOfStock
                            ? "Unavailable"
                            : "Choose a size"}
                        </option>

                        {availableSizes.map((item) => (
                          <option
                            key={item.size}
                            value={item.size}
                          >
                            {item.size}
                            {` — ${item.stock} available`}
                          </option>
                        ))}
                      </select>
                    </div>

                    <button
                      type="button"
                      className="wl-add-btn"
                      onClick={() => handleAddToCart(product)}
                      disabled={
                        outOfStock ||
                        isAdding ||
                        isRemoving ||
                        isClearing ||
                        addingProductId !== null ||
                        removingProductId !== null
                      }
                    >
                      {isAdding
                        ? "Adding..."
                        : outOfStock
                          ? "Out of stock"
                          : "Add to cart"}

                      {!outOfStock && !isAdding && (
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          aria-hidden="true"
                        >
                          <path d="M5 12h14M13 6l6 6-6 6" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </section>

        {/* Continue shopping */}

        <footer className="wl-footer">
          <Link to="/collection" className="wl-continue-link">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
            >
              <path d="M19 12H5M11 18l-6-6 6-6" />
            </svg>

            Continue shopping
          </Link>

          <p className="wl-footer-note">
            Good style is worth saving.
          </p>
        </footer>
      </div>
    </main>
  );
};

const wishlistStyles = `
  .wl-root {
    --wl-text: #2A2E1E;
    --wl-muted: #656B50;
    --wl-accent: #56701C;
    --wl-accent-hover: #405516;
    --wl-border: rgba(75, 83, 32, 0.22);
    --wl-soft: rgba(86, 112, 28, 0.08);
    --wl-danger: #A6503B;
    --wl-success: #4F6B32;

    min-height: 70vh;
    width: 100%;
    padding: 120px clamp(18px, 5vw, 72px) 72px;

    background: var(--bg-primary, #F1F4E8);
    color: var(--wl-text);

    font-family: 'Outfit', sans-serif;
    transition:
      background-color 0.25s ease,
      color 0.25s ease;
  }

  html.dark-mode .wl-root {
    --wl-text: #F0F1E0;
    --wl-muted: #B3B997;
    --wl-accent: #B4CF74;
    --wl-accent-hover: #D0E59B;
    --wl-border: rgba(255, 255, 255, 0.17);
    --wl-soft: rgba(180, 207, 116, 0.09);
    --wl-danger: #E0907A;
    --wl-success: #B4CF74;

    background: #000000;
    color: var(--wl-text);
  }

  .wl-container {
    width: 100%;
    max-width: 1240px;
    margin: 0 auto;
  }

  .wl-header {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 24px;
    padding-bottom: 28px;
    border-bottom: 1px solid var(--wl-border);
  }

  .wl-eyebrow {
    margin: 0 0 12px;
    color: var(--wl-muted);
    font-size: 0.72rem;
    font-weight: 600;
    letter-spacing: 0.19em;
    text-transform: uppercase;
  }

  .wl-title,
  .wl-empty-title {
    margin: 0;
    color: var(--wl-text);
    font-family: 'Prata', Georgia, serif;
    font-size: clamp(2.2rem, 4vw, 3.6rem);
    font-weight: 400;
    line-height: 1.15;
    letter-spacing: -0.035em;
  }

  .wl-subtitle {
    margin: 12px 0 0;
    color: var(--wl-muted);
    font-size: 0.96rem;
    line-height: 1.7;
  }

  .wl-header-actions {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    flex-wrap: wrap;
    gap: 16px;
  }

  .wl-item-count {
    color: var(--wl-muted);
    font-size: 0.72rem;
    font-weight: 600;
    letter-spacing: 0.13em;
    white-space: nowrap;
  }

  .wl-clear-btn {
    padding: 8px 0;
    border: 0;
    border-bottom: 1px solid var(--wl-border);
    background: transparent;
    color: var(--wl-muted);
    font: inherit;
    font-size: 0.82rem;
    cursor: pointer;
    transition:
      color 0.2s ease,
      border-color 0.2s ease;
  }

  .wl-clear-btn:hover:not(:disabled) {
    color: var(--wl-danger);
    border-color: var(--wl-danger);
  }

  .wl-clear-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .wl-list {
    width: 100%;
  }

  .wl-item {
    display: grid;
    grid-template-columns: minmax(160px, 230px) minmax(0, 1fr);
    gap: clamp(22px, 4vw, 52px);
    padding: 30px 0;
    border-bottom: 1px solid var(--wl-border);
  }

  .wl-image-link {
    display: block;
    width: 100%;
    aspect-ratio: 4 / 5;
    overflow: hidden;
    background: rgba(86, 112, 28, 0.045);
    text-decoration: none;
  }

  html.dark-mode .wl-image-link {
    background: #080808;
  }

  .wl-product-image {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.5s cubic-bezier(.2,.8,.2,1);
  }

  .wl-image-link:hover .wl-product-image {
    transform: scale(1.035);
  }

  .wl-image-placeholder {
    display: flex;
    width: 100%;
    height: 100%;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 10px;
    color: var(--wl-muted);
    font-size: 0.78rem;
  }

  .wl-image-placeholder svg {
    width: 30px;
    height: 30px;
    stroke: currentColor;
    stroke-width: 1.2;
    stroke-linecap: round;
    stroke-linejoin: round;
  }

  .wl-product-info {
    display: flex;
    min-width: 0;
    flex-direction: column;
    justify-content: center;
    padding: 4px 0;
  }

  .wl-product-heading {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 16px;
  }

  .wl-category {
    margin: 0 0 8px;
    color: var(--wl-muted);
    font-size: 0.72rem;
    letter-spacing: 0.1em;
    text-transform: uppercase;
  }

  .wl-product-name {
    display: inline-block;
    color: var(--wl-text);
    font-family: 'Prata', Georgia, serif;
    font-size: clamp(1.25rem, 2vw, 1.75rem);
    font-weight: 400;
    line-height: 1.4;
    text-decoration: none;
    transition: color 0.2s ease;
  }

  .wl-product-name:hover {
    color: var(--wl-accent);
  }

  .wl-remove-btn {
    display: inline-flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    min-width: 36px;
    min-height: 36px;
    padding: 6px;
    border: 0;
    background: transparent;
    color: var(--wl-muted);
    cursor: pointer;
    transition:
      color 0.2s ease,
      background 0.2s ease;
  }

  .wl-remove-btn:hover:not(:disabled) {
    color: var(--wl-danger);
    background: var(--wl-soft);
  }

  .wl-remove-btn:disabled {
    opacity: 0.55;
    cursor: not-allowed;
  }

  .wl-remove-btn svg {
    width: 19px;
    height: 19px;
    stroke: currentColor;
    stroke-width: 1.6;
    stroke-linecap: round;
  }

  .wl-remove-loading {
    font-size: 0.72rem;
    white-space: nowrap;
  }

  .wl-price-row {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 14px;
    margin-top: 18px;
  }

  .wl-price {
    color: var(--wl-text);
    font-size: 1rem;
    font-weight: 500;
  }

  .wl-price-unavailable {
    color: var(--wl-muted);
    font-size: 0.88rem;
  }

  .wl-stock {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    font-size: 0.78rem;
  }

  .wl-stock-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: currentColor;
  }

  .wl-stock-in {
    color: var(--wl-success);
  }

  .wl-stock-out {
    color: var(--wl-danger);
  }

  .wl-product-bottom {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 18px;
    margin-top: 30px;
  }

  .wl-size-field {
    display: flex;
    min-width: 170px;
    flex-direction: column;
    gap: 9px;
  }

  .wl-size-label {
    color: var(--wl-muted);
    font-size: 0.75rem;
    letter-spacing: 0.04em;
  }

  .wl-size-select {
    width: 100%;
    min-width: 170px;
    min-height: 43px;
    padding: 10px 34px 10px 12px;
    border: 1px solid var(--wl-border);
    border-radius: 0;
    outline: none;
    background: transparent;
    color: var(--wl-text);
    font: inherit;
    font-size: 0.84rem;
    cursor: pointer;
    transition:
      border-color 0.2s ease,
      background 0.2s ease;
  }

  .wl-size-select:focus {
    border-color: var(--wl-accent);
  }

  .wl-size-select:disabled {
    opacity: 0.55;
    cursor: not-allowed;
  }

  .wl-size-select option {
    background: var(--bg-primary, #F1F4E8);
    color: #2A2E1E;
  }

  html.dark-mode .wl-size-select option {
    background: #000000;
    color: #F0F1E0;
  }

  .wl-add-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    min-height: 44px;
    padding: 12px 18px;
    border: 1px solid var(--wl-accent);
    background: var(--wl-accent);
    color: #FFFFFF;
    font: inherit;
    font-size: 0.82rem;
    font-weight: 500;
    cursor: pointer;
    transition:
      background 0.2s ease,
      color 0.2s ease,
      border-color 0.2s ease,
      opacity 0.2s ease;
  }

  html.dark-mode .wl-add-btn {
    color: #080A04;
  }

  .wl-add-btn:hover:not(:disabled) {
    background: var(--wl-accent-hover);
    border-color: var(--wl-accent-hover);
    color: #FFFFFF;
  }

  html.dark-mode .wl-add-btn:hover:not(:disabled) {
    color: #000000;
  }

  .wl-add-btn:disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }

  .wl-add-btn svg {
    width: 17px;
    height: 17px;
    stroke: currentColor;
    stroke-width: 1.7;
    stroke-linecap: round;
    stroke-linejoin: round;
  }

  .wl-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 16px;
    padding-top: 28px;
  }

  .wl-continue-link {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    color: var(--wl-text);
    font-size: 0.86rem;
    text-decoration: none;
    transition: color 0.2s ease;
  }

  .wl-continue-link:hover {
    color: var(--wl-accent);
  }

  .wl-continue-link svg {
    width: 18px;
    height: 18px;
    stroke: currentColor;
    stroke-width: 1.6;
    stroke-linecap: round;
    stroke-linejoin: round;
    transition: transform 0.2s ease;
  }

  .wl-continue-link:hover svg {
    transform: translateX(-3px);
  }

  .wl-footer-note {
    margin: 0;
    color: var(--wl-muted);
    font-family: 'Prata', Georgia, serif;
    font-size: 0.9rem;
    font-style: italic;
  }

  /* ══════════ Empty and loading states ══════════ */

  .wl-empty-state,
  .wl-loading-state {
    display: flex;
    min-height: 52vh;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    padding: 36px 16px;
  }

  .wl-empty-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 62px;
    height: 62px;
    margin-bottom: 26px;
    color: var(--wl-accent);
  }

  .wl-empty-icon svg {
    width: 46px;
    height: 46px;
    stroke: currentColor;
    stroke-width: 1.3;
    stroke-linecap: round;
    stroke-linejoin: round;
  }

  .wl-empty-title {
    font-size: clamp(2rem, 4vw, 3rem);
  }

  .wl-empty-description {
    max-width: 430px;
    margin: 18px 0 28px;
    color: var(--wl-muted);
    font-size: 0.94rem;
    line-height: 1.8;
  }

  .wl-primary-btn {
    display: inline-flex;
    min-height: 46px;
    align-items: center;
    justify-content: center;
    padding: 13px 24px;
    background: var(--wl-accent);
    color: #FFFFFF;
    font-size: 0.86rem;
    font-weight: 500;
    text-decoration: none;
    transition:
      background 0.2s ease,
      transform 0.2s ease;
  }

  html.dark-mode .wl-primary-btn {
    color: #080A04;
  }

  .wl-primary-btn:hover {
    background: var(--wl-accent-hover);
    color: #FFFFFF;
    transform: translateY(-1px);
  }

  html.dark-mode .wl-primary-btn:hover {
    color: #000000;
  }

  .wl-text-link {
    margin-top: 18px;
    color: var(--wl-muted);
    font-size: 0.83rem;
    text-decoration: underline;
    text-underline-offset: 4px;
  }

  .wl-text-link:hover {
    color: var(--wl-accent);
  }

  .wl-loading-state {
    gap: 16px;
    color: var(--wl-muted);
    font-size: 0.9rem;
  }

  .wl-spinner {
    width: 30px;
    height: 30px;
    border: 2px solid var(--wl-border);
    border-top-color: var(--wl-accent);
    border-radius: 50%;
    animation: wl-spin 0.75s linear infinite;
  }

  @keyframes wl-spin {
    to {
      transform: rotate(360deg);
    }
  }

  /* ══════════ Responsive ══════════ */

  @media (max-width: 700px) {
    .wl-root {
      padding: 98px 18px 48px;
    }

    .wl-header {
      align-items: flex-start;
      flex-direction: column;
      gap: 20px;
      padding-bottom: 22px;
    }

    .wl-header-actions {
      width: 100%;
      justify-content: space-between;
    }

    .wl-item {
      grid-template-columns: minmax(105px, 34%) minmax(0, 1fr);
      gap: 16px;
      padding: 22px 0;
    }

    .wl-product-info {
      padding: 0;
    }

    .wl-product-name {
      font-size: 1.15rem;
    }

    .wl-category {
      font-size: 0.65rem;
    }

    .wl-price-row {
      gap: 8px;
      margin-top: 12px;
    }

    .wl-price {
      font-size: 0.9rem;
    }

    .wl-stock {
      font-size: 0.7rem;
    }

    .wl-product-bottom {
      align-items: stretch;
      flex-direction: column;
      gap: 12px;
      margin-top: 18px;
    }

    .wl-size-field,
    .wl-size-select {
      width: 100%;
      min-width: 0;
    }

    .wl-add-btn {
      width: 100%;
      min-height: 42px;
      padding: 10px 12px;
    }

    .wl-remove-btn {
      min-width: 28px;
      min-height: 28px;
      padding: 3px;
    }

    .wl-remove-btn svg {
      width: 16px;
      height: 16px;
    }

    .wl-footer {
      align-items: flex-start;
      flex-direction: column;
    }
  }

  @media (max-width: 390px) {
    .wl-root {
      padding-right: 13px;
      padding-left: 13px;
    }

    .wl-item {
      grid-template-columns: 100px minmax(0, 1fr);
      gap: 12px;
    }

    .wl-product-name {
      font-size: 1rem;
    }

    .wl-price-row {
      align-items: flex-start;
      flex-direction: column;
    }

    .wl-empty-title {
      font-size: 2rem;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .wl-root *,
    .wl-root *::before,
    .wl-root *::after {
      animation-duration: 0.01ms !important;
      transition-duration: 0.01ms !important;
      scroll-behavior: auto !important;
    }
  }
`;

export default Wishlist;