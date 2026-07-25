"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { addDoc, collection, getDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Button, Card, Input, Textarea, Modal, Spinner, Skeleton } from "@/components/ui";
import { useLiveStats, useFirestoreDoc, useToast } from "@/hooks";
import { cn, formatCurrency, formatDate } from "@/lib/utils";
import {
  SITE_NAME,
  SITE_TAGLINE,
  GOAL_AMOUNT,
  MAX_BLOCKS,
  SECTION_IDS,
  support,
  siteLogo,
} from "@/lib/config";
import type { Block, CustomerProfile } from "@/lib/types";

function HeroSection() {
  return (
    <section className="relative py-20 px-4 text-center overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-neutral-50 to-transparent dark:from-neutral-900/50 dark:to-transparent -z-10" />
      <div className="max-w-3xl mx-auto">
        <h1 className="text-5xl sm:text-6xl font-bold tracking-tight text-neutral-900 dark:text-white">
          {SITE_NAME}
        </h1>
        <p className="mt-6 text-xl text-neutral-600 dark:text-neutral-400 max-w-xl mx-auto">
          {SITE_TAGLINE}
        </p>
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href={`/#${SECTION_IDS.buy}`}>
            <Button size="lg">Buy Blocks</Button>
          </Link>
          <Link href={`/#${SECTION_IDS.gallery}`}>
            <Button variant="outline" size="lg">
              Explore the Wall
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}

function StatisticsSection() {
  const { data: stats, loading } = useLiveStats();

  if (loading) {
    return (
      <section id={SECTION_IDS.statistics} className="py-12 px-4 max-w-6xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-2xl" />
          ))}
        </div>
      </section>
    );
  }

  if (!stats) return null;

  const cards = [
    { label: "Goal", value: formatCurrency(stats.goalAmount || GOAL_AMOUNT) },
    { label: "Raised", value: formatCurrency(stats.totalRaised || 0) },
    { label: "Available", value: stats.availableBlocks ?? MAX_BLOCKS },
    { label: "Sold", value: `${stats.soldBlocks || 0} / ${stats.totalBlocks || MAX_BLOCKS}` },
    { label: "Members", value: stats.totalMembers || 0 },
  ];

  return (
    <section id={SECTION_IDS.statistics} className="py-12 px-4 max-w-6xl mx-auto">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {cards.map((card) => (
          <Card key={card.label} className="text-center">
            <p className="text-sm font-medium text-neutral-500">{card.label}</p>
            <p className="mt-2 text-2xl font-bold text-neutral-900 dark:text-white">
              {card.value}
            </p>
          </Card>
        ))}
      </div>
    </section>
  );
}

function BlockWallSection() {
  const { data: wallData, loading } = useFirestoreDoc<{ blocks: Record<number, Block> }>("blocks", "wall");
  const [selectedBlock, setSelectedBlock] = useState<Block | null>(null);
  const [selectedProfile, setSelectedProfile] = useState<CustomerProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const toast = useToast();

  const blocks: Block[] = wallData?.blocks ? Object.values(wallData.blocks) : [];

  const handleBlockClick = async (block: Block) => {
    if (!block.purchased) {
      document.getElementById(SECTION_IDS.buy)?.scrollIntoView({ behavior: "smooth" });
      return;
    }
    setSelectedBlock(block);
    setProfileLoading(true);
    try {
      if (block.memberId) {
        const snap = await getDoc(doc(db!, "customers", block.memberId));
        if (snap.exists()) setSelectedProfile(snap.data() as CustomerProfile);
        else toast.error("Profile not found");
      }
    } catch (err) {
      toast.error("Failed to load profile");
    } finally {
      setProfileLoading(false);
    }
  };

  if (loading) {
    return (
      <section id={SECTION_IDS.gallery} className="py-12 px-4 max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold mb-8 text-center">The Wall</h2>
        <div className="grid grid-cols-[repeat(auto-fill,minmax(50px,1fr))] gap-0.5">
          {Array.from({ length: 50 }).map((_, i) => (
            <Skeleton key={i} className="aspect-square" />
          ))}
        </div>
      </section>
    );
  }

  return (
    <section id={SECTION_IDS.gallery} className="py-12 px-4 max-w-7xl mx-auto">
      <h2 className="text-3xl font-bold mb-8 text-center">The Wall</h2>
      {blocks.length === 0 ? (
        <div className="text-center py-12 text-neutral-500">No blocks yet.</div>
      ) : (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(50px,1fr))] gap-0.5">
          {blocks
            .sort((a, b) => a.id - b.id)
            .map((block) => (
              <div
                key={block.id}
                className={cn(
                  "aspect-square cursor-pointer transition-opacity hover:opacity-80",
                  block.purchased
                    ? "bg-cover bg-center"
                    : "bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 flex items-center justify-center"
                )}
                style={
                  block.purchased && block.bannerUrl
                    ? { backgroundImage: `url(${block.bannerUrl})` }
                    : undefined
                }
                onClick={() => handleBlockClick(block)}
              >
                {!block.purchased && (
                  <span className="text-[10px] text-neutral-400">Available</span>
                )}
              </div>
            ))}
        </div>
      )}
      <Modal open={!!selectedBlock} onOpenChange={() => { setSelectedBlock(null); setSelectedProfile(null); }} className="max-w-md">
        {selectedBlock && (
          <div className="text-center">
            {profileLoading ? (
              <Spinner className="mx-auto" />
            ) : selectedProfile ? (
              <>
                <Image
                  src={selectedProfile.profileImage || siteLogo.src}
                  alt={selectedProfile.fullName}
                  width={80}
                  height={80}
                  className="rounded-full mx-auto object-cover border-2 border-neutral-200 dark:border-neutral-700"
                />
                <h3 className="mt-4 text-xl font-bold text-neutral-900 dark:text-white">{selectedProfile.fullName}</h3>
                <p className="text-sm text-neutral-500">{selectedProfile.country}</p>
                {selectedProfile.description && (
                  <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">{selectedProfile.description}</p>
                )}
                <div className="mt-4 flex flex-wrap justify-center gap-2 text-xs text-neutral-500">
                  <span>Member ID: {selectedProfile.memberId}</span>
                  <span>•</span>
                  <span>Blocks: {selectedProfile.blocksPurchased}</span>
                  <span>•</span>
                  <span>{formatDate(selectedProfile.purchaseDate)}</span>
                </div>
                <div className="mt-6 flex justify-center gap-3">
                  {selectedProfile.website && (
                    <a href={selectedProfile.website} target="_blank" rel="noopener noreferrer">
                      <Button size="sm">Visit Website</Button>
                    </a>
                  )}
                  {selectedProfile.socialLink && (
                    <a href={selectedProfile.socialLink} target="_blank" rel="noopener noreferrer">
                      <Button size="sm" variant="outline">Social</Button>
                    </a>
                  )}
                </div>
              </>
            ) : (
              <p className="py-4 text-neutral-500">No profile information available.</p>
            )}
          </div>
        )}
      </Modal>
    </section>
  );
}

