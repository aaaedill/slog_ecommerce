import React,{useState,useContext} from "react";
import axios from "axios";
import {ShopContext} from "../../context/ShopContext";
import {toast} from "react-toastify";
import {useNavigate} from "react-router-dom";

const AddProduct=()=>{

const navigate=useNavigate();

const {fetchProducts}=useContext(ShopContext);

const [images,setImages]=useState([]);
const [imageBase64,setImageBase64]=useState("");
const [isSaving,setIsSaving]=useState(false);

const [product,setProduct]=useState({
name:"",
description:"",
category:"tshirt",
price:"",
sizes:[]
});


// IMAGE
const handleImage=(e,index)=>{

const file=e.target.files[0];
if(!file)return;

const newImages=[...images];
newImages[index]=file;
setImages(newImages);

const reader=new FileReader();

reader.onloadend=()=>{
setImageBase64(reader.result);
};

reader.readAsDataURL(file);

};


// SIZE
const toggleSize=(size)=>{

if(product.sizes.includes(size)){

setProduct({
...product,
sizes:product.sizes.filter(s=>s!==size)
});

}else{

setProduct({
...product,
sizes:[...product.sizes,size]
});

}

};


// SUBMIT
const handleSubmit=async()=>{

if(isSaving)return;

if(!product.name||!product.description||!product.price||!imageBase64){

toast.error("Please fill all fields and upload image");
return;

}

try{

setIsSaving(true);

const res=await axios.get("http://localhost:4000/products");

const products=res.data;

const lastId=
products.length>0
?
Math.max(...products.map(p=>Number(p.id)))
:
0;

const newId=String(lastId+1);

const newProduct={

id:newId,
name:product.name,
description:product.description,
price:Number(product.price),
image:imageBase64,
category:product.category,
sizes:product.sizes,
rating:4.5

};


await axios.post("http://localhost:4000/products",newProduct);

await fetchProducts();

toast.success("Product Added Successfully");

setProduct({
name:"",
description:"",
category:"tshirt",
price:"",
sizes:[]
});

setImages([]);
setImageBase64("");

}catch{

toast.error("Failed to add product");

}finally{

setIsSaving(false);

}

};


return(

<div className="min-h-screen bg-[#0b1120] flex justify-center items-start p-3 sm:p-6 md:p-8 rounded-3xl pb-20">

<div className="w-full max-w-4xl bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] p-4 sm:p-6 md:p-8 relative overflow-hidden">


<div className="absolute -top-40 -left-40 w-96 h-96 bg-orange-500/20 rounded-full blur-3xl"></div>

<div className="absolute -bottom-40 -right-40 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"></div>


<div className="relative z-10">


{/* BACK BUTTON */}

 <button
       onClick={() => navigate("/admin/products")}
       className="
        group
        flex items-center
        px-4 py-2
        mb-5
        rounded-full
        bg-white/10
        backdrop-blur-lg
        border border-white/20
        text-white/90
        hover:bg-orange-500/20
        hover:border-orange-500/40
        hover:text-orange-400
        transition duration-300
        w-fit
        cursor-pointer
        "
      >
       <svg
        xmlns="http://www.w3.org/2000/svg"
        className="
        w-4 h-4
        transition
        group-hover:-translate-x-1
        "
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
        >
        <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15 19l-7-7 7-7"
        />
       </svg>
        <span className="text-sm font-medium tracking-wide">
          Back
        </span>
       </button>


{/* IMAGE */}

<p className="text-lg font-medium mb-3 text-white">

Upload Image

</p>


<div className="flex flex-wrap gap-4 mb-8">


<label className="w-20 h-20 sm:w-24 sm:h-24 border border-white/20 flex items-center justify-center cursor-pointer hover:border-orange-500 transition bg-white/10 text-white">

{
images[0]
?
<img
src={URL.createObjectURL(images[0])}
className="w-full h-full object-cover rounded"
/>
:
"Upload"
}

<input
type="file"
hidden
onChange={(e)=>handleImage(e,0)}
/>

</label>

</div>


{/* NAME */}

<p className="mb-2 text-white">

Product Name

</p>

<input
value={product.name}
placeholder="Enter Name..."
className="w-full border border-white/20 px-4 py-2 mb-6 outline-none bg-white/10 text-white"
onChange={(e)=>
setProduct({...product,name:e.target.value})
}
/>


{/* DESCRIPTION */}

<p className="mb-2 text-white">

Product Description

</p>

<textarea
value={product.description}
placeholder="Enter Description..."
className="w-full border border-white/20 px-4 py-2 mb-6 outline-none bg-white/10 text-white"
onChange={(e)=>
setProduct({...product,description:e.target.value})
}
/>


{/* CATEGORY + PRICE */}

<div className="flex flex-col sm:flex-row gap-6 mb-6">


<div className="flex-1">

<p className="mb-2 text-white">

Category

</p>

<select
value={product.category}
className="w-full border border-white/20 px-4 py-2 bg-white/10 text-white"
onChange={(e)=>
setProduct({...product,category:e.target.value})
}
>

<option className="text-black">shirt</option>
<option className="text-black">tshirt</option>
<option className="text-black">hoodie</option>
<option className="text-black">pants</option>

</select>

</div>


<div className="flex-1">

<p className="mb-2 text-white">

Price

</p>

<input
value={product.price}
type="number"
placeholder="Enter Price..."
className="w-full border border-white/20 px-4 py-2 bg-white/10 text-white"
onChange={(e)=>
setProduct({...product,price:e.target.value})
}
/>

</div>

</div>


{/* SIZES */}

<p className="mb-2 text-white">

Product Sizes

</p>


<div className="flex flex-wrap gap-3 mb-8">

{["S","M","L","XL","XXL"].map(size=>(

<button
key={size}
type="button"
onClick={()=>toggleSize(size)}
className={`px-4 py-2 border border-white/20 cursor-pointer rounded transition ${
product.sizes.includes(size)
?
"bg-orange-500 text-white"
:
"bg-white/10 text-white"
}`}
>

{size}

</button>

))}

</div>


{/* BUTTON */}

<button
onClick={handleSubmit}
disabled={isSaving}
className="w-full sm:w-auto bg-orange-500 text-white px-10 py-3 rounded hover:bg-orange-700 transition duration-300 cursor-pointer disabled:opacity-50"
>

{isSaving?"ADDING...":"ADD PRODUCT"}

</button>


</div>
</div>
</div>

);

};

export default AddProduct;