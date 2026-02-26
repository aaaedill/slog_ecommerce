import { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate, Link } from "react-router-dom";

const Register = () => {

  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!name || !email || !password) {
      toast.error("Please fill all fields");
      return;
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*\d).{8,}$/;
    if (!passwordRegex.test(password)) {
      toast.error(
        "Password must be at least 8 characters and include lowercase letter and number"
      );
      return;
    }

    try {
      const checkUser = await axios.get(
        `http://localhost:4000/users?email=${email.trim().toLowerCase()}`
      );
      if (checkUser.data.length > 0) {
        toast.error("Email already taken");
        return;
      }

      // ✅ NEW: generate sequential user id (0001, 0002, ...)
      const usersRes = await axios.get("http://localhost:4000/users");

      const numericIds = usersRes.data
        .map((u) => u.id)
        .filter((id) => typeof id === "string" && /^\d+$/.test(id))
        .map((id) => parseInt(id, 10));

      const nextNumber = numericIds.length ? Math.max(...numericIds) + 1 : 1;
      const nextId = String(nextNumber).padStart(4, "0");

      await axios.post("http://localhost:4000/users", {
  id: nextId, // ✅ your existing
  name,
  email: email.trim().toLowerCase(),
  password: password.trim(),
  role: "user",
  isBlocked: false,
  cart: [],
  orders: []
});

      toast.success("Account Created Successfully");
      navigate("/login");
    } catch {
      toast.error("Error creating account");
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,300;0,400;1,300;1,400&family=Jost:wght@300;400;500&display=swap');

        .register-root {
          font-family: 'Jost', sans-serif;
          min-height: 100vh;
          background: #EDE8E0;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem 1rem;
        }

        .register-card {
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

        .register-topbar {
          background: #DAD3C8;
          border-bottom: 1px solid #D4CCC0;
          padding: 1rem 2rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .register-body {
          padding: 2.5rem 2rem;
        }

        .register-input {
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
        .register-input::placeholder { color: #8B7D74; }
        .register-input:focus {
          border-color: #8B6F5E;
          background: #D4CCC0;
        }

        .register-btn {
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
        .register-btn:hover {
          background: #8B6F5E;
          transform: translateY(-1px);
        }

        .register-divider {
          height: 1px;
          background: #D4CCC0;
          margin: 1.75rem 0;
        }

        .register-link {
          color: #6B4F3E;
          font-weight: 500;
          text-decoration: none;
          border-bottom: 1px solid #B8AFA7;
          padding-bottom: 1px;
          transition: color 0.2s ease, border-color 0.2s ease;
        }
        .register-link:hover {
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

      <div className="register-root">
        <div className="register-card">

          {/* Top Bar */}
          <div className="register-topbar">
            <span style={{ fontFamily: "'Fraunces', serif", fontWeight: 300, fontSize: '1.2rem', color: '#2C2825' }}>
              Create <i style={{ fontStyle: 'italic', color: '#6B4F3E' }}>Account</i>
            </span>
            <span style={{ fontSize: '0.65rem', fontWeight: 500, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#6B6058' }}>
              Slog Fashion
            </span>
          </div>

          {/* Body */}
          <form onSubmit={handleRegister} className="register-body">

            {/* Welcome note */}
            <div style={{ marginBottom: '2rem', paddingBottom: '1.5rem', borderBottom: '1px solid #D4CCC0' }}>
              <p style={{ fontFamily: "'Fraunces', serif", fontWeight: 300, fontSize: '0.92rem', color: '#6B6058', letterSpacing: '0.05em' }}>
                Join us — fill in your details to get started.
              </p>
            </div>

            {/* Full Name */}
            <div style={{ marginBottom: '1.25rem' }}>
              <label className="field-label">Full Name</label>
              <input
                placeholder="John Doe"
                className="register-input"
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            {/* Email */}
            <div style={{ marginBottom: '1.25rem' }}>
              <label className="field-label">Email Address</label>
              <input
                placeholder="you@example.com"
                className="register-input"
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            {/* Password */}
            <div style={{ marginBottom: '2rem' }}>
              <label className="field-label">Password</label>
              <input
                type="password"
                placeholder="••••••••"
                className="register-input"
                onChange={(e) => setPassword(e.target.value)}
              />
              <p style={{ marginTop: '0.5rem', fontSize: '0.63rem', color: '#8B7D74', letterSpacing: '0.06em' }}>
                Min. 8 characters with a lowercase letter and number
              </p>
            </div>

            {/* Submit */}
            <button type="submit" className="register-btn">
              Create Account
            </button>

            {/* Secure note */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', marginTop: '0.85rem', color: '#6B6058', fontSize: '0.63rem', letterSpacing: '0.14em' }}>
              <svg width="10" height="12" viewBox="0 0 10 12" fill="none">
                <rect x="0.6" y="4.6" width="8.8" height="6.8" rx="1.2" stroke="currentColor" strokeWidth="1.1"/>
                <path d="M2.5 4.5V3A2.5 2.5 0 0 1 7.5 3v1.5" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/>
              </svg>
              <span style={{ textTransform: 'uppercase', letterSpacing: '0.14em' }}>Secure registration</span>
            </div>

            {/* Divider */}
            <div className="register-divider" />

            {/* Login link */}
            <p style={{ textAlign: 'center', fontSize: '0.85rem', color: '#6B6058' }}>
              Already have an account?{" "}
              <Link to="/login" className="register-link">
                Sign In
              </Link>
            </p>

          </form>
        </div>
      </div>
    </>
  );
};

export default Register;