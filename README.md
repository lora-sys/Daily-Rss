# Daily Briefs of AI

![Preview](public/Snipaste_2025-12-28_16-28-54.png)

A sophisticated daily AI news briefing platform that automatically aggregates content from multiple RSS feeds and delivers curated insights directly to subscribers' inboxes. The system features automated daily news collection, processing, and email distribution with robust error handling and monitoring capabilities.

## Core Features

- **Automated Daily News Collection**: Fetches articles from multiple RSS sources daily
- **Email Subscription System**: Manage subscriber lists with Resend contacts API
- **Cron-Scheduled Broadcasting**: Automatically sends daily newsletters at scheduled times
- **RSS Feed Processing**: Supports both direct RSS feeds and RSSHub routes
- **Database Integration**: Stores articles and source information in Supabase
- **Error Handling & Monitoring**: Comprehensive logging and error reporting
- **News Categorization**: Organizes content by source and category
- **HTML Email Templates**: Rich, formatted email content with responsive design

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **Email Service**: Resend (with broadcasts and contacts API)
- **Task Queue**: Inngest (for cron jobs and background processing)
- **Database**: Supabase (PostgreSQL)
- **RSS Parsing**: rss-parser
- **Icons**: Lucide React
- **Notifications**: Sonner
- **UI Components**: Custom components with Tailwind CSS

## Architecture Overview

The application follows a modern server-side architecture with:

- **Frontend**: Next.js 16 with Client Components for interactive UI
- **Backend API Routes**: For subscription management and Inngest integration
- **Task Scheduling**: Inngest functions for cron-based news aggregation and email delivery
- **Database Layer**: Supabase PostgreSQL with dedicated modules for news sources and articles
- **Email Delivery**: Resend for transactional emails and broadcast newsletters

## Environment Variables

Create a `.env.local` file with the following variables:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Resend Configuration
RESEND_API_KEY=your_resend_api_key
RESEND_FROM_EMAIL=your_verified_sender_email
RESEND_SEGMENT_ID=your_resend_segment_id

# Inngest Configuration
INNGEST_EVENT_KEY=your_inngest_event_key
INNGEST_SIGNING_KEY=your_inngest_signing_key

# RSSHub Configuration (optional)
RSSHUB_BASE_URL=https://your-rsshub-instance.com  # defaults to https://rss.appree.com
```

## Getting Started

1. Install dependencies:
```bash
npm install
# or
bun install
```

2. Set up environment variables (create `.env.local`):
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
RESEND_API_KEY=your_resend_api_key
RESEND_FROM_EMAIL=your_verified_sender_email
RESEND_SEGMENT_ID=your_resend_segment_id
INNGEST_EVENT_KEY=your_inngest_event_key
INNGEST_SIGNING_KEY=your_inngest_signing_key
```

3. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the result.

## Cron Job Functionality

The application includes an automated daily newsletter system that:

- Runs daily at 4:15 AM UTC (12:15 PM Beijing time) via Inngest cron
- Fetches articles from all active RSS sources in the database
- Processes up to 10 most recent articles per source
- Aggregates content from the past 3 days (configurable)
- Formats articles into HTML email templates
- Sends newsletters via Resend broadcasts to all subscribers

The cron schedule `"15 4 * * *"` means the job runs at 4:15 UTC daily. You can adjust this in `inngest/functions.ts`.

## Database Schema

The application uses Supabase PostgreSQL with two main tables:

### News Sources Table
- Manages RSS feed configurations
- Tracks source status (active/inactive)
- Supports both direct RSS feeds and RSSHub routes
- Includes priority levels for processing order

### News Articles Table
- Stores processed articles from RSS feeds
- Maintains publication dates and content
- Links to source information
- Prevents duplicate entries

## RSS Processing

The system supports two types of RSS sources:

1. **Direct Feeds**: Standard RSS feed URLs
2. **RSSHub Routes**: RSSHub endpoints with configurable parameters

Each source includes:
- Name and category information
- Type designation (direct_feed or rsshub)
- Priority level for processing order
- Active status flag
- Statistics tracking (success/failure counts)

## Deployment

This project is ready for deployment on [Vercel](https://vercel.com):

1. Push your code to GitHub
2. Import your repository on Vercel
3. Add environment variables in Vercel dashboard
4. Configure the Inngest Dev Server (optional, for local development)
5. Deploy

For production deployments, ensure your domain is properly configured with Resend for email delivery.

## Development

During development, you can trigger the daily news function manually using Inngest Dev Server:

1. Install Inngest CLI: `npm install -g inngest-cli`
2. Run the dev server: `inngest dev`
3. Send test events to trigger functions

## Learn More

- [Next.js Documentation](https://nextjs.org)
- [Inngest Documentation](https://www.inngest.com)
- [Resend Documentation](https://resend.com)
- [Supabase Documentation](https://supabase.com/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com)
