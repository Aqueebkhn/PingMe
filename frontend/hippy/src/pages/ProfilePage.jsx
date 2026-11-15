import React, { useState } from "react";
import { useAuthStore } from "../store/useAuthStore.js";
import { BadgeCheck, Camera, CalendarDays, Mail, ShieldCheck, UserRound, Loader } from "lucide-react";
import toast from "react-hot-toast";

const ProfilePage = () => {
  const { authUser, isUpdatingProfile, updateProfile } = useAuthStore();
  const [selectedImg, setSelectedImg] = useState(null);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Choose an image file to update your photo");
      e.target.value = "";
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Profile photos must be 5 MB or smaller");
      e.target.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = async () => {
      if (typeof reader.result !== "string") {
        toast.error("Could not read the selected photo");
        return;
      }
      const updated = await updateProfile({ profilePic: reader.result });
      if (updated) setSelectedImg(reader.result);
    };
    reader.onerror = () => toast.error("Could not read the selected photo");
    reader.readAsDataURL(file);
  };

  const fullName = authUser?.fullName ?? authUser?.fullname ?? "PingMe member";
  const memberSince = authUser?.createdAt
    ? new Date(authUser.createdAt).toLocaleDateString(undefined, { month: "long", year: "numeric" })
    : "Recently joined";

  return (
    <main className="min-h-screen px-4 pb-12 pt-24 sm:px-6">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-primary">Your account</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight sm:text-4xl">Profile</h1>
          <p className="mt-2 text-sm text-base-content/55">Manage your photo and view your account details.</p>
        </div>

        <section className="app-shell overflow-hidden rounded-3xl border border-base-300/70 bg-base-100">
          <div className="relative h-36 overflow-hidden bg-gradient-to-br from-primary via-primary/80 to-secondary sm:h-48">
            <div className="absolute -right-10 -top-24 size-72 rounded-full border border-white/15" />
            <div className="absolute -right-2 -top-16 size-56 rounded-full border border-white/15" />
            <div className="absolute -bottom-28 left-1/3 size-64 rounded-full border border-white/10" />
            <div className="absolute bottom-5 left-5 flex items-center gap-2 rounded-full bg-black/10 px-3 py-1.5 text-xs font-medium text-white backdrop-blur sm:left-8">
              <ShieldCheck className="size-4" />
              Personal account
            </div>
          </div>

          <div className="px-5 pb-6 sm:px-8 sm:pb-8">
            <div className="-mt-12 flex flex-col gap-4 sm:-mt-14 sm:flex-row sm:items-end sm:justify-between">
              <div className="relative size-24 shrink-0 sm:size-28">
                <img
                  src={selectedImg || authUser?.profilePic || "/avatar.png"}
                  alt={`${fullName} profile`}
                  className="size-full rounded-3xl border-4 border-base-100 bg-base-200 object-cover shadow-lg"
                  onError={(e) => {
                    e.currentTarget.src = "https://cdn-icons-png.flaticon.com/512/149/149071.png";
                  }}
                />
                <label
                  htmlFor="avatar-upload"
                  title="Change profile photo"
                  className={`absolute -bottom-2 -right-2 flex size-10 cursor-pointer items-center justify-center rounded-2xl border-4 border-base-100 bg-primary text-primary-content shadow-md transition-transform hover:scale-105 ${
                    isUpdatingProfile ? "pointer-events-none opacity-70" : ""
                  }`}
                >
                  {isUpdatingProfile ? <Loader className="size-4 animate-spin" /> : <Camera className="size-4" />}
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

              <div className="flex flex-col gap-3 sm:items-end">
                <div className="flex items-center gap-2 rounded-full bg-success/10 px-3 py-1.5 text-xs font-semibold text-success">
                  <span className="size-2 rounded-full bg-success" />
                  Account active
                </div>
                <p className="text-xs text-base-content/45">
                  {isUpdatingProfile ? "Uploading your photo..." : "Use the camera button to update your photo"}
                </p>
              </div>
            </div>

            <div className="mt-5 border-b border-base-300/70 pb-6">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-2xl font-bold tracking-tight">{fullName}</h2>
                <BadgeCheck className="size-5 text-primary" aria-label="PingMe account" />
              </div>
              <p className="mt-1 text-sm text-base-content/55">PingMe community member</p>
            </div>

            <div className="grid gap-3 pt-5 sm:grid-cols-2">
              <div className="rounded-2xl border border-base-300/70 bg-base-200/45 p-4">
                <div className="mb-3 flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Mail className="size-4" />
                </div>
                <p className="text-xs font-medium uppercase tracking-wide text-base-content/45">Email address</p>
                <p className="mt-1 break-all text-sm font-semibold">{authUser?.email || "Not available"}</p>
              </div>

              <div className="rounded-2xl border border-base-300/70 bg-base-200/45 p-4">
                <div className="mb-3 flex size-9 items-center justify-center rounded-xl bg-secondary/15 text-secondary">
                  <CalendarDays className="size-4" />
                </div>
                <p className="text-xs font-medium uppercase tracking-wide text-base-content/45">Member since</p>
                <p className="mt-1 text-sm font-semibold">{memberSince}</p>
              </div>

              <div className="rounded-2xl border border-base-300/70 bg-base-200/45 p-4 sm:col-span-2">
                <div className="flex items-center gap-3">
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-accent/15 text-accent">
                    <UserRound className="size-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-medium uppercase tracking-wide text-base-content/45">Display name</p>
                    <p className="mt-1 truncate text-sm font-semibold">{fullName}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
};

export default ProfilePage;
