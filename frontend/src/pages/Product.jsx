import {
  useParams,
  useNavigate
} from "react-router-dom";

import {
  useEffect,
  useState,
  useContext,
  useRef
} from "react";

import axios from "axios";

import { toast } from "react-toastify";

import { ShopContext } from "../context/ShopContext";

import API_URL from "../config/api";


const glassToastStyle = {
  background:
    "rgba(255,255,255,0.55)",

  backdropFilter:
    "blur(24px) saturate(1.8)",

  WebkitBackdropFilter:
    "blur(24px) saturate(1.8)",

  border:
    "1px solid rgba(47,93,255,0.25)",

  borderRadius:
    "16px",

  color:
    "#16307A",

  fontFamily:
    "Outfit, sans-serif",

  boxShadow:
    "0 8px 32px rgba(47,93,255,0.16), 0 1px 0 rgba(255,255,255,0.8) inset"
};


/* =========================================================
   NORMALIZE SIZE NAME
   ========================================================= */

const normalizeSizeName = (
  value
) => {
  return String(
    value ?? ""
  )
    .trim()
    .toLowerCase();
};


/* =========================================================
   GET SIZE NAME
   ========================================================= */

const getSizeName = (
  sizeItem
) => {

  if (
    typeof sizeItem ===
    "string"
  ) {
    return sizeItem.trim();
  }

  return String(
    sizeItem?.size ?? ""
  ).trim();

};


/* =========================================================
   GET SIZE STOCK
   ========================================================= */

const getSizeStock = (
  sizeItem
) => {

  /*
   * Old string-based sizes do not
   * have trustworthy stock information.
   *
   * They are therefore treated as
   * unavailable.
   */

  if (
    typeof sizeItem ===
    "string"
  ) {
    return 0;
  }


  const stock =
    Number(
      sizeItem?.stock
    );


  if (
    !Number.isFinite(
      stock
    )
  ) {
    return 0;
  }


  return Math.max(
    0,
    Math.floor(
      stock
    )
  );

};


/* =========================================================
   MAIN PRODUCT PAGE
   ========================================================= */

