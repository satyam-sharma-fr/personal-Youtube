# FocusTube

A distraction-free YouTube experience. Watch videos only from channels you've explicitly added — no algorithm, no recommendations, no rabbit holes.

## Features

- 🎯 **Distraction-Free Feed** - See videos only from channels you subscribe to
- 🔐 **Authentication** - Sign up with Google or Email/Password via Supabase Auth
- 📺 **Channel Management** - Add channels by URL, handle, or search
- ♾️ **Infinite Scroll** - Smooth, paginated video feed
- ✅ **Watch Tracking** - Mark videos as watched, resume where you left off
- 🎬 **Clean Player** - Embedded YouTube player without recommendations
- 🌙 **Dark Mode** - Beautiful dark theme by default
- 📱 **Responsive** - Works on desktop and mobile

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Styling**: Tailwind CSS + shadcn/ui
- **Database**: Supabase (PostgreSQL with RLS)
- **Auth**: Supabase Auth (Google OAuth + Email/Password)
- **Animations**: Framer Motion
- **API**: YouTube Data API v3

## Getting Started

### Prerequisites

- Node.js 18+
- A Supabase project
- YouTube Data API key

### Environment Variables

Create a `.env.local` file:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# YouTube API (server-side only)
YOUTUBE_API_KEY=your_youtube_api_key

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Dodo Payments (for subscriptions)
DODO_PAYMENTS_API_KEY=your_dodo_api_key
DODO_PAYMENTS_WEBHOOK_KEY=your_webhook_secret
DODO_PAYMENTS_ENVIRONMENT=test_mode
DODO_PAYMENTS_RETURN_URL=http://localhost:3000
DODO_PRODUCT_PRO=pdt_your_pro_product_id
DODO_PRODUCT_UNLIMITED=pdt_your_unlimited_product_id
```

### Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

### Database Setup

The database schema is automatically applied via Supabase migrations. The app uses the following tables:

- `profiles` - User profiles with subscription info
- `channel_subscriptions` - User → Channel relationships
- `youtube_channels` - Cached channel metadata
- `youtube_videos` - Cached video metadata
- `user_video_state` - Watch history and progress

All tables have Row Level Security (RLS) enabled.

## Usage

1. Sign up with Google or Email/Password
2. Add channels by:
   - Pasting a YouTube channel URL
   - Entering a channel handle (e.g., `@mkbhd`)
   - Searching by channel name
3. Your feed will show the latest videos from your subscribed channels
4. Click on a video to watch in a distraction-free player
5. Mark videos as watched to track your viewing

## Subscription Tiers

- **Free**: Up to 5 channels
- **Pro** ($9/mo): Up to 25 channels, categories, extended history
- **Unlimited** ($12/mo): Unlimited channels, all features

Payments are processed via [Dodo Payments](https://dodopayments.com/).

## Development

```bash
# Type check
npm run lint

# Build for production
npm run build

# Start production server
npm run start
```

## License

MIT
