import React, {
  lazy,
  Suspense
} from 'react'

import {
  Routes,
  Route,
  useLocation,
  Navigate
} from 'react-router-dom'

/* ==========================================
   LAZY-LOADED USER PAGES
   ========================================== */

const Home = lazy(() => import('./pages/Home'))
const Collection = lazy(() => import('./pages/Collection'))
const About = lazy(() => import('./pages/About'))
const Contact = lazy(() => import('./pages/Contact'))
const Product = lazy(() => import('./pages/Product'))
const Cart = lazy(() => import('./pages/Cart'))
const Login = lazy(() => import('./pages/Login'))
const PlaceOrder = lazy(() => import('./pages/PlaceOrder'))
const Orders = lazy(() => import('./pages/Orders'))
const Register = lazy(() => import('./pages/Register'))
const Profile = lazy(() => import('./pages/Profile'))
const Wishlist = lazy(() => import('./pages/Wishlist'))
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'))
const ResetPassword = lazy(() => import('./pages/ResetPassword'))
const Newsletter = lazy(() => import('./pages/Newsletter'))

/* ==========================================
   SHARED COMPONENTS
   ========================================== */

import Navbar from './components/Navbar'
import Footer from './components/Footer'
import ScrollToTop from './components/ScrollToTop'

/* ==========================================
   LAZY-LOADED ADMIN PAGES
   ========================================== */

const AdminLayout = lazy(() => import("./pages/admin/AdminLayout"))
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"))
const AdminProducts = lazy(() => import("./pages/admin/AdminProducts"))
const AddProduct = lazy(() => import("./pages/admin/AddProduct"))
const EditProduct = lazy(() => import("./pages/admin/EditProduct"))
const AdminOrders = lazy(() => import("./pages/admin/AdminOrders"))
const AdminOrderDetails = lazy(() => import("./pages/admin/AdminOrderDetails"))
const AdminUsers = lazy(() => import("./pages/admin/AdminUsers"))

/* ==========================================
   ADMIN ROUTE PROTECTION
   ========================================== */

import AdminRoute from "./components/AdminRoute"

const App = () => {

  const location = useLocation()

  const isAdminRoute =
    location.pathname.startsWith("/admin")

  const isAuthRoute =
    location.pathname === "/login" ||
    location.pathname === "/register" ||
    location.pathname === "/forgot-password" ||
    location.pathname === "/reset-password"

  const isHomeRoute =
    location.pathname === "/"

  const isNewsletterRoute =
    location.pathname === "/newsletter"

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

      {!isAdminRoute &&
        !isAuthRoute &&
        !isNewsletterRoute && (

          <Navbar />

        )}

      {/* ==========================================
          FIXED NAVBAR SPACING

          Desktop: 76px
          Mobile: 64px

          Reserve space below the fixed navbar
          so customer page content starts below it.

          Authentication, admin and newsletter
          pages remain independent from the
          customer navbar.
          ========================================== */}

      {!isAdminRoute &&
        !isAuthRoute &&
        !isNewsletterRoute && (

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


      {/* ==========================================
          MAIN CONTENT
          ========================================== */}

      <div
        className="
          flex-grow
        "
      >

        <div
          className={
            !isAdminRoute &&
            !isHomeRoute &&
            !isNewsletterRoute
              ? 'px-4 sm:px-[5vw] md:px-[7vw] lg:px-[9vw]'
              : ''
          }
        >
          {/* ==========================================
              LAZY LOADING FALLBACK
              ========================================== */}

          <Suspense
            fallback={
              <div
                className="
                  min-h-[50vh]
                  w-full
                  flex
                  items-center
                  justify-center
                  text-sm
                  tracking-widest
                  text-[var(--text-primary)]
                "
              >
                LOADING...
              </div>
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


              {/* NEWSLETTER */}

              <Route
                path="/newsletter"
                element={
                  <Newsletter />
                }
              />


              {/* AUTHENTICATION */}

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


              {/* FORGOT PASSWORD */}

              <Route
                path="/forgot-password"
                element={
                  <ForgotPassword />
                }
              />


              {/* RESET PASSWORD */}

              <Route
                path="/reset-password"
                element={
                  <ResetPassword />
                }
              />


              {/* ORDERS */}

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


                {/* INDIVIDUAL ORDER DETAILS */}

                <Route
                  path="orders/:id"
                  element={
                    <AdminOrderDetails />
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

          </Suspense>

        </div>

      </div>


      {/* ==========================================
          FOOTER

          Footer now appears directly after
          the main page content.

          No 80px reveal zone.
          No scroll-triggered mounting.
          ========================================== */}

      {!isAdminRoute &&
        !isAuthRoute &&
        !isNewsletterRoute && (

          <Footer />

        )}

    </div>

  )

}

export default App