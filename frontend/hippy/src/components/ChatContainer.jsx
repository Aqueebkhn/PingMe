import React, { useEffect, useRef } from "react";
import { useChatStore } from "../store/useChatStore.js";
import { useAuthStore } from "../store/useAuthStore.js";
import ChatHeader from "./ChatHeader.jsx";
import MessageInput from "./MessageInput.jsx";
import MessageSkeleton from "./skeletons/MessageSkeleton.jsx";
import { Download, FileText } from "lucide-react";

const formatFileSize = (bytes) => {
  if (!bytes) return "";
  return bytes < 1024 * 1024
    ? `${(bytes / 1024).toFixed(0)} KB`
    : `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const ChatContainer = () => {
  const {
    messages,
    getMessages,
    isMessagesLoading,
    selectedUser,
    subscribeToMessages,
    unsubscribeFromMessages,
  } = useChatStore();
  const { authUser } = useAuthStore();
  const messageEndRef = useRef(null);

  useEffect(() => {
    getMessages(selectedUser._id);

    subscribeToMessages();

    return () => unsubscribeFromMessages();
  }, [selectedUser._id, getMessages, subscribeToMessages, unsubscribeFromMessages]);

  useEffect(() => {
    if (messageEndRef.current && messages) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const formatMessageTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (isMessagesLoading) {
    return (
      <div className="flex-1 flex flex-col overflow-auto bg-base-100/50">
        <ChatHeader />
        <MessageSkeleton />
        <MessageInput />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-auto bg-base-100/50">
      <ChatHeader />

      <div className="flex-1 space-y-4 overflow-y-auto bg-base-200/20 p-4 sm:p-6">
        {messages.map((message) => {
          const isSender = message.senderId === authUser._id;
          const senderAvatar = isSender
            ? authUser.profilePic || "/avatar.png"
            : selectedUser.profilePic || "/avatar.png";

          return (
            <div
              key={message._id}
              className={`chat ${isSender ? "chat-end" : "chat-start"}`}
            >
              <div className="chat-image avatar">
                <div className="size-10 rounded-full border border-base-300">
                  <img
                    src={senderAvatar}
                    alt="profile pic"
                    onError={(e) => {
                      e.target.src = "https://cdn-icons-png.flaticon.com/512/149/149071.png";
                    }}
                  />
                </div>
              </div>

              <div className="chat-header mb-1">
                <time className="text-xs opacity-50 ml-1">
                  {formatMessageTime(message.createdAt)}
                </time>
              </div>

              <div className={`chat-bubble flex max-w-[85%] flex-col overflow-hidden rounded-2xl p-3 shadow-sm sm:max-w-[75%] ${isSender ? "rounded-br-md" : "rounded-bl-md"}`}>
                {message.image && (
                  <img
                    src={message.image}
                    alt="Attachment"
                    className="sm:max-w-[450px] rounded-lg mb-2 object-cover border border-base-300"
                  />
                )}
                {message.attachment && (
                  message.attachment.mimeType?.startsWith("image/") ? (
                    <a href={message.attachment.url} target="_blank" rel="noreferrer" className="mb-2">
                      <img
                        src={message.attachment.url}
                        alt={message.attachment.name}
                        className="sm:max-w-[450px] rounded-lg object-cover border border-base-300"
                      />
                    </a>
                  ) : (
                    <a
                      href={message.attachment.url}
                      target="_blank"
                      rel="noreferrer"
                      className="mb-2 flex max-w-full items-center gap-3 rounded-lg border border-base-content/20 bg-base-100/20 p-3 hover:bg-base-100/30"
                    >
                      <FileText className="size-6 shrink-0" />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium">{message.attachment.name}</span>
                        <span className="block text-xs opacity-70">{formatFileSize(message.attachment.size)}</span>
                      </span>
                      <Download className="size-4 shrink-0" />
                    </a>
                  )
                )}
                {message.text && <p className="leading-relaxed break-words">{message.text}</p>}
              </div>
            </div>
          );
        })}
        <div ref={messageEndRef} />
      </div>

      <MessageInput />
    </div>
  );
};

export default ChatContainer;
