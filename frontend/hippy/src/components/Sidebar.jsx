import React, { useEffect, useState } from "react";
import { useChatStore } from "../store/useChatStore.js";
import { useAuthStore } from "../store/useAuthStore.js";
import SidebarSkeleton from "./skeletons/SidebarSkeleton.jsx";
import { Link } from "react-router-dom";
import { Search, UserPlus, Users } from "lucide-react";

const Sidebar = () => {
  const { getUsers, users, selectedUser, setSelectedUser, isUsersLoading } = useChatStore();
  const { onlineUsers, authUser } = useAuthStore();
  const [showOnlineOnly, setShowOnlineOnly] = useState(false);
  const [showDiscover, setShowDiscover] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    getUsers();
  }, [getUsers]);

  const filteredUsers = users.filter((user) => {
    const matchesOnlineFilter = showDiscover || !showOnlineOnly || onlineUsers.includes(user._id);
    const fullName = user.fullName ?? user.fullname ?? "";
    const matchesSearch = !searchQuery.trim() || fullName.toLowerCase().includes(searchQuery.trim().toLowerCase());
    return matchesOnlineFilter && matchesSearch;
  });
  const onlineContacts = filteredUsers.filter((user) => onlineUsers.includes(user._id));
  const offlineContacts = filteredUsers.filter((user) => !onlineUsers.includes(user._id));

  if (isUsersLoading) return <SidebarSkeleton />;

  return (
    <aside className="flex h-full w-32 shrink-0 flex-col border-r border-base-300/70 bg-base-100 transition-all duration-200 sm:w-64 lg:w-72">
      <div className="w-full border-b border-base-300/70 bg-base-100 p-3 sm:p-4">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            {showDiscover ? <UserPlus className="size-5 text-primary" /> : <Users className="size-5 text-primary" />}
            <div className="min-w-0">
              <p className="truncate text-xs font-semibold sm:text-sm">{showDiscover ? "Find people" : "Messages"}</p>
              <p className="hidden text-xs text-base-content/50 sm:block">
                {showDiscover ? "Discover people" : `${onlineContacts.length} online now`}
              </p>
            </div>
          </div>
          <button
            type="button"
            title={showDiscover ? "Back to messages" : "Add friend"}
            aria-label={showDiscover ? "Back to messages" : "Add friend"}
            onClick={() => {
              setShowDiscover(!showDiscover);
              setSearchQuery("");
            }}
            className={`btn btn-ghost btn-square btn-sm ${showDiscover ? "text-primary" : ""}`}
          >
            {showDiscover ? <Users className="size-4" /> : <UserPlus className="size-4" />}
          </button>
        </div>
        <div className="relative mt-3 hidden sm:block">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-base-content/40" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={showDiscover ? "Search people" : "Search messages"}
              aria-label={showDiscover ? "Search people" : "Search contacts"}
              className="input input-bordered input-sm w-full rounded-xl bg-base-200/50 pl-9"
            />
        </div>
        {!showDiscover && (
          <div className="mt-3 hidden items-center justify-between gap-2 sm:flex">
            <label className="flex cursor-pointer items-center gap-2 text-xs text-base-content/60">
              <input
                type="checkbox"
                checked={showOnlineOnly}
                onChange={(e) => setShowOnlineOnly(e.target.checked)}
                className="checkbox checkbox-primary checkbox-xs"
              />
              <span>Online only</span>
            </label>
            <span className="rounded-full bg-success/10 px-2 py-0.5 text-xs font-medium text-success">
              {onlineContacts.length}
            </span>
          </div>
        )}
      </div>

      <div className="w-full flex-1 overflow-y-auto p-2 sm:p-3">
        {[
          { title: showDiscover ? "Online" : "Online now", users: onlineContacts },
          ...(!showOnlineOnly || showDiscover ? [{ title: "Offline", users: offlineContacts }] : []),
        ].map((group) => group.users.length > 0 && (
          <section key={group.title} className="mb-4 last:mb-0">
            <div className="mb-1 hidden items-center justify-between px-2 py-1 sm:flex">
              <h2 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-base-content/45">
                {group.title}
              </h2>
              <span className="text-[11px] text-base-content/40">{group.users.length}</span>
            </div>
            {group.users.map((user) => {
              const fullName = user.fullName ?? user.fullname ?? "Unknown user";
              const profilePic = user.profilePic ?? user.profilepic;

              return (
                <button
                  key={user._id}
                  onClick={() => setSelectedUser(user)}
                  className={`
                    mb-1 flex w-full items-center gap-2 rounded-xl p-1.5 text-left transition-all sm:gap-3 sm:p-2.5
                    ${selectedUser?._id === user._id
                      ? "bg-primary/10 text-primary ring-1 ring-primary/15"
                      : "text-base-content hover:bg-base-200"}
                  `}
                >
                  <div className="relative shrink-0">
                    <img
                      src={profilePic || "/avatar.png"}
                      alt={fullName}
                      className="size-9 rounded-full object-cover ring-2 ring-base-100 sm:size-11"
                      onError={(e) => {
                        e.currentTarget.src = "https://cdn-icons-png.flaticon.com/512/149/149071.png";
                      }}
                    />
                    {onlineUsers.includes(user._id) && (
                      <span className="absolute bottom-0 right-0 size-3 rounded-full border-2 border-base-100 bg-success" />
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1">
                      <span className="truncate text-xs font-semibold sm:text-sm">{fullName}</span>
                      {onlineUsers.includes(user._id) && (
                        <span className="hidden size-1.5 shrink-0 rounded-full bg-success sm:block" />
                      )}
                    </div>
                    <div className="truncate text-[10px] text-base-content/50 sm:text-xs">
                      {showDiscover
                        ? onlineUsers.includes(user._id) ? "Online · Add to chat" : "Invite to chat"
                        : onlineUsers.includes(user._id) ? "Active now" : "Offline"}
                    </div>
                  </div>
                </button>
              );
            })}
          </section>
        ))}

        {filteredUsers.length === 0 && (
          <div className="px-2 py-8 text-center sm:px-4">
            <div className="mx-auto mb-2 flex size-10 items-center justify-center rounded-full bg-base-200">
              {showDiscover ? <UserPlus className="size-5 text-base-content/40" /> : <Users className="size-5 text-base-content/40" />}
            </div>
            <p className="text-xs text-base-content/50 sm:text-sm">
              {showDiscover ? "No people found" : showOnlineOnly ? "No friends online right now" : "No contacts yet"}
            </p>
          </div>
        )}
      </div>

      <Link
        to="/profile"
        className="flex items-center gap-3 border-t border-base-300/70 bg-base-100 p-3 hover:bg-base-200/70"
      >
        <div className="relative shrink-0">
          <img
            src={authUser?.profilePic || "/avatar.png"}
            alt={authUser?.fullName || "Your profile"}
            className="size-10 rounded-full object-cover ring-2 ring-primary/15"
            onError={(e) => {
              e.currentTarget.src = "https://cdn-icons-png.flaticon.com/512/149/149071.png";
            }}
          />
          <span className="absolute bottom-0 right-0 size-3 rounded-full border-2 border-base-100 bg-success" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-semibold sm:text-sm">{authUser?.fullName || "Your profile"}</p>
          <p className="hidden text-xs text-base-content/50 sm:block">View your profile</p>
        </div>
      </Link>
    </aside>
  );
};

export default Sidebar;
