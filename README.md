# Petadot

*Automatically synced with your [v0.dev](https://v0.dev) deployments*

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/condfires-projects/v0-petadot)
[![Built with v0](https://img.shields.io/badge/Built%20with-v0.dev-black?style=for-the-badge)](https://v0.dev/chat/projects/YZzCzZHusro)

## Overview

This repository will stay in sync with your deployed chats on [v0.dev](https://v0.dev).
Any changes you make to your deployed app will be automatically pushed to this repository from [v0.dev](https://v0.dev).

## Deployment

Your project is live at:

**[https://vercel.com/condfires-projects/v0-petadot](https://vercel.com/condfires-projects/v0-petadot)**

## Build your app

Continue building your app on:

**[https://v0.dev/chat/projects/YZzCzZHusro](https://v0.dev/chat/projects/YZzCzZHusro)**

## How It Works

1. Create and modify your project using [v0.dev](https://v0.dev)
2. Deploy your chats from the v0 interface
3. Changes are automatically pushed to this repository
4. Vercel deploys the latest version from this repository

## Database Setup

When setting up a new Supabase project, run the SQL files inside the `db` folder. The events table can be created with:

\`\`\`bash
supabase db execute ./db/create-events-table.sql
\`\`\`
To add the pet reports table, run:

```bash
supabase db execute ./db/create-pet-reports-table.sql
```

Ensure the Supabase CLI is linked to your project before running the command.
