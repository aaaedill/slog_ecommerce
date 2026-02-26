import { createContext, useEffect, useState } from "react";
import axios from "axios";

export const ShopContext = createContext();

const ShopContextProvider = ({ children }) => {

  const [products, setProducts] = useState([]);
  const [cartItems, setCartItems] = useState({});
  const [orders, setOrders] = useState([]);

  const [user, setUser] = useState(() => {

    const storedUser = JSON.parse(localStorage.getItem("user"));

    if (storedUser?.role === "admin") {

      if (!window.location.pathname.startsWith("/admin")) {

        window.location.replace("/admin");

      }

    }

    return storedUser;

  });


  // ALWAYS STRING USER ID

  const userId =
    user?.id !== undefined && user?.id !== null
      ? String(user.id)
      : null;



  // ADMIN AUTO REDIRECT

  useEffect(() => {

    if (user && user.role === "admin") {

      if (!window.location.pathname.startsWith("/admin")) {

        window.location.href = "/admin";

      }

    }

  }, [user]);



  // LOGIN

  const loginUser = (userData) => {

    localStorage.setItem("user", JSON.stringify(userData));

    setUser(userData);

  };



  // LOGOUT

  const logoutUser = () => {

    localStorage.removeItem("user");

    setUser(null);
    setCartItems({});
    setOrders([]);

    window.location.replace("/");

  };



  // FETCH PRODUCTS

  const fetchProducts = async () => {

    try {

      const res = await axios.get("http://localhost:4000/products");

      setProducts(res.data);

    }

    catch (err) {

      console.log(err);

    }

  };



  useEffect(() => {

    fetchProducts();

  }, []);




  // ✅ LOAD CART WITH MULTI-DEVICE SYNC

  useEffect(() => {

    if (!userId) {

      setCartItems({});
      return;

    }

    const loadCart = () => {

      axios
        .get(`http://localhost:4000/cart?userId=${userId}`)
        .then(res => {

          if (res.data.length > 0) {

            setCartItems(res.data[0].items || {});

          }

          else {

            setCartItems({});

          }

        })
        .catch(err => console.log(err));

    };

    // first load
    loadCart();

    // auto sync every 2 seconds
    const interval = setInterval(loadCart, 2000);

    return () => clearInterval(interval);

  }, [userId]);




  // LOAD ORDERS

  useEffect(() => {

    if (!userId) {

      setOrders([]);

      return;

    }

    axios
      .get("http://localhost:4000/orders")
      .then(res => {

        const filteredOrders =
          res.data.filter(
            order =>
              String(order.userId) === String(userId)
          );

        setOrders(filteredOrders);

      })
      .catch(err => console.log(err));

  }, [userId]);




  // ADD TO CART

  const addToCart = async (id, size, userOverride) => {

    const currentUserId =
      userOverride?.id !== undefined
        ? String(userOverride.id)
        : userId;

    if (!currentUserId) return;

    const key = id + "_" + size;

    const updatedCart = {

      ...cartItems,

      [key]: (cartItems[key] || 0) + 1

    };


    // instant refresh
    setCartItems({ ...updatedCart });


    const res = await axios.get(
      `http://localhost:4000/cart?userId=${currentUserId}`
    );


    if (res.data.length > 0) {

      await axios.patch(
        `http://localhost:4000/cart/${res.data[0].id}`,
        { items: updatedCart }
      );

    }

    else {

      await axios.post(
        "http://localhost:4000/cart",
        {
          userId: currentUserId,
          items: updatedCart
        }
      );

    }

  };




  // REMOVE FROM CART

  const removeFromCart = async (key) => {

    if (!userId) return;

    const updatedCart = { ...cartItems };

    delete updatedCart[key];

    setCartItems({ ...updatedCart });


    const res = await axios.get(
      `http://localhost:4000/cart?userId=${userId}`
    );


    if (res.data.length > 0)

      await axios.patch(
        `http://localhost:4000/cart/${res.data[0].id}`,
        { items: updatedCart }
      );

  };




  // PLACE ORDER

  const placeOrder = async (address = {}, paymentMethod = "cod") => {

    if (!userId) return;

    const orderItems =
      Object.entries(cartItems).map(
        ([key, qty]) => {

          const id = key.split("_")[0];

          const size = key.split("_")[1];

          const product =
            products.find(
              p => String(p.id) === String(id)
            );

          return {

            productId: id,
            name: product?.name,
            image: product?.image,
            price: product?.price,
            size,
            quantity: qty

          };

        }
      );


    const existingOrders = await axios.get(
      "http://localhost:4000/orders"
    );


    const numericIds = existingOrders.data
      .map(o => o.id)
      .filter(id => /^\d+$/.test(id))
      .map(id => parseInt(id));


    let nextNumber = 1;


    if (numericIds.length > 0) {

      nextNumber = Math.max(...numericIds) + 1;

    }


    const nextId =
      String(nextNumber).padStart(4, "0");


    const orderData = {

      id: nextId,
      userId: userId,
      items: orderItems,
      total: getCartTotal(),
      date: new Date().toLocaleString(),
      status: "Order Placed",
      address,
      paymentMethod

    };


    const res = await axios.post(
      "http://localhost:4000/orders",
      orderData
    );


    setOrders(prev => [res.data, ...prev]);


    const cartRes = await axios.get(
      `http://localhost:4000/cart?userId=${userId}`
    );


    if (cartRes.data.length > 0)

      await axios.patch(
        `http://localhost:4000/cart/${cartRes.data[0].id}`,
        { items: {} }
      );


    setCartItems({});

  };




  const getCartTotal = () => {

    let total = 0;

    for (const key in cartItems) {

      const id = key.split("_")[0];

      const product =
        products.find(
          p => String(p.id) === String(id)
        );

      if (product)

        total += product.price * cartItems[key];

    }

    return total;

  };




  const getCartCount = () =>
    Object.values(cartItems)
      .reduce((a, b) => a + b, 0);




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

        placeOrder,

        getCartTotal,
        getCartCount

      }}
    >

      {children}

    </ShopContext.Provider>

  );

};


export default ShopContextProvider;