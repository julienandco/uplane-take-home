# Image Processor

A polished image upload and processing application built with Nuxt 4 and Supabase.

## Features

- 🎨 **Beautiful UI** - Dark theme with warm amber accents, distinctive typography
- 📤 **Drag & Drop Upload** - Intuitive file upload with drag-and-drop support
- ⏳ **Processing Feedback** - Engaging animations and fun facts while processing
- 📥 **Download & Delete** - Full control over your processed images
- 🔄 **Real-time Updates** - Supabase Realtime for instant processing status updates

## Getting Started

### Prerequisites

- Node.js 18+
- npm or pnpm

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

The app will start in **demo mode** without Supabase credentials, simulating uploads and processing locally.

### Environment Variables

To connect to Supabase, create a `.env` file with:

```env
# Your Supabase project URL
VITE_SUPABASE_URL=https://your-project.supabase.co

# Your Supabase anonymous/public key
VITE_SUPABASE_ANON_KEY=your-anon-key
```

## Project Structure

```
app/
├── app.vue                    # Root layout
├── assets/
│   └── css/
│       └── main.css           # Global styles & design system
├── components/
│   ├── FileCard.vue           # Completed file with actions
│   ├── FileUploader.vue       # Drag & drop upload zone
│   ├── ProcessingState.vue    # Processing animation & fun facts
│   └── UploadProgress.vue     # Upload progress indicator
├── composables/
│   └── useFileUpload.ts       # File management logic
└── pages/
    └── index.vue              # Main page
```

## Supabase Integration

The app is ready for Supabase integration with:

1. **Storage** - Images are uploaded to Supabase Storage (`uploads` bucket)
2. **Realtime** - Listens to `file_processing` table for status updates
3. **Processing Flow**:
   - Upload image → status: `uploading`
   - Backend processes → status: `processing`
   - Processing complete → status: `done`
   - User can download processed file or delete

### Expected Supabase Schema

```sql
-- Table to track file processing status
create table file_processing (
  id text primary key,
  original_name text not null,
  file_path text not null,
  status text not null default 'processing',
  processed_url text,
  created_at timestamp with time zone default now()
);

-- Enable realtime
alter publication supabase_realtime add table file_processing;
```

## Design System

- **Font**: Satoshi (from Fontshare)
- **Colors**: Deep charcoal background with warm amber accent
- **Animations**: Smooth transitions, engaging processing spinner
