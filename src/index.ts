#!/usr/bin/env node

import { Command } from 'commander';
import { loadConfig } from '@/config';
import { fetchJiraIssue, normalizeJiraResponse, parseManualInput } from '@/jira';
import { renderTemplate } from '@/template';
import { getProvider } from '@/providers/index';
import { writeOutput } from '@/output';
import { defaultPrompt } from '@/prompts/defaultPrompt';
import { readFileSync } from 'fs';
import type { CLIOptions } from '@/types';

const program = new Command();

program
  .name('jira-ticket-reviewer')
  .description('CLI to review Jira issues using AI models')
  .version('0.1.0')
  .argument('[issueKey]', 'Jira issue key (e.g., PROJ-123)')
  .option('--jira-base-url <url>', 'Jira base URL')
  .option('--jira-token <token>', 'Jira API token')
  .option('--jira-email <email>', 'Jira account email')
  .option('-i, --input <file>', 'Manual input JSON file instead of fetching from Jira')
  .option('-p, --provider <name>', 'LLM provider to use (openai, anthropic, gemini, local, custom)')
  .option('--prompt <file>', 'Custom prompt template file')
  .option('-o, --output <file>', 'Output file path (default: <ISSUE_KEY>.md)')
  .option('--no-stdout', 'Disable stdout output')
  .option('--no-file', 'Disable file output')
  .action(async (issueKey: string | undefined, options: CLIOptions) => {
    try {
      await run(issueKey, options);
    } catch (error) {
      console.error('Error:', error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });

async function run(issueKey: string | undefined, options: CLIOptions): Promise<void> {
  // Load configuration
  const config = loadConfig(options);

  // Determine issue key from input or argument
  let issue;

  if (options.input) {
    // Manual input mode
    const inputContent = readFileSync(options.input, 'utf-8');
    issue = parseManualInput(inputContent);
  } else if (issueKey) {
    // Fetch from Jira
    if (!config.jira.baseUrl || !config.jira.token || !config.jira.email) {
      throw new Error(
        'Jira credentials required. Set JIRA_BASE_URL, JIRA_TOKEN, JIRA_EMAIL env vars or use config file.'
      );
    }
    const rawIssue = await fetchJiraIssue(
      config.jira.baseUrl,
      issueKey,
      config.jira.email,
      config.jira.token
    );
    issue = normalizeJiraResponse(rawIssue, config.jira.baseUrl);
  } else {
    program.help();
    return;
  }

  // Load prompt template
  let promptTemplate = defaultPrompt;
  if (options.prompt || config.promptFile) {
    const promptPath = options.prompt || config.promptFile!;
    promptTemplate = readFileSync(promptPath, 'utf-8');
  }

  // Render the prompt with issue details
  const renderedPrompt = renderTemplate(promptTemplate, issue);

  // Get the LLM provider
  const providerName = options.provider || config.provider || 'openai';
  const provider = getProvider(providerName, config);

  // Call the LLM
  console.log(`\nReviewing ${issue.key} using ${provider.name}...\n`);
  const review = await provider.complete(renderedPrompt);

  // Generate markdown output
  const markdown = formatMarkdownOutput(issue.key, issue.summary, review);

  // Determine output file name
  const outputFile = options.output || `${issue.key}.md`;

  // Write output
  await writeOutput(markdown, {
    stdout: options.noStdout !== true,
    file: options.noFile !== true ? outputFile : undefined,
  });
}

function formatMarkdownOutput(key: string, summary: string, review: string): string {
  return `# Review: ${key}

**Summary:** ${summary}

---

${review}
`;
}

program.parse();
