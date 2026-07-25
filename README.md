# Digital Blocks – Premium Digital Billboard

**Own a permanent piece of the internet.**  
A modern, Apple‑inspired platform where users purchase digital blocks on a homepage using cryptocurrency. Built with Next.js, Firebase, and Tailwind CSS.

---

## Table of Contents

1. [Concept](#concept)
2. [Features](#features)
3. [Tech Stack](#tech-stack)
4. [Installation](#installation)
5. [Firebase Setup](#firebase-setup)
6. [Cloudinary Setup](#cloudinary-setup)
7. [Environment Variables](#environment-variables)
8. [Admin Login](#admin-login)
9. [Deployment](#deployment)
10. [Folder Structure](#folder-structure)
11. [Usage Guide](#usage-guide)
12. [All Files (Project Map)](#all-files-project-map)

---

## Concept

The homepage contains a **wall of 1,000 equal‑sized blocks**. Visitors can purchase one or more blocks via a request form. Once the admin approves the payment (cryptocurrency), the admin assigns the blocks, uploads the customer’s banner and profile, and the blocks become visible to the world. Purchased blocks are interactive – clicking them opens a beautiful profile card with the customer’s details, social links, and website.

Everything follows a **minimal, Apple‑like design language** with light/dark mode, real‑time statistics, and a full admin panel.

---

## Features

- 🧱 **Digital Block Wall** – 1,000 responsive, interactive blocks
- 💰 **Manual crypto payments** – BTC, ETH, USDT, BNB, SOL, and more
- 👤 **Customer profiles** – profile card with avatar, badge, social links
- 📊 **Live statistics** – goal, raised, sold, members (Firestore real‑time)
- 🎨 **Apple‑inspired design** – neutral palette, generous whitespace, subtle shadows
- 🌓 **Light / Dark mode** – system‑aware, persistent preference
- 🔒 **Admin panel** – manage orders, blocks, gallery, wallets, settings, logs
- 🔐 **Authentication** – Firebase Auth for admin
- 🛡️ **Security rules** – Firestore, Realtime Database, and Storage rules included
- 📦 **Progressive Web App** ready (manifest included)
- ⚡ **Performance** – Next.js, image optimisation, lazy loading, 95+ Lighthouse target

---

## Tech Stack

| Layer        | Technology                          |
| ------------ | ----------------------------------- |
| Framework    | Next.js 14 (App Router)             |
| UI           | React 18 + Tailwind CSS             |
| Components   | Radix UI primitives + custom        |
| Backend      | Firebase (Auth, Firestore, Storage) |
| Icons        | Lucide React                        |
| Notifications| Sonner                              |
| Theming      | next‑themes                         |
| Images       | Cloudinary                          |
| Language     | TypeScript (strict)                 |

---

## Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd digital-blocks
