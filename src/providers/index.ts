import type { Config, LLMProvider } from '@/types';
import { OpenAIProvider } from '@/providers/openai';
import { AnthropicProvider } from '@/providers/anthropic';
import { LocalProvider } from '@/providers/local';

export function getProvider(name: string, config: Config): LLMProvider {
  switch (name.toLowerCase()) {
    case 'openai':
      return new OpenAIProvider(config.providers.openai);
    case 'anthropic':
      return new AnthropicProvider(config.providers.anthropic);
    case 'local':
      return new LocalProvider(config.providers.local);
    case 'custom':
      return createCustomProvider(config.providers.custom);
    default:
      throw new Error(`Unknown provider: ${name}. Available: openai, anthropic, local, custom`);
  }
}

function createCustomProvider(providerConfig: Config['providers']['custom']): LLMProvider {
  if (!providerConfig?.baseUrl) {
    throw new Error('Custom provider requires baseUrl to be set');
  }

  return {
    name: 'custom',
    async complete(prompt: string): Promise<string> {
      const response = await fetch(providerConfig.baseUrl!, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(providerConfig.apiKey ? { Authorization: `Bearer ${providerConfig.apiKey}` } : {}),
        },
        body: JSON.stringify({
          model: providerConfig.model || 'default',
          messages: [{ role: 'user', content: prompt }],
        }),
      });

      if (!response.ok) {
        throw new Error(`Custom provider error: ${response.status} ${response.statusText}`);
      }

      const data = (await response.json()) as {
        choices?: { message?: { content?: string } }[];
        response?: string;
        content?: string;
      };

      // Try common response formats
      return (
        data.choices?.[0]?.message?.content || data.response || data.content || JSON.stringify(data)
      );
    },
  };
}

export { OpenAIProvider } from '@/providers/openai';
export { AnthropicProvider } from '@/providers/anthropic';
export { LocalProvider } from '@/providers/local';
