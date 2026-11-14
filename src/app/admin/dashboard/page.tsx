"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import api from "@/lib/api";
import { formatPrice } from "@/lib/utils";
import {
  LayoutDashboard,
  Clock,
  CheckCircle2,
  XCircle,
  FileText,
  Users,
  ShieldCheck,
  LogOut,
  ChevronRight,
  Menu,
  X,
  Search,
  Filter,
  Eye,
  Check,
  AlertTriangle,
  RotateCw,
  Star,
  MapPin,
  Calendar,
  User as UserIcon,
  Phone,
  Mail,
  SlidersHorizontal,
  ExternalLink,
  Shield,
  History,
} from "lucide-react";

interface AdminStats {
  totalAds: number;
  pendingAds: number;
  approvedAds: number;
  rejectedAds: number;
  totalUsers: number;
}

interface AdvertisementItem {
  _id: string;
  title: string;
  slug: string;
  description: string;
  price: number;
  category: string;
  subCategory?: string;
  condition: string;
  images: { url: string; publicId?: string }[];
  location: { state?: string; city: string; area?: string; pincode?: string };
  seller?: {
    _id: string;
    name: string;
    email: string;
    phone: string;
    city: string;
    avatar?: string;
    isVerified?: boolean;
    createdAt?: string;
  };
  sellerContact?: { name: string; phone: string; email: string };
  attributes?: Record<string, any>;
  status: "pending" | "approved" | "rejected";
  rejectionReason?: string;
  approvedBy?: { name: string; email: string };
  approvedAt?: string;
  isFeatured?: boolean;
  viewsCount?: number;
  createdAt: string;
}

interface AdminUserItem {
  _id: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  avatar?: string;
  role: string;
  status: "active" | "suspended";
  isSuspended: boolean;
  isVerified: boolean;
  adCount: number;
  createdAt: string;
}

interface AuditLogItem {
  _id: string;
  admin: { name: string; email: string; avatar?: string };
  action: string;
  targetType: string;
  metadata?: any;
  createdAt: string;
}

