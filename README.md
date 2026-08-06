# Ghurabo - Real Travel Community & Trip-Sharing Platform

Ghurabo is a production-ready user-generated travel community web application where travellers share complete trip stories, upload high-resolution photos, write real reviews, provide itemized cost breakdowns, publish itineraries, and help other users plan Solo, Couple, Family, or Group tours.

---

## Features

- **Split Hero Composition**: Vibrant turquoise hero section with organic torn-paint brush edge mask, world map watermark, iconic landmark silhouettes, and circular slider arrows.
- **6-Step Trip Creator Wizard**: Multi-step trip publishing form with itemized per-person expense calculation, day-by-day itinerary builder, and multi-image uploader.
- **Dynamic Auto-Sync Gallery**: Every image uploaded inside an approved trip automatically populates the public Masonry Gallery without requiring separate manual uploads.
- **Verified Trip System**: Optional proof upload (booking/ticket proof) for admin moderation to earn the "Verified Trip" badge.
- **Role-Based Admin Moderation Desk**: Complete moderation panel for pending trip approvals/rejections, review management, site statistics, and badge verification.
- **MongoDB & Cloudinary Integration**: Mongoose models with Cloudinary image upload handling and seamless local fallback.

---

## Tech Stack

- **Framework**: Next.js 14 App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: MongoDB Atlas with Mongoose
- **Image Storage**: Cloudinary SDK / Signed Upload API
- **Auth & Session**: Custom JWT HTTP-Only Cookies

---

## Getting Started

1. Clone the repository:
```bash
git clone https://github.com/nafij-islam/Ghurabo-Final.git
cd Ghurabo-Final
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables in `.env.local`:
```env
MONGODB_URI=your_mongodb_connection_uri
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=your_upload_preset
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
JWT_SECRET=your_jwt_secret
```

4. Seed initial community data:
```bash
npm run seed
```

5. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the platform.
