import React from "react";
import { MessageSquare } from "lucide-react";

const NoChatSelected = () => {
  return (
    <div className="flex w-full flex-1 flex-col items-center justify-center bg-base-200/20 p-8 sm:p-16">
      <div className="max-w-md space-y-5 text-center">
        {/* Icon Display */}
        <div className="flex justify-center gap-4 mb-4">
          <div className="relative">
            <div className="flex size-20 items-center justify-center rounded-[1.75rem] bg-primary text-primary-content shadow-xl shadow-primary/20">
              <MessageSquare className="size-9" />
            </div>
          </div>
        </div>

        {/* Welcome Text */}
        <h2 className="text-2xl font-bold tracking-tight">Your conversations start here</h2>
        <p className="leading-relaxed text-base-content/60">
          Pick someone from your contacts to share a message, a photo, or a file.
        </p>
      </div>
    </div>
  );
};

export default NoChatSelected;
