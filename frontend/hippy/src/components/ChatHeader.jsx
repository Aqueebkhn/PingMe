import React from "react";
import { X } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore.js";
import { useChatStore } from "../store/useChatStore.js";

const ChatHeader = () => {
  const { selectedUser, setSelectedUser } = useChatStore();
  const { onlineUsers } = useAuthStore();
  const isOnline = onlineUsers.includes(selectedUser._id);
  const fullName = selectedUser.fullName ?? selectedUser.fullname ?? "Unknown user";

  return (
    <div className="border-b border-base-300/70 bg-base-100/90 px-3 py-3 sm:px-5">
      <div className="flex items-center justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <div className="relative shrink-0">
            <div className="size-11 overflow-hidden rounded-full ring-2 ring-primary/15">
              <img
                src={selectedUser.profilePic || "/avatar.png"}
                alt={fullName}
                className="size-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = "https://cdn-icons-png.flaticon.com/512/149/149071.png";
                }}
              />
            </div>
            <span className={`absolute bottom-0 right-0 size-3.5 rounded-full border-2 border-base-100 ${isOnline ? "bg-success" : "bg-base-content/25"}`} />
          </div>

          <div className="min-w-0">
            <h3 className="truncate text-sm font-semibold sm:text-base">{fullName}</h3>
            <p className={`text-xs ${isOnline ? "text-success" : "text-base-content/50"}`}>
              {isOnline ? "Online now" : "Offline"}
            </p>
          </div>
        </div>

        <button
          onClick={() => setSelectedUser(null)}
          className="btn btn-ghost btn-circle btn-sm text-base-content/50 hover:text-base-content"
          aria-label="Close conversation"
          title="Close conversation"
        >
          <X className="size-5" />
        </button>
      </div>
    </div>
  );
};

export default ChatHeader;
