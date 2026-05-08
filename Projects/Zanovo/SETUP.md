# ZANOVO — Supabase + Zoho Setup Guide

## File structure you received

```
src/
  zanovo-website.jsx      ← Your complete website (replace your current file)
  lib/
    supabase.js           ← Supabase client (new file to add)
supabase/
  migration.sql           ← Run once in Supabase SQL Editor
  functions/
    send-lead-email/
      index.ts            ← Edge Function (deploy via CLI)
.env.example              ← Copy to .env and fill in your values
```

---

## Step 1 — Install the Supabase client

In your project terminal:

```bash
npm install @supabase/supabase-js
```

---

## Step 2 — Add your environment variables

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Fill in the two values from your Supabase dashboard:
- Go to: **supabase.com → your project → Settings → API**
- Copy **Project URL** → paste as `VITE_SUPABASE_URL`
- Copy **anon / public** key → paste as `VITE_SUPABASE_ANON_KEY`

Your `.env` should look like:
```
VITE_SUPABASE_URL=https://abcdefghij.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...
```

Add `.env` to your `.gitignore` — never commit this file.

---

## Step 3 — Create the database table

1. Go to **supabase.com → your project → SQL Editor → New query**
2. Paste the entire contents of `supabase/migration.sql`
3. Click **Run**

You should see the `leads` table appear in your **Table Editor**.

---

## Step 4 — Get your Zoho App Password

This is NOT your Zoho login password. It's a special password for SMTP.

1. Log in to **mail.zoho.com**
2. Go to: **Settings → Security → App Passwords**
3. Click **Generate New Password** → name it "Zanovo Website"
4. Copy the password shown (you won't see it again)

---

## Step 5 — Add secrets to Supabase Edge Functions

1. Go to **supabase.com → your project → Edge Functions → Secrets**
2. Add these three secrets:

| Secret name      | Value                          |
|------------------|-------------------------------|
| `ZOHO_SMTP_USER` | `thabiso@zanovo.co.za`        |
| `ZOHO_SMTP_PASS` | *(your Zoho App Password)*    |
| `NOTIFY_EMAIL`   | `thabiso@zanovo.co.za`        |

---

## Step 6 — Deploy the Edge Function

Install the Supabase CLI if you haven't already:

```bash
npm install -g supabase
```

Log in and link your project:

```bash
supabase login
supabase link --project-ref YOUR_PROJECT_REF
```
*(Your project ref is the part of your Supabase URL before `.supabase.co`)*

Deploy the function:

```bash
supabase functions deploy send-lead-email
```

---

## Step 7 — Replace your website file

- Replace your current `src/App.jsx` (or `src/zanovo-website.jsx`) with the updated `src/zanovo-website.jsx` from this package
- Add `src/lib/supabase.js` to your project

---

## Step 8 — Test it

1. Run your site locally: `npm run dev`
2. Fill in the contact form and submit
3. Check:
   - **Supabase → Table Editor → leads** — your submission should appear
   - **thabiso@zanovo.co.za inbox** — you should receive the formatted email

---

## How it works (summary)

```
User submits form
       ↓
React calls supabase.from("leads").insert(...)
       ↓
Lead saved to Supabase Postgres
       ↓
React calls /functions/v1/send-lead-email
       ↓
Edge Function connects to Zoho SMTP (smtp.zoho.com:465)
       ↓
Formatted HTML email sent to thabiso@zanovo.co.za
       ↓
Form shows success state
```

---

## Troubleshooting

**Form submits but no email arrives**
- Double-check your Zoho App Password in Supabase Secrets
- Make sure you used an App Password, not your Zoho login password
- Check Edge Function logs: Supabase → Edge Functions → send-lead-email → Logs

**"Missing Supabase env vars" error in browser**
- Your `.env` file is missing or the variable names are wrong
- Make sure they start with `VITE_` (required by Vite)
- Restart your dev server after adding `.env`

**Lead saves but email fails**
- The lead is still captured in your database — nothing is lost
- The error message shown to the user includes your direct email as a fallback

**CORS error in browser console**
- This means the Edge Function isn't deployed yet
- Run `supabase functions deploy send-lead-email` again
