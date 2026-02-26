import { useContext } from "react";
import { ShopContext } from "../context/ShopContext";
import { Title } from "./Title";
import { Link } from "react-router-dom";

const LatestCollection = () => {

  const { products } = useContext(ShopContext);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600&family=Montserrat:wght@200;300;400;500&display=swap');

        .lc-root {
          font-family: 'Montserrat', sans-serif;
        }
        /* Card */
        .lc-card {
          position: relative;
          cursor: pointer;
          group: true;
        }
        .lc-img-wrap {
          position: relative;
          overflow: hidden;
          border-radius: 0.75rem;
          background: #f4f1ee;
        }
        /* Overlay on hover */
        .lc-img-wrap::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(to top, rgba(10,10,10,0.28) 0%, transparent 55%);
          opacity: 0;
          transition: opacity 0.45s ease;
          border-radius: 0.75rem;
          pointer-events: none;
          z-index: 1;
        }
        .lc-card:hover .lc-img-wrap::after {
          opacity: 1;
        }
        .lc-img {
          width: 100%;
          object-fit: cover;
          transition: transform 0.7s cubic-bezier(0.76,0,0.24,1), filter 0.5s ease;
          filter: contrast(1.03) brightness(0.98);
          display: block;
        }
        .lc-card:hover .lc-img {
          transform: scale(1.07);
          filter: contrast(1.05) brightness(0.95);
        }
        /* Quick view pill — appears on hover */
        .lc-quick-view {
          position: absolute;
          bottom: 0.9rem;
          left: 50%;
          transform: translateX(-50%) translateY(6px);
          z-index: 2;
          font-family: 'Montserrat', sans-serif;
          font-size: 0.7rem;
          font-weight: 500;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: white;
          background: rgba(10,10,10,0.75);
          backdrop-filter: blur(8px);
          border: 1px solid rgba(255,255,255,0.25);
          padding: 0.4rem 1.1rem;
          border-radius: 100px;
          white-space: nowrap;
          opacity: 0;
          transition: opacity 0.35s ease, transform 0.35s ease;
          pointer-events: none;
        }
        .lc-card:hover .lc-quick-view {
          opacity: 1;
          transform: translateX(-50%) translateY(0);
        }
        /* Product name */
        .lc-name {
          font-family: 'Playfair Display', serif;
          font-style: normal;
          font-weight: 500;
          color: #1a1a1a;
          line-height: 1.2;
          letter-spacing: 0.01em;
          transition: color 0.3s ease;
        }
        .lc-card:hover .lc-name { color: #b91c1c; }
        /* Price */
        .lc-price {
          font-family: 'Montserrat', sans-serif;
          font-weight: 500;
          font-size: 0.85rem;
          letter-spacing: 0.06em;
          color: #444;
        }
        /* Divider dot */
        .lc-dot {
          width: 3px;
          height: 3px;
          border-radius: 50%;
          background: #dc2626;
          display: inline-block;
          margin: 0 0.5rem;
          vertical-align: middle;
          opacity: 0;
          transition: opacity 0.3s ease;
        }
        .lc-card:hover .lc-dot { opacity: 1; }
        /* Card entrance */
        @keyframes cardIn {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .lc-card {
          animation: cardIn 0.7s ease both;
        }
        .lc-card:nth-child(1)  { animation-delay: 0.05s; }
        .lc-card:nth-child(2)  { animation-delay: 0.12s; }
        .lc-card:nth-child(3)  { animation-delay: 0.19s; }
        .lc-card:nth-child(4)  { animation-delay: 0.26s; }
        .lc-card:nth-child(5)  { animation-delay: 0.33s; }
        .lc-card:nth-child(6)  { animation-delay: 0.40s; }
        .lc-card:nth-child(7)  { animation-delay: 0.47s; }
        .lc-card:nth-child(8)  { animation-delay: 0.54s; }
      `}</style>
      <div className="lc-root my-12 sm:my-16 md:my-20">

        {/* Section header */}
        <div className="mb-8 sm:mb-12 md:mb-14">
          <Title text1="LATEST" text2="COLLECTION" />
          <p className="
            mt-3
            text-sm
            tracking-[0.15em]
            uppercase
            text-neutral-500
            font-normal
          " style={{fontFamily:"'Montserrat',sans-serif"}}>
            Curated &nbsp;·&nbsp; Seasonal &nbsp;·&nbsp; Exclusive
          </p>
        </div>
        <div>
          <div className="
            grid
            grid-cols-2
            sm:grid-cols-2
            md:grid-cols-3
            lg:grid-cols-4
            gap-4 sm:gap-6 md:gap-8
          ">
            {products.map((item) => (
              <Link key={item.id} to={`/product/${item.id}`}>
                <div className="lc-card">

                  {/* IMAGE CONTAINER */}
                  <div className="lc-img-wrap">
                    <img
                      src={item.image}
                      className="
                        lc-img
                        h-52 sm:h-72 md:h-80 lg:h-96
                      "
                    />
                    <span className="lc-quick-view">View Product</span>
                  </div>

                  {/* TEXT */}
                  <div className="mt-3 sm:mt-4 px-0.5">
                    <p className="lc-name text-base sm:text-xl md:text-2xl mb-1">
                      {item.name}
                    </p>
                    <div className="flex items-center">
                      <p className="lc-price">₹{item.price}</p>
                      <span className="lc-dot" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default LatestCollection;