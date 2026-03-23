# Invoice Data Extractor

Extracts structured data from invoice images using AI (OpenRouter API with Google Gemini Vision).

## Prerequisites

- Node.js v18 or higher
- An [OpenRouter](https://openrouter.ai/) account and API key

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

## Supported File Types

`.jpg`, `.jpeg`, `.png`, `.webp`, `.gif`

## Output

Extracted data is printed to the console and saved as a JSON file
alongside the input image.

Example: `invoices/invoice_1.jpg` → `invoices/invoice_1_extracted.json`
```json
{
  "vendor": { "name": "", "address": "", "tax_id": "", "iban": "" },
  "client": { "name": "", "address": "", "tax_id": "" },
  "invoice_number": "",
  "invoice_date": "YYYY-MM-DD",
  "totals": { "net_worth": 0, "vat": 0, "grand_total": 0 },
  "line_items": [
    {
      "description": "",
      "quantity": 0,
      "unit_of_measure": "",
      "unit_price": 0,
      "net_worth": 0,
      "vat_percent": 0,
      "line_total": 0
    }
  ]
}
```

## Project Structure
```
invoice_extractor/
├── invoices/          # Place invoice images here
├── src/
│   └── index.ts       # Main extraction logic
├── .env               # API key (not committed)
├── .gitignore
├── package.json
└── tsconfig.json
```

## Tech Stack

- Node.js + TypeScript
- OpenRouter API (Google Gemini 2.0 Flash — vision model)
- dotenv for config