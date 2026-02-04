import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import type { Config, CLIOptions } from '@/types';

const CONFIG_FILE_NAME = '.jira-ticket-reviewer.json';

function findConfigFile(): string | null {
  // Check current directory
  const cwdConfig = join(process.cwd(), CONFIG_FILE_NAME);
  if (existsSync(cwdConfig)) {
    return cwdConfig;
  }

  // Check home directory
  const homeDir = process.env.HOME || process.env.USERPROFILE || '';
  const homeConfig = join(homeDir, CONFIG_FILE_NAME);
  if (existsSync(homeConfig)) {
    return homeConfig;
  }

  return null;
}

function loadConfigFile(): Partial<Config> {
  const configPath = findConfigFile();
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
  return {
    jira: {
      baseUrl: process.env.JIRA_BASE_URL,
      token: process.env.JIRA_TOKEN,
      email: process.env.JIRA_EMAIL,
    },
    provider: process.env.LLM_PROVIDER,
    providers: {
      openai: {
        name: 'openai',
        apiKey: process.env.OPENAI_API_KEY,
        model: process.env.OPENAI_MODEL,
      },
      anthropic: {
        name: 'anthropic',
        apiKey: process.env.ANTHROPIC_API_KEY,
        model: process.env.ANTHROPIC_MODEL,
      },
      local: {
        name: 'local',
        baseUrl: process.env.LOCAL_LLM_URL,
        model: process.env.LOCAL_LLM_MODEL,
      },
      custom: {
        name: 'custom',
        apiKey: process.env.CUSTOM_LLM_API_KEY,
        baseUrl: process.env.CUSTOM_LLM_URL,
        model: process.env.CUSTOM_LLM_MODEL,
      },
    },
    promptFile: process.env.PROMPT_FILE,
    outputDir: process.env.OUTPUT_DIR,
  };
}

function mergeConfigs(...configs: Partial<Config>[]): Config {
  const defaultConfig: Config = {
    jira: {},
    provider: 'openai',
    providers: {},
  };

  let result = { ...defaultConfig };

  for (const config of configs) {
    result = {
      ...result,
      ...config,
      jira: {
        ...result.jira,
        ...config.jira,
      },
      providers: {
        ...result.providers,
        ...config.providers,
      },
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
  const fileConfig = loadConfigFile();
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

  // Merge: file -> env -> cli (cli wins)
  return mergeConfigs(fileConfig, envConfig, cliConfig);
}
