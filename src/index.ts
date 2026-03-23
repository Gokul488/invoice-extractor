import * as fs from "fs";
import * as path from "path";
import * as dotenv from "dotenv";

dotenv.config();

interface LineItem {
  description: string;
  quantity: number;
  unit_of_measure: string;
  unit_price: number;
  net_worth: number;
  vat_percent: number;
  line_total: number;
}

interface InvoiceData {
  vendor: {
    name: string;
    address: string;
    tax_id?: string;
    iban?: string;
  };
  client: {
    name: string;
    address: string;
    tax_id?: string;
  };
  invoice_number: string;
  invoice_date: string;
  totals: {
    net_worth: number;
    vat: number;
    grand_total: number;
  };
  line_items: LineItem[];
}

interface OpenRouterResponse {
  choices: Array<{
    message: { content: string };
  }>;
}

function imageToBase64(filePath: string): string {
  const absolutePath = path.resolve(filePath);
  const imageBuffer = fs.readFileSync(absolutePath);
  return imageBuffer.toString("base64");
}

function getMimeType(filePath: string): string {
  const ext = path.extname(filePath).toLowerCase();
  const mimeTypes: Record<string, string> = {
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".webp": "image/webp",
    ".gif": "image/gif",
  };
  return mimeTypes[ext] ?? "image/jpeg";
}

async function extractInvoiceData(imagePath: string): Promise<InvoiceData> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) throw new Error("OPENROUTER_API_KEY not set in .env");

  const base64Image = imageToBase64(imagePath);
  const mimeType = getMimeType(imagePath);

  const prompt = `
You are an invoice data extraction assistant.
Carefully read the invoice image and extract all information.
Return ONLY a valid JSON object — no explanation, no markdown, no code fences.

The JSON must follow this exact structure:
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

If a field is not found in the invoice, use null for strings and 0 for numbers.
`;

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-2.0-flash-001",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image_url",
              image_url: {
                url: `data:${mimeType};base64,${base64Image}`,
              },
            },
            {
              type: "text",
              text: prompt,
            },
          ],
        },
      ],
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenRouter API error: ${response.status} - ${error}`);
  }

  const data = await response.json() as OpenRouterResponse;

  if (!data.choices || data.choices.length === 0) {
    throw new Error("No response from AI model");
  }

  const rawText: string = data.choices[0]!.message.content;
  const cleaned = rawText.replace(/```json|```/g, "").trim();

  const invoiceData: InvoiceData = JSON.parse(cleaned) as InvoiceData;
  return invoiceData;
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.error("Usage: npx ts-node src/index.ts <path-to-invoice-image>");
    console.error("Example: npx ts-node src/index.ts invoices/sample.jpg");
    process.exit(1);
  }

  const imagePath = args[0] ?? "";

  if (!imagePath) {
    console.error("No file path provided.");
    process.exit(1);
  }

  if (!fs.existsSync(imagePath)) {
    console.error(`File not found: ${imagePath}`);
    process.exit(1);
  }

  console.log(`\nProcessing invoice: ${imagePath}`);
  console.log("Sending to AI model...\n");

  const result = await extractInvoiceData(imagePath);

  console.log("Extracted Invoice Data:");
  console.log("─".repeat(50));
  console.log(JSON.stringify(result, null, 2));

  const outputPath = imagePath.replace(/\.(jpg|jpeg|png|webp|gif)$/i, "_extracted.json");
  fs.writeFileSync(outputPath, JSON.stringify(result, null, 2));
  console.log(`\nSaved to: ${outputPath}`);
}

main().catch(console.error);