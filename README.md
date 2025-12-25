# FocusTube 🎯

A distraction-free YouTube experience. Watch videos only from channels you choose to follow - no recommendations, no trending, no endless rabbit holes.

![FocusTube Preview](https://via.placeholder.com/1200x630/1a1a2e/ffffff?text=FocusTube+-+Distraction+Free+YouTube)

## ✨ Features

- **🔐 User Authentication** - Sign in with Google or Email/Password
- **📺 Channel Management** - Add YouTube channels by URL, handle, or search
- **🎬 Curated Feed** - Only see videos from your selected channels
- **✅ Watch Tracking** - Mark videos as watched
- **🎨 Beautiful UI** - Modern, animated, dark-themed interface
- **📱 Responsive** - Works perfectly on desktop and mobile
- **⚡ Real-time** - Powered by Convex for instant updates

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm or pnpm
- A [Convex](https://convex.dev) account (free)
- A [YouTube Data API](https://console.cloud.google.com/) key
- (Optional) Google OAuth credentials for social login

### Installation

1. **Clone and install dependencies:**
   ```bash
   git clone <your-repo-url>
   cd focustube
   npm install
   ```

2. **Set up Convex:**
   ```bash
   npx convex dev
   ```
   This will prompt you to log in and create a new project. It will automatically create `.env.local` with your Convex URL.

3. **Add your YouTube API key:**
   
   Add to your `.env.local`:
   ```env
   NEXT_PUBLIC_YOUTUBE_API_KEY=your_youtube_api_key
   ```

4. **Configure authentication (in Convex Dashboard):**
   
   Go to your [Convex Dashboard](https://dashboard.convex.dev) → Settings → Environment Variables and add:
   ```
   SITE_URL=http://localhost:3000
   ```

   For Google OAuth (optional), also add:
   ```
   AUTH_GOOGLE_ID=your_google_client_id
   AUTH_GOOGLE_SECRET=your_google_client_secret
   ```

5. **Run the development server:**
   ```bash
   # In one terminal
   npx convex dev
   
   # In another terminal
   npm run dev:frontend
   ```

6. **Open [http://localhost:3000](http://localhost:3000)** 🎉

## 📖 Getting API Keys

### YouTube Data API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Enable "YouTube Data API v3"
4. Go to Credentials → Create Credentials → API Key
5. Copy the key to your `.env.local`

### Google OAuth (for Google Sign-In)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to APIs & Services → Credentials
3. Create OAuth 2.0 Client ID (Web application)
4. Add authorized origins: `http://localhost:3000`
5. Add redirect URI: `https://YOUR-CONVEX-URL.convex.site/api/auth/callback/google`
6. Add credentials to Convex Dashboard environment variables

## 🏗️ Tech Stack

- **Framework:** [Next.js 14](https://nextjs.org/) (App Router)
- **Database:** [Convex](https://convex.dev) (real-time backend)
- **Auth:** [Convex Auth](https://labs.convex.dev/auth)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **UI Components:** [shadcn/ui](https://ui.shadcn.com/)
- **Animations:** [Framer Motion](https://www.framer.com/motion/)
- **Icons:** [Lucide React](https://lucide.dev/)

## 📁 Project Structure

```
├── convex/              # Convex backend
│   ├── schema.ts        # Database schema
│   ├── auth.ts          # Authentication config
│   ├── channels.ts      # Channel mutations/queries
│   └── watched.ts       # Watch history mutations/queries
├── src/
│   ├── app/             # Next.js pages
│   │   ├── page.tsx     # Landing page
│   │   ├── signin/      # Auth pages
│   │   ├── dashboard/   # Main app
│   │   └── watch/       # Video player
│   ├── components/      # React components
│   │   ├── ui/          # shadcn components
│   │   ├── navbar.tsx
│   │   ├── video-card.tsx
│   │   ├── video-feed.tsx
│   │   └── ...
│   └── lib/
│       ├── utils.ts     # Utilities
│       └── youtube.ts   # YouTube API helpers
└── ...
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_CONVEX_URL` | Convex deployment URL | Yes (auto-generated) |
| `NEXT_PUBLIC_YOUTUBE_API_KEY` | YouTube Data API key | Yes |
| `AUTH_GOOGLE_ID` | Google OAuth Client ID | No (for Google login) |
| `AUTH_GOOGLE_SECRET` | Google OAuth Secret | No (for Google login) |
| `SITE_URL` | Your app URL | Yes (for auth) |

## 🚢 Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import to [Vercel](https://vercel.com)
3. Add environment variables
4. Deploy!

### Convex Production

```bash
npx convex deploy
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

MIT License - feel free to use this for your own projects!

---

Built with ❤️ for focused minds.
