"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useMarketplace } from "@/context/MarketplaceContext";
import { ProductGrid } from "@/components/products/ProductGrid";
import { Button } from "@/components/common/Button";
import { Breadcrumb } from "@/components/common/Breadcrumb";
import { EmptyState } from "@/components/common/EmptyState";
import { MOCK_PRODUCTS } from "@/data/products";
import { formatPrice } from "@/lib/utils";
import {
  getMyAds,
  deleteAd,
  updateAd,
  BackendAdvertisement,
} from "@/lib/advertisementApi";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Plus,
  LogOut,
  PackageCheck,
  Heart,
  ShieldCheck,
  Edit3,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Trash2,
  ExternalLink,
  RefreshCw,
  Loader2,
  X,
} from "lucide-react";

export default function ProfilePage() {
  const { user, logout, userAds, wishlist } = useMarketplace();
  const [activeTab, setActiveTab] = useState<"my-ads" | "wishlist">("my-ads");
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "approved" | "rejected">("all");

  // Real backend ads state
  const [backendAds, setBackendAds] = useState<BackendAdvertisement[]>([]);
  const [isLoadingAds, setIsLoadingAds] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  // Edit / Resubmit modal state
  const [editingAd, setEditingAd] = useState<BackendAdvertisement | null>(null);
  const [editForm, setEditForm] = useState({
    title: "",
    price: "",
    description: "",
  });
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchUserAds = async () => {
    setIsLoadingAds(true);
    try {
      const ads = await getMyAds();
      setBackendAds(ads);
    } catch {
      // ignore
    } finally {
      setIsLoadingAds(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchUserAds();
    }
  }, [user]);

  const handleDeleteAd = async (id: string) => {
    if (!confirm("Are you sure you want to permanently delete this advertisement?")) return;
    setActionLoadingId(id);
    try {
      await deleteAd(id);
      setBackendAds((prev) => prev.filter((a) => a._id !== id));
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to delete advertisement.");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleOpenEdit = (ad: BackendAdvertisement) => {
    setEditingAd(ad);
    setEditForm({
      title: ad.title,
      price: ad.price.toString(),
      description: ad.description || "",
    });
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAd) return;

    setIsUpdating(true);
    try {
      const res = await updateAd(editingAd._id, {
        title: editForm.title,
        price: Number(editForm.price),
        description: editForm.description,
      });

      alert(res.message || "Advertisement updated successfully!");
      setEditingAd(null);
      await fetchUserAds();
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to update advertisement.");
    } finally {
      setIsUpdating(false);
    }
  };

  if (!user) {
    return (
      <div className="py-12">
        <EmptyState
          icon={<User className="w-8 h-8 text-slate-400" />}
          title="Please log in to view your profile"
          description="Log in to manage your active advertisements, see buyer enquiries, and update profile settings."
          actionText="Log In Now"
          actionHref="/login"
        />
      </div>
    );
  }

  // Saved items from wishlist
  const savedAds = [...userAds, ...MOCK_PRODUCTS].filter((p) => wishlist.includes(p.id));

  // Filter backend ads
  const filteredAds = backendAds.filter((ad) => {
    if (statusFilter === "all") return true;
    return ad.status === statusFilter;
  });

  const pendingCount = backendAds.filter((a) => a.status === "pending").length;
  const approvedCount = backendAds.filter((a) => a.status === "approved").length;
  const rejectedCount = backendAds.filter((a) => a.status === "rejected").length;

  const breadcrumbItems = [{ label: "My Profile" }];

  return (
    <div className="space-y-6">
      <Breadcrumb items={breadcrumbItems} />

      {/* User Header Profile Card */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden border-4 border-slate-100 shadow-sm shrink-0">
              <Image
                src={user.avatar}
                alt={user.name}
                width={96}
                height={96}
                unoptimized
                className="w-full h-full object-cover"
              />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900">{user.name}</h1>
                <span className="p-1 rounded-md bg-emerald-50 text-emerald-600" title="Verified Account">
                  <ShieldCheck className="w-4 h-4" />
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                <div className="flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span>{user.email}</span>
                </div>
                <span>•</span>
                <div className="flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span>{user.phone}</span>
                </div>
                <span>•</span>
                <div className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>{user.city}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            <Link href="/profile/edit" className="flex-1 sm:flex-none">
              <Button
                variant="outline"
                size="md"
                leftIcon={<Edit3 className="w-4 h-4 text-[#0047BA]" />}
                className="w-full sm:w-auto font-bold border-2 border-slate-300 text-slate-800 hover:border-[#0047BA] hover:text-[#0047BA]"
              >
                Edit Profile
              </Button>
            </Link>
            <Link href="/post-ad" className="flex-1 sm:flex-none">
              <Button
                variant="sell"
                size="md"
                leftIcon={<Plus className="w-4 h-4 stroke-[3]" />}
                className="w-full sm:w-auto"
              >
                Post Ad
              </Button>
            </Link>
            <Button
              variant="outline"
              size="md"
              leftIcon={<LogOut className="w-4 h-4" />}
              onClick={logout}
            >
              Logout
            </Button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveTab("my-ads")}
          className={`flex items-center gap-2 pb-3 px-4 text-sm font-bold transition-colors relative cursor-pointer ${
            activeTab === "my-ads"
              ? "text-[#0047BA] border-b-2 border-[#0047BA]"
              : "text-slate-400 hover:text-slate-600"
          }`}
        >
          <PackageCheck className="w-4 h-4" />
          <span>My Posted Advertisements ({backendAds.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("wishlist")}
          className={`flex items-center gap-2 pb-3 px-4 text-sm font-bold transition-colors relative cursor-pointer ${
            activeTab === "wishlist"
              ? "text-[#0047BA] border-b-2 border-[#0047BA]"
              : "text-slate-400 hover:text-slate-600"
          }`}
        >
          <Heart className="w-4 h-4" />
          <span>Saved Advertisements ({savedAds.length})</span>
        </button>
      </div>

      {/* Tab Contents: My Ads */}
      {activeTab === "my-ads" && (
        <div className="space-y-4">
          {/* Status Sub-Filters */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => setStatusFilter("all")}
                className={`text-xs px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                  statusFilter === "all"
                    ? "bg-[#0A2540] text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                All ({backendAds.length})
              </button>
              <button
                onClick={() => setStatusFilter("pending")}
                className={`text-xs px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  statusFilter === "pending"
                    ? "bg-amber-500 text-white"
                    : "bg-amber-50 text-amber-700 hover:bg-amber-100"
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>Pending Approval ({pendingCount})</span>
              </button>
              <button
                onClick={() => setStatusFilter("approved")}
                className={`text-xs px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  statusFilter === "approved"
                    ? "bg-emerald-600 text-white"
                    : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Live & Approved ({approvedCount})</span>
              </button>
              <button
                onClick={() => setStatusFilter("rejected")}
                className={`text-xs px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  statusFilter === "rejected"
                    ? "bg-rose-600 text-white"
                    : "bg-rose-50 text-rose-700 hover:bg-rose-100"
                }`}
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Rejected ({rejectedCount})</span>
              </button>
            </div>

            <button
              onClick={fetchUserAds}
              disabled={isLoadingAds}
              className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1.5 font-medium cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoadingAds ? "animate-spin" : ""}`} />
              <span>Refresh</span>
            </button>
          </div>

          {/* Advertisements List */}
          {isLoadingAds ? (
            <div className="py-12 text-center text-slate-400 space-y-2">
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#00A896]" />
              <p className="text-sm">Loading your advertisements...</p>
            </div>
          ) : filteredAds.length > 0 ? (
            <div className="space-y-4">
              {filteredAds.map((ad) => {
                const coverImg =
                  ad.images && ad.images.length > 0
                    ? typeof ad.images[0] === "string"
                      ? ad.images[0]
                      : ad.images[0].url
                    : "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80";

                return (
                  <div
                    key={ad._id}
                    className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-all hover:border-slate-300"
                  >
                    <div className="flex items-start sm:items-center gap-4 flex-1 min-w-0">
                      <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden bg-slate-100 shrink-0 border border-slate-200">
                        <Image
                          src={coverImg}
                          alt={ad.title}
                          fill
                          sizes="96px"
                          className="object-cover"
                        />
                      </div>
                      <div className="min-w-0 space-y-1.5 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            className={`text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1 ${
                              ad.status === "approved"
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : ad.status === "pending"
                                ? "bg-amber-50 text-amber-700 border border-amber-200"
                                : "bg-rose-50 text-rose-700 border border-rose-200"
                            }`}
                          >
                            {ad.status === "approved" && <CheckCircle2 className="w-3 h-3" />}
                            {ad.status === "pending" && <Clock className="w-3 h-3" />}
                            {ad.status === "rejected" && <AlertTriangle className="w-3 h-3" />}
                            <span>
                              {ad.status === "approved"
                                ? "Approved / Live"
                                : ad.status === "pending"
                                ? "Pending Review"
                                : "Rejected"}
                            </span>
                          </span>

                          <span className="text-xs text-slate-400 capitalize">
                            Category: {ad.category}
                          </span>
                        </div>

                        <h3 className="font-bold text-slate-900 text-base truncate">
                          {ad.title}
                        </h3>

                        <div className="flex items-center gap-3 text-xs text-slate-500">
                          <span className="font-extrabold text-[#00A896] text-sm">
                            {formatPrice(ad.price)}
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-slate-400" />
                            {ad.location?.city || "Kathmandu"}
                          </span>
                          <span>•</span>
                          <span>
                            Submitted {new Date(ad.createdAt).toLocaleDateString()}
                          </span>
                        </div>

                        {/* Rejection notice callout if rejected */}
                        {ad.status === "rejected" && (
                          <div className="mt-2 p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 space-y-1">
                            <p className="font-bold flex items-center gap-1">
                              <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                              Rejection Reason:
                            </p>
                            <p className="italic">
                              &quot;{ad.rejectionReason || "Listing does not comply with community guidelines."}&quot;
                            </p>
                            <p className="text-[11px] text-rose-600 font-medium pt-0.5">
                              Click &quot;Edit & Resubmit&quot; to update this ad and send it back to the moderation queue.
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 shrink-0 w-full md:w-auto justify-end border-t md:border-t-0 pt-3 md:pt-0 border-slate-100">
                      {ad.status === "approved" && (
                        <Link href={`/product/${ad.slug}`}>
                          <Button
                            variant="outline"
                            size="sm"
                            leftIcon={<ExternalLink className="w-3.5 h-3.5" />}
                          >
                            View Live
                          </Button>
                        </Link>
                      )}

                      <Button
                        variant={ad.status === "rejected" ? "primary" : "outline"}
                        size="sm"
                        onClick={() => handleOpenEdit(ad)}
                        leftIcon={<Edit3 className="w-3.5 h-3.5" />}
                      >
                        {ad.status === "rejected" ? "Edit & Resubmit" : "Edit"}
                      </Button>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteAd(ad._id)}
                        disabled={actionLoadingId === ad._id}
                        className="text-rose-600 hover:bg-rose-50"
                      >
                        {actionLoadingId === ad._id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <EmptyState
              icon={<PackageCheck className="w-8 h-8 text-slate-400" />}
              title="No advertisements found in this filter"
              description="Post an advertisement to sell your electronics, vehicles, or items across Nepal."
              actionText="Post an Advertisement"
              actionHref="/post-ad"
            />
          )}
        </div>
      )}

      {/* Tab Contents: Wishlist */}
      {activeTab === "wishlist" && (
        <div className="space-y-4">
          {savedAds.length > 0 ? (
            <ProductGrid products={savedAds} />
          ) : (
            <EmptyState
              icon={<Heart className="w-8 h-8 text-rose-400" />}
              title="No saved advertisements"
              description="Browse the marketplace and bookmark ads by clicking the heart button."
              actionText="Explore Marketplace"
              actionHref="/"
            />
          )}
        </div>
      )}

      {/* Edit / Resubmit Modal */}
      {editingAd && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-slate-200 space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-black text-slate-900">
                  {editingAd.status === "rejected" ? "Edit & Resubmit Advertisement" : "Edit Advertisement"}
                </h3>
                <p className="text-xs text-slate-500">
                  {editingAd.status === "rejected"
                    ? "Resubmitting will send your advertisement back to the Superadmin moderation queue."
                    : "Update your advertisement details."}
                </p>
              </div>
              <button
                onClick={() => setEditingAd(null)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4 text-left">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Ad Title</label>
                <input
                  type="text"
                  value={editForm.title}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, title: e.target.value }))}
                  required
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#00A896]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Price (NPR)</label>
                <input
                  type="number"
                  value={editForm.price}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, price: e.target.value }))}
                  required
                  min="0"
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#00A896]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Description</label>
                <textarea
                  rows={4}
                  value={editForm.description}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, description: e.target.value }))}
                  required
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#00A896]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditingAd(null)}
                  disabled={isUpdating}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="sell"
                  disabled={isUpdating}
                  leftIcon={isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : undefined}
                >
                  {isUpdating ? "Saving..." : editingAd.status === "rejected" ? "Resubmit for Approval" : "Save Changes"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
