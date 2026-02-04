import type { LLMProvider, ProviderConfig } from '@/types';

interface LocalLLMResponse {
  choices?: {
    message?: {
      content?: string;
    };
  }[];
  response?: string;
  content?: string;
  message?: {
    content?: string;
  };
}

export class LocalProvider implements LLMProvider {
  name = 'local';
  private baseUrl: string;
  private model: string;

  constructor(config?: ProviderConfig) {
    this.baseUrl = config?.baseUrl || process.env.LOCAL_LLM_URL || 'http://localhost:11434/api';
    this.model = config?.model || process.env.LOCAL_LLM_MODEL || 'llama2';
  }

  async complete(prompt: string): Promise<string> {
    // Try OpenAI-compatible endpoint first (common for local LLMs like LM Studio, text-generation-webui)
    const openaiCompatible = await this.tryOpenAICompatible(prompt);
    if (openaiCompatible !== null) {
      return openaiCompatible;
    }

    // Fall back to Ollama-style endpoint
    return this.tryOllama(prompt);
  }

  private async tryOpenAICompatible(prompt: string): Promise<string | null> {
    try {
      const response = await fetch(`${this.baseUrl}/v1/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.model,
          messages: [{ role: 'user', content: prompt }],
        }),
      });

      if (!response.ok) {
        return null;
      }

      const data = (await response.json()) as LocalLLMResponse;
      return data.choices?.[0]?.message?.content || null;
    } catch {
      return null;
    }
  }

  private async tryOllama(prompt: string): Promise<string> {
    // Ollama uses /api/generate or /api/chat
    const response = await fetch(`${this.baseUrl}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: this.model,
        messages: [{ role: 'user', content: prompt }],
        stream: false,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Local LLM error: ${response.status} ${response.statusText}\n${error}`);
    }

    const data = (await response.json()) as LocalLLMResponse;
    return data.message?.content || data.response || '';
  }
}
