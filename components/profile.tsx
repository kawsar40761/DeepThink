"use client";

import { useState } from "react";
import Image from "next/image";
import { Button, Card, Badge, Spinner } from "@/components/ui";
import { useFirestoreDoc } from "@/hooks";
import { formatDate, cn } from "@/lib/utils";
import type { CustomerProfile } from "@/lib/types";

function getBadges(profile: CustomerProfile) {
  const badges: { label: string; variant: "success" | "warning" | "info" | "default" }[] = [];
  if (profile.approved) badges.push({ label: "Verified", variant: "success" });
  if (profile.blocksPurchased >= 20) badges.push({ label: "Top Investor", variant: "info" });
  const memberNumber = parseInt(profile.memberId.split("-")[1] ?? "0", 36);
  if (!isNaN(memberNumber) && memberNumber < 10) badges.push({ label: "Pioneer", variant: "warning" });
  return badges;
}

interface MemberProfileProps {
  memberId: string;
  onClose?: () => void;
  showBlocks?: boolean;
}

export function MemberProfile({ memberId, onClose, showBlocks = true }: MemberProfileProps) {
  const { data: profile, loading, error } = useFirestoreDoc<CustomerProfile>("customers", memberId);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  if (error) {
    return <div className="py-8 text-center text-red-500">Failed to load profile.</div>;
  }

  if (!profile) {
    return <div className="py-8 text-center text-neutral-500">Profile not found.</div>;
  }

  const badges = getBadges(profile);

  return (
    <div className="w-full max-w-lg mx-auto p-6">
      <div className="flex flex-col items-center relative">
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-0 right-0 p-2 rounded-full text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300"
            aria-label="Close profile"
          >
            ✕
          </button>
        )}
        <Image
          src={profile.profileImage || "/logo.svg"}
          alt={profile.fullName}
          width={80}
          height={80}
          className="rounded-full object-cover border-2 border-neutral-200 dark:border-neutral-700 mb-4"
        />
        <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">{profile.fullName}</h2>
        {profile.country && <p className="text-sm text-neutral-500 mt-1">{profile.country}</p>}
        {badges.length > 0 && (
          <div className="flex flex-wrap justify-center gap-2 mt-3">
            {badges.map((badge) => (
              <Badge key={badge.label} variant={badge.variant}>{badge.label}</Badge>
            ))}
          </div>
        )}
      </div>

      {profile.description && (
        <div className="mt-6 text-center text-sm text-neutral-600 dark:text-neutral-400 px-4">
          {profile.description}
        </div>
      )}

      <div className="mt-6 grid grid-cols-2 gap-3">
        <Card className="text-center p-3">
          <p className="text-xs text-neutral-500">Member ID</p>
          <p className="text-sm font-mono font-medium text-neutral-700 dark:text-neutral-300 mt-1">{profile.memberId}</p>
        </Card>
        <Card className="text-center p-3">
          <p className="text-xs text-neutral-500">Blocks Owned</p>
          <p className="text-lg font-bold text-neutral-900 dark:text-white mt-1">{profile.blocksPurchased}</p>
        </Card>
        <Card className="text-center p-3 col-span-2">
          <p className="text-xs text-neutral-500">Joined</p>
          <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mt-1">{formatDate(profile.purchaseDate)}</p>
        </Card>
      </div>

      {showBlocks && profile.blocks && profile.blocks.length > 0 && (
        <div className="mt-6">
          <h3 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-2">My Blocks</h3>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(36px,1fr))] gap-1">
            {profile.blocks.sort((a, b) => a - b).map((blockId) => (
              <div
                key={blockId}
                className="aspect-square flex items-center justify-center bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-md text-xs font-medium text-neutral-500 dark:text-neutral-400"
                title={`Block #${blockId}`}
              >
                {blockId}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
        {profile.website && (
          <a href={profile.website} target="_blank" rel="noopener noreferrer" className="flex-1">
            <Button size="sm" className="w-full" variant="primary">Visit Website</Button>
          </a>
        )}
        {profile.socialLink && (
          <a href={profile.socialLink} target="_blank" rel="noopener noreferrer" className="flex-1">
            <Button size="sm" className="w-full" variant="outline">Social Link</Button>
          </a>
        )}
      </div>

      {onClose && (
        <div className="mt-6 text-center">
          <Button variant="ghost" size="sm" onClick={onClose}>Close</Button>
        </div>
      )}
    </div>
  );
}
