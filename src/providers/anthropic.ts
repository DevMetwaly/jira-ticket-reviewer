import type { LLMProvider, ProviderConfig } from '@/types';

interface AnthropicResponse {
  content: {
    type: string;
    text: string;
  }[];
}

export class AnthropicProvider implements LLMProvider {
  name = 'anthropic';
  private apiKey: string;
  private model: string;
  private baseUrl: string;

  constructor(config?: ProviderConfig) {
    this.apiKey = config?.apiKey || process.env.ANTHROPIC_API_KEY || '';
    this.model = config?.model || process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-20250514';
    this.baseUrl = config?.baseUrl || 'https://api.anthropic.com/v1';

    if (!this.apiKey) {
      throw new Error(
        'Anthropic API key is required. Set ANTHROPIC_API_KEY env var or configure in config file.'
      );
    }
  }

  async complete(prompt: string): Promise<string> {
    const response = await fetch(`${this.baseUrl}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: this.model,
        max_tokens: 4096,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Anthropic API error: ${response.status} ${response.statusText}\n${error}`);
    }

    const data = (await response.json()) as AnthropicResponse;
    const textContent = data.content.find((c) => c.type === 'text');
    return textContent?.text || '';
  }
}
