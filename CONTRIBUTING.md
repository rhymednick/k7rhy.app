# Contributing to k7rhy.app

Welcome! Thank you for your interest in contributing to k7rhy.app. This document provides instructions for setting up your development environment.

## Getting Started

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/rhymednick/k7rhy.app.git
    cd k7rhy.app
    ```

2.  **Install dependencies:**

    ```bash
    npm install
    ```

3.  **Set up environment variables:** Copy `.env.development` to `.env.local` and fill in the required values.

    ```bash
    cp .env.development .env.local
    ```

    Optional server variables:
    - `DISCORD_BOT_TOKEN`: Displays Community announcements and Relay pinned messages. The pages render graceful fallback states when it is absent.

4.  **Start the development server:**
    ```bash
    npm run dev
    ```
    Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure

- `app/`: Next.js App Router pages and layouts.
- `components/`: React components.
    - `community/`: Discord announcement components.
    - `features/`: Feature-specific components (e.g., PowerCalculator).
    - `navigation/`: Navigation components (Header, Footer, Nav).
    - `shared/`: Shared utilities and providers.
    - `ui/`: Reusable UI components (Shadcn UI).
- `content/`: MDX content for instruments, Relay, and docs.
- `lib/`: Utility functions.

## Testing & Code Quality

We use **Vitest** for testing and **ESLint/Prettier** for code quality.

- **Run tests:**

    ```bash
    npm run test
    ```

- **Lint code:**

    ```bash
    npm run lint
    ```

- **Format code:**
    ```bash
    npm run format
    ```

## Adding Content

Follow the authoring guidance alongside each content family. Serialized instruments use `content/instruments/README.md` and must remain unlisted, excluded from sitemaps, and reachable only by exact URL or case-card QR code.
