"use client";

import { useState, useEffect } from "react";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  limit,
  runTransaction,
} from "firebase/firestore";
import { signOut } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import {
  Button,
  Input,
  Textarea,
  Modal,
  Spinner,
  Card,
  Badge,
  Switch,
} from "@/components/ui";
import { useAuth, useToast, useFirestoreCollection, useFirestoreDoc, useLiveStats } from "@/hooks";
import { AdminLoginForm } from "@/components/forms";
import { cn, formatDate, formatCurrency, generateMemberId } from "@/lib/utils";
import {
  MAX_BLOCKS,
  wallets as defaultWallets,
  support as defaultSupport,
  social as defaultSocial,
  FEATURES,
  SITE_NAME,
} from "@/lib/config";
import type { Block, BuyRequest, CustomerProfile, LiveStats, AppSettings } from "@/lib/types";

export default function AdminPanel() {
  const { user, loading: authLoading, isAdmin, logout } = useAuth();

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-md mx-auto mt-20 px-4">
        <AdminLoginForm onSuccess={() => {}} />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="text-center py-20">
        <h1 className="text-2xl font-bold text-red-500">Access Denied</h1>
        <p className="mt-2 text-neutral-500">You do not have administrator privileges.</p>
        <Button className="mt-4" variant="outline" onClick={logout}>
          Logout
        </Button>
      </div>
    );
  }

  return <AdminDashboard user={user} onLogout={logout} />;
}

function AdminDashboard({ user, onLogout }: { user: any; onLogout: () => void }) {
  const [activeSection, setActiveSection] = useState("dashboard");
  const toast = useToast();

  const sections = [
    { id: "dashboard", label: "Dashboard" },
    { id: "orders", label: "Orders" },
    { id: "gallery", label: "Gallery" },
    { id: "wallets", label: "Wallets" },
    { id: "statistics", label: "Statistics" },
    { id: "settings", label: "Settings" },
    { id: "customers", label: "Customers" },
    { id: "logs", label: "Activity Log" },
  ];

  const handleLogout = async () => {
    await signOut(auth!);
    toast.success("Logged out");
    onLogout();
  };

  return (
    <div className="min-h-screen flex bg-neutral-50 dark:bg-neutral-950">
      <aside className="w-64 bg-white dark:bg-neutral-900 border-r border-neutral-200 dark:border-neutral-800 p-4 flex flex-col">
        <div className="mb-6">
          <h1 className="text-xl font-bold text-neutral-900 dark:text-white">{SITE_NAME} Admin</h1>
          <p className="text-sm text-neutral-500 mt-1">{user.email}</p>
        </div>
        <nav className="flex-1 space-y-1">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={cn(
                "w-full text-left px-3 py-2 rounded-xl text-sm font-medium transition-colors",
                activeSection === section.id
                  ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900"
                  : "text-neutral-600 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800"
              )}
            >
              {section.label}
            </button>
          ))}
        </nav>
        <div className="pt-4 border-t border-neutral-200 dark:border-neutral-800">
          <Button variant="ghost" size="sm" onClick={handleLogout} className="w-full">
            Logout
          </Button>
        </div>
      </aside>
      <main className="flex-1 p-6 overflow-auto">
        {activeSection === "dashboard" && <DashboardSection />}
        {activeSection === "orders" && <OrdersSection />}
        {activeSection === "gallery" && <GallerySection />}
        {activeSection === "wallets" && <WalletsSection />}
        {activeSection === "statistics" && <StatisticsSection />}
        {activeSection === "settings" && <SettingsSection />}
        {activeSection === "customers" && <CustomersSection />}
        {activeSection === "logs" && <LogsSection />}
      </main>
    </div>
  );
}

