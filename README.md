# jira-ticket-reviewer

CLI tool to review Jira issues using AI models.

## Installation

```bash
npm install -g jira-ticket-reviewer

```

Or run locally:

```bash
npm install
npm run build

```

## Demo

To see the tool in action without a Jira account, you can use the provided demo ticket:

1. Clone the repository:

```bash
git clone https://github.com/your-username/jira-ticket-reviewer.git
cd jira-ticket-reviewer

```

2. Install dependencies and build:

```bash
npm install
npm run build

```

3. Run the demo using the example ticket:

```bash
node dist/index.js --input demo/ticket.json
```

You can also try using a custom prompt:

```bash
node dist/index.js --input demo/ticket.json --prompt demo/custom-prompt.txt
```

> **Note:** You still need to configure an LLM provider (e.g., OpenAI API key) as described in the [Configuration](#configuration) section. You can use `demo/.jira-ticket-reviewer.json` as a starting point for your configuration.

## Usage

### Basic usage (fetch from Jira)

```bash
jira-ticket-reviewer PROJ-123


```

### Manual input (JSON file)

```bash
jira-ticket-reviewer --input ticket.json


```

### Options

| Option                  | Description                                            |
| ----------------------- | ------------------------------------------------------ |
| `--jira-base-url <url>` | Jira base URL                                          |
| `--jira-token <token>`  | Jira API token                                         |
| `--jira-email <email>`  | Jira account email                                     |
| `-i, --input <file>`    | Manual input JSON file instead of fetching from Jira   |
| `-p, --provider <name>` | LLM provider: `openai`, `anthropic`, `local`, `custom` |
| `--prompt <file>`       | Custom prompt template file                            |
| `-o, --output <file>`   | Output file path (default: `<ISSUE_KEY>.md`)           |
| `--no-stdout`           | Disable stdout output                                  |
| `--no-file`             | Disable file output                                    |

## Configuration

### Config file

Create `.jira-ticket-reviewer.json` in your project root or home directory:

```json
{
  "jira": {
    "baseUrl": "https://your-company.atlassian.net",
    "email": "your-email@example.com",
    "token": "your-jira-api-token"
  },
  "provider": "openai",
  "providers": {
    "openai": {
      "apiKey": "sk-...",
      "model": "gpt-4o"
    },
    "anthropic": {
      "apiKey": "sk-ant-...",
      "model": "claude-sonnet-4-20250514"
    },
    "local": {
      "baseUrl": "http://localhost:11434/api",
      "model": "llama2"
    }
  }
}


```

### Environment variables

Environment variables override config file values:

| Variable             | Description                                           |
| -------------------- | ----------------------------------------------------- |
| `JIRA_BASE_URL`      | Jira base URL                                         |
| `JIRA_TOKEN`         | Jira API token                                        |
| `JIRA_EMAIL`         | Jira account email                                    |
| `LLM_PROVIDER`       | Default LLM provider                                  |
| `OPENAI_API_KEY`     | OpenAI API key                                        |
| `OPENAI_MODEL`       | OpenAI model (default: `gpt-4o`)                      |
| `ANTHROPIC_API_KEY`  | Anthropic API key                                     |
| `ANTHROPIC_MODEL`    | Anthropic model (default: `claude-sonnet-4-20250514`) |
| `LOCAL_LLM_URL`      | Local LLM endpoint URL                                |
| `LOCAL_LLM_MODEL`    | Local LLM model name                                  |
| `CUSTOM_LLM_URL`     | Custom LLM endpoint URL                               |
| `CUSTOM_LLM_API_KEY` | Custom LLM API key                                    |
| `CUSTOM_LLM_MODEL`   | Custom LLM model                                      |
| `PROMPT_FILE`        | Path to custom prompt template                        |

## Custom prompts

Create a custom prompt template using `{{placeholder}}` syntax:

```text
Review this Jira ticket:

Key: {{key}}
Summary: {{summary}}
Description: {{description}}

Please provide:
1. Clarity issues
2. Missing requirements
3. Suggested improvements


```

Available placeholders:

- `{{key}}` - Issue key (e.g., PROJ-123)
- `{{summary}}` - Issue summary
- `{{status}}` - Issue status
- `{{priority}}` - Issue priority
- `{{issueType}}` - Issue type
- `{{assignee}}` - Assignee name
- `{{reporter}}` - Reporter name
- `{{created}}` - Created date
- `{{updated}}` - Updated date
- `{{labels}}` - Labels (comma-separated)
- `{{components}}` - Components (comma-separated)
- `{{fixVersions}}` - Fix versions (comma-separated)
- `{{project}}` - Project name
- `{{url}}` - Jira issue URL
- `{{description}}` - Full description

## Manual input format

When using `--input`, provide a JSON file with issue details:

```json
{
  "key": "PROJ-123",
  "summary": "Implement user authentication",
  "status": "In Progress",
  "priority": "High",
  "issueType": "Story",
  "assignee": "John Doe",
  "reporter": "Jane Smith",
  "description": "As a user, I want to...",
  "labels": ["backend", "security"],
  "components": ["auth"],
  "project": "My Project"
}


```

## Providers

### OpenAI

Uses the OpenAI Chat Completions API. Set `OPENAI_API_KEY` or configure in config file.

### Anthropic

Uses the Anthropic Messages API. Set `ANTHROPIC_API_KEY` or configure in config file.

### Local

Supports local LLM servers with OpenAI-compatible APIs or Ollama. Default URL: `http://localhost:11434/api`

### Custom

For any other LLM endpoint that accepts OpenAI-style requests. Configure `baseUrl`, `apiKey`, and `model`.

## License

MIT
