import { NextRequest, NextResponse } from "next/server";
import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  collection,
  addDoc,
  query,
  orderBy,
  limit,
  getDocs,
  runTransaction,
} from "firebase/firestore";
import { firebaseConfigData, ADMIN_EMAIL } from "@/lib/config";

let app: FirebaseApp;
if (!getApps().length) {
  app = initializeApp(firebaseConfigData);
} else {
  app = getApps()[0];
}
const db = getFirestore(app);

async function verifyAdmin(request: NextRequest): Promise<boolean> {
  const sessionCookie = request.cookies.get("session")?.value;
  if (!sessionCookie) return false;
  try {
    const res = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${firebaseConfigData.apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken: sessionCookie }),
      }
    );
    if (!res.ok) return false;
    const data = await res.json();
    if (data.users && data.users.length > 0) {
      return data.users[0].email === ADMIN_EMAIL;
    }
    return false;
  } catch {
    return false;
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string[] } }
) {
  const path = params.slug || [];
  const resource = path[0];
  const subResource = path[1];

  if (resource === "stats") {
    const snap = await getDoc(doc(db, "stats", "live"));
    return NextResponse.json(snap.exists() ? snap.data() : null);
  }
  if (resource === "blocks") {
    const snap = await getDoc(doc(db, "blocks", "wall"));
    return NextResponse.json(snap.exists() ? (snap.data() as any).blocks : {});
  }
  if (resource === "customers" && subResource) {
    const snap = await getDoc(doc(db, "customers", subResource));
    return NextResponse.json(snap.exists() ? snap.data() : null);
  }

  if (!(await verifyAdmin(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (resource === "settings") {
    const snap = await getDoc(doc(db, "settings", "app"));
    return NextResponse.json(snap.exists() ? snap.data() : {});
  }
  if (resource === "gallery") {
    const col = collection(db, "gallery");
    const q = query(col, orderBy("createdAt", "desc"), limit(100));
    const snap = await getDocs(q);
    return NextResponse.json(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  }

  return NextResponse.json({ error: "Not found" }, { status: 404 });
}

export async function POST(
  request: NextRequest,
  { params }: { params: { slug: string[] } }
) {
  const path = params.slug || [];
  const resource = path[0];
  const action = path[1];

  if (resource === "requests") {
    const body = await request.json();
    const docRef = await addDoc(collection(db, "buy_requests"), {
      ...body,
      status: "pending",
      createdAt: new Date().toISOString(),
    });
    return NextResponse.json({ id: docRef.id });
  }

  if (!(await verifyAdmin(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  try {
    if (resource === "stats") {
      await setDoc(doc(db, "stats", "live"), body, { merge: true });
      return NextResponse.json({ success: true });
    }
    if (resource === "settings") {
      await setDoc(doc(db, "settings", "app"), body, { merge: true });
      return NextResponse.json({ success: true });
    }
    if (resource === "blocks" && action === "assign") {
      const { blockId, memberId, bannerUrl } = body;
      const wallRef = doc(db, "blocks", "wall");
      await runTransaction(db, async (transaction) => {
        const snap = await transaction.get(wallRef);
        if (!snap.exists()) throw new Error("Wall not found");
        const blocks = (snap.data() as any).blocks;
        if (blocks[blockId].purchased) throw new Error("Already purchased");
        blocks[blockId] = { ...blocks[blockId], purchased: true, memberId, bannerUrl };
        transaction.set(wallRef, { blocks }, { merge: true });
      });
      return NextResponse.json({ success: true });
    }
    if (resource === "blocks" && action === "unassign") {
      const { blockId } = body;
      const wallRef = doc(db, "blocks", "wall");
      await runTransaction(db, async (transaction) => {
        const snap = await transaction.get(wallRef);
        if (!snap.exists()) throw new Error("Wall not found");
        const blocks = (snap.data() as any).blocks;
        blocks[blockId] = { id: blockId, purchased: false };
        transaction.set(wallRef, { blocks }, { merge: true });
      });
      return NextResponse.json({ success: true });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ error: "Not found" }, { status: 404 });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { slug: string[] } }
) {
  if (!(await verifyAdmin(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const path = params.slug || [];
  const resource = path[0];
  const subResource = path[1];

  if (resource === "gallery" && subResource) {
    const { deleteDoc } = await import("firebase/firestore");
    await deleteDoc(doc(db, "gallery", subResource));
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: "Not found" }, { status: 404 });
}
