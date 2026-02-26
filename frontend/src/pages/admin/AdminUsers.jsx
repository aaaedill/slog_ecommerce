import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const AdminUsers = () => {

  const [users, setUsers] = useState([]);

  const navigate = useNavigate();

  // FETCH USERS
  const fetchUsers = () => {

    axios
      .get("http://localhost:4000/users")
      .then(res => {
        const filtered =
          res.data.filter(
            user => user.role === "user"
          );
        setUsers(filtered);
      })
      .catch(err => console.log(err));
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // BLOCK / UNBLOCK USER
  const toggleBlock = (user) => {

    axios.patch(
      `http://localhost:4000/users/${user.id}`,
      {
        isBlocked: !user.isBlocked
      }
    )

    .then(() => {

      fetchUsers();

      const nowBlocked = !user.isBlocked;

      toast.success(
        nowBlocked
        ? "User blocked"
        : "User unblocked"
      );

      // ✅ NEW: Trigger logout in other tabs
      if (nowBlocked) {

        localStorage.setItem(
          "forceLogout",
          JSON.stringify({
            userId: user.id,
            time: Date.now()
          })
        );

      }

    });

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
            All Users List
          </h2>

          {/* HEADER */}
          <div className="
            hidden sm:grid
            grid-cols-[2fr_2fr_1fr_140px]
            text-white
            border-b border-white/20
            pb-3
            font-medium
          ">
            <p>Name</p>
            <p>Email</p>
            <p>Status</p>
            <p className="text-center">Action</p>
          </div>

          {/* USERS LIST */}
          {
            users.map(user => (
              <div
                key={user.id}
                className="
                  grid
                  grid-cols-1
                  sm:grid-cols-[2fr_2fr_1fr_140px]
                  gap-4
                  sm:gap-0
                  items-center
                  text-white
                  border-b border-white/10
                  py-4
                  hover:bg-white/5
                  transition
                "
              >

                <div className="sm:hidden">
                  <p className="font-medium">{user.name}</p>
                  <p className="text-sm text-white/60">{user.email}</p>

                  <span
                    className={`
                      inline-block
                      mt-1
                      px-3 py-1
                      rounded-lg
                      text-xs
                      border
                      ${user.isBlocked
                        ?
                        "bg-red-500/20 border-red-500/40 text-red-300"
                        :
                        "bg-green-500/20 border-green-500/40 text-green-300"
                      }
                    `}
                  >
                    {user.isBlocked ? "Blocked" : "Active"}
                  </span>
                </div>

                <p className="hidden sm:block">
                  {user.name}
                </p>

                <p className="hidden sm:block">
                  {user.email}
                </p>

                <div className="hidden sm:block">
                  <span
                    className={`
                      px-3 py-1
                      rounded-lg
                      text-xs
                      border
                      ${user.isBlocked
                        ?
                        "bg-red-500/20 border-red-500/40 text-red-300"
                        :
                        "bg-green-500/20 border-green-500/40 text-green-300"
                      }
                    `}
                  >
                    {user.isBlocked ? "Blocked" : "Active"}
                  </span>
                </div>

                <div className="flex justify-start sm:justify-center mt-2 sm:mt-0">
                  <button
                    onClick={() => toggleBlock(user)}
                    className={`
                      px-4 py-1.5
                      rounded-lg
                      border
                      transition
                      duration-300
                      backdrop-blur-lg
                      cursor-pointer
                      ${user.isBlocked
                        ?
                        "bg-green-500/20 hover:bg-green-500 border-green-500/40 text-green-300 hover:text-white"
                        :
                        "bg-red-500/20 hover:bg-red-500 border-red-500/40 text-red-300 hover:text-white"
                      }
                    `}
                  >
                    {user.isBlocked ? "Unblock" : "Block"}
                  </button>
                </div>

              </div>
            ))
          }

        </div>
      </div>
    </div>
  );
};

export default AdminUsers;