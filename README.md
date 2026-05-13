# My Project

A web app built with Next.js, Tailwind CSS, and Supabase.

---

## Prerequisites

Make sure you have these installed before starting:

- [Node.js](https://nodejs.org) (v18 or higher)
- pnpm — install it by running:
  ```bash
  npm install -g pnpm
  ```

---

## Getting Started

### 1. Clone the repo

```bash
git clone <your-repo-url>
cd <project-folder>
```

### 2. Install dependencies

```bash
pnpm install
```

### 3. Create a file named .env.local in the root of your project and add the following keys:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
RESEND_API_KEY=your_resend_api_key
```

### 4. Run the app

```bash
pnpm dev
```

Then open your browser and go to: **http://localhost:3000**

---

## Notes

- The `.env.local` file is included in the repo and contains the Supabase credentials — no extra setup needed.
- Do **not** share the repo publicly as it contains project credentials.
- If you run into a port conflict, use a different port: `pnpm dev -- -p 3001`