export default function SuperadminDashboardPage() {
  const router = useRouter();

  // Navigation & UI States
  const [activeTab, setActiveTab] = useState<
    "dashboard" | "pending" | "approved" | "rejected" | "all" | "users" | "audit"
  >("dashboard");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Data States
  const [stats, setStats] = useState<AdminStats>({
    totalAds: 0,
    pendingAds: 0,
    approvedAds: 0,
    rejectedAds: 0,
    totalUsers: 0,
  });
  const [advertisements, setAdvertisements] = useState<AdvertisementItem[]>([]);
  const [users, setUsers] = useState<AdminUserItem[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([]);

  // Action Feedback & Modal States
  const [reviewAd, setReviewAd] = useState<AdvertisementItem | null>(null);
  const [activeReviewImg, setActiveReviewImg] = useState<number>(0);
  const [rejectionModalAd, setRejectionModalAd] = useState<AdvertisementItem | null>(null);
  const [rejectionReasonInput, setRejectionReasonInput] = useState("");
  const [actionSuccessMessage, setActionSuccessMessage] = useState<string | null>(null);
  const [isActionLoading, setIsActionLoading] = useState(false);

  // Show temporary toast feedback
  const showToast = (msg: string) => {
    setActionSuccessMessage(msg);
    setTimeout(() => setActionSuccessMessage(null), 4000);
  };

  // Fetch Dashboard Statistics
  const fetchStats = useCallback(async () => {
    try {
      const res = await api.get("/admin/stats");
      if (res.data.success) {
        setStats(res.data.stats);
      }
    } catch {
      // ignore
    }
  }, []);

  // Fetch Advertisements based on active tab
  const fetchAdvertisements = useCallback(async () => {
    setIsLoading(true);
    try {
      const statusParam =
        activeTab === "pending"
          ? "pending"
          : activeTab === "approved"
          ? "approved"
          : activeTab === "rejected"
          ? "rejected"
          : "all";

      const res = await api.get("/admin/advertisements", {
        params: {
          status: statusParam,
          search: searchTerm || undefined,
          limit: 50,
        },
      });

      if (res.data.success) {
        setAdvertisements(res.data.advertisements);
      }
    } catch (err: any) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        router.push("/admin");
      }
    } finally {
      setIsLoading(false);
    }
  }, [activeTab, searchTerm, router]);

  // Fetch Users
  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await api.get("/admin/users", {
        params: { search: searchTerm || undefined },
      });
      if (res.data.success) {
        setUsers(res.data.users);
      }
    } catch {
      // ignore
    } finally {
      setIsLoading(false);
    }
  }, [searchTerm]);

  // Fetch Audit Logs
  const fetchAuditLogs = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await api.get("/admin/audit-logs");
      if (res.data.success) {
        setAuditLogs(res.data.logs);
      }
    } catch {
      // ignore
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial authentication check & data load
  useEffect(() => {
    const token = localStorage.getItem("dealdoko_token");
    if (!token) {
      router.push("/admin");
      return;
    }

    fetchStats();

    if (activeTab === "users") {
      fetchUsers();
    } else if (activeTab === "audit") {
      fetchAuditLogs();
    } else {
      fetchAdvertisements();
    }
  }, [activeTab, fetchStats, fetchAdvertisements, fetchUsers, fetchAuditLogs, router]);

  // Approve Advertisement handler
  const handleApproveAd = async (adId: string) => {
    setIsActionLoading(true);
    try {
      const res = await api.put(`/admin/advertisements/${adId}/approve`);
      if (res.data.success) {
        showToast("Advertisement approved! It is now live on DealDoko marketplace.");
        setReviewAd(null);
        fetchStats();
        fetchAdvertisements();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to approve advertisement.");
    } finally {
      setIsActionLoading(false);
    }
  };

  // Open Rejection Dialog
  const openRejectDialog = (ad: AdvertisementItem) => {
    setRejectionModalAd(ad);
    setRejectionReasonInput(
      "Inappropriate content or pricing details require verification. Please update your photos and description."
    );
  };

  // Confirm Rejection handler
  const handleConfirmReject = async () => {
    if (!rejectionModalAd) return;
    if (!rejectionReasonInput.trim()) {
      alert("Please provide a rejection reason for the seller.");
      return;
    }

    setIsActionLoading(true);
    try {
      const res = await api.put(`/admin/advertisements/${rejectionModalAd._id}/reject`, {
        reason: rejectionReasonInput.trim(),
      });
      if (res.data.success) {
        showToast("Advertisement rejected. Seller has received real-time feedback.");
        setRejectionModalAd(null);
        setReviewAd(null);
        fetchStats();
        fetchAdvertisements();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to reject advertisement.");
    } finally {
      setIsActionLoading(false);
    }
  };

  // Toggle Featured Status
  const handleToggleFeatured = async (adId: string) => {
    try {
      const res = await api.put(`/admin/advertisements/${adId}/featured`);
      if (res.data.success) {
        showToast(
          res.data.isFeatured
            ? "Advertisement promoted to Featured Homepage tier!"
            : "Featured status removed."
        );
        fetchAdvertisements();
      }
    } catch {
      alert("Failed to toggle featured status.");
    }
  };

  // Toggle User Suspension
  const handleToggleUserStatus = async (userId: string) => {
    try {
      const res = await api.put(`/admin/users/${userId}/status`);
      if (res.data.success) {
        showToast(res.data.message);
        fetchUsers();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to update user status.");
    }
  };

  // Logout handler
  const handleLogout = () => {
    localStorage.removeItem("dealdoko_token");
    localStorage.removeItem("dealdoko_admin_user");
    router.push("/admin");
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col -mx-4 -mt-4 sm:-mx-6 sm:-mt-6">
      {/* Top Admin Header Bar */}
      <header className="h-16 bg-slate-950/80 border-b border-slate-800 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsSidebarOpen((prev) => !prev)}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#0047BA] to-blue-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <Shield className="w-4 h-4 stroke-[2.5]" />
            </div>
            <div>
              <h1 className="text-sm font-black text-white tracking-wide flex items-center gap-2">
                <span>DealDoko</span>
                <span className="text-[10px] font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30 px-1.5 py-0.5 rounded">
                  SUPERADMIN
                </span>
              </h1>
            </div>
          </div>
        </div>

        {/* Right Admin Profile & Status */}
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2 text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-1 rounded-full">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>MongoDB &amp; Socket.IO Live</span>
          </div>

          <Link
            href="/"
            target="_blank"
            className="hidden md:flex items-center gap-1.5 text-xs text-slate-300 hover:text-white font-semibold transition-colors"
          >
            <span>View Marketplace</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>

          <button
            onClick={handleLogout}
            title="Sign out of Superadmin"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-rose-600/20 hover:text-rose-400 text-xs font-bold text-slate-300 transition-all cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <div className="flex-1 flex overflow-hidden">
        {/* Collapsible Sidebar */}
        <aside
          className={`${
            isSidebarOpen ? "w-64" : "w-16"
          } transition-all duration-200 bg-slate-950/60 border-r border-slate-800 shrink-0 flex flex-col justify-between py-4 select-none`}
        >
          {/* Navigation Items */}
          <nav className="space-y-1 px-2">
            {[
              { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
              {
                id: "pending",
                label: "Pending Approvals",
                icon: Clock,
                badge: stats.pendingAds,
                badgeColor: "bg-amber-500 text-slate-950",
              },
              {
                id: "approved",
                label: "Approved Live Ads",
                icon: CheckCircle2,
                badge: stats.approvedAds,
                badgeColor: "bg-emerald-500/20 text-emerald-400",
              },
              { id: "rejected", label: "Rejected Ads", icon: XCircle },
              { id: "all", label: "All Advertisements", icon: FileText },
              {
                id: "users",
                label: "User Management",
                icon: Users,
                badge: stats.totalUsers,
                badgeColor: "bg-blue-500/20 text-blue-400",
              },
              { id: "audit", label: "Audit Logs", icon: History },
            ].map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id as any);
                    setSearchTerm("");
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    isActive
                      ? "bg-[#0047BA] text-white shadow-md shadow-blue-600/20"
                      : "text-slate-400 hover:text-white hover:bg-slate-800/60"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4 shrink-0" />
                    {isSidebarOpen && <span>{item.label}</span>}
                  </div>

                  {isSidebarOpen && item.badge !== undefined && (
                    <span
                      className={`text-[10px] font-black px-1.5 py-0.5 rounded-md ${
                        item.badgeColor || "bg-slate-800 text-slate-300"
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Sidebar Footer info */}
          {isSidebarOpen && (
            <div className="px-4 py-3 border-t border-slate-800/80 text-[11px] text-slate-500">
              <p className="font-semibold text-slate-400">DealDheko Core v1.0</p>
              <p>Himalayan Cloud Platform</p>
            </div>
          )}
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto space-y-6">
          {/* Notification Toast */}
          {actionSuccessMessage && (
            <div className="bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold px-4 py-3 rounded-2xl flex items-center justify-between shadow-lg animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{actionSuccessMessage}</span>
              </div>
              <button
                onClick={() => setActionSuccessMessage(null)}
                className="text-emerald-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Section A: Statistics Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
            {/* Total Ads */}
            <div className="bg-slate-800/60 border border-slate-800 rounded-2xl p-4 space-y-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Total Ads
              </span>
              <p className="text-2xl font-black text-white">{stats.totalAds}</p>
              <span className="text-[10px] text-slate-500">All submissions</span>
            </div>

            {/* Pending Approvals (Mandatory Stage) */}
            <div
              onClick={() => setActiveTab("pending")}
              className="bg-amber-500/10 border border-amber-500/30 hover:border-amber-500/60 rounded-2xl p-4 space-y-1 cursor-pointer transition-colors"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">
                  Pending Review
                </span>
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
              </div>
              <p className="text-2xl font-black text-amber-400">{stats.pendingAds}</p>
              <span className="text-[10px] text-amber-300/80">Requires your approval →</span>
            </div>

            {/* Approved Live */}
            <div
              onClick={() => setActiveTab("approved")}
              className="bg-emerald-500/10 border border-emerald-500/30 hover:border-emerald-500/60 rounded-2xl p-4 space-y-1 cursor-pointer transition-colors"
            >
              <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">
                Approved Live
              </span>
              <p className="text-2xl font-black text-emerald-400">{stats.approvedAds}</p>
              <span className="text-[10px] text-emerald-300/80">Publicly visible</span>
            </div>

            {/* Rejected */}
            <div
              onClick={() => setActiveTab("rejected")}
              className="bg-rose-500/10 border border-rose-500/30 hover:border-rose-500/60 rounded-2xl p-4 space-y-1 cursor-pointer transition-colors"
            >
              <span className="text-[11px] font-bold text-rose-400 uppercase tracking-wider">
                Rejected
              </span>
              <p className="text-2xl font-black text-rose-400">{stats.rejectedAds}</p>
              <span className="text-[10px] text-rose-300/80">Awaiting seller resubmit</span>
            </div>

            {/* Registered Users */}
            <div
              onClick={() => setActiveTab("users")}
              className="bg-blue-500/10 border border-blue-500/30 hover:border-blue-500/60 rounded-2xl p-4 space-y-1 cursor-pointer transition-colors"
            >
              <span className="text-[11px] font-bold text-blue-400 uppercase tracking-wider">
                Total Users
              </span>
              <p className="text-2xl font-black text-blue-400">{stats.totalUsers}</p>
              <span className="text-[10px] text-blue-300/80">Registered sellers &amp; buyers</span>
            </div>
          </div>

          {/* Section B: Tab Specific Controls (Search & Refresh) */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
            <div>
              <h2 className="text-lg font-black text-white capitalize flex items-center gap-2">
                <span>
                  {activeTab === "pending"
                    ? "Pending Advertisements (Awaiting Approval)"
                    : activeTab === "approved"
                    ? "Approved Live Advertisements"
                    : activeTab === "rejected"
                    ? "Rejected Advertisements"
                    : activeTab === "users"
                    ? "Registered Users Directory"
                    : activeTab === "audit"
                    ? "Superadmin Action Audit Trail"
                    : "Marketplace Advertisements Registry"}
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                {activeTab === "pending"
                  ? "Carefully review product images and seller details before publishing to public marketplace."
                  : "Live data directly synchronized with MongoDB Atlas."}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative flex-1 sm:w-64">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search by title, seller, city..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>

              <button
                onClick={() => {
                  fetchStats();
                  if (activeTab === "users") fetchUsers();
                  else if (activeTab === "audit") fetchAuditLogs();
                  else fetchAdvertisements();
                }}
                title="Refresh from MongoDB"
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
              >
                <RotateCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
              </button>
            </div>
          </div>

          {/* Section C: Tab Contents */}
          {activeTab === "users" ? (
            /* Users Table */
            <div className="bg-slate-800/40 border border-slate-800 rounded-3xl overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950/60 border-b border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    <tr>
                      <th className="py-3 px-4">User</th>
                      <th className="py-3 px-4">Contact</th>
                      <th className="py-3 px-4">City</th>
                      <th className="py-3 px-4">Role</th>
                      <th className="py-3 px-4">Total Ads</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-slate-300">
                    {users.map((u) => (
                      <tr key={u._id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full overflow-hidden bg-slate-700 border border-slate-600 shrink-0">
                              <Image
                                src={
                                  u.avatar ||
                                  "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80"
                                }
                                alt={u.name}
                                width={32}
                                height={32}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div>
                              <p className="font-bold text-white">{u.name}</p>
                              <p className="text-[10px] text-slate-400">
                                Joined {new Date(u.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 font-mono text-[11px]">
                          <div>{u.email}</div>
                          <div className="text-slate-400">{u.phone}</div>
                        </td>
                        <td className="py-3 px-4">{u.city || "Kathmandu"}</td>
                        <td className="py-3 px-4">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                              u.role === "superadmin"
                                ? "bg-purple-500/20 text-purple-400 border border-purple-500/30"
                                : "bg-slate-700 text-slate-300"
                            }`}
                          >
                            {u.role}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-bold text-white">{u.adCount} ads</td>
                        <td className="py-3 px-4">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                              u.isSuspended || u.status === "suspended"
                                ? "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                                : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                            }`}
                          >
                            {u.isSuspended || u.status === "suspended" ? "Suspended" : "Active"}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          {u.role !== "superadmin" && (
                            <button
                              onClick={() => handleToggleUserStatus(u._id)}
                              className={`px-3 py-1 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
                                u.isSuspended
                                  ? "bg-emerald-600 hover:bg-emerald-500 text-white"
                                  : "bg-rose-600/30 hover:bg-rose-600 text-rose-300 hover:text-white"
                              }`}
                            >
                              {u.isSuspended ? "Re-activate" : "Suspend"}
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : activeTab === "audit" ? (
            /* Audit Logs Table */
            <div className="bg-slate-800/40 border border-slate-800 rounded-3xl overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950/60 border-b border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    <tr>
                      <th className="py-3 px-4">Timestamp</th>
                      <th className="py-3 px-4">Administrator</th>
                      <th className="py-3 px-4">Action</th>
                      <th className="py-3 px-4">Target Type</th>
                      <th className="py-3 px-4">Summary</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-slate-300">
                    {auditLogs.map((log) => (
                      <tr key={log._id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-3 px-4 font-mono text-[11px] text-slate-400">
                          {new Date(log.createdAt).toLocaleString()}
                        </td>
                        <td className="py-3 px-4 font-bold text-white">
                          {log.admin?.name || "Superadmin"}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                              log.action === "ad_approved"
                                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                                : log.action === "ad_rejected"
                                ? "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                                : "bg-blue-500/20 text-blue-400"
                            }`}
                          >
                            {log.action}
                          </span>
                        </td>
                        <td className="py-3 px-4 uppercase text-[10px] font-semibold text-slate-400">
                          {log.targetType}
                        </td>
                        <td className="py-3 px-4 text-xs text-slate-300">
                          {log.metadata?.title || JSON.stringify(log.metadata || {})}
                        </td>
                      </tr>
                    ))}
                    {auditLogs.length === 0 && (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-slate-500">
                          No audit log entries recorded yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            /* Advertisements Table / Cards */
            <div className="bg-slate-800/40 border border-slate-800 rounded-3xl overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950/60 border-b border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    <tr>
                      <th className="py-3 px-4">Thumbnail</th>
                      <th className="py-3 px-4">Title &amp; Category</th>
                      <th className="py-3 px-4">Price</th>
                      <th className="py-3 px-4">Seller</th>
                      <th className="py-3 px-4">Location</th>
                      <th className="py-3 px-4">Submitted</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Moderation Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-slate-300">
                    {advertisements.map((ad) => {
                      const coverImg =
                        ad.images[0]?.url ||
                        "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=400&q=80";

                      return (
                        <tr key={ad._id} className="hover:bg-slate-800/40 transition-colors">
                          {/* Thumbnail */}
                          <td className="py-3 px-4">
                            <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-slate-700 border border-slate-600 shrink-0">
                              <Image
                                src={coverImg}
                                alt={ad.title}
                                fill
                                sizes="56px"
                                className="object-cover"
                              />
                            </div>
                          </td>

                          {/* Title & Category */}
                          <td className="py-3 px-4 max-w-xs">
                            <p className="font-bold text-white line-clamp-1">{ad.title}</p>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className="text-[10px] font-semibold bg-slate-700 text-slate-300 px-1.5 py-0.5 rounded uppercase">
                                {ad.category}
                              </span>
                              <span className="text-[10px] text-slate-400">
                                {ad.condition}
                              </span>
                              {ad.isFeatured && (
                                <span className="text-[10px] font-bold text-amber-400 flex items-center gap-0.5">
                                  <Star className="w-3 h-3 fill-amber-400" /> Featured
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Price */}
                          <td className="py-3 px-4 font-black text-emerald-400 text-sm">
                            {formatPrice(ad.price)}
                          </td>

                          {/* Seller */}
                          <td className="py-3 px-4">
                            <p className="font-bold text-slate-200">
                              {ad.seller?.name || ad.sellerContact?.name || "Seller"}
                            </p>
                            <p className="text-[10px] text-slate-400 font-mono">
                              {ad.seller?.phone || ad.sellerContact?.phone}
                            </p>
                          </td>

                          {/* Location */}
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-1 text-slate-300">
                              <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                              <span>{ad.location?.city || "Kathmandu"}</span>
                            </div>
                            {ad.location?.area && (
                              <p className="text-[10px] text-slate-500 pl-4.5">
                                {ad.location.area}
                              </p>
                            )}
                          </td>

                          {/* Submitted */}
                          <td className="py-3 px-4 font-mono text-[11px] text-slate-400">
                            {new Date(ad.createdAt).toLocaleDateString()}
                          </td>

                          {/* Status */}
                          <td className="py-3 px-4">
                            <span
                              className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                                ad.status === "approved"
                                  ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                                  : ad.status === "rejected"
                                  ? "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                                  : "bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse"
                              }`}
                            >
                              {ad.status}
                            </span>
                          </td>

                          {/* Actions */}
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* Review / View Details Button */}
                              <button
                                onClick={() => {
                                  setReviewAd(ad);
                                  setActiveReviewImg(0);
                                }}
                                title="Review Full Ad Details"
                                className="px-2.5 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-white font-bold text-xs flex items-center gap-1 cursor-pointer transition-colors"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                <span className="hidden lg:inline">Review</span>
                              </button>

                              {/* Quick Approve (If pending or rejected) */}
                              {ad.status !== "approved" && (
                                <button
                                  onClick={() => handleApproveAd(ad._id)}
                                  disabled={isActionLoading}
                                  title="Approve & Publish Live"
                                  className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1 cursor-pointer transition-colors shadow-xs"
                                >
                                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                                  <span className="hidden lg:inline">Approve</span>
                                </button>
                              )}

                              {/* Quick Reject (If pending) */}
                              {ad.status === "pending" && (
                                <button
                                  onClick={() => openRejectDialog(ad)}
                                  disabled={isActionLoading}
                                  title="Reject with Reason"
                                  className="px-2.5 py-1.5 rounded-lg bg-rose-600/30 hover:bg-rose-600 text-rose-300 hover:text-white font-bold text-xs flex items-center gap-1 cursor-pointer transition-colors"
                                >
                                  <X className="w-3.5 h-3.5" />
                                  <span className="hidden lg:inline">Reject</span>
                                </button>
                              )}

                              {/* Toggle Featured (If approved) */}
                              {ad.status === "approved" && (
                                <button
                                  onClick={() => handleToggleFeatured(ad._id)}
                                  title="Toggle Featured"
                                  className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                                    ad.isFeatured
                                      ? "bg-amber-500/20 text-amber-400 border-amber-500/40"
                                      : "bg-slate-700 text-slate-400 border-slate-600 hover:text-white"
                                  }`}
                                >
                                  <Star className={`w-3.5 h-3.5 ${ad.isFeatured ? "fill-amber-400" : ""}`} />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}

                    {advertisements.length === 0 && (
                      <tr>
                        <td colSpan={8} className="py-12 text-center text-slate-400">
                          <p className="font-bold text-sm text-slate-300">
                            No advertisements found in this view.
                          </p>
                          <p className="text-xs text-slate-500 mt-1">
                            New user submissions will automatically arrive under Pending Approvals.
                          </p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Review Modal (Full Advertisement Inspection & Approval Modal) */}
      {reviewAd && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-4xl max-h-[90vh] rounded-3xl overflow-hidden shadow-2xl flex flex-col animate-in zoom-in-95">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
              <div className="flex items-center gap-2.5">
                <span
                  className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                    reviewAd.status === "approved"
                      ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                      : reviewAd.status === "rejected"
                      ? "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                      : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                  }`}
                >
                  {reviewAd.status}
                </span>
                <h3 className="text-base font-bold text-white line-clamp-1">
                  {reviewAd.title}
                </h3>
              </div>
              <button
                onClick={() => setReviewAd(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Photo Gallery Grid */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Uploaded Photos ({reviewAd.images?.length || 0})
                </h4>
                <div className="flex flex-col sm:flex-row gap-4">
                  {/* Main Selected Image */}
                  <div className="relative flex-1 h-64 sm:h-80 rounded-2xl overflow-hidden bg-slate-950 border border-slate-800">
                    <Image
                      src={
                        reviewAd.images[activeReviewImg]?.url ||
                        "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80"
                      }
                      alt={reviewAd.title}
                      fill
                      className="object-contain"
                    />
                  </div>

                  {/* Thumbnails list */}
                  {reviewAd.images?.length > 1 && (
                    <div className="flex sm:flex-col gap-2 overflow-x-auto sm:overflow-y-auto sm:max-h-80 shrink-0">
                      {reviewAd.images.map((img, idx) => (
                        <button
                          key={idx}
                          onClick={() => setActiveReviewImg(idx)}
                          className={`relative w-16 h-16 rounded-xl overflow-hidden border-2 cursor-pointer transition-all ${
                            activeReviewImg === idx
                              ? "border-blue-500 scale-105"
                              : "border-slate-800 opacity-60 hover:opacity-100"
                          }`}
                        >
                          <Image
                            src={img.url}
                            alt={`Preview ${idx + 1}`}
                            fill
                            className="object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Advertisement Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                {/* Product Info */}
                <div className="space-y-4 bg-slate-800/40 p-4 rounded-2xl border border-slate-800">
                  <h4 className="text-xs font-bold text-blue-400 uppercase tracking-wider">
                    Product Specification
                  </h4>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between py-1 border-b border-slate-800">
                      <span className="text-slate-400">Price</span>
                      <span className="font-black text-emerald-400 text-sm">
                        {formatPrice(reviewAd.price)}
                      </span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-800">
                      <span className="text-slate-400">Category</span>
                      <span className="font-bold text-white uppercase">{reviewAd.category}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-800">
                      <span className="text-slate-400">Condition</span>
                      <span className="font-bold text-white">{reviewAd.condition}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-800">
                      <span className="text-slate-400">Location</span>
                      <span className="font-bold text-white">
                        {reviewAd.location?.area
                          ? `${reviewAd.location.area}, ${reviewAd.location.city}`
                          : reviewAd.location?.city}
                      </span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-slate-400">Submitted Date</span>
                      <span className="font-mono text-slate-300">
                        {new Date(reviewAd.createdAt).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div>
                    <span className="text-[11px] font-bold text-slate-400 block mb-1">
                      Description:
                    </span>
                    <p className="text-xs text-slate-300 bg-slate-900/80 p-3 rounded-xl leading-relaxed whitespace-pre-wrap border border-slate-800">
                      {reviewAd.description}
                    </p>
                  </div>
                </div>

                {/* Seller Info */}
                <div className="space-y-4 bg-slate-800/40 p-4 rounded-2xl border border-slate-800">
                  <h4 className="text-xs font-bold text-blue-400 uppercase tracking-wider">
                    Seller Profile &amp; Contact Details
                  </h4>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full overflow-hidden bg-slate-700 border border-slate-600 shrink-0">
                      <Image
                        src={
                          reviewAd.seller?.avatar ||
                          "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80"
                        }
                        alt="Seller"
                        width={48}
                        height={48}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <h5 className="font-bold text-white">
                        {reviewAd.seller?.name || reviewAd.sellerContact?.name || "Verified Seller"}
                      </h5>
                      <p className="text-xs text-slate-400">
                        {reviewAd.seller?.city || reviewAd.location?.city}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2 text-xs pt-2">
                    <div className="flex items-center gap-2 text-slate-300">
                      <Phone className="w-4 h-4 text-slate-400" />
                      <span className="font-mono">
                        {reviewAd.seller?.phone || reviewAd.sellerContact?.phone}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-300">
                      <Mail className="w-4 h-4 text-slate-400" />
                      <span className="font-mono">
                        {reviewAd.seller?.email || reviewAd.sellerContact?.email}
                      </span>
                    </div>
                  </div>

                  {reviewAd.rejectionReason && (
                    <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl space-y-1">
                      <span className="text-[11px] font-bold text-rose-400 block">
                        Existing Rejection Reason:
                      </span>
                      <p className="text-xs text-rose-200">{reviewAd.rejectionReason}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Modal Actions Footer */}
            <div className="p-4 sm:p-5 bg-slate-950/90 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setReviewAd(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
              >
                Close Preview
              </button>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => openRejectDialog(reviewAd)}
                  disabled={isActionLoading}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white transition-colors cursor-pointer"
                >
                  Reject Advertisement
                </button>

                <button
                  type="button"
                  onClick={() => handleApproveAd(reviewAd._id)}
                  disabled={isActionLoading}
                  className="px-6 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/20 transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>Approve &amp; Publish Live</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Rejection Reason Modal */}
      {rejectionModalAd && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-md rounded-3xl p-6 space-y-4 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center gap-3 text-rose-400">
              <div className="p-2 rounded-xl bg-rose-500/10">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">Reject Advertisement</h3>
            </div>

            <p className="text-xs text-slate-400">
              Please state why this advertisement cannot be approved. This reason will be
              sent in a real-time notification to{" "}
              <strong className="text-white">
                {rejectionModalAd.seller?.name || "the seller"}
              </strong>
              , allowing them to fix and resubmit.
            </p>

            <textarea
              rows={4}
              value={rejectionReasonInput}
              onChange={(e) => setRejectionReasonInput(e.target.value)}
              placeholder="e.g. Price is unrealistically low, or photos violate community standards..."
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500 transition-colors"
            />

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setRejectionModalAd(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmReject}
                disabled={isActionLoading || !rejectionReasonInput.trim()}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white transition-colors cursor-pointer disabled:opacity-50"
              >
                Confirm Rejection &amp; Notify Seller
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
