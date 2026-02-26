import React, { useContext, useState } from "react";
import { NavLink } from "react-router-dom";
import { ShopContext } from "../../context/ShopContext";

const AdminNavbar = () => {

  const { logoutUser } = useContext(ShopContext);

  const [menuOpen, setMenuOpen] = useState(false);


  const logout = () => {

    logoutUser();

  };


  const linkClass =
    "px-4 py-2 rounded-lg transition duration-300 block";

  const activeClass =
    "bg-orange-600 text-white shadow";

  const normalClass =
    "text-white hover:bg-white transition duration-300 hover:text-black";



  return (

    <div className="w-full sticky top-0 z-50 mt-3 sm:mt-5 px-3 sm:px-0">

      <div className="bg-[#0b1120] shadow-lg rounded-2xl sm:rounded-3xl backdrop-blur">

        <div className="flex justify-between items-center px-4 sm:px-8 py-4">


          {/* LOGO */}

          <h1 className="text-white text-lg sm:text-xl font-semibold">

            SLOG <span className="text-orange-500">ADMIN</span>

          </h1>



          {/* DESKTOP MENU */}

          <div className="hidden md:flex gap-4 bg-white/20 backdrop-blur-md p-2 rounded-xl">


            <NavLink

              to="/admin"

              end

              className={({ isActive }) =>

                `${linkClass} ${isActive ? activeClass : normalClass}`

              }

            >

              Dashboard

            </NavLink>



            {/* UPDATED USERS */}

            <NavLink

              to="/admin/users"

              className={({ isActive }) =>

                `${linkClass} ${isActive ? activeClass : normalClass}`

              }

            >

              Users

            </NavLink>



            <NavLink

              to="/admin/products"

              className={({ isActive }) =>

                `${linkClass} ${isActive ? activeClass : normalClass}`

              }

            >

              Products

            </NavLink>



            <NavLink

              to="/admin/orders"

              className={({ isActive }) =>

                `${linkClass} ${isActive ? activeClass : normalClass}`

              }

            >

              Orders

            </NavLink>



          </div>



          {/* DESKTOP LOGOUT */}

          <button

            onClick={logout}

            className="hidden md:block bg-white text-black px-4 py-2 rounded-lg hover:bg-orange-600 hover:text-white transition duration-300 cursor-pointer"

          >

            Logout

          </button>



          {/* MOBILE MENU BUTTON */}

          <button

            onClick={() => setMenuOpen(!menuOpen)}

            className="md:hidden text-white text-2xl"

          >

            ☰

          </button>



        </div>



        {/* MOBILE MENU */}

        {menuOpen && (

          <div className="md:hidden px-4 pb-4">

            <div className="flex flex-col gap-2 bg-white/10 backdrop-blur-md p-3 rounded-xl">



              <NavLink

                to="/admin"

                end

                onClick={() => setMenuOpen(false)}

                className={({ isActive }) =>

                  `${linkClass} ${isActive ? activeClass : normalClass}`

                }

              >

                Dashboard

              </NavLink>



              {/* UPDATED USERS */}

              <NavLink

                to="/admin/users"

                onClick={() => setMenuOpen(false)}

                className={({ isActive }) =>

                  `${linkClass} ${isActive ? activeClass : normalClass}`

                }

              >

                Users

              </NavLink>



              <NavLink

                to="/admin/products"

                onClick={() => setMenuOpen(false)}

                className={({ isActive }) =>

                  `${linkClass} ${isActive ? activeClass : normalClass}`

                }

              >

                Products

              </NavLink>



              <NavLink

                to="/admin/orders"

                onClick={() => setMenuOpen(false)}

                className={({ isActive }) =>

                  `${linkClass} ${isActive ? activeClass : normalClass}`

                }

              >

                Orders

              </NavLink>



              {/* MOBILE LOGOUT */}

              <button

                onClick={logout}

                className="bg-white text-black px-4 py-2 rounded-lg hover:bg-orange-600 hover:text-white transition duration-300 cursor-pointer mt-2"

              >

                Logout

              </button>



            </div>

          </div>

        )}

      </div>

    </div>

  );

};

export default AdminNavbar;