import React, { useState } from "react";
import { useAuthStore } from "../store/useAuthStore.js";
import { Camera, Mail, User, Loader } from "lucide-react";

const ProfilePage = () => {
  const { authUser, isUpdatingProfile, updateProfile } = useAuthStore();
  const [selectedImg, setSelectedImg] = useState(null);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = async () => {
      const base64Image = reader.result;
      setSelectedImg(base64Image);
      await updateProfile({ profilePic: base64Image });
    };

    reader.readAsDataURL(file);
  };

  return (
    <div className="min-h-screen pt-20 pb-10">
      <div className="max-w-2xl mx-auto p-4">
        <div className="bg-base-300 rounded-2xl p-6 space-y-8 shadow-xl">
          <div className="text-center">
            <h1 className="text-2xl font-bold">Profile</h1>
            <p className="mt-1 text-sm text-base-content/60">Your profile information</p>
          </div>

          {/* Avatar Upload */}
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <img
                src={selectedImg || authUser.profilePic || "/avatar.png"}
                alt="Profile Avatar"
                className="size-32 object-cover rounded-full border-4 border-base-100"
                onError={(e) => {
                  e.target.src = "https://cdn-icons-png.flaticon.com/512/149/149071.png";
                }}
              />
              <label
                htmlFor="avatar-upload"
                className={`
                  absolute bottom-0 right-0 
                  bg-base-content hover:scale-105
                  p-2.5 rounded-full cursor-pointer 
                  transition-all duration-200
                  ${isUpdatingProfile ? "animate-pulse pointer-events-none" : ""}
                `}
              >
                {isUpdatingProfile ? (
                  <Loader className="w-5 h-5 text-base-300 animate-spin" />
                ) : (
                  <Camera className="w-5 h-5 text-base-300" />
                )}
                <input
                  type="file"
                  id="avatar-upload"
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={isUpdatingProfile}
                />
              </label>
            </div>
            <p className="text-xs text-base-content/60">
              {isUpdatingProfile ? "Uploading..." : "Click the camera icon to update your photo"}
            </p>
          </div>

          {/* User Fields */}
          <div className="space-y-6">
            <div className="space-y-1.5">
              <div className="text-sm text-base-content/60 flex items-center gap-2">
                <User className="w-4 h-4" />
                Full Name
              </div>
              <p className="px-4 py-2.5 bg-base-200 rounded-lg border border-base-300">
                {authUser?.fullName}
              </p>
            </div>

            <div className="space-y-1.5">
              <div className="text-sm text-base-content/60 flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Email Address
              </div>
              <p className="px-4 py-2.5 bg-base-200 rounded-lg border border-base-300">
                {authUser?.email}
              </p>
            </div>
          </div>

          {/* Info Details Section */}
          <div className="bg-base-200 rounded-xl p-6 border border-base-300">
            <h2 className="text-lg font-medium mb-4">Account Information</h2>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between border-b border-base-300 pb-2">
                <span className="text-base-content/60">Member Since</span>
                <span>{authUser?.createdAt ? new Date(authUser.createdAt).toLocaleDateString() : "Recently"}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-base-content/60">Account Status</span>
                <span className="text-success font-medium">Active</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
