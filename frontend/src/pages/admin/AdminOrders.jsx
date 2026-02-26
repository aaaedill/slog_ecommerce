import React, { useEffect, useState } from "react";
import axios from "axios";

const AdminOrders = () => {

  const [orders, setOrders] = useState([]);

  useEffect(() => {
    axios
      .get("http://localhost:4000/orders")
      .then(res => setOrders(res.data.reverse()))
      .catch(err => console.log(err));
  }, []);

  const updateStatus = (id, status) => {
    axios.patch(
      `http://localhost:4000/orders/${id}`,
      { status }
    );
    setOrders(prev =>
      prev.map(order =>
        order.id === id
          ? { ...order, status }
          : order
      )
    );
  };
  return (
<div className="min-h-screen bg-[#0b1120] flex justify-center items-start p-3 sm:p-6 md:p-8 rounded-3xl pb-20">
<div className="
w-full max-w-6xl
bg-white/5
backdrop-blur-xl
border border-white/10
rounded-3xl
shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]
p-4 sm:p-6 md:p-8
relative
overflow-hidden
">
{/* BLOBS */}
<div className="absolute -top-40 -left-40 w-96 h-96 bg-orange-500/20 rounded-full blur-3xl"></div>
<div className="absolute -bottom-40 -right-40 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"></div>
<div className="relative z-10">
{/* TITLE */}
<h2 className="text-lg sm:text-xl font-semibold mb-6 text-white">
All Orders List
</h2>
{/* HEADER desktop only */}
<div className="
hidden sm:grid
grid-cols-[80px_2.5fr_1.2fr_1fr_1fr]
text-white
border-b border-white/20
pb-3
font-medium
">
<p>Image</p>
<p>Products & Address</p>
<p>Date</p>
<p>Total</p>
<p className="text-center">Status</p>
</div>
{/* ORDERS */}
{
orders.map(order => (
<div
key={order.id}
className="
grid
grid-cols-1
sm:grid-cols-[80px_2.5fr_1.2fr_1fr_1fr]
gap-4
sm:gap-0
items-start
text-white
border-b border-white/10
py-4
hover:bg-white/5
transition
"
>

{/* IMAGE + MOBILE HEADER */}
<div className="flex gap-4 sm:contents">
<img
src={order.items?.[0]?.image}
className="
w-14 h-14
object-cover
rounded
border border-white/20
"
/>

{/* MOBILE ONLY INFO */}
<div className="sm:hidden">
<p className="text-sm text-white/70">
Order ID: {order.id}
</p>
<p className="text-sm text-white/70">
₹{order.total}
</p>
<p className="text-xs text-white/50">
{order.date}
</p>
</div>
</div>

{/* PRODUCTS + ADDRESS */}
<div className="flex flex-col gap-2">

{/* PRODUCTS */}
{order.items?.map((item,index)=>(
<p key={index} className="text-sm font-medium">
{item.name}
<span className="text-white/50 text-xs">
{" | Size: "}{item.size} | Qty:{item.quantity}
</span>
</p>
))}

{/* ADDRESS */}
{order.address && (
<div className="text-xs text-white/60 leading-relaxed mt-1">
<p className="text-white/80 font-medium">
{order.address.firstName} {order.address.lastName}
</p>
<p>{order.address.street}</p>
<p>{order.address.city}, {order.address.state}</p>
<p>{order.address.country}</p>
<p>Phone: {order.address.phone}</p>
<p>Payment: {order.paymentMethod}</p>
</div>
)}
</div>

{/* DATE desktop */}
<p className="hidden sm:block text-white/70 pt-1">
{order.date}
</p>

{/* TOTAL desktop */}
<p className="hidden sm:block font-medium pt-1">
₹{order.total}
</p>

{/* STATUS */}
<div className="flex justify-start sm:justify-center pt-1">
<select
value={order.status}
onChange={(e)=>updateStatus(order.id,e.target.value)}
className="
bg-black
border border-white/20
px-3 py-1
rounded
transition
"
>
<option>Order Placed</option>
<option>Packing</option>
<option>Shipped</option>
<option>Out for delivery</option>
<option>Delivered</option>
</select>
</div>
</div>
))
}
</div>
</div>
</div>
);
};

export default AdminOrders;