function DashboardSection() {
  const { data: stats } = useLiveStats();
  const { data: requests, loading: reqLoading } = useFirestoreCollection<BuyRequest>("buy_requests", [
    orderBy("createdAt", "desc"),
    limit(5),
  ]);
  const { data: customers } = useFirestoreCollection<CustomerProfile>("customers");

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Dashboard</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card>
          <p className="text-sm text-neutral-500">Total Blocks</p>
          <p className="text-2xl font-bold">{stats?.totalBlocks || MAX_BLOCKS}</p>
        </Card>
        <Card>
          <p className="text-sm text-neutral-500">Sold</p>
          <p className="text-2xl font-bold">{stats?.soldBlocks || 0}</p>
        </Card>
        <Card>
          <p className="text-sm text-neutral-500">Total Raised</p>
          <p className="text-2xl font-bold">{formatCurrency(stats?.totalRaised || 0)}</p>
        </Card>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h3 className="font-semibold mb-3">Recent Requests</h3>
          {reqLoading ? (
            <Spinner />
          ) : requests.length === 0 ? (
            <p className="text-sm text-neutral-500">No requests yet.</p>
          ) : (
            <ul className="space-y-2">
              {requests.map((req) => (
                <li key={req.id} className="flex justify-between text-sm">
                  <span>{req.fullName}</span>
                  <Badge
                    variant={
                      req.status === "approved" ? "success" : req.status === "rejected" ? "danger" : "warning"
                    }
                  >
                    {req.status}
                  </Badge>
                </li>
              ))}
            </ul>
          )}
        </Card>
        <Card>
          <h3 className="font-semibold mb-3">Customers ({customers.length})</h3>
          {customers.length === 0 ? (
            <p className="text-sm text-neutral-500">No customers yet.</p>
          ) : (
            <ul className="space-y-1 text-sm">
              {customers.slice(0, 5).map((c) => (
                <li key={c.memberId}>{c.fullName} ({c.country})</li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}

function OrdersSection() {
  const { data: requests, loading } = useFirestoreCollection<BuyRequest>("buy_requests", [
    orderBy("createdAt", "desc"),
  ]);
  const [selectedRequest, setSelectedRequest] = useState<BuyRequest | null>(null);
  const toast = useToast();

  const updateStatus = async (id: string, newStatus: string) => {
    if (!db) return;
    try {
      await updateDoc(doc(db, "buy_requests", id), { status: newStatus });
      toast.success(`Request ${newStatus}`);
      await addDoc(collection(db, "activity_logs"), {
        action: `Request ${id} set to ${newStatus}`,
        timestamp: new Date().toISOString(),
        user: "admin",
      });
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  if (loading) return <Spinner />;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Orders</h2>
      {requests.length === 0 ? (
        <p className="text-neutral-500">No requests yet.</p>
      ) : (
        <div className="space-y-4">
          {requests.map((req) => (
            <Card key={req.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <p className="font-medium">{req.fullName}</p>
                <p className="text-sm text-neutral-500">{req.email}</p>
                <p className="text-sm">Blocks: {req.blocksRequested}</p>
                <p className="text-xs text-neutral-400">{formatDate(req.createdAt)}</p>
                <Badge
                  variant={
                    req.status === "approved" ? "success" : req.status === "rejected" ? "danger" : "warning"
                  }
                >
                  {req.status}
                </Badge>
              </div>
              <div className="flex gap-2">
                {req.status !== "approved" && (
                  <Button size="sm" variant="primary" onClick={() => updateStatus(req.id, "approved")}>
                    Approve
                  </Button>
                )}
                {req.status !== "rejected" && (
                  <Button size="sm" variant="danger" onClick={() => updateStatus(req.id, "rejected")}>
                    Reject
                  </Button>
                )}
                <Button size="sm" variant="outline" onClick={() => setSelectedRequest(req)}>
                  View
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
      <Modal open={!!selectedRequest} onOpenChange={() => setSelectedRequest(null)}>
        {selectedRequest && (
          <div className="space-y-3">
            <h3 className="text-xl font-bold">{selectedRequest.fullName}</h3>
            <p className="text-sm">Email: {selectedRequest.email}</p>
            <p className="text-sm">Blocks: {selectedRequest.blocksRequested}</p>
            <p className="text-sm">Website: {selectedRequest.website || "—"}</p>
            <p className="text-sm">Message: {selectedRequest.message || "—"}</p>
            <p className="text-sm">Status: {selectedRequest.status}</p>
            <p className="text-sm">Created: {formatDate(selectedRequest.createdAt)}</p>
          </div>
        )}
      </Modal>
    </div>
  );
}

function GallerySection() {
  const { data: wallData, loading } = useFirestoreDoc<{ blocks: Record<number, Block> }>("blocks", "wall");
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [selectedBlock, setSelectedBlock] = useState<Block | null>(null);
  const [form, setForm] = useState({ memberId: "", bannerUrl: "" });
  const toast = useToast();

  useEffect(() => {
    if (wallData?.blocks) {
      setBlocks(Object.values(wallData.blocks).sort((a, b) => a.id - b.id));
    }
  }, [wallData]);

  const assignBlock = async () => {
    if (!db || !selectedBlock || !form.memberId) return;
    try {
      const wallRef = doc(db, "blocks", "wall");
      await runTransaction(db, async (transaction) => {
        const snap = await transaction.get(wallRef);
        if (!snap.exists()) throw new Error("Wall not found");
        const currentBlocks = (snap.data() as any).blocks;
        currentBlocks[selectedBlock.id] = {
          ...currentBlocks[selectedBlock.id],
          purchased: true,
          memberId: form.memberId,
          bannerUrl: form.bannerUrl || "",
        };
        transaction.set(wallRef, { blocks: currentBlocks }, { merge: true });
      });
      toast.success("Block assigned");
      await addDoc(collection(db, "activity_logs"), {
        action: `Block ${selectedBlock.id} assigned to ${form.memberId}`,
        timestamp: new Date().toISOString(),
        user: "admin",
      });
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const unassignBlock = async (blockId: number) => {
    if (!db) return;
    try {
      const wallRef = doc(db, "blocks", "wall");
      await runTransaction(db, async (transaction) => {
        const snap = await transaction.get(wallRef);
        if (!snap.exists()) throw new Error("Wall not found");
        const currentBlocks = (snap.data() as any).blocks;
        currentBlocks[blockId] = { id: blockId, purchased: false };
        transaction.set(wallRef, { blocks: currentBlocks }, { merge: true });
      });
      toast.success("Block unassigned");
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  if (loading) return <Spinner />;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Gallery (Block Wall)</h2>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(40px,1fr))] gap-1 mb-8">
        {blocks.map((block) => (
          <div
            key={block.id}
            className={cn(
              "aspect-square border border-neutral-200 dark:border-neutral-700 cursor-pointer transition",
              block.purchased ? "bg-green-100 dark:bg-green-900/30" : "bg-neutral-100 dark:bg-neutral-800"
            )}
            style={block.bannerUrl ? { backgroundImage: `url(${block.bannerUrl})`, backgroundSize: "cover" } : undefined}
            onClick={() => setSelectedBlock(block)}
            title={`Block ${block.id}`}
          >
            {!block.purchased && (
              <span className="flex items-center justify-center h-full text-[8px] text-neutral-400">#{block.id}</span>
            )}
          </div>
        ))}
      </div>
      <Modal open={!!selectedBlock} onOpenChange={() => setSelectedBlock(null)}>
        {selectedBlock && (
          <div className="space-y-4">
            <h3 className="text-xl font-bold">Block #{selectedBlock.id}</h3>
            <p>Status: {selectedBlock.purchased ? "Purchased" : "Available"}</p>
            {selectedBlock.purchased && (
              <Button size="sm" variant="danger" onClick={() => { unassignBlock(selectedBlock.id); setSelectedBlock(null); }}>
                Unassign
              </Button>
            )}
            {!selectedBlock.purchased && (
              <div className="space-y-3">
                <Input placeholder="Member ID" value={form.memberId} onChange={(e) => setForm({ ...form, memberId: e.target.value })} />
                <Input placeholder="Banner URL (optional)" value={form.bannerUrl} onChange={(e) => setForm({ ...form, bannerUrl: e.target.value })} />
                <Button onClick={assignBlock}>Assign Block</Button>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}

function WalletsSection() {
  const { data: settings } = useFirestoreDoc<AppSettings>("settings", "app");
  const [wallets, setWallets] = useState<Record<string, string>>(defaultWallets);
  const [newNetwork, setNewNetwork] = useState("");
  const [newAddress, setNewAddress] = useState("");
  const toast = useToast();

  useEffect(() => {
    if (settings?.wallets) setWallets(settings.wallets);
  }, [settings]);

  const saveWallets = async () => {
    if (!db) return;
    try {
      await setDoc(doc(db, "settings", "app"), { wallets }, { merge: true });
      toast.success("Wallets updated");
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const addWallet = () => {
    if (!newNetwork || !newAddress) return;
    setWallets({ ...wallets, [newNetwork]: newAddress });
    setNewNetwork("");
    setNewAddress("");
  };

  const removeWallet = (network: string) => {
    const updated = { ...wallets };
    delete updated[network];
    setWallets(updated);
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Wallets</h2>
      <div className="space-y-3">
        {Object.entries(wallets).map(([network, address]) => (
          <Card key={network} className="flex justify-between items-center">
            <div>
              <p className="font-medium capitalize">{network}</p>
              <p className="text-sm text-neutral-500 break-all">{address}</p>
            </div>
            <div className="flex gap-2 items-center">
              <Input
                className="w-40 sm:w-64"
                value={address}
                onChange={(e) => setWallets({ ...wallets, [network]: e.target.value })}
              />
              <Button size="sm" variant="danger" onClick={() => removeWallet(network)}>Remove</Button>
            </div>
          </Card>
        ))}
      </div>
      <div className="mt-4 flex gap-2">
        <Input placeholder="Network (e.g., BTC)" value={newNetwork} onChange={(e) => setNewNetwork(e.target.value)} />
        <Input placeholder="Address" className="flex-1" value={newAddress} onChange={(e) => setNewAddress(e.target.value)} />
        <Button onClick={addWallet} variant="secondary">Add</Button>
      </div>
      <Button className="mt-4" onClick={saveWallets}>Save Changes</Button>
    </div>
  );
}

function StatisticsSection() {
  const { data: stats, loading } = useLiveStats();
  const [form, setForm] = useState<LiveStats>({
    totalBlocks: MAX_BLOCKS,
    soldBlocks: 0,
    availableBlocks: MAX_BLOCKS,
    totalRaised: 0,
    goalAmount: 1000000,
    totalMembers: 0,
  });
  const toast = useToast();

  useEffect(() => {
    if (stats) setForm(stats);
  }, [stats]);

  const saveStats = async () => {
    if (!db) return;
    try {
      await setDoc(doc(db, "stats", "live"), form);
      toast.success("Stats updated");
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  if (loading) return <Spinner />;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Statistics</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input label="Total Blocks" type="number" value={form.totalBlocks} onChange={(e) => setForm({ ...form, totalBlocks: +e.target.value })} />
        <Input label="Sold Blocks" type="number" value={form.soldBlocks} onChange={(e) => setForm({ ...form, soldBlocks: +e.target.value })} />
        <Input label="Available Blocks" type="number" value={form.availableBlocks} onChange={(e) => setForm({ ...form, availableBlocks: +e.target.value })} />
        <Input label="Total Raised ($)" type="number" value={form.totalRaised} onChange={(e) => setForm({ ...form, totalRaised: +e.target.value })} />
        <Input label="Goal Amount ($)" type="number" value={form.goalAmount} onChange={(e) => setForm({ ...form, goalAmount: +e.target.value })} />
        <Input label="Total Members" type="number" value={form.totalMembers} onChange={(e) => setForm({ ...form, totalMembers: +e.target.value })} />
      </div>
      <Button className="mt-4" onClick={saveStats}>Save Statistics</Button>
    </div>
  );
}

function SettingsSection() {
  const { data: settings, loading } = useFirestoreDoc<AppSettings>("settings", "app");
  const [form, setForm] = useState<AppSettings>({
    maintenanceMode: false,
    wallets: defaultWallets,
    social: defaultSocial,
    support: defaultSupport,
    logoUrl: "",
    siteName: SITE_NAME,
  });
  const toast = useToast();

  useEffect(() => {
    if (settings) setForm(settings);
  }, [settings]);

  const saveSettings = async () => {
    if (!db) return;
    try {
      await setDoc(doc(db, "settings", "app"), form);
      toast.success("Settings saved");
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  if (loading) return <Spinner />;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Settings</h2>
      <div className="space-y-4">
        <Switch
          label="Maintenance Mode"
          checked={form.maintenanceMode}
          onCheckedChange={(v) => setForm({ ...form, maintenanceMode: v })}
        />
        <Input
          label="Site Name"
          value={form.siteName}
          onChange={(e) => setForm({ ...form, siteName: e.target.value })}
        />
        <Input
          label="Logo URL"
          value={form.logoUrl}
          onChange={(e) => setForm({ ...form, logoUrl: e.target.value })}
        />
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="WhatsApp"
            value={form.support.whatsapp}
            onChange={(e) => setForm({ ...form, support: { ...form.support, whatsapp: e.target.value } })}
          />
          <Input
            label="Support Email"
            value={form.support.email}
            onChange={(e) => setForm({ ...form, support: { ...form.support, email: e.target.value } })}
          />
        </div>
        <h3 className="font-semibold mt-4">Social Links</h3>
        {Object.entries(form.social).map(([platform, url]) => (
          <Input
            key={platform}
            label={platform}
            value={url}
            onChange={(e) =>
              setForm({ ...form, social: { ...form.social, [platform]: e.target.value } })
            }
          />
        ))}
        <Button onClick={saveSettings}>Save Settings</Button>
      </div>
    </div>
  );
}

function CustomersSection() {
  const { data: customers, loading } = useFirestoreCollection<CustomerProfile>("customers");
  const [selected, setSelected] = useState<CustomerProfile | null>(null);
  const [edit, setEdit] = useState(false);
  const [form, setForm] = useState<CustomerProfile>({} as CustomerProfile);
  const toast = useToast();

  const openEdit = (customer: CustomerProfile) => {
    setSelected(customer);
    setForm(customer);
    setEdit(true);
  };

  const saveCustomer = async () => {
    if (!db || !selected) return;
    try {
      await updateDoc(doc(db, "customers", selected.memberId), { ...form });
      toast.success("Customer updated");
      setEdit(false);
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  if (loading) return <Spinner />;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Customers</h2>
      {customers.length === 0 ? (
        <p className="text-neutral-500">No customers yet.</p>
      ) : (
        <div className="space-y-2">
          {customers.map((c) => (
            <Card key={c.memberId} className="flex justify-between items-center">
              <div>
                <p className="font-medium">{c.fullName}</p>
                <p className="text-sm text-neutral-500">{c.country}</p>
              </div>
              <Button size="sm" onClick={() => openEdit(c)}>Edit</Button>
            </Card>
          ))}
        </div>
      )}
      <Modal open={edit} onOpenChange={() => setEdit(false)}>
        <div className="space-y-3">
          <h3 className="text-xl font-bold">Edit Customer</h3>
          <Input label="Full Name" value={form.fullName || ""} onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
          <Input label="Country" value={form.country || ""} onChange={(e) => setForm({ ...form, country: e.target.value })} />
          <Input label="Website" value={form.website || ""} onChange={(e) => setForm({ ...form, website: e.target.value })} />
          <Input label="Social Link" value={form.socialLink || ""} onChange={(e) => setForm({ ...form, socialLink: e.target.value })} />
          <Textarea label="Description" value={form.description || ""} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <Input label="Profile Image URL" value={form.profileImage || ""} onChange={(e) => setForm({ ...form, profileImage: e.target.value })} />
          <Button onClick={saveCustomer}>Save</Button>
        </div>
      </Modal>
    </div>
  );
}

function LogsSection() {
  const { data: logs, loading } = useFirestoreCollection<any>("activity_logs", [
    orderBy("timestamp", "desc"),
    limit(100),
  ]);

  if (loading) return <Spinner />;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Activity Log</h2>
      <div className="space-y-2">
        {logs.length === 0 ? (
          <p className="text-neutral-500">No activity recorded.</p>
        ) : (
          logs.map((log) => (
            <Card key={log.id}>
              <p className="text-sm">{log.action}</p>
              <p className="text-xs text-neutral-400">{formatDate(log.timestamp)}</p>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
