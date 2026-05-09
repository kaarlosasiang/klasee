# Klasee Web App

Next.js frontend for the Klasee school management system.

## Getting Started

### Development

```bash
# Install dependencies (from root)
pnpm install

# Run development server
pnpm run dev:web
```

Open [http://localhost:3000](http://localhost:3000) to see the result.

### Building

```bash
pnpm run build:web
```

## Environment Variables

See `.env` for available configuration options.

## Tech Stack

- **Framework**: Next.js 16
- **Styling**: Tailwind CSS v4
- **State Management**: Zustand
- **Forms**: React Hook Form
- **Notifications**: Sonner
- **HTTP Client**: Axios

## Project Structure

```
app/          - Next.js app router
components/   - React components
lib/          - Utilities and helpers
```
