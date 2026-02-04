import type { LLMProvider, ProviderConfig } from '@/types';

interface GeminiResponse {
  candidates: {
    content: {
      parts: {
        text: string;
      }[];
    };
  }[];
  error?: {
    code: number;
    message: string;
    status: string;
  };
}

export class GeminiProvider implements LLMProvider {
  name = 'gemini';
  private apiKey: string;
  private model: string;
  private baseUrl: string;

  constructor(config?: ProviderConfig) {
    this.apiKey = config?.apiKey || process.env.GEMINI_API_KEY || '';
    this.model = config?.model || process.env.GEMINI_MODEL || 'gemini-2.0-flash';
    this.baseUrl = config?.baseUrl || 'https://generativelanguage.googleapis.com/v1beta';

    if (!this.apiKey) {
      throw new Error(
        'Gemini API key is required. Set GEMINI_API_KEY env var or configure in config file.'
      );
    }
  }

  async complete(prompt: string): Promise<string> {
    const url = `${this.baseUrl}/models/${this.model}:generateContent?key=${this.apiKey}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 8192,
        },
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Gemini API error: ${response.status} ${response.statusText}\n${error}`);
    }

    const data = (await response.json()) as GeminiResponse;

    if (data.error) {
      throw new Error(`Gemini API error: ${data.error.code} ${data.error.message}`);
    }

    const textContent = data.candidates?.[0]?.content?.parts?.[0]?.text;
    return textContent || '';
  }
}
