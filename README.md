# HabitSync 🌱
> Full-stack Daily Habit Tracker — Next.js + MongoDB + Email OTP + Cloudinary

---

## 🚀 Quick Start (Local)

### 1. Install dependencies
```bash
npm install
```

### 2. Set up environment variables
```bash
cp .env.local.example .env.local
```
Then fill in your values (see **Services Setup** below).

### 3. Run the dev server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000)

---

## ☁️ Deploy to Vercel (Free)

### Step 1 — MongoDB Atlas (Free Database)
1. Go to [mongodb.com/atlas](https://www.mongodb.com/atlas) → Sign up free
2. Create a **Free M0 cluster**
3. Under **Database Access** → Add user with password
4. Under **Network Access** → Add `0.0.0.0/0` (allow all IPs for Vercel)
5. Click **Connect** → **Drivers** → copy the connection string
6. Replace `<password>` in the string with your DB user password

### Step 2 — Gmail App Password (Email OTP)
1. Enable **2-Step Verification** on your Google account
2. Go to [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
3. Create an app password → copy the 16-character code
4. Use your Gmail as `EMAIL_USER` and the app password as `EMAIL_PASS`

### Step 3 — Cloudinary (Free Profile Picture Hosting)
1. Sign up free at [cloudinary.com](https://cloudinary.com) (25GB free)
2. From the Dashboard, copy your **Cloud Name**, **API Key**, **API Secret**

### Step 4 — Deploy to Vercel
1. Push this folder to a GitHub repository
2. Go to [vercel.com](https://vercel.com) → Import your repo
3. In **Environment Variables**, add all variables from `.env.local.example`
4. Set `NEXT_PUBLIC_APP_URL` to your Vercel URL (e.g. `https://habitsync.vercel.app`)
5. Click **Deploy** ✅

---

## 📁 Project Structure

```
habitsync/
├── pages/
│   ├── index.js          # Redirects to login
│   ├── login.js          # Login page
│   ├── register.js       # Register with avatar + phone
│   ├── verify-otp.js     # 6-digit email OTP verification
│   ├── dashboard.js      # Stats, chart, habit performance
│   ├── tracker.js        # Full habit grid (like the image!)
│   ├── calendar.js       # Monthly calendar with color coding
│   ├── profile.js        # Edit profile, avatar, password
│   └── api/
│       ├── auth/         # register, login, logout, me, verify-otp, resend-otp
│       ├── habits/       # CRUD habits + daily tick logs
│       ├── dashboard/    # Stats API
│       └── profile/      # Update profile + avatar upload
├── components/
│   └── Layout.js         # Sidebar navigation
├── models/
│   ├── User.js           # User schema (name, email, phone, avatar, OTP, streak)
│   ├── Habit.js          # Habit schema (name, icon, color, category)
│   └── HabitLog.js       # Daily log (ticks map, mood, pct, completed count)
├── lib/
│   ├── db.js             # MongoDB connection
│   ├── auth.js           # JWT sign/verify + requireAuth middleware
│   ├── email.js          # Nodemailer OTP + welcome emails
│   ├── cloudinary.js     # Profile picture upload
│   └── useAuth.js        # React auth hook
└── styles/
    └── globals.css       # Tailwind + custom styles
```

---

## ✨ Features

| Feature | Details |
|---|---|
| 🔐 **Auth** | Register → Email OTP → Login → JWT cookie session |
| 👤 **Profile** | Name, email, phone, timezone, profile picture (Cloudinary) |
| ✅ **Habit Tracker** | Real calendar grid, clickable checkboxes, week colour coding |
| 📊 **Dashboard** | Streak, completion rate, area chart, per-habit progress bars |
| 📅 **Calendar** | Month view, colour-coded days (green/yellow/red by completion) |
| 😊 **Mood Tracker** | 7 emoji moods per day, click to select |
| 🔥 **Streaks** | Auto-calculated current + longest streak |
| 📧 **Emails** | Beautiful OTP email + welcome email on signup |
| ☁️ **Storage** | MongoDB Atlas (habits, logs) + Cloudinary (avatars) |

---

## 🔑 Environment Variables

```env
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your-secret-32-chars-min
EMAIL_USER=your@gmail.com
EMAIL_PASS=your-16-char-app-password
EMAIL_FROM="HabitSync <your@gmail.com>"
NEXTAUTH_URL=http://localhost:3000
NEXT_PUBLIC_APP_URL=http://localhost:3000
CLOUDINARY_CLOUD_NAME=xxx
CLOUDINARY_API_KEY=xxx
CLOUDINARY_API_SECRET=xxx
```

---

## 🛠 Tech Stack

- **Frontend**: Next.js 14, React, Tailwind CSS, Recharts
- **Backend**: Next.js API Routes (Node.js)
- **Database**: MongoDB + Mongoose
- **Auth**: JWT (httpOnly cookies) + bcrypt
- **Email**: Nodemailer + Gmail SMTP
- **File Upload**: Formidable + Cloudinary
- **Hosting**: Vercel (free) + MongoDB Atlas (free) + Cloudinary (free)
