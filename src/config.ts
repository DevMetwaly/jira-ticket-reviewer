import { existsSync, readFileSync } from 'fs';
import { join, dirname } from 'path';
import type { Config, CLIOptions, ProviderConfig } from '@/types';

const CONFIG_FILE_NAME = '.jira-ticket-reviewer.json';

function findConfigFile(cwd?: string): string | null {
  // Check specified directory or current directory
  const searchDir = cwd || process.cwd();
  const cwdConfig = join(searchDir, CONFIG_FILE_NAME);
  if (existsSync(cwdConfig)) {
    return cwdConfig;
  }

  // If we searched a specific directory and didn't find it, don't fallback to home
  // unless it's the current directory search
  if (cwd) {
    return null;
  }

  // Check home directory
  const homeDir = process.env.HOME || process.env.USERPROFILE || '';
  const homeConfig = join(homeDir, CONFIG_FILE_NAME);
  if (existsSync(homeConfig)) {
    return homeConfig;
  }

  return null;
}

function loadConfigFile(cwd?: string): Partial<Config> {
  const configPath = findConfigFile(cwd);
  if (!configPath) {
    return {};
  }

  try {
    const content = readFileSync(configPath, 'utf-8');
    return JSON.parse(content) as Partial<Config>;
  } catch {
    console.warn(`Warning: Could not parse config file at ${configPath}`);
    return {};
  }
}

function getEnvConfig(): Partial<Config> {
  const providers: Config['providers'] = {};

  if (process.env.OPENAI_API_KEY || process.env.OPENAI_MODEL) {
    providers.openai = {
      name: 'openai',
      apiKey: process.env.OPENAI_API_KEY,
      model: process.env.OPENAI_MODEL,
    };
  }

  if (process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_MODEL) {
    providers.anthropic = {
      name: 'anthropic',
      apiKey: process.env.ANTHROPIC_API_KEY,
      model: process.env.ANTHROPIC_MODEL,
    };
  }

  if (process.env.GEMINI_API_KEY || process.env.GEMINI_MODEL) {
    providers.gemini = {
      name: 'gemini',
      apiKey: process.env.GEMINI_API_KEY,
      model: process.env.GEMINI_MODEL,
    };
  }

  if (process.env.LOCAL_LLM_URL || process.env.LOCAL_LLM_MODEL) {
    providers.local = {
      name: 'local',
      baseUrl: process.env.LOCAL_LLM_URL,
      model: process.env.LOCAL_LLM_MODEL,
    };
  }

  if (
    process.env.CUSTOM_LLM_API_KEY ||
    process.env.CUSTOM_LLM_URL ||
    process.env.CUSTOM_LLM_MODEL
  ) {
    providers.custom = {
      name: 'custom',
      apiKey: process.env.CUSTOM_LLM_API_KEY,
      baseUrl: process.env.CUSTOM_LLM_URL,
      model: process.env.CUSTOM_LLM_MODEL,
    };
  }

  return {
    jira: {
      baseUrl: process.env.JIRA_BASE_URL,
      token: process.env.JIRA_TOKEN,
      email: process.env.JIRA_EMAIL,
    },
    provider: process.env.LLM_PROVIDER,
    providers,
    promptFile: process.env.PROMPT_FILE,
    outputDir: process.env.OUTPUT_DIR,
  };
}

function mergeConfigs(...configs: Partial<Config>[]): Config {
  const defaultConfig: Config = {
    jira: {},
    provider: 'openai',
    providers: {
      openai: { name: 'openai' },
      anthropic: { name: 'anthropic' },
      gemini: { name: 'gemini' },
      local: { name: 'local' },
      custom: { name: 'custom' },
    },
  };

  let result = { ...defaultConfig };

  for (const config of configs) {
    if (!config) continue;

    const mergedProviders = { ...result.providers };
    if (config.providers) {
      for (const [key, value] of Object.entries(config.providers)) {
        if (value) {
          const providerKey = key as keyof Config['providers'];
          mergedProviders[providerKey] = {
            ...mergedProviders[providerKey],
            ...value,
          } as ProviderConfig;
        }
      }
    }

    result = {
      ...result,
      ...config,
      jira: {
        ...result.jira,
        ...config.jira,
      },
      providers: mergedProviders,
    };
  }

  // Remove undefined values from jira config
  if (result.jira) {
    result.jira = Object.fromEntries(
      Object.entries(result.jira).filter(([, v]) => v !== undefined)
    ) as Config['jira'];
  }

  return result;
}

export function loadConfig(cliOptions: CLIOptions): Config {
  // 1. Load from current directory or home
  const globalConfig = loadConfigFile();

  // 2. Load from input file directory if provided
  let inputDirConfig: Partial<Config> = {};
  if (cliOptions.input) {
    const inputDir = dirname(cliOptions.input);
    inputDirConfig = loadConfigFile(inputDir);
  }

  const envConfig = getEnvConfig();

  // CLI options take highest priority
  const cliConfig: Partial<Config> = {
    jira: {
      baseUrl: cliOptions.jiraBaseUrl,
      token: cliOptions.jiraToken,
      email: cliOptions.jiraEmail,
    },
    provider: cliOptions.provider,
    promptFile: cliOptions.prompt,
  };

  // Merge: global -> inputDir -> env -> cli (cli wins)
  return mergeConfigs(globalConfig, inputDirConfig, envConfig, cliConfig);
}
