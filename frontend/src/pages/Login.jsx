import { useState, useContext } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { ShopContext } from "../context/ShopContext";

const Login = () => {

  const navigate = useNavigate();
  const location = useLocation();
  const { addToCart, loginUser } = useContext(ShopContext);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e) => {

    e.preventDefault();

    try {
      const res = await axios.get(
        `http://localhost:4000/users?email=${email}&password=${password}`
      );
      if (res.data.length > 0) {

        // ✅ GET USER FROM DATABASE
        const dbUser = res.data[0];

        // ✅ BLOCK CHECK (NEW FEATURE)
        if (dbUser.isBlocked) {
          toast.error("Your account has been blocked by admin");
          return;
        }

        // ✅ FORCE ID AS STRING (YOUR EXISTING FIX)
        const userData = {
          ...dbUser,
          id: String(dbUser.id)
        };

        // LOGIN SAVE
        loginUser(userData);
        toast.success("Welcome to SLOG-FASHION");

        // ADMIN LOGIN
        if (userData.role === "admin") {
          navigate("/admin");
          return;
        }

        // ADD TO CART AFTER LOGIN FLOW
        if (location.state) {
          const { productId, size, from } = location.state;
          if (productId && size) {
            setTimeout(() => {
              addToCart(productId, size, userData);
              toast.success("Product added to cart");
            }, 100);
          }
          navigate(from || "/");
        }
        else {
          navigate("/");
        }
      }
      else {
        toast.error("Invalid email or password");
      }
    }
    catch {
      toast.error("Login failed");
    }
  };
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,300;0,400;1,300;1,400&family=Jost:wght@300;400;500&display=swap');
        .login-root {
          font-family: 'Jost', sans-serif;
          min-height: 100vh;
          background: #EDE8E0;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem 1rem;
        }
        .login-card {
          width: 100%;
          max-width: 420px;
          background: #E4DDD3;
          border: 1px solid #D4CCC0;
          border-radius: 2px;
          overflow: hidden;
          animation: cartUp 0.45s ease both;
        }
        @keyframes cartUp {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .login-topbar {
          background: #DAD3C8;
          border-bottom: 1px solid #D4CCC0;
          padding: 1rem 2rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .login-body {
          padding: 2.5rem 2rem;
        }
        .login-input {
          width: 100%;
          background: #DAD3C8;
          border: 1px solid #D4CCC0;
          border-radius: 2px;
          padding: 0.75rem 1rem;
          font-family: 'Jost', sans-serif;
          font-size: 0.92rem;
          color: #2C2825;
          outline: none;
          transition: border-color 0.2s ease, background 0.2s ease;
          box-sizing: border-box;
        }
        .login-input::placeholder { color: #8B7D74; }
        .login-input:focus {
          border-color: #8B6F5E;
          background: #D4CCC0;
        }
        .login-btn {
          width: 100%;
          background: #2C2825;
          color: #EDE8E0;
          border: none;
          border-radius: 2px;
          padding: 1rem;
          font-family: 'Jost', sans-serif;
          font-size: 0.72rem;
          font-weight: 500;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          cursor: pointer;
          transition: background 0.25s ease, transform 0.2s ease;
        }
        .login-btn:hover {
          background: #8B6F5E;
          transform: translateY(-1px);
        }
        .login-divider {
          height: 1px;
          background: #D4CCC0;
          margin: 1.75rem 0;
        }
        .login-link {
          color: #6B4F3E;
          font-weight: 500;
          text-decoration: none;
          border-bottom: 1px solid #B8AFA7;
          padding-bottom: 1px;
          transition: color 0.2s ease, border-color 0.2s ease;
        }
        .login-link:hover {
          color: #2C2825;
          border-color: #6B4F3E;
        }
        .field-label {
          display: block;
          font-size: 0.65rem;
          font-weight: 500;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: #6B6058;
          margin-bottom: 0.5rem;
        }
      `}</style>
      <div className="login-root">
        <div className="login-card">
          <div className="login-topbar">
            <span style={{ fontFamily: "'Fraunces', serif", fontWeight: 300, fontSize: '1.2rem', color: '#2C2825' }}>
              Sign <i style={{ fontStyle: 'italic', color: '#6B4F3E' }}>In</i>
            </span>
            <span style={{ fontSize: '0.65rem', fontWeight: 500, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#6B6058' }}>
              Slog Fashion
            </span>
          </div>
          <form onSubmit={handleLogin} className="login-body">
            <div style={{ marginBottom: '2rem', paddingBottom: '1.5rem', borderBottom: '1px solid #D4CCC0' }}>
              <p style={{ fontFamily: "'Fraunces', serif", fontWeight: 300, fontSize: '0.92rem', color: '#6B6058', letterSpacing: '0.05em' }}>
                Welcome back — enter your details to continue.
              </p>
            </div>
            <div style={{ marginBottom: '1.25rem' }}>
              <label className="field-label">Email Address</label>
              <input
                type="email"
                placeholder="you@example.com"
                className="login-input"
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div style={{ marginBottom: '2rem' }}>
              <label className="field-label">Password</label>
              <input
                type="password"
                placeholder="••••••••"
                className="login-input"
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="login-btn">
              Sign In
            </button>
            <div className="login-divider" />
            <p style={{ textAlign: 'center', fontSize: '0.85rem', color: '#6B6058' }}>
              Don't have an account?{" "}
              <Link to="/register" className="login-link">
                Create Account
              </Link>
            </p>
          </form>
        </div>
      </div>
    </>
  );
};

export default Login;