
import {
  createContext,
  useEffect,
  useState,
  useCallback,
  useRef
} from "react";

import axios from "axios";
import API_URL from "../config/api";


export const ShopContext = createContext();



const ShopContextProvider = ({ children }) => {

  const [products, setProducts] = useState([]);

  const [cartItems, setCartItems] = useState({});

  const [orders, setOrders] = useState([]);

  // =========================================================
  // WISHLIST
  // =========================================================

  const [wishlist, setWishlist] = useState([]);

  const [wishlistLoading, setWishlistLoading] =
    useState(false);

  const wishlistOperationVersion = useRef(0);


  // Used to prevent the cart-loading effect from
  // overwriting a cart update happening at the same time.
  const cartOperationVersion = useRef(0);


  // Used to prevent an old authentication request
  // from changing the user after a newer authentication
  // operation such as login or logout has already happened.
  const authOperationVersion = useRef(0);


  // =========================================================
  // USER
  // =========================================================

  const [user, setUser] = useState(() => {
    try {
      const storedUser =
        JSON.parse(
          localStorage.getItem("user")
        );

      return storedUser || null;

    } catch (err) {

      console.log(
        "User parse error:",
        err
      );

      localStorage.removeItem("user");

      return null;
    }
  });


  // =========================================================
  // AUTHENTICATION CHECK
  // =========================================================
  //
  // The localStorage user is only used as cached UI state.
  //
  // The actual authentication state is determined by the
  // backend through:
  //
  // GET /api/auth/me
  //
  // The JWT is stored inside an HTTP-only cookie, so the
  // browser sends that cookie using withCredentials: true.
  //
  // This prevents an expired/stale localStorage user from
  // being treated as permanently authenticated.
  // =========================================================

  const [authChecked, setAuthChecked] =
    useState(false);


  useEffect(() => {

    let isMounted = true;

    const currentAuthVersion =
      authOperationVersion.current;


    const verifyAuthentication =
      async () => {

        try {

          const res =
            await axios.get(
              `${API_URL}/auth/me`,
              {
                withCredentials: true
              }
            );


          if (
            !isMounted ||
            currentAuthVersion !==
              authOperationVersion.current
          ) {

            return;
          }


          const authenticatedUser =
            res.data?.user;


          if (
            authenticatedUser
          ) {

            localStorage.setItem(
              "user",
              JSON.stringify(
                authenticatedUser
              )
            );

            setUser(
              authenticatedUser
            );

          } else {

            localStorage.removeItem(
              "user"
            );

            setUser(null);
          }


          setAuthChecked(true);

        } catch (err) {

          if (
            !isMounted ||
            currentAuthVersion !==
              authOperationVersion.current
          ) {

            return;
          }


          // -------------------------------------------------
          // A 401 means the JWT cookie is missing, expired,
          // invalid, or the account is no longer authenticated.
          //
          // In that case the cached localStorage user must
          // also be removed.
          // -------------------------------------------------

          if (
            err.response?.status === 401
          ) {

            console.log(
              "Authentication expired or invalid."
            );


            localStorage.removeItem(
              "user"
            );


            setUser(null);

          } else {

            // ------------------------------------------------
            // If the backend cannot be reached because of a
            // temporary network/server problem, don't destroy
            // the cached user immediately.
            //
            // The user can remain visible in the UI while the
            // application continues working with the cached
            // authentication state.
            //
            // Protected backend requests will still enforce
            // the actual authentication.
            // ------------------------------------------------

            console.log(
              "Authentication verification error:",
              err
            );
          }


          setAuthChecked(true);
        }
      };


    verifyAuthentication();


    return () => {

      isMounted = false;

    };

  }, []);


  // =========================================================
  // ADMIN REDIRECT
  // =========================================================

  useEffect(() => {

    if (
      !authChecked
    ) {

      return;
    }


    if (
      user &&
      user.role === "admin" &&
      !window.location.pathname.startsWith(
        "/admin"
      )
    ) {

      window.location.href =
        "/admin";
    }

  }, [
    user,
    authChecked
  ]);


  // =========================================================
  // LOGIN
  // =========================================================

  const loginUser = (userData) => {

    if (!userData) {
      return false;
    }


    // -------------------------------------------------------
    // A successful login already means the backend has
    // authenticated the user and created the HTTP-only JWT
    // cookie.
    //
    // We keep localStorage as a cached copy so the existing
    // frontend can immediately display the user.
    // -------------------------------------------------------

    authOperationVersion.current += 1;


    localStorage.setItem(
      "user",
      JSON.stringify(userData)
    );


    setUser(
      userData
    );


    setAuthChecked(
      true
    );


    return true;
  };


  // =========================================================
  // LOGOUT
  // =========================================================

  const logoutUser = async () => {

    authOperationVersion.current += 1;

    cartOperationVersion.current += 1;

    wishlistOperationVersion.current += 1;


    try {

      await axios.post(
        `${API_URL}/auth/logout`,
        {},
        {
          withCredentials: true
        }
      );

    } catch (err) {

      console.log(
        "Logout API error:",
        err
      );
    }


    localStorage.removeItem(
      "user"
    );


    setUser(null);


    setCartItems({});


    setOrders([]);


    setWishlist([]);


    setWishlistLoading(false);


    setAuthChecked(
      true
    );


    window.location.replace("/");
  };


  // =========================================================
  // FETCH PRODUCTS
  // =========================================================

  const fetchProducts = useCallback(
    async () => {

      try {

        const res =
          await axios.get(
            `${API_URL}/products`,
            {
              withCredentials: true
            }
          );


        const productData =
          Array.isArray(
            res.data?.products
          )
            ? res.data.products
            : [];


        setProducts(
          productData
        );


        return {
          success: true,
          data: productData
        };

      } catch (err) {

        console.log(
          "Fetch products error:",
          err
        );


        setProducts([]);


        return {
          success: false,
          error: err
        };
      }

    },
    []
  );


  // =========================================================
  // LOAD PRODUCTS WHEN APP STARTS
  // =========================================================

  useEffect(() => {

    fetchProducts();

  }, [fetchProducts]);


  // =========================================================
  // LOAD CART
  // =========================================================
  //
  // Don't load a protected cart until authentication has
  // been checked against the backend.
  // =========================================================

  useEffect(() => {

    if (
      !authChecked
    ) {

      return;
    }


    if (!user) {

      setCartItems({});

      return;
    }


    const loadCart =
      async () => {

        const versionAtStart =
          cartOperationVersion.current;


        try {

          const res =
            await axios.get(
              `${API_URL}/cart`,
              {
                withCredentials: true
              }
            );


          // If another cart operation started
          // while this request was running,
          // don't overwrite newer state.

          if (
            versionAtStart !==
            cartOperationVersion.current
          ) {

            return;
          }


          const cart =
            res.data?.cart;


          if (
            cart &&
            cart.items
          ) {

            setCartItems(
              normalizeCartItems(
                cart.items
              )
            );

          } else {

            setCartItems({});
          }


        } catch (err) {

          console.log(
            "Cart load error:",
            err
          );


          if (
            versionAtStart !==
            cartOperationVersion.current
          ) {

            return;
          }


          // If authentication has expired,
          // don't pretend the cart is empty.

          if (
            err.response?.status === 401
          ) {

            console.log(
              "Cart authentication expired."
            );

            return;
          }


          setCartItems({});
        }
      };


    loadCart();

  }, [
    user,
    authChecked
  ]);


  // =========================================================
  // LOAD ORDERS
  // =========================================================
  //
  // Orders are also protected, so wait for authentication
  // verification before requesting them.
  // =========================================================

  useEffect(() => {

    if (
      !authChecked
    ) {

      return;
    }


    if (!user) {

      setOrders([]);

      return;
    }


    const loadOrders =
      async () => {

        try {

          const res =
            await axios.get(
              `${API_URL}/orders`,
              {
                withCredentials: true
              }
            );


          // =================================================
          // IMPORTANT
          // =================================================
          //
          // MongoDB returns:
          //
          // orderId
          // amount
          //
          // The existing frontend uses:
          //
          // id
          // total
          //
          // Normalize EVERY order loaded from the backend.
          // This also fixes older orders.
          // =================================================

          const orderData =
            Array.isArray(
              res.data?.orders
            )
              ? res.data.orders
                  .map(
                    normalizeOrder
                  )
                  .filter(Boolean)
              : [];


          setOrders(
            orderData
          );

        } catch (err) {

          console.log(
            "Orders error:",
            err
          );


          // -------------------------------------------------
          // If the session has expired, don't replace the
          // user's order state with a fake empty list.
          // -------------------------------------------------

          if (
            err.response?.status === 401
          ) {

            console.log(
              "Orders authentication expired."
            );

            return;
          }


          setOrders([]);
        }
      };


    loadOrders();

  }, [
    user,
    authChecked
  ]);


  // =========================================================
  // LOAD WISHLIST
  // =========================================================
  //
  // Each authenticated user has a wishlist stored in MongoDB.
  //
  // Wait until authentication has been checked before loading
  // the wishlist, and use a request version to avoid an older
  // request overwriting a newer wishlist operation.
  // =========================================================

  const fetchWishlist = useCallback(
    async () => {

      if (!user) {

        setWishlist([]);

        return {
          success: false,
          message: "Please login first."
        };
      }


      const versionAtStart =
        wishlistOperationVersion.current;


      setWishlistLoading(true);


      try {

        const res =
          await axios.get(
            `${API_URL}/wishlist`,
            {
              withCredentials: true
            }
          );


        if (
          versionAtStart !==
          wishlistOperationVersion.current
        ) {

          return {
            success: false,
            message: "A newer wishlist operation has started."
          };
        }


        const wishlistProducts =
          Array.isArray(
            res.data?.products
          )
            ? res.data.products
            : [];


        setWishlist(
          wishlistProducts
        );


        return {
          success: true,
          data: wishlistProducts
        };

      } catch (err) {

        console.log(
          "Fetch wishlist error:",
          err
        );


        if (
          versionAtStart ===
          wishlistOperationVersion.current
        ) {

          if (
            err.response?.status !== 401
          ) {

            setWishlist([]);
          }
        }


        return {
          success: false,
          error: err,
          message:
            err.response?.data?.message ||
            "Unable to load your wishlist."
        };

      } finally {

        if (
          versionAtStart ===
          wishlistOperationVersion.current
        ) {

          setWishlistLoading(false);
        }
      }

    },
    [
      user
    ]
  );


  // =========================================================
  // LOAD WISHLIST AFTER AUTHENTICATION
  // =========================================================

  useEffect(() => {

    if (!authChecked) {
      return;
    }


    if (!user) {

      wishlistOperationVersion.current += 1;

      setWishlist([]);

      setWishlistLoading(false);

      return;
    }


    fetchWishlist();

  }, [
    user,
    authChecked,
    fetchWishlist
  ]);


  // =========================================================
  // GET CSRF TOKEN
  // =========================================================
  //
  // The backend protects wishlist POST and DELETE requests.
  //
  // Fetch a CSRF token first, then send it through the header
  // expected by the existing CSRF middleware.
  //
  // The backend endpoint returns the token in its JSON body
  // and stores it in the readable XSRF-TOKEN cookie.
  // =========================================================

  const getCSRFToken = async () => {

    const res =
      await axios.get(
        `${API_URL}/auth/csrf`,
        {
          withCredentials: true
        }
      );


    const token =
      res.data?.csrfToken ||
      res.data?.token ||
      res.data?.xsrfToken;


    if (!token) {

      throw new Error(
        "Unable to retrieve the CSRF token."
      );
    }


    return token;
  };


  // =========================================================
  // ADD TO WISHLIST
  // =========================================================
  //
  // userOverride is optional.
  //
  // It allows the Login page to add a pending wishlist
  // product immediately after successful login, without
  // waiting for React to update the user state.
  //
  // The backend still identifies the user through the
  // HTTP-only authentication cookie.
  // =========================================================

  const addToWishlist = async (
    id,
    userOverride
  ) => {

    if (!user && !userOverride) {

      return {
        success: false,
        message: "Please login first."
      };
    }


    if (
      id === undefined ||
      id === null ||
      String(id).trim() === ""
    ) {

      return {
        success: false,
        message: "Invalid product."
      };
    }


    const productId =
      String(id).trim();


    const existingProduct =
      wishlist.find(
        (product) =>
          String(
            product.id ??
            product._id
          ) === productId
      );


    if (existingProduct) {

      return {
        success: true,
        alreadyExists: true,
        message: "This product is already in your wishlist."
      };
    }


    wishlistOperationVersion.current += 1;

    const operationVersion =
      wishlistOperationVersion.current;


    try {

      const csrfToken =
        await getCSRFToken();


      const res =
        await axios.post(
          `${API_URL}/wishlist/${encodeURIComponent(
            productId
          )}`,
          {},
          {
            withCredentials: true,

            headers: {
              "X-CSRF-Token": csrfToken
            }
          }
        );


      if (
        operationVersion ===
        wishlistOperationVersion.current
      ) {

        const wishlistProducts =
          Array.isArray(
            res.data?.products
          )
            ? res.data.products
            : [];


        setWishlist(
          wishlistProducts
        );
      }


      return {
        success: true,
        data: res.data?.products || [],
        message:
          res.data?.message ||
          "Product added to your wishlist."
      };

    } catch (err) {

      console.log(
        "Add to wishlist error:",
        err
      );


      if (
        err.response?.status === 401
      ) {

        authOperationVersion.current += 1;

        localStorage.removeItem("user");

        setUser(null);

        setCartItems({});

        setOrders([]);

        setWishlist([]);
      }


      return {
        success: false,
        error: err,
        message:
          err.response?.data?.message ||
          err.message ||
          "Unable to add this product to your wishlist."
      };
    }
  };


  // =========================================================
  // REMOVE FROM WISHLIST
  // =========================================================

  const removeFromWishlist = async (
    id
  ) => {

    if (!user) {

      return {
        success: false,
        message: "Please login first."
      };
    }


    if (
      id === undefined ||
      id === null ||
      String(id).trim() === ""
    ) {

      return {
        success: false,
        message: "Invalid product."
      };
    }


    const productId =
      String(id).trim();


    wishlistOperationVersion.current += 1;

    const operationVersion =
      wishlistOperationVersion.current;


    try {

      const csrfToken =
        await getCSRFToken();


      const res =
        await axios.delete(
          `${API_URL}/wishlist/${encodeURIComponent(
            productId
          )}`,
          {
            withCredentials: true,

            headers: {
              "X-CSRF-Token": csrfToken
            }
          }
        );


      if (
        operationVersion ===
        wishlistOperationVersion.current
      ) {

        const wishlistProducts =
          Array.isArray(
            res.data?.products
          )
            ? res.data.products
            : [];


        setWishlist(
          wishlistProducts
        );
      }


      return {
        success: true,
        data: res.data?.products || [],
        message:
          res.data?.message ||
          "Product removed from your wishlist."
      };

    } catch (err) {

      console.log(
        "Remove from wishlist error:",
        err
      );


      if (
        err.response?.status === 401
      ) {

        authOperationVersion.current += 1;

        localStorage.removeItem("user");

        setUser(null);

        setCartItems({});

        setOrders([]);

        setWishlist([]);
      }


      return {
        success: false,
        error: err,
        message:
          err.response?.data?.message ||
          err.message ||
          "Unable to remove this product from your wishlist."
      };
    }
  };


  // =========================================================
  // CLEAR WISHLIST
  // =========================================================

  const clearWishlist = async () => {

    if (!user) {

      return {
        success: false,
        message: "Please login first."
      };
    }


    if (wishlist.length === 0) {

      return {
        success: true,
        message: "Your wishlist is already empty."
      };
    }


    wishlistOperationVersion.current += 1;

    const operationVersion =
      wishlistOperationVersion.current;


    try {

      const csrfToken =
        await getCSRFToken();


      const res =
        await axios.delete(
          `${API_URL}/wishlist`,
          {
            withCredentials: true,

            headers: {
              "X-CSRF-Token": csrfToken
            }
          }
        );


      if (
        operationVersion ===
        wishlistOperationVersion.current
      ) {

        setWishlist(
          Array.isArray(
            res.data?.products
          )
            ? res.data.products
            : []
        );
      }


      return {
        success: true,
        message:
          res.data?.message ||
          "Your wishlist has been cleared."
      };

    } catch (err) {

      console.log(
        "Clear wishlist error:",
        err
      );


      if (
        err.response?.status === 401
      ) {

        authOperationVersion.current += 1;

        localStorage.removeItem("user");

        setUser(null);

        setCartItems({});

        setOrders([]);

        setWishlist([]);
      }


      return {
        success: false,
        error: err,
        message:
          err.response?.data?.message ||
          err.message ||
          "Unable to clear your wishlist."
      };
    }
  };


  // =========================================================
  // CHECK WISHLIST
  // =========================================================

  const isInWishlist = useCallback(
    (id) => {

      if (
        id === undefined ||
        id === null
      ) {

        return false;
      }


      const productId =
        String(id);


      return wishlist.some(
        (product) =>
          String(
            product.id ??
            product._id
          ) === productId
      );

    },
    [
      wishlist
    ]
  );


  // =========================================================
  // ADD TO CART
  // =========================================================

  const addToCart = async (
    id,
    size,
    userOverride
  ) => {

    // -------------------------------------------------------
    // The backend now determines the authenticated user
    // from the JWT cookie.
    //
    // userOverride is intentionally kept in the function
    // signature because existing frontend components may
    // still pass it.
    //
    // It is NOT sent to the backend.
    // -------------------------------------------------------

    if (!user && !userOverride) {

      return {
        success: false,
        message:
          "Please login first."
      };
    }


    if (
      !size ||
      String(size).trim() === ""
    ) {

      return {
        success: false,
        message:
          "Please select a size."
      };
    }


    if (
      id === undefined ||
      id === null ||
      String(id).trim() === ""
    ) {

      return {
        success: false,
        message:
          "Invalid product."
      };
    }


    // Mark cart operation as started.

    cartOperationVersion.current += 1;


    const operationVersion =
      cartOperationVersion.current;


    try {

      // -----------------------------------------------------
      // The backend gets the authenticated user from
      // the HTTP-only JWT cookie.
      //
      // We do NOT send userId.
      // -----------------------------------------------------

      const res =
        await axios.post(
          `${API_URL}/cart`,
          {
            productId:
              String(id),

            size:
              String(size).trim(),

            quantity: 1
          },
          {
            withCredentials: true
          }
        );


      const cart =
        res.data?.cart;


      if (
        !cart
      ) {

        return {
          success: false,
          message:
            "Cart was not returned by the server."
        };
      }


      const updatedCart =
        normalizeCartItems(
          cart.items
        );


      if (
        operationVersion ===
        cartOperationVersion.current
      ) {

        setCartItems(
          updatedCart
        );
      }


      return {
        success: true,
        data: cart
      };


    } catch (err) {

      console.log(
        "Add to cart error:",
        err
      );


      // -----------------------------------------------------
      // If the backend says authentication failed, clear
      // the cached user so the UI doesn't continue pretending
      // that the session is valid.
      // -----------------------------------------------------

      if (
        err.response?.status === 401
      ) {

        authOperationVersion.current += 1;

        localStorage.removeItem(
          "user"
        );

        setUser(null);

        setCartItems({});

        setOrders([]);
      }


      return {
        success: false,
        error: err,
        message:
          err.response?.data?.message ||
          "Failed to add product to cart."
      };
    }
  };


  // =========================================================
  // REMOVE FROM CART
  // =========================================================

  const removeFromCart = async (
    key
  ) => {

    if (!user) {

      return {
        success: false,
        message:
          "Please login first."
      };
    }


    if (
      !key ||
      !String(key).includes("_")
    ) {

      return {
        success: false,
        message:
          "Invalid cart item."
      };
    }


    cartOperationVersion.current += 1;


    const operationVersion =
      cartOperationVersion.current;


    try {

      const separatorIndex =
        String(key).indexOf("_");


      const productId =
        String(key).substring(
          0,
          separatorIndex
        );


      const size =
        String(key).substring(
          separatorIndex + 1
        );


      const res =
        await axios.delete(
          `${API_URL}/cart/item`,
          {
            data: {
              productId,
              size
            },

            withCredentials: true
          }
        );


      const cart =
        res.data?.cart;


      const updatedCart =
        cart?.items
          ? normalizeCartItems(
              cart.items
            )
          : {};


      if (
        operationVersion ===
        cartOperationVersion.current
      ) {

        setCartItems(
          updatedCart
        );
      }


      return {
        success: true
      };


    } catch (err) {

      console.log(
        "Remove cart error:",
        err
      );


      if (
        err.response?.status === 401
      ) {

        authOperationVersion.current += 1;

        localStorage.removeItem(
          "user"
        );

        setUser(null);

        setCartItems({});

        setOrders([]);
      }


      return {
        success: false,
        error: err,
        message:
          err.response?.data?.message ||
          "Failed to update cart."
      };
    }
  };


  // =========================================================
  // UPDATE CART ITEM
  // =========================================================

  const updateCartItem = async (
    key,
    quantity
  ) => {

    if (!user) {

      return {
        success: false,
        message:
          "Please login first."
      };
    }


    if (
      !key ||
      !String(key).includes("_")
    ) {

      return {
        success: false,
        message:
          "Invalid cart item."
      };
    }


    const numericQuantity =
      Number(quantity);


    if (
      !Number.isFinite(
        numericQuantity
      ) ||
      numericQuantity < 0
    ) {

      return {
        success: false,
        message:
          "Invalid quantity."
      };
    }


    const separatorIndex =
      String(key).indexOf("_");


    const productId =
      String(key).substring(
        0,
        separatorIndex
      );


    const size =
      String(key).substring(
        separatorIndex + 1
      );


    cartOperationVersion.current += 1;


    const operationVersion =
      cartOperationVersion.current;


    try {

      const res =
        await axios.put(
          `${API_URL}/cart`,
          {
            productId,
            size,
            quantity:
              numericQuantity
          },
          {
            withCredentials: true
          }
        );


      const cart =
        res.data?.cart;


      const updatedCart =
        cart?.items
          ? normalizeCartItems(
              cart.items
            )
          : {};


      if (
        operationVersion ===
        cartOperationVersion.current
      ) {

        setCartItems(
          updatedCart
        );
      }


      return {
        success: true
      };


    } catch (err) {

      console.log(
        "Update cart error:",
        err
      );


      if (
        err.response?.status === 401
      ) {

        authOperationVersion.current += 1;

        localStorage.removeItem(
          "user"
        );

        setUser(null);

        setCartItems({});

        setOrders([]);
      }


      return {
        success: false,
        error: err,
        message:
          err.response?.data?.message ||
          "Failed to update cart."
      };
    }
  };


  // =========================================================
  // CLEAR CART
  // =========================================================

  const clearCart = async () => {

    if (!user) {

      return {
        success: false,
        message:
          "Please login first."
      };
    }


    cartOperationVersion.current += 1;


    try {

      await axios.delete(
        `${API_URL}/cart`,
        {
          withCredentials: true
        }
      );


      setCartItems({});


      return {
        success: true
      };


    } catch (err) {

      console.log(
        "Clear cart error:",
        err
      );


      if (
        err.response?.status === 401
      ) {

        authOperationVersion.current += 1;

        localStorage.removeItem(
          "user"
        );

        setUser(null);

        setCartItems({});

        setOrders([]);
      }


      return {
        success: false,
        error: err,
        message:
          err.response?.data?.message ||
          "Failed to clear cart."
      };
    }
  };


  // =========================================================
  // PLACE ORDER
  // =========================================================

  const placeOrder = async (
    address = {},
    paymentMethod = "cod"
  ) => {

    if (!user) {

      return {
        success: false,
        message:
          "Please login first."
      };
    }


    if (
      Object.keys(
        cartItems
      ).length === 0
    ) {

      return {
        success: false,
        message:
          "Your cart is empty."
      };
    }


    try {

      // -----------------------------------------------------
      // The backend now reads the authenticated user from
      // the JWT cookie.
      //
      // The backend also validates the cart products and
      // calculates the order amount.
      // -----------------------------------------------------

      const res =
        await axios.post(
          `${API_URL}/orders`,
          {
            address,
            paymentMethod
          },
          {
            withCredentials: true
          }
        );


      const newOrder =
        normalizeOrder(
          res.data?.order
        );


      if (
        !newOrder
      ) {

        return {
          success: false,
          message:
            "Order was created but no order data was returned."
        };
      }


      setOrders(
        prev => [
          newOrder,
          ...prev
        ]
      );


      cartOperationVersion.current += 1;


      setCartItems({});


      return {
        success: true,
        data: newOrder
      };


    } catch (err) {

      console.log(
        "Place order error:",
        err
      );


      if (
        err.response?.status === 401
      ) {

        authOperationVersion.current += 1;

        localStorage.removeItem(
          "user"
        );

        setUser(null);

        setCartItems({});

        setOrders([]);
      }


      return {
        success: false,
        error: err,
        message:
          err.response?.data?.message ||
          "Failed to place order."
      };
    }
  };


  // =========================================================
  // CANCEL ORDER
  // =========================================================

  const cancelOrder = async (
    orderId
  ) => {

    // -------------------------------------------------------
    // Normalize the ID before sending it.
    //
    // This protects against callers passing either:
    //
    // order.id
    //
    // or:
    //
    // order.orderId
    // -------------------------------------------------------

    const cleanOrderId =
      String(
        orderId ?? ""
      ).trim();


    if (
      !cleanOrderId
    ) {

      return {
        success: false,
        message:
          "Invalid order ID."
      };
    }


    if (!user) {

      return {
        success: false,
        message:
          "Please login first."
      };
    }


    try {

      const res =
        await axios.patch(
          `${API_URL}/orders/${encodeURIComponent(
            cleanOrderId
          )}/cancel`,
          {},
          {
            withCredentials: true
          }
        );


      const cancelledOrder =
        normalizeOrder(
          res.data?.order
        );


      setOrders(
        prev =>
          prev.map(
            order => {

              const currentOrderId =
                String(
                  order.id ??
                  order.orderId ??
                  ""
                );


              if (
                currentOrderId ===
                cleanOrderId
              ) {

                return (
                  cancelledOrder ||
                  {
                    ...order,
                    status:
                      "Cancelled"
                  }
                );
              }


              return order;
            }
          )
      );


      return {
        success: true,
        data:
          cancelledOrder
      };


    } catch (err) {

      console.log(
        "Cancel order error:",
        err
      );


      if (
        err.response?.status === 401
      ) {

        authOperationVersion.current += 1;

        localStorage.removeItem(
          "user"
        );

        setUser(null);

        setCartItems({});

        setOrders([]);
      }


      return {
        success: false,
        error: err,
        message:
          err.response?.data?.message ||
          "Failed to cancel order."
      };
    }
  };


  // =========================================================
  // GET CART TOTAL
  // =========================================================

  const getCartTotal = () => {

    let total = 0;


    for (
      const key in cartItems
    ) {

      const separatorIndex =
        key.indexOf("_");


      const id =
        separatorIndex !== -1
          ? key.substring(
              0,
              separatorIndex
            )
          : key;


      const product =
        products.find(
          p =>
            String(p.id) ===
            String(id)
        );


      if (!product) {
        continue;
      }


      const price =
        Number(product.price);


      const quantity =
        Number(
          cartItems[key]
        );


      if (
        Number.isFinite(price) &&
        Number.isFinite(quantity)
      ) {

        total +=
          price * quantity;
      }
    }


    return total;
  };


  // =========================================================
  // GET CART COUNT
  // =========================================================

  const getCartCount = () =>
    Object.values(
      cartItems
    ).reduce(
      (
        total,
        quantity
      ) =>
        total +
        (Number(quantity) || 0),
      0
    );


  // =========================================================
  // GET WISHLIST COUNT
  // =========================================================

  const getWishlistCount = () =>
    wishlist.length;


  // =========================================================
  // CONTEXT
  // =========================================================

  return (
    <ShopContext.Provider
      value={{
        user,
        loginUser,
        logoutUser,

        products,
        fetchProducts,

        cartItems,
        orders,

        addToCart,
        removeFromCart,
        updateCartItem,
        clearCart,

        placeOrder,
        cancelOrder,

        getCartTotal,
        getCartCount,

        wishlist,
        wishlistLoading,
        fetchWishlist,
        addToWishlist,
        removeFromWishlist,
        clearWishlist,
        isInWishlist,
        getWishlistCount
      }}
    >
      {children}
    </ShopContext.Provider>
  );
};


// ============================================================
// NORMALIZE CART ITEMS
// ============================================================
//
// Mongoose Map values can arrive as an ordinary object,
// while some responses can represent them differently.
// This keeps the rest of the existing frontend unchanged.
// ============================================================

const normalizeCartItems = (
  items
) => {

  if (!items) {
    return {};
  }


  if (
    items instanceof Map
  ) {

    return Object.fromEntries(
      items
    );
  }


  if (
    typeof items ===
    "object"
  ) {

    return {
      ...items
    };
  }


  return {};
};


// ============================================================
// NORMALIZE ORDER
// ============================================================
//
// The backend Order model uses:
//
// orderId
// amount
//
// The existing frontend expects:
//
// id
// total
//
// We translate the backend response here so the existing
// Orders UI can continue working without unnecessary changes.
// ============================================================

const normalizeOrder = (
  order
) => {

  if (!order) {
    return null;
  }


  return {
    ...order,

    id:
      order.id ??
      order.orderId,

    total:
      order.total ??
      order.amount
  };
};


export default ShopContextProvider;