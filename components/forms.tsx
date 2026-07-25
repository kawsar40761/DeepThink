"use client";

import { useState } from "react";
import { addDoc, collection } from "firebase/firestore";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { Button, Input, Textarea, Card } from "@/components/ui";
import { useToast } from "@/hooks";
import { MAX_BLOCKS } from "@/lib/config";

function isValidEmail(email: string): boolean {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

export function BuyBlockForm({ onSuccess }: { onSuccess?: (name: string) => void }) {
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    blocks: 1,
    website: "",
    message: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const toast = useToast();

  function validate() {
    const errs: Record<string, string> = {};
    if (!form.fullName.trim()) errs.fullName = "Full name is required.";
    if (!form.email.trim()) {
      errs.email = "Email is required.";
    } else if (!isValidEmail(form.email)) {
      errs.email = "Invalid email address.";
    }
    if (!form.blocks || form.blocks < 1 || form.blocks > MAX_BLOCKS) {
      errs.blocks = `Blocks must be between 1 and ${MAX_BLOCKS}.`;
    }
    return errs;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setErrors({});
    setSubmitting(true);
    try {
      if (!db) throw new Error("Database not available");
      await addDoc(collection(db, "buy_requests"), {
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        blocksRequested: form.blocks,
        website: form.website.trim(),
        message: form.message.trim(),
        status: "pending",
        createdAt: new Date().toISOString(),
      });
      toast.success("Request sent successfully!");
      onSuccess?.(form.fullName.trim());
    } catch (err: any) {
      toast.error(err?.message || "Failed to submit request.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Card>
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Full Name *</label>
          <Input
            placeholder="John Doe"
            value={form.fullName}
            onChange={(e) => setForm({ ...form, fullName: e.target.value })}
            error={errors.fullName}
          />
          {errors.fullName && <p className="mt-1 text-xs text-red-500">{errors.fullName}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Email *</label>
          <Input
            type="email"
            placeholder="john@example.com"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            error={errors.email}
          />
          {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Number of Blocks *</label>
          <Input
            type="number"
            min={1}
            max={MAX_BLOCKS}
            placeholder="1"
            value={form.blocks}
            onChange={(e) => setForm({ ...form, blocks: Number(e.target.value) })}
            error={errors.blocks}
          />
          {errors.blocks && <p className="mt-1 text-xs text-red-500">{errors.blocks}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Website (optional)</label>
          <Input
            placeholder="https://example.com"
            value={form.website}
            onChange={(e) => setForm({ ...form, website: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Message (optional)</label>
          <Textarea
            placeholder="Any specific instructions..."
            value={form.message}
            onChange={(e) => setForm({ ...form, message: e.target.value })}
          />
        </div>
        <Button type="submit" className="w-full" loading={submitting}>
          Submit Request
        </Button>
      </form>
    </Card>
  );
}

export function ContactForm({ onSuccess }: { onSuccess?: () => void }) {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const toast = useToast();

  function validate() {
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = "Name is required.";
    if (!form.email.trim()) errs.email = "Email is required.";
    else if (!isValidEmail(form.email)) errs.email = "Invalid email address.";
    if (!form.message.trim()) errs.message = "Message is required.";
    return errs;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setErrors({});
    setSubmitting(true);
    try {
      if (!db) throw new Error("Database not available");
      await addDoc(collection(db, "contact_messages"), {
        name: form.name.trim(),
        email: form.email.trim(),
        message: form.message.trim(),
        createdAt: new Date().toISOString(),
      });
      toast.success("Message sent successfully!");
      setForm({ name: "", email: "", message: "" });
      onSuccess?.();
    } catch (err: any) {
      toast.error(err?.message || "Failed to send message.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Card>
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Name *</label>
          <Input
            placeholder="Your name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            error={errors.name}
          />
          {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Email *</label>
          <Input
            type="email"
            placeholder="your@email.com"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            error={errors.email}
          />
          {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Message *</label>
          <Textarea
            placeholder="Your message..."
            value={form.message}
            onChange={(e) => setForm({ ...form, message: e.target.value })}
            error={errors.message}
          />
          {errors.message && <p className="mt-1 text-xs text-red-500">{errors.message}</p>}
        </div>
        <Button type="submit" className="w-full" loading={submitting}>
          Send Message
        </Button>
      </form>
    </Card>
  );
}

export function AdminLoginForm({ onSuccess }: { onSuccess?: () => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!email || !password) {
      setError("Email and password are required.");
      return;
    }
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth!, email, password);
      toast.success("Logged in successfully");
      onSuccess?.();
    } catch (err: any) {
      const message =
        err?.code === "auth/invalid-credential"
          ? "Invalid email or password."
          : err?.message || "Login failed.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <h1 className="text-2xl font-bold text-center text-neutral-900 dark:text-white">Admin Login</h1>
        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <Input
            type="email"
            placeholder="admin@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Password</label>
          <Input
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        {error && <p className="text-sm text-red-500">{error}</p>}
        <Button type="submit" className="w-full" loading={loading}>
          Login
        </Button>
      </form>
    </Card>
  );
}
