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

    Required variables:
    - `GOOGLE_GENERATIVE_AI_API_KEY`: Required for AI summary generation. You can get an API key from [Google AI Studio](https://aistudio.google.com/apikey).

4.  **Start the development server:**
    ```bash
    npm run dev
    ```
    Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure

- `app/`: Next.js App Router pages and layouts.
- `components/`: React components.
    - `blog/`: Blog-specific components.
    - `features/`: Feature-specific components (e.g., PowerCalculator).
    - `navigation/`: Navigation components (Header, Footer, Nav).
    - `shared/`: Shared utilities and providers.
    - `ui/`: Reusable UI components (Shadcn UI).
- `content/`: MDX content for blog and docs.
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

To add a new blog post, create a new `.mdx` file in `content/blog/`. Ensure it has the required frontmatter:

```yaml
---
title: 'My New Post'
date: '2023-10-27'
summary: 'Optional summary. If omitted, AI will generate one.'
tags: ['radio', 'electronics'] # Optional. Used for filtering on the blog page and linking posts to products.
publish: true
---
### About Tags

Tags are optional but recommended. They serve two purposes:
1.  **Filtering**: Allows users to filter posts on the main blog page.
2.  **Product Association**: If a tag matches a product category or slug (e.g., `guitars`, `dummy-load`), the post may appear on that product's page.
```
