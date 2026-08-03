# RuneChat

[![Last Commit](https://img.shields.io/github/last-commit/Papaya-Voldemort/Runechat)](https://github.com/Papaya-Voldemort/RuneChat/commits/main)
[![Verify](https://github.com/Papaya-Voldemort/RuneChat/actions/workflows/verify.yml/badge.svg)](https://github.com/Papaya-Voldemort/RuneChat/actions/workflows/verify.yml)
[![Release](https://github.com/Papaya-Voldemort/RuneChat/actions/workflows/release.yml/badge.svg)](https://github.com/Papaya-Voldemort/RuneChat/actions/workflows/release.yml)

A custom AI chatbot interface powered by Hack Club AI!
Made for Hackclub Horizons!

Live Demo: [https://runechat.elinelson.dev](https://runechat.elinelson.dev)

> AI Declaration: This project used AI for the following: Specific help on storage. See more in [`ai-declaration.md`](./ai-declaration.md).

> RuneChat is powered by [HCAI](https://ai.hackclub.com/). If Hackclub AI is down your API key will not work

## Table of Contents

- [Screenshots](#screenshots)
  - [Desktop Interface](#desktop-interface)
  - [Mobile Interface](#mobile-interface)
- [What?](#what)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Quick Start](#quick-start)
- [Railway Deployment](#railway-deployment)
- [Desktop App (Tauri v2)](#desktop-app-tauri-v2)
  - [Installing an Unsigned macOS Build](#installing-an-unsigned-macos-build)
- [GitHub Releases](#github-releases)
- [Future Updates](#future-updates)
- [Final Notes](#final-notes)

## Screenshots

### Desktop Interface

![Desktop Interface Layout](./public/screenshots/desktop.png)

### Mobile Interface

![Mobile Responsive UI](./public/screenshots/mobile.png)

## What?

RuneChat is one of my favorite projects I have ever worked on. It was the first I ever touched a JS framework or really used TS to its fullest.

I have always wanted to make a simple ChatBot UI and thought this was the perfect opportunity to make one!

So boom! RuneChat was born! A fun fact about the project is that its original name was RuneGPT, a combination of Runes from Svelte 5 and ChatGPT, but it was later renamed for brand consistency.

## Features

- Custom Material Icons
- BYOK Support
- Front and Backend
- Reasoning Model Support
- Model Personas

## Tech Stack

- Bun
- TS
- Svelte 5
- Railway
- HCAI

## Quick Start

Go to our web URL to try it out now: [Click Here](https://runechat-production-16f4.up.railway.app/)

Or for a deeper look:

```bash
git clone https://github.com/Papaya-Voldemort/RuneChat.git
cd RuneChat
bun install
bun run dev
```

For image input in a deployed environment, set `PUBLIC_BASE_URL` to RuneChat's
public HTTPS URL. RuneChat serves each image at a temporary opaque URL so the
model provider can fetch it without a base64-encoded chat payload.

Image uploads are rate-limited and held temporarily. Browser clients hosted on
the same origin work automatically; if you host a client separately, set
`CORS_ORIGINS` to its exact comma-separated HTTPS origin(s).

## Railway deployment

Deploy the repository root, not `src/`: the root contains `package.json`,
`server.ts`, and the Railway configuration. `railway.json` explicitly builds
the Vite client with `bun run build` and starts the Bun server with
`bun run start`, so Railway serves both the web app and its `/api` endpoints.
Set Railway's **Root Directory** to the repository root (leave it blank for a
single-repository service) and set `PUBLIC_BASE_URL` to the generated Railway
domain when using image attachments.

## Desktop app (Tauri v2)

RuneChat can be packaged for macOS, Windows, and Linux with Tauri v2. The
desktop bundle includes the Bun API server as a platform-specific sidecar, so
chat and text-attachment requests continue to use a local API at
`127.0.0.1:3000`.

```bash
bun run tauri:dev
bun run tauri:build
```

### Installing an unsigned macOS build

If macOS blocks the first launch, open **System Settings → Privacy & Security**
and select **Open Anyway** for RuneChat, then confirm. Only when you trust the
downloaded release, this Terminal command removes the download quarantine:

```bash
xattr -dr com.apple.quarantine /Applications/RuneChat.app
```

Unsigned builds can display a Gatekeeper warning; that is expected. Do not run
the command for an app obtained from an untrusted source.

## GitHub releases

Pushing a version tag such as `v0.1.0` starts the release workflow. It creates
a draft GitHub release containing macOS (Apple Silicon and Intel) DMGs, a
Windows x64 installer, and Android APK/AAB artifacts. Review the draft and
publish it from GitHub when ready.

The Android release job requires these repository secrets:

- `ANDROID_KEY_BASE64` — base64-encoded upload keystore (`base64 -i upload-keystore.jks` on macOS)
- `ANDROID_KEY_ALIAS` — the key alias
- `ANDROID_KEY_PASSWORD` — the keystore/key password

Those values are written only on the GitHub runner to the ignored
`src-tauri/gen/android/keystore.properties` file. Keep the keystore and its
password out of Git. Android artifacts are signed with this key and can be
uploaded to Google Play; the first Play upload still needs to be completed in
the Play Console.

## Future Updates

In the future I want to add the following new features:

- Multi Media Inputs
- Image/Video generation

## Final Notes

Thanks for checking out RuneChat hope you had fun :)
