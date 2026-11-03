# PoliceFlow – Smart Verification & Appointment Management (prototype)

React + Vite + TypeScript + Tailwind CSS + Framer Motion.

> PoliceFlow is a proposed prototype. It is **not** an official portal of Navi Mumbai Police or any
> government body. All stations, slots, figures and bookings are synthetic demo data.

## Run it

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # production build in dist/
```

Deploys as-is to Vercel (`vercel.json` handles SPA routes) or any static host.

## Add hero photographs

The homepage hero is a slideshow. Put **licensed** photos (your own shoot, or Unsplash / Pexels / a
paid stock site) at `public/images/hero-1.jpg`, `hero-2.jpg` and `hero-3.jpg` (landscape, 2400px or
more wide). Any slide without a photo shows a designed navy backdrop instead. Do not use official
seals, logos or photos of officials.

## What's included

- **Split-screen hero:** 55/45 on desktop, 50/50 on tablet, stacked on mobile. Animated headline with
  underline accent, two CTAs, three trust indicators, an officer photo with pointer parallax (off on
  touch devices), and a glass status card labelled as demo data.
- **Five infinite marquees** (`src/components/Marquee.tsx`), all CSS keyframes with `translate3d`:
  hero values strip, 01 Digital Services (←), 02 Citizen Experience (→), 03 Process (outlined, ←)
  and 04 the oversized "Your time matters" transition. Each loops seamlessly from two identical
  tracks, runs at its own speed, pauses on hover, fades at the edges, and uses `touch-action: pan-y`
  so vertical scrolling is never blocked.
- **`prefers-reduced-motion`:** marquees stop and become a normal horizontal scroller, and entrance
  animations are skipped.
- **Booking wizard** (`/book`): service, validated details, station filtered by service, and
  date + 15-minute slots. Slot capacity is enforced (5 per slot, in `SLOT_CONFIG`), full slots are
  disabled, and duplicate bookings for the same reference are blocked.
- **Digital pass:** QR holding a random token only (no personal data), masked reference, document
  checklist, and an A4 print / Save-as-PDF layout.
- **Tracking** (`/track`): look up by appointment ID or reference, see the status timeline, cancel
  (which releases the slot).

## Staff and admin portal (demo)

| Login | URL | Demo account |
|---|---|---|
| Staff | `/staff/login` | `staff1` / `Staff@123` (also `staff2`) |
| Head admin | `/admin/login` | `admin` / `Admin@123` |

- **Staff desk** (`/staff`): scan the pass QR with the camera, upload a photo of it, or type the ID.
  Mark the citizen arrived, tick each original document, then accept the file, or request more info.
- **Admin panel** (`/admin`):
  - **Applications:** open, accept, decline or reopen any file.
  - **Activity log:** who accepted what, when, with notes. Exports to CSV.
  - **Staff accounts:** add accounts, disable or remove them, reset passwords.
  - **Website content:** the notice banner, slideshow photos (upload or remove) and news items with photos.
- These accounts are stored in the browser, so this is **not secure**. Before real use, move logins,
  the activity log and content to the backend: bcrypt hashing, httpOnly JWT cookies, server-side role
  checks and rate limiting.

## Connecting a backend

`src/lib/store.ts` is a browser-only demo engine (localStorage). Replace `book`, `slotsFor`,
`findAppointment` and `cancelAppointment` with calls to your Express/MongoDB API. The server must
repeat the capacity and duplicate checks atomically, for example with a conditional
`findOneAndUpdate` on the slot document.

## Structure

```
src/
  components/  Hero, OfficerVisual, Marquee, Navbar, Footer, PassCard, Reveal, DemoBadge
  pages/       Home, Book, Track
  lib/store.ts demo data + booking engine
  index.css    marquee keyframes, glass, pulse, print styles, reduced-motion
```
