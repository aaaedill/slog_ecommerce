import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from "react-router-dom"

import './index.css'
import App from './App.jsx'
import ShopContextProvider from './context/ShopContext.jsx'

import { ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"

createRoot(document.getElementById('root')).render(

  <StrictMode>

    <BrowserRouter>

      <ShopContextProvider>

        <App />

        {/* ✅ GLOBAL PREMIUM TOAST CONTAINER */}
        <ToastContainer
          position="top-center"
          autoClose={2200}
          hideProgressBar
          newestOnTop
          closeOnClick
          pauseOnHover={false}
          draggable={false}
          theme="light"
          toastStyle={{
            background: "#ffffff",
            color: "#000000",
            borderRadius: "14px",
            padding: "14px 16px",
            fontSize: "14px",
            fontWeight: "500",
            boxShadow:
              "0 10px 30px rgba(0,0,0,0.08)",
            border: "1px solid rgba(0,0,0,0.06)"
          }}
        />

      </ShopContextProvider>

    </BrowserRouter>

  </StrictMode>

)