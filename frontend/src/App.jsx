import React from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'

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
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import ScrollToTop from './components/ScrollToTop'

import AdminLayout from "./pages/admin/AdminLayout"
import AdminDashboard from "./pages/admin/AdminDashboard"
import AdminProducts from "./pages/admin/AdminProducts"
import AddProduct from "./pages/admin/AddProduct"
import EditProduct from "./pages/admin/EditProduct"
import AdminOrders from "./pages/admin/AdminOrders"
import AdminRoute from "./components/AdminRoute"
import AdminUsers from './pages/admin/AdminUsers'


const App = () => {

  const location = useLocation()

  const isAdminRoute =
    location.pathname.startsWith("/admin")

  const isAuthRoute =
    location.pathname === "/login" ||
    location.pathname === "/register"

  return (

    <div className="flex flex-col min-h-screen">

      {/* CONTENT AREA */}
      <div className="flex-grow">
        <div className='px-4 sm:px-[5vw] md:px-[7vw] lg:px-[9vw]'>
          {!isAdminRoute && <Navbar />}
          <ScrollToTop />
          <Routes>
            {/* USER ROUTES */}
            <Route path='/' element={<Home />} />
            <Route path='/collection' element={<Collection />} />
            <Route path='/about' element={<About />} />
            <Route path='/contact' element={<Contact />} />
            <Route path="/product/:id" element={<Product />} />
            <Route path='/cart' element={<Cart />} />
            <Route path='/login' element={<Login />} />
            <Route path='/place-order' element={<PlaceOrder />} />
            <Route path='/orders' element={<Orders />} />
            <Route path='/register' element={<Register />} />
            <Route path='/profile' element={<Profile />} />

            {/* ✅ PROTECTED ADMIN ROUTES */}
            <Route
              path="/admin"
              element={
                <AdminRoute>
                  <AdminLayout />
                </AdminRoute>
              }
            >
              <Route index element={<AdminDashboard />} />
              <Route path="products" element={<AdminProducts />} />
              <Route path="add" element={<AddProduct />} />
              <Route path="edit-product/:id" element={<EditProduct />} />
              <Route path="orders" element={<AdminOrders />} />
              <Route path='users' element={<AdminUsers />} />
            </Route>
          </Routes>
        </div>
      </div>

      {/* FOOTER */}
      {!isAdminRoute && !isAuthRoute && <Footer />}
    </div>
  )
}

export default App