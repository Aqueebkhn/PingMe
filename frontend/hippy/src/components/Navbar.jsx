import React from "react";
import { Link } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore.js";
import { MessageSquare, Settings, LogOut } from "lucide-react";

const Navbar = () => {
  const { logout, authUser } = useAuthStore();

  return (
    <header className="app-navbar fixed inset-x-0 top-0 z-40 border-b">
      <div className="mx-auto h-16 max-w-7xl px-4 sm:px-6">
        <div className="flex items-center justify-between h-full">
          {/* Logo & App Name */}
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2.5 hover:opacity-80 transition-all">
              <div className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-content shadow-md shadow-primary/20">
                <MessageSquare className="size-5" />
              </div>
              <div>
                <h1 className="text-lg font-bold leading-tight tracking-tight">PingMe</h1>
                <p className="hidden text-[10px] font-medium uppercase tracking-[0.18em] text-base-content/45 sm:block">Chat together</p>
              </div>
            </Link>
          </div>

          {/* Navigation Items */}
          <div className="flex items-center gap-2">
            <Link to="/settings" className="btn btn-sm btn-ghost gap-2 transition-colors">
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">Settings</span>
            </Link>

            {authUser && (
              <>
                <Link to="/profile" className="btn btn-sm btn-ghost gap-2 transition-colors">
                  <img
                    src={authUser.profilePic || "/avatar.png"}
                    alt=""
                    className="size-7 rounded-full object-cover ring-2 ring-primary/15"
                    onError={(e) => {
                      e.currentTarget.src = "https://cdn-icons-png.flaticon.com/512/149/149071.png";
                    }}
                  />
                  <span className="hidden max-w-28 truncate sm:inline">{authUser.fullName || "Profile"}</span>
                </Link>

                <button onClick={logout} className="btn btn-sm btn-ghost gap-2 text-error hover:bg-error/10 transition-colors">
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </>
            )}
            {!authUser && (
              <>
                <Link to="/login" className="btn btn-sm btn-ghost">
                  Log in
                </Link>
                <Link to="/signup" className="btn btn-sm btn-primary">
                  Sign up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