const Product = () => {

  const {
    id
  } = useParams();


  const navigate =
    useNavigate();


  const {
    addToCart,
    user
  } = useContext(
    ShopContext
  );


  const [
    product,
    setProduct
  ] = useState(null);


  const [
    selectedSize,
    setSelectedSize
  ] = useState(null);


  /*
   * Prevents the pending-cart
   * operation from running multiple
   * times after login.
   */

  const hasExecuted =
    useRef(false);


  // =========================================================
  // LOAD PRODUCT
  // =========================================================

  useEffect(() => {

    let isMounted =
      true;


    const loadProduct =
      async () => {

        try {

          const res =
            await axios.get(
              `${API_URL}/products/${encodeURIComponent(
                id
              )}`,
              {
                withCredentials:
                  true
              }
            );


          if (
            !isMounted
          ) {
            return;
          }


          const productData =
            res.data?.product;


          if (
            !productData
          ) {

            toast.error(
              "Failed to load product",
              {
                style:
                  glassToastStyle
              }
            );

            return;

          }


          setProduct(
            productData
          );

        } catch (
          err
        ) {

          console.error(
            "Product load error:",
            err
          );


          if (
            !isMounted
          ) {
            return;
          }


          toast.error(
            err.response?.data?.message ||
              "Failed to load product",
            {
              style:
                glassToastStyle
            }
          );

        }

      };


    loadProduct();


    return () => {

      isMounted =
        false;

    };

  }, [
    id
  ]);


  // =========================================================
  // HANDLE PENDING CART AFTER LOGIN
  // =========================================================

  useEffect(() => {

    const pendingCart =
      localStorage.getItem(
        "pendingCart"
      );


    if (
      !pendingCart ||
      !user ||
      hasExecuted.current
    ) {
      return;
    }


    /*
     * Product must already be loaded
     * before checking the selected size.
     */

    if (
      !product
    ) {
      return;
    }


    let parsed;


    try {

      parsed =
        JSON.parse(
          pendingCart
        );

    } catch {

      localStorage.removeItem(
        "pendingCart"
      );

      return;

    }


    const {
      productId,
      size
    } = parsed;


    /*
     * Only process the pending cart
     * if it belongs to this product.
     */

    if (
      String(
        productId
      ) !==
      String(
        id
      )
    ) {
      return;
    }


    /*
     * Find the selected size using
     * case-insensitive comparison.
     */

    const matchingSize =
      product?.sizes?.find(
        (sizeItem) => {

          const sizeName =
            getSizeName(
              sizeItem
            );


          return (
            normalizeSizeName(
              sizeName
            ) ===
            normalizeSizeName(
              size
            )
          );

        }
      );


    /*
     * Size no longer exists.
     */

    if (
      !matchingSize
    ) {

      localStorage.removeItem(
        "pendingCart"
      );

      toast.error(
        "Selected size is no longer available",
        {
          style:
            glassToastStyle
        }
      );

      return;

    }


    const matchingStock =
      getSizeStock(
        matchingSize
      );


    /*
     * Size exists but has no
     * available stock.
     */

    if (
      matchingStock <= 0
    ) {

      localStorage.removeItem(
        "pendingCart"
      );

      toast.error(
        "Selected size is sold out",
        {
          style:
            glassToastStyle
        }
      );

      return;

    }


    hasExecuted.current =
      true;


    (
      async () => {

        try {

          const result =
            await addToCart(
              productId,
              getSizeName(
                matchingSize
              )
            );


          if (
            result?.success
          ) {

            toast.success(
              "Added to cart",
              {
                style:
                  glassToastStyle
              }
            );


            localStorage.removeItem(
              "pendingCart"
            );

          } else {

            toast.error(
              result?.message ||
                "Failed to add to cart",
              {
                style:
                  glassToastStyle
              }
            );


            hasExecuted.current =
              false;

          }

        } catch (
          err
        ) {

          console.error(
            "Pending cart error:",
            err
          );


          toast.error(
            err.response?.data?.message ||
              "Failed to add to cart",
            {
              style:
                glassToastStyle
            }
          );


          hasExecuted.current =
            false;

        }

      }
    )();

  }, [
    user,
    id,
    product,
    addToCart
  ]);


  // =========================================================
  // LOADING STATE
  // =========================================================

  if (
    !product
  ) {

    return (
      <p
        style={{
          fontFamily:
            "'Outfit', sans-serif",

          fontSize:
            "0.85rem",

          letterSpacing:
            "0.1em",

          color:
            "var(--text-secondary)"
        }}
      >
        Loading...
      </p>
    );

  }


  // =========================================================
  // FIND SELECTED SIZE
  // =========================================================

  const selectedSizeData =
    product?.sizes?.find(
      (sizeItem) => {

        const sizeName =
          getSizeName(
            sizeItem
          );


        return (
          normalizeSizeName(
            sizeName
          ) ===
          normalizeSizeName(
            selectedSize
          )
        );

      }
    );


  const selectedStock =
    selectedSizeData
      ? getSizeStock(
          selectedSizeData
        )
      : 0;


  const hasSelectedSize =
    Boolean(
      selectedSize &&
      String(
        selectedSize
      ).trim() !== ""
    );


  const isSelectedSizeAvailable =
    hasSelectedSize &&
    selectedSizeData &&
    Number.isFinite(
      selectedStock
    ) &&
    selectedStock > 0;


  // =========================================================
  // ADD TO CART
  // =========================================================

  const handleAddToCart =
    async () => {

      /*
       * Size must be selected.
       */

      if (
        !selectedSize ||
        String(
          selectedSize
        ).trim() === ""
      ) {

        toast.error(
          "Please select size",
          {
            style:
              glassToastStyle
          }
        );

        return;

      }


      /*
       * Verify that the selected
       * size still exists and has
       * stock.
       */

      if (
        !isSelectedSizeAvailable
      ) {

        toast.error(
          "Selected size is sold out",
          {
            style:
              glassToastStyle
          }
        );

        return;

      }


      /*
       * If the user is not logged in,
       * remember the selected product
       * and size before redirecting.
       */

      if (
        !user
      ) {

        localStorage.setItem(
          "pendingCart",
          JSON.stringify({
            productId:
              product.id,

            size:
              getSizeName(
                selectedSizeData
              )
          })
        );


        toast.error(
          "Please login first",
          {
            style:
              glassToastStyle
          }
        );


        navigate(
          "/login"
        );

        return;

      }


      /*
       * Product must have a valid ID.
       */

      if (
        !product?.id
      ) {

        toast.error(
          "Invalid product",
          {
            style:
              glassToastStyle
          }
        );

        return;

      }


      try {

        const result =
          await addToCart(
            product.id,
            getSizeName(
              selectedSizeData
            )
          );


        if (
          result?.success
        ) {

          toast.success(
            "Added to cart",
            {
              style:
                glassToastStyle
            }
          );

        } else {

          toast.error(
            result?.message ||
              "Failed to add to cart",
            {
              style:
                glassToastStyle
            }
          );

        }

      } catch (
        err
      ) {

        console.error(
          "Add to cart error:",
          err
        );


        toast.error(
          err.response?.data?.message ||
            "Failed to add to cart",
          {
            style:
              glassToastStyle
          }
        );

      }

    };


  // =========================================================
  // UI
  // =========================================================

  return (
    <>
      <style>{`

@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@200;300;400;500;600;700&display=swap');


.product-root {
  font-family: 'Outfit', sans-serif;
}


.product-img-wrap {
  position: relative;
  overflow: hidden;
  border-radius: 1.2rem;
  background: var(--bg-card);
  border: 1px solid rgba(47,93,255,0.12);
  flex-shrink: 0;
  height: 380px;
}


@media (min-width: 640px) {

  .product-img-wrap {
    height: 520px;
  }

}


@media (min-width: 768px) {

  .product-img-wrap {
    height: 580px;
  }

}


.product-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transition:
    transform 0.7s
    cubic-bezier(0.76,0,0.24,1);
}


.product-img-wrap:hover
.product-img {
  transform:
    scale(1.04);
}


.product-category {
  font-size: 0.72rem;
  font-weight: 600;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: #2F5DFF;
  margin-bottom: 0.6rem;
}


.product-name {
  font-weight: 600;
  color: var(--text-primary);
  line-height: 1.15;
  letter-spacing: -0.02em;
}


.product-rating {
  font-size: 0.8rem;
  font-weight: 400;
  color: var(--text-secondary);
  letter-spacing: 0.02em;
}


.product-rating-stars {
  color: #2F5DFF;
}


.product-price {
  font-weight: 700;
  color: #2F5DFF;
  letter-spacing: -0.01em;
}


.product-rule {
  height: 1px;
  background: rgba(47,93,255,0.14);
  margin: 1.25rem 0;
}


.product-desc {
  font-size: 0.92rem;
  font-weight: 400;
  color: var(--text-secondary);
  line-height: 1.8;
}


.product-size-label {
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--text-primary);
}


.product-size-btn {
  font-family: 'Outfit', sans-serif;
  font-size: 0.82rem;
  font-weight: 500;
  width: 48px;
  height: 48px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1px;
  border: 1.5px solid rgba(47,93,255,0.18);
  border-radius: 0.7rem;
  cursor: pointer;
  color: var(--text-primary);
  background: rgba(255,255,255,0.7);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  transition: all 0.25s ease;
}


.product-size-btn:hover {
  border-color: #2F5DFF;
  background: rgba(47,93,255,0.06);
}


.product-size-btn.active {
  background: #2F5DFF;
  border-color: #2F5DFF;
  color: white;
  box-shadow:
    0 6px 16px
    rgba(47,93,255,0.28);
}


.product-size-btn.out-of-stock {
  opacity: 0.45;
  cursor: not-allowed;
  text-decoration: line-through;
}


.product-size-btn.out-of-stock:hover {
  border-color:
    rgba(47,93,255,0.18);
  background:
    rgba(255,255,255,0.7);
}


.product-size-stock {
  font-size: 0.52rem;
  font-weight: 500;
  letter-spacing: 0.01em;
  line-height: 1;
  text-decoration: none;
}


.product-size-stock.sold {
  color: #DC2626;
}


.product-size-stock.available {
  color: #64748B;
}


.product-size-btn.active
.product-size-stock.available {
  color: rgba(255,255,255,0.9);
}


.product-cart-btn {
  font-family: 'Outfit', sans-serif;
  font-size: 0.85rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  color: white;
  background: #2F5DFF;
  border: none;
  border-radius: 100px;
  padding: 1rem 2.5rem;
  cursor: pointer;
  box-shadow:
    0 8px 24px
    rgba(47,93,255,0.28);
  transition:
    background 0.3s ease,
    transform 0.3s ease,
    box-shadow 0.3s ease,
    opacity 0.3s ease;
  width: 100%;
}


@media (min-width: 640px) {

  .product-cart-btn {
    width: auto;
  }

}


.product-cart-btn:hover {
  background: #16307A;
  transform:
    translateY(-2px);
  box-shadow:
    0 12px 32px
    rgba(47,93,255,0.34);
}


.product-cart-btn:disabled {
  background: #94A3B8;
  cursor: not-allowed;
  opacity: 0.7;
  box-shadow: none;
  transform: none;
}


.product-stock-info {
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--text-secondary);
  margin-top: -1.1rem;
  margin-bottom: 1.25rem;
}


.product-stock-info.available {
  color: #2F5DFF;
}


.product-stock-info.sold {
  color: #DC2626;
}


.product-badge-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.7rem 0;
  border-bottom:
    1px solid
    rgba(47,93,255,0.1);
}


.product-badge-item:last-child {
  border-bottom: none;
}


.product-badge-icon {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background:
    rgba(255,255,255,0.7);
  border:
    1px solid
    rgba(47,93,255,0.16);
  backdrop-filter:
    blur(12px);
  -webkit-backdrop-filter:
    blur(12px);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  flex-shrink: 0;
}


.product-badge-text {
  font-size: 0.85rem;
  font-weight: 400;
  color: var(--text-secondary);
}


.product-back-btn {
  background:
    rgba(255,255,255,0.6);
  border:
    1px solid
    rgba(47,93,255,0.16);
  color: var(--text-secondary);
  backdrop-filter:
    blur(20px) saturate(1.6);
  -webkit-backdrop-filter:
    blur(20px) saturate(1.6);
  box-shadow:
    0 2px 12px
    rgba(47,93,255,0.06);
  transition:
    background 0.2s ease,
    color 0.2s ease;
}


.product-back-btn:hover {
  background:
    rgba(255,255,255,0.95);
  color: #2F5DFF;
}


@keyframes blurUp {

  from {
    opacity: 0;
    filter: blur(8px);
    transform:
      translateY(18px);
  }

  to {
    opacity: 1;
    filter: blur(0);
    transform:
      translateY(0);
  }

}


.a1 {
  animation:
    blurUp 0.7s
    cubic-bezier(0.16,1,0.3,1)
    both 0.05s;
}


.a2 {
  animation:
    blurUp 0.7s
    cubic-bezier(0.16,1,0.3,1)
    both 0.15s;
}


/* ── DARK MODE ── */


html.dark-mode
.product-size-btn {
  background:
    rgba(30,41,59,0.75)
    !important;

  border-color:
    rgba(96,130,255,0.22)
    !important;
}


html.dark-mode
.product-size-btn:hover {
  background:
    rgba(47,93,255,0.14)
    !important;

  border-color:
    #6E8BFF
    !important;
}


html.dark-mode
.product-size-btn.out-of-stock {
  opacity: 0.35;
}


html.dark-mode
.product-size-btn.out-of-stock:hover {
  background:
    rgba(30,41,59,0.75)
    !important;

  border-color:
    rgba(96,130,255,0.22)
    !important;
}


html.dark-mode
.product-size-stock.available {
  color: #94A3B8;
}


html.dark-mode
.product-size-btn.active
.product-size-stock.available {
  color:
    rgba(255,255,255,0.9);
}


html.dark-mode
.product-badge-icon {
  background:
    rgba(30,41,59,0.75)
    !important;

  border-color:
    rgba(96,130,255,0.22)
    !important;
}


html.dark-mode
.product-badge-item {
  border-bottom-color:
    rgba(96,130,255,0.16)
    !important;
}


html.dark-mode
.product-back-btn {
  background:
    rgba(30,41,59,0.65)
    !important;

  border-color:
    rgba(96,130,255,0.22)
    !important;

  box-shadow:
    0 2px 12px
    rgba(0,0,0,0.20)
    !important;
}


html.dark-mode
.product-back-btn:hover {
  background:
    rgba(30,41,59,0.95)
    !important;

  color:
    #6E8BFF
    !important;
}


html.dark-mode
.product-img-wrap {
  border-color:
    rgba(96,130,255,0.18)
    !important;
}

`}</style>


      {/* =====================================================
          BACK BUTTON
      ===================================================== */}

      <div
        className="px-4 sm:px-10 pt-6"
      >

        <button
          onClick={() =>
            navigate(-1)
          }
          className="product-back-btn group flex items-center px-4 py-2 rounded-full cursor-pointer"
        >

          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-4 h-4 group-hover:-translate-x-1 transition"
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


          <span
            className="text-sm font-medium ml-1"
          >
            Back
          </span>

        </button>

      </div>


      {/* =====================================================
          PRODUCT CONTENT
      ===================================================== */}

      <div
        className="product-root pt-10 px-4 sm:px-10 flex flex-col sm:flex-row gap-10 sm:gap-16 pb-16"
      >

        {/* ===================================================
            PRODUCT IMAGE
        =================================================== */}

        <div
          className="product-img-wrap a1 w-full sm:w-[420px] md:w-[460px]"
        >

          <img
            src={product.image}
            alt={product.name}
            className="product-img"
          />

        </div>


        {/* ===================================================
            PRODUCT INFORMATION
        =================================================== */}

        <div
          className="flex-1 a2"
        >

          {/* CATEGORY */}

          <p
            className="product-category"
          >
            {product.category ||
              "Premium Fashion"}
          </p>


          {/* NAME */}

          <h1
            className="product-name text-2xl sm:text-3xl md:text-4xl mb-3"
          >
            {product.name}
          </h1>


          {/* RATING */}

          <div
            className="flex items-center gap-2 mb-1"
          >

            <span
              className="product-rating-stars text-sm"
            >
              ⭐⭐⭐⭐
            </span>


            <span
              className="product-rating"
            >
              ({product.rating})
            </span>

          </div>


          {/* DIVIDER */}

          <div
            className="product-rule"
          />


          {/* PRICE */}

          <p
            className="product-price text-3xl sm:text-4xl mb-4"
          >
            ₹
            {product.price}
          </p>


          {/* DESCRIPTION */}

          <p
            className="product-desc max-w-md mb-5"
          >
            {product.description}
          </p>


          {/* DIVIDER */}

          <div
            className="product-rule"
          />


          {/* SIZE */}

          <p
            className="product-size-label mb-3"
          >
            Select Size
          </p>


          <div
            className="flex gap-2.5 flex-wrap mb-6"
          >

            {Array.isArray(
              product.sizes
            ) &&
              product.sizes.map(
                (
                  sizeItem,
                  index
                ) => {

                  /*
                   * New MongoDB format:
                   *
                   * {
                   *   size: "M",
                   *   stock: 5
                   * }
                   */

                  const sizeName =
                    getSizeName(
                      sizeItem
                    );


                  const stock =
                    getSizeStock(
                      sizeItem
                    );


                  const available =
                    stock > 0;


                  const isActive =
                    normalizeSizeName(
                      selectedSize
                    ) ===
                    normalizeSizeName(
                      sizeName
                    );


                  return (
                    <button
                      key={`${sizeName}-${index}`}
                      type="button"
                      disabled={
                        !available
                      }
                      onClick={() => {

                        if (
                          !available
                        ) {
                          return;
                        }


                        setSelectedSize(
                          sizeName
                        );

                      }}
                      className={`product-size-btn ${
                        isActive
                          ? "active"
                          : ""
                      } ${
                        !available
                          ? "out-of-stock"
                          : ""
                      }`}
                      title={
                        available
                          ? `${stock} ${
                              stock === 1
                                ? "piece"
                                : "pieces"
                            } available`
                          : "Sold out"
                      }
                    >

                      <span>
                        {sizeName}
                      </span>


                      <span
                        className={`product-size-stock ${
                          available
                            ? "available"
                            : "sold"
                        }`}
                      >

                        {available
                          ? stock <= 5
                            ? `${stock} left`
                            : "Available"
                          : "Sold out"}

                      </span>

                    </button>
                  );

                }
              )}

          </div>


          {/* =================================================
              SELECTED STOCK
          ================================================= */}

          {hasSelectedSize && (
            <p
              className={`product-stock-info ${
                isSelectedSizeAvailable
                  ? "available"
                  : "sold"
              }`}
            >

              {isSelectedSizeAvailable
                ? selectedStock === 1
                  ? "Only 1 piece left"
                  : `${selectedStock} pieces available`
                : "This size is sold out"}

            </p>
          )}


          {/* =================================================
              ADD TO CART
          ================================================= */}

          <button
            onClick={
              handleAddToCart
            }
            disabled={
              !isSelectedSizeAvailable
            }
            className="product-cart-btn mb-8"
          >

            {!hasSelectedSize
              ? "Select Size"
              : !isSelectedSizeAvailable
                ? "Sold Out"
                : "Add to Cart"}

          </button>


          {/* DIVIDER */}

          <div
            className="product-rule"
          />


          {/* =================================================
              PRODUCT BADGES
          ================================================= */}

          <div>

            <div
              className="product-badge-item"
            >

              <div
                className="product-badge-icon"
              >
                ✔
              </div>


              <span
                className="product-badge-text"
              >
                100% Original product
              </span>

            </div>


            <div
              className="product-badge-item"
            >

              <div
                className="product-badge-icon"
              >
                🚚
              </div>


              <span
                className="product-badge-text"
              >
                Cash on delivery available
              </span>

            </div>


            <div
              className="product-badge-item"
            >

              <div
                className="product-badge-icon"
              >
                ↩
              </div>


              <span
                className="product-badge-text"
              >
                Easy return within 7 days
              </span>

            </div>

          </div>

        </div>

      </div>

    </>
  );

};


export default Product;