import React from "react";
import { useAuthStore } from "../store/useAuthStore.js";
import { useChatStore } from "../store/useChatStore.js";
import AnonymousChatPage from "./AnonymousChatPage.jsx";
import Sidebar from "../components/Sidebar.jsx";
import NoChatSelected from "../components/NoChatSelected.jsx";
import ChatContainer from "../components/ChatContainer.jsx";

const HomePage = () => {
  const { authUser } = useAuthStore();
  const { selectedUser } = useChatStore();

  if (!authUser) return <AnonymousChatPage />;

  return (
    <div className="h-screen bg-transparent">
      <div className="flex h-full items-center justify-center px-2 pb-2 pt-[4.5rem] sm:px-6 sm:pb-5">
        <div className="app-shell h-[calc(100vh-5.5rem)] w-full max-w-7xl overflow-hidden rounded-2xl bg-base-100">
          <div className="flex h-full overflow-hidden rounded-2xl">
            <Sidebar />
            {!selectedUser ? <NoChatSelected /> : <ChatContainer />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
