export interface JiraIssue {
  key: string;
  summary: string;
  status: string;
  priority: string;
  issueType: string;
  assignee: string;
  reporter: string;
  created: string;
  updated: string;
  labels: string;
  components: string;
  fixVersions: string;
  project: string;
  url: string;
  description: string;
}

export interface JiraConfig {
  baseUrl?: string;
  token?: string;
  email?: string;
}

export interface ProviderConfig {
  name: string;
  apiKey?: string;
  model?: string;
  baseUrl?: string;
}

export interface Config {
  jira: JiraConfig;
  provider: string;
  providers: {
    openai?: ProviderConfig;
    anthropic?: ProviderConfig;
    local?: ProviderConfig;
    custom?: ProviderConfig;
  };
  promptFile?: string;
  outputDir?: string;
}

export interface CLIOptions {
  jiraBaseUrl?: string;
  jiraToken?: string;
  jiraEmail?: string;
  input?: string;
  provider?: string;
  prompt?: string;
  output?: string;
  noStdout?: boolean;
  noFile?: boolean;
}

export interface LLMProvider {
  name: string;
  complete(prompt: string): Promise<string>;
}
