import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState, useContext } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { ShopContext } from "../context/ShopContext";

const Product = () => {

  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useContext(ShopContext);
  const [product, setProduct] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);

  useEffect(() => {
    axios
      .get(`http://localhost:4000/products/${id}`)
      .then(res => setProduct(res.data))
      .catch(() => toast.error("Failed to load product"));
  }, [id]);

  if (!product)
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <p style={{
          fontFamily: "'Montserrat', sans-serif",
          fontSize: '0.85rem',
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          color: '#999'
        }}>Loading...</p>
      </div>
    );

  const handleAddToCart = () => {
    const user = localStorage.getItem("user");
    if (!user) {
      toast.error("Please login first");
      navigate("/login", {
        state: { from: `/product/${id}`, productId: product.id, size: selectedSize }
      });
      return;
    }
    if (!selectedSize) {
      toast.error("Please select size");
      return;
    }
    addToCart(product.id, selectedSize);
    toast.success("Added to cart");
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&family=Montserrat:wght@300;400;500;600&display=swap');

        .product-root { font-family: 'Montserrat', sans-serif; }

        .product-img-wrap {
          position: relative;
          overflow: hidden;
          border-radius: 1rem;
          background: #f5f3f0;
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

        .product-img-wrap::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(to top, rgba(0,0,0,0.06) 0%, transparent 40%);
          pointer-events: none;
        }

        .product-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          transition: transform 0.7s cubic-bezier(0.76,0,0.24,1);
        }

        .product-img-wrap:hover .product-img { transform: scale(1.04); }

        .product-name {
          font-family: 'Playfair Display', serif;
          font-weight: 600;
          color: #111;
          line-height: 1.2;
          letter-spacing: 0.01em;
        }

        .product-rating {
          font-family: 'Montserrat', sans-serif;
          font-size: 0.78rem;
          font-weight: 400;
          color: #888;
          letter-spacing: 0.06em;
        }

        .product-rating-stars { color: #f59e0b; }

        .product-price {
          font-family: 'Playfair Display', serif;
          font-weight: 600;
          color: #111;
          letter-spacing: 0.01em;
        }

        .product-rule {
          height: 1px;
          background: linear-gradient(to right, #e5e5e5, transparent);
          margin: 1.25rem 0;
        }

        .product-desc {
          font-family: 'Montserrat', sans-serif;
          font-size: 0.88rem;
          font-weight: 400;
          color: #555;
          line-height: 1.85;
        }

        .product-size-label {
          font-family: 'Montserrat', sans-serif;
          font-size: 0.65rem;
          font-weight: 600;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: #111;
        }

        .product-size-btn {
          font-family: 'Montserrat', sans-serif;
          font-size: 0.78rem;
          font-weight: 500;
          letter-spacing: 0.08em;
          width: 48px;
          height: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1.5px solid #ddd;
          border-radius: 0.5rem;
          cursor: pointer;
          color: #333;
          background: white;
          transition: all 0.25s ease;
        }

        .product-size-btn:hover {
          border-color: #111;
          color: #111;
          background: #f9f9f9;
        }

        .product-size-btn.active {
          background: #111;
          border-color: #111;
          color: white;
        }

        .product-cart-btn {
          font-family: 'Montserrat', sans-serif;
          font-size: 0.78rem;
          font-weight: 600;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: white;
          background: #111;
          border: none;
          border-radius: 100px;
          padding: 1rem 2.5rem;
          cursor: pointer;
          transition: background 0.3s ease, transform 0.3s ease;
          width: 100%;
        }

        @media (min-width: 640px) {
          .product-cart-btn { width: auto; }
        }

        .product-cart-btn:hover {
          background: #dc2626;
          transform: translateY(-2px);
        }

        .product-badge-item {
          display: flex;
          align-items: center;
          gap: 0.65rem;
          padding: 0.6rem 0;
          border-bottom: 1px solid #f0f0f0;
        }

        .product-badge-item:last-child { border-bottom: none; }

        .product-badge-icon {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: #f5f5f5;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.75rem;
          flex-shrink: 0;
        }

        .product-badge-text {
          font-family: 'Montserrat', sans-serif;
          font-size: 0.82rem;
          font-weight: 400;
          color: #444;
        }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .a1 { animation: fadeUp 0.8s ease both 0.05s; }
        .a2 { animation: fadeUp 0.8s ease both 0.2s; }

      `}</style>

      <div className="px-4 sm:px-10 pt-6">
        <button onClick={() => navigate(-1)} className="group flex items-center px-4 py-2 rounded-full bg-white/40 backdrop-blur-lg border border-white/40 shadow-md text-black hover:bg-orange-200 transition cursor-pointer">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 group-hover:-translate-x-1 transition" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/>
          </svg>
          <span className="text-sm font-medium">Back</span>
        </button>
      </div>

      <div className="product-root pt-10 px-4 sm:px-10 flex flex-col sm:flex-row gap-10 sm:gap-16 pb-16">

        <div className="product-img-wrap a1 w-full sm:w-[420px] md:w-[460px]">
          <img src={product.image} className="product-img"/>
        </div>

         <div className="flex-1 a2">
          <p style={{
            fontFamily: "'Montserrat', sans-serif",
            fontSize: '0.65rem',
            fontWeight: 500,
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
            color: '#dc2626',
            marginBottom: '0.5rem'
          }}>
            {product.category || 'Premium Fashion'}
          </p>

          <h1 className="product-name text-2xl sm:text-3xl md:text-4xl mb-3">
            {product.name}
          </h1>

          <div className="flex items-center gap-2 mb-1">
            <span className="product-rating-stars text-sm">⭐⭐⭐⭐</span>
            <span className="product-rating">({product.rating})</span>
          </div>

          <div className="product-rule" />

          <p className="product-price text-3xl sm:text-4xl mb-4">
            ₹{product.price}
          </p>

          <p className="product-desc max-w-md mb-5">
            {product.description}
          </p>

          <div className="product-rule" />

          <p className="product-size-label mb-3">Select Size</p>

          <div className="flex gap-2.5 flex-wrap mb-6">
            {product.sizes?.map(size => (
              <button
                key={size}
                onClick={() => setSelectedSize(size)}
                className={`product-size-btn ${selectedSize === size ? 'active' : ''}`}
              >
                {size}
              </button>
            ))}
          </div>

          <button onClick={handleAddToCart} className="product-cart-btn mb-8">
            Add to Cart
          </button>

          <div className="product-rule" />

          <div>
            <div className="product-badge-item">
              <div className="product-badge-icon">✔</div>
              <span className="product-badge-text">100% Original product</span>
            </div>

            <div className="product-badge-item">
              <div className="product-badge-icon">🚚</div>
              <span className="product-badge-text">Cash on delivery available</span>
            </div>

            <div className="product-badge-item">
              <div className="product-badge-icon">↩</div>
              <span className="product-badge-text">Easy return within 7 days</span>
            </div>

          </div>

        </div>

      </div>

    </>
  );
};

export default Product;