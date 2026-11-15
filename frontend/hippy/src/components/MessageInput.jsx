import React, { useRef, useState } from "react";
import { useChatStore } from "../store/useChatStore.js";
import { FileText, Image, Paperclip, Send, X } from "lucide-react";
import toast from "react-hot-toast";

const MAX_FILE_SIZE = 5 * 1024 * 1024;

const readFileAsDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("Could not read the selected file"));
    reader.readAsDataURL(file);
  });

const MessageInput = () => {
  const [text, setText] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const [attachmentFile, setAttachmentFile] = useState(null);
  const [isSending, setIsSending] = useState(false);
  const fileInputRef = useRef(null);
  const attachmentInputRef = useRef(null);
  const { sendMessage } = useChatStore();

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > MAX_FILE_SIZE) {
      toast.error("Images must be 5 MB or smaller");
      e.target.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleAttachmentChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > MAX_FILE_SIZE) {
      toast.error("Files must be 5 MB or smaller");
      e.target.value = "";
      return;
    }

    setAttachmentFile(file);
  };

  const removeImage = () => {
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeAttachment = () => {
    setAttachmentFile(null);
    if (attachmentInputRef.current) attachmentInputRef.current.value = "";
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!text.trim() && !imagePreview && !attachmentFile) return;

    setIsSending(true);
    try {
      const attachment = attachmentFile
        ? {
            data: await readFileAsDataUrl(attachmentFile),
            name: attachmentFile.name,
            mimeType: attachmentFile.type || "application/octet-stream",
            size: attachmentFile.size,
          }
        : undefined;
      const sent = await sendMessage({
        text: text.trim(),
        image: imagePreview,
        attachment,
      });

      if (sent) {
        setText("");
        removeImage();
        removeAttachment();
      }
    } catch (error) {
      toast.error(error.message || "Failed to read the selected file");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="w-full border-t border-base-300/70 bg-base-100 p-3 sm:p-4">
      {(imagePreview || attachmentFile) && (
        <div className="mb-3 flex flex-wrap items-center gap-3">
          {imagePreview && (
            <div className="relative">
              <img
                src={imagePreview}
                alt="Image preview"
                className="size-20 rounded-lg border border-base-300 object-cover"
              />
              <button
                onClick={removeImage}
                className="absolute -right-1.5 -top-1.5 flex size-5 items-center justify-center rounded-full bg-base-300 hover:bg-base-200"
                type="button"
                aria-label="Remove image"
              >
                <X className="size-3" />
              </button>
            </div>
          )}
          {attachmentFile && (
            <div className="flex max-w-full items-center gap-2 rounded-lg border border-base-300 bg-base-200 px-3 py-2">
              <FileText className="size-5 shrink-0 text-primary" />
              <span className="max-w-48 truncate text-sm">{attachmentFile.name}</span>
              <button
                onClick={removeAttachment}
                className="btn btn-ghost btn-xs btn-circle"
                type="button"
                aria-label="Remove file"
              >
                <X className="size-3" />
              </button>
            </div>
          )}
        </div>
      )}

      <form onSubmit={handleSendMessage} className="flex items-center gap-2">
        <div className="flex flex-1 gap-2">
          <input
            type="text"
            className="input input-bordered input-sm flex-1 rounded-xl bg-base-200/50 sm:input-md"
            placeholder="Type a message..."
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <input
            type="file"
            accept="image/*"
            className="hidden"
            ref={fileInputRef}
            onChange={handleImageChange}
          />

          <button
            type="button"
            title="Attach image"
            aria-label="Attach image"
            className={`hidden sm:flex btn btn-circle btn-sm sm:btn-md ${imagePreview ? "text-emerald-500" : "text-zinc-400"}`}
            onClick={() => fileInputRef.current?.click()}
          >
            <Image className="w-5 h-5" />
          </button>
          <input
            type="file"
            className="hidden"
            ref={attachmentInputRef}
            onChange={handleAttachmentChange}
          />
          <button
            type="button"
            title="Attach file (maximum 5 MB)"
            aria-label="Attach file"
            className={`btn btn-circle btn-sm sm:btn-md ${attachmentFile ? "text-primary" : "text-zinc-400"}`}
            onClick={() => attachmentInputRef.current?.click()}
          >
            <Paperclip className="size-5" />
          </button>
        </div>
        <button
          type="submit"
          className="btn btn-sm sm:btn-md btn-circle btn-primary"
          disabled={isSending || (!text.trim() && !imagePreview && !attachmentFile)}
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};

export default MessageInput;
