# ClaimVault AI

A separate invoice-capture application deployed at https://claimvault-ai.vercel.app (pending Namecheap DNS for https://claimvault.sovanndevid.xyz).

**Important:** This branch is an integration checkpoint only, NOT the full application source tree. The working complete source package is `ClaimVault-AI-v0.5-Authenticated-AI-Source.zip` delivered in ChatGPT. Import the ZIP contents into a dedicated GitHub repository named `sovanndevid/claimvault-ai` and link that repository to the existing Vercel project. Do not change the portfolio production branch.

Features include scanning receipt photos to compressed PDF, on-device OCR, Australian financial-year records, encrypted Supabase cloud backup, user authentication, and optional server-side AI parsing with daily authenticated quotas. The OpenAI API key is not bundled and needs to be configured as a sensitive Vercel environment variable. No user receipts or keys belong in GitHub.

**Current services:** Supabase project `ysbsktgfnhlbulobahby`, Vercel project `claimvault-ai`. Supabase sign-in and storage require real-user cross-device verification before production tax-record use.
