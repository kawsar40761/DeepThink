"use client";

import { useParams } from "next/navigation";
import { MemberProfile } from "@/components/profile";

export default function ProfilePage() {
  const params = useParams();
  const memberId = params?.id as string;

  if (!memberId) {
    return (
      <div className="flex items-center justify-center min-h-[50vh] text-neutral-500">
        Invalid profile ID.
      </div>
    );
  }

  return <MemberProfile memberId={memberId} showBlocks />;
}
