import type { LLMProvider, ProviderConfig } from '@/types';

interface OpenAIResponse {
  choices: {
    message: {
      content: string;
    };
  }[];
}

export class OpenAIProvider implements LLMProvider {
  name = 'openai';
  private apiKey: string;
  private model: string;
  private baseUrl: string;

  constructor(config?: ProviderConfig) {
    this.apiKey = config?.apiKey || process.env.OPENAI_API_KEY || '';
    this.model = config?.model || process.env.OPENAI_MODEL || 'gpt-4o';
    this.baseUrl = config?.baseUrl || 'https://api.openai.com/v1';

    if (!this.apiKey) {
      throw new Error(
        'OpenAI API key is required. Set OPENAI_API_KEY env var or configure in config file.'
      );
    }
  }

  async complete(prompt: string): Promise<string> {
    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.model,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`OpenAI API error: ${response.status} ${response.statusText}\n${error}`);
    }

    const data = (await response.json()) as OpenAIResponse;
    return data.choices[0]?.message?.content || '';
  }
}
