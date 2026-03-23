# Invoice Data Extractor

Extracts structured data from invoice images using AI (OpenRouter API).

## Setup

1. Clone the repo and install dependencies:
```bash
   npm install
```

2. Create a `.env` file in the root:
```
   OPENROUTER_API_KEY=your_api_key_here
```

## Usage
```bash
npx ts-node src/index.ts invoices/sample.jpg
```

The extracted JSON will be printed to the console and saved alongside the input file.

## Tech Stack
- Node.js + TypeScript
- OpenRouter API (Gemini Flash 1.5 — vision model)
- dotenv for config