function BuyRequestSection() {
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    blocks: 1,
    website: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const toast = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.fullName || !form.email) {
      toast.error("Please fill in required fields");
      return;
    }
    if (form.blocks < 1 || form.blocks > MAX_BLOCKS) {
      toast.error(`Blocks must be between 1 and ${MAX_BLOCKS}`);
      return;
    }
    setSubmitting(true);
    try {
      await addDoc(collection(db!, "buy_requests"), {
        fullName: form.fullName,
        email: form.email,
        blocksRequested: form.blocks,
        website: form.website,
        message: form.message,
        status: "pending",
        createdAt: new Date().toISOString(),
      });
      setSubmitted(true);
      toast.success("Request sent successfully!");
    } catch (err) {
      toast.error("Failed to submit request.");
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <section id={SECTION_IDS.buy} className="py-12 px-4 max-w-xl mx-auto text-center">
        <Card>
          <h3 className="text-2xl font-bold">Request Received</h3>
          <p className="mt-2 text-neutral-600 dark:text-neutral-400">
            Thank you, {form.fullName}. We will contact you soon.
          </p>
          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <a href={`https://wa.me/${support.whatsapp}`} target="_blank" rel="noopener noreferrer" className="flex-1">
              <Button variant="outline" className="w-full">WhatsApp</Button>
            </a>
            <a href={`mailto:${support.email}`} className="flex-1">
              <Button variant="outline" className="w-full">Email</Button>
            </a>
          </div>
        </Card>
      </section>
    );
  }

  return (
    <section id={SECTION_IDS.buy} className="py-12 px-4 max-w-xl mx-auto">
      <h2 className="text-3xl font-bold mb-6 text-center">Buy Blocks</h2>
      <Card>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input placeholder="Full Name" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} required />
          <Input type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          <Input type="number" min={1} max={MAX_BLOCKS} placeholder="Number of Blocks" value={form.blocks} onChange={(e) => setForm({ ...form, blocks: Number(e.target.value) })} required />
          <Input placeholder="Website (optional)" value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} />
          <Textarea placeholder="Message (optional)" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
          <Button type="submit" className="w-full" loading={submitting}>Submit Request</Button>
        </form>
      </Card>
      <div className="mt-6 text-center text-sm text-neutral-500">
        Need help?{" "}
        <a href={`https://wa.me/${support.whatsapp}`} className="underline">WhatsApp</a>{" "}
        or{" "}
        <a href={`mailto:${support.email}`} className="underline">Email</a>
      </div>
    </section>
  );
}

function FAQSection() {
  const items = [
    { value: "what", trigger: "What is Digital Blocks?", content: "A premium digital billboard where you can permanently own blocks on our homepage." },
    { value: "how", trigger: "How do I buy a block?", content: "Submit the request form, and our team will contact you for payment and setup." },
  ];

  return (
    <section id={SECTION_IDS.faq} className="py-12 px-4 max-w-3xl mx-auto">
      <h2 className="text-3xl font-bold mb-6 text-center">FAQ</h2>
      <div className="space-y-4">
        {items.map((item) => (
          <Card key={item.value}>
            <h3 className="font-semibold">{item.trigger}</h3>
            <p className="mt-1 text-sm text-neutral-500">{item.content}</p>
          </Card>
        ))}
      </div>
    </section>
  );
}

function ContactSection() {
  return (
    <section id={SECTION_IDS.contact} className="py-12 px-4 max-w-xl mx-auto text-center">
      <h2 className="text-3xl font-bold mb-6">Contact</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card>
          <p className="font-medium">WhatsApp</p>
          <p className="text-sm text-neutral-500 mt-1">{support.whatsapp}</p>
          <a href={`https://wa.me/${support.whatsapp}`} target="_blank" rel="noopener noreferrer">
            <Button size="sm" className="mt-2">Chat</Button>
          </a>
        </Card>
        <Card>
          <p className="font-medium">Email</p>
          <p className="text-sm text-neutral-500 mt-1">{support.email}</p>
          <a href={`mailto:${support.email}`}>
            <Button size="sm" className="mt-2">Send Email</Button>
          </a>
        </Card>
      </div>
    </section>
  );
}

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <StatisticsSection />
      <BlockWallSection />
      <BuyRequestSection />
      <FAQSection />
      <ContactSection />
    </>
  );
}
