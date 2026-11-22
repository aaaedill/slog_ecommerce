import React, {
  useEffect,
  useRef,
  useState
} from 'react'

import {
  Routes,
  Route,
  useLocation,
  Navigate
} from 'react-router-dom'


import Home from './pages/Home'
import Collection from './pages/Collection'
import About from './pages/About'
import Contact from './pages/Contact'
import Product from './pages/Product'
import Cart from './pages/Cart'
import Login from './pages/Login'
import PlaceOrder from './pages/PlaceOrder'
import Orders from './pages/Orders'
import Register from './pages/Register'
import Profile from './pages/Profile'
import Wishlist from './pages/Wishlist'


import Navbar from './components/Navbar'
import Footer from './components/Footer'
import ScrollToTop from './components/ScrollToTop'


import AdminLayout from "./pages/admin/AdminLayout"
import AdminDashboard from "./pages/admin/AdminDashboard"
import AdminProducts from "./pages/admin/AdminProducts"
import AddProduct from "./pages/admin/AddProduct"
import EditProduct from "./pages/admin/EditProduct"
import AdminOrders from "./pages/admin/AdminOrders"
import AdminUsers from './pages/admin/AdminUsers'

import AdminRoute from "./components/AdminRoute"


const App = () => {

  const location = useLocation()

  const [showFooter, setShowFooter] = useState(false)

  const footerTriggerRef = useRef(null)

  const isAdminRoute =
    location.pathname.startsWith("/admin")

  const isAuthRoute =
    location.pathname === "/login" ||
    location.pathname === "/register"

  const isHomeRoute =
    location.pathname === "/"


  /*
   * Reset the footer whenever the user
   * navigates to another page.
   */

  useEffect(() => {

    setShowFooter(false)

  }, [location.pathname])


  /*
   * FOOTER REVEAL
   *
   * The footer is not mounted immediately.
   *
   * An invisible 80px area exists after
   * the main page content.
   *
   * The footer appears after the user
   * scrolls through this reveal area.
   */

  useEffect(() => {

    if (
      isAdminRoute ||
      isAuthRoute
    ) {
      return
    }

    const trigger =
      footerTriggerRef.current

    if (!trigger) {
      return
    }

    const checkFooterTrigger = () => {

      if (showFooter) {
        return
      }

      const rect =
        trigger.getBoundingClientRect()

      if (
        rect.bottom <=
        window.innerHeight
      ) {

        setShowFooter(true)

      }

    }

    window.addEventListener(
      "scroll",
      checkFooterTrigger,
      { passive: true }
    )

    checkFooterTrigger()

    return () => {

      window.removeEventListener(
        "scroll",
        checkFooterTrigger
      )

    }

  }, [
    location.pathname,
    isAdminRoute,
    isAuthRoute,
    showFooter
  ])


  return (

    <div
      className="
        flex
        flex-col
        min-h-screen
        bg-[var(--bg-primary)]
      "
    >

      {/* SCROLL TO TOP */}

      <ScrollToTop />


      {/* NAVBAR */}

      {!isAdminRoute && (
        <Navbar />
      )}


      {/* ==========================================
          FIXED NAVBAR SPACING

          Desktop: 76px
          Mobile: 64px

          Reserve space below the fixed navbar
          so customer page content starts below it.

          Admin pages remain independent.
          ========================================== */}

      {!isAdminRoute && (

        <div
          aria-hidden="true"
          className="
            w-full
            shrink-0
            h-[64px]
            md:h-[76px]
          "
        />

      )}


      {/* MAIN CONTENT */}

      <div
        className="
          flex-grow
        "
      >

        <div
          className={
            !isAdminRoute &&
            !isHomeRoute
              ? 'px-4 sm:px-[5vw] md:px-[7vw] lg:px-[9vw]'
              : ''
          }
        >

          <Routes>

            {/* ==========================================
                USER ROUTES
                ========================================== */}

            <Route
              path="/"
              element={
                <Home />
              }
            />

            <Route
              path="/collection"
              element={
                <Collection />
              }
            />

            <Route
              path="/about"
              element={
                <About />
              }
            />

            <Route
              path="/contact"
              element={
                <Contact />
              }
            />

            <Route
              path="/product/:id"
              element={
                <Product />
              }
            />

            <Route
              path="/cart"
              element={
                <Cart />
              }
            />

            <Route
              path="/wishlist"
              element={
                <Wishlist />
              }
            />

            <Route
              path="/login"
              element={
                <Login />
              }
            />

            <Route
              path="/register"
              element={
                <Register />
              }
            />

            <Route
              path="/place-order"
              element={
                <PlaceOrder />
              }
            />

            <Route
              path="/orders"
              element={
                <Orders />
              }
            />

            <Route
              path="/profile"
              element={
                <Profile />
              }
            />


            {/* ==========================================
                ADMIN ROUTES
                ========================================== */}

            <Route
              path="/admin"
              element={
                <AdminRoute>
                  <AdminLayout />
                </AdminRoute>
              }
            >

              <Route
                index
                element={
                  <AdminDashboard />
                }
              />

              <Route
                path="products"
                element={
                  <AdminProducts />
                }
              />

              <Route
                path="add"
                element={
                  <AddProduct />
                }
              />

              <Route
                path="edit-product/:id"
                element={
                  <EditProduct />
                }
              />

              <Route
                path="orders"
                element={
                  <AdminOrders />
                }
              />

              <Route
                path="users"
                element={
                  <AdminUsers />
                }
              />

            </Route>


            {/* ==========================================
                FALLBACK
                ========================================== */}

            <Route
              path="*"
              element={
                <Navigate
                  to="/"
                  replace
                />
              }
            />

          </Routes>

        </div>

      </div>


      {/* ==========================================
          FOOTER REVEAL ZONE
          ========================================== */}

      {!isAdminRoute &&
        !isAuthRoute && (

          <div
            ref={footerTriggerRef}
            className="
              h-[80px]
              w-full
              shrink-0
              bg-[var(--bg-primary)]
            "
            aria-hidden="true"
          />

        )}


      {/* FOOTER */}

      {!isAdminRoute &&
        !isAuthRoute &&
        showFooter && (

          <Footer />

        )}

    </div>

  )

}

export default App