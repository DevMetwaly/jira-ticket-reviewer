import type { JiraIssue } from '@/types';

/**
 * Render a template string by replacing {{placeholders}} with values from the issue.
 */
export function renderTemplate(template: string, issue: JiraIssue): string {
  const variables: Record<string, string> = {
    key: issue.key,
    summary: issue.summary,
    status: issue.status,
    priority: issue.priority,
    issueType: issue.issueType,
    assignee: issue.assignee,
    reporter: issue.reporter,
    created: issue.created,
    updated: issue.updated,
    labels: issue.labels,
    components: issue.components,
    fixVersions: issue.fixVersions,
    project: issue.project,
    url: issue.url,
    description: issue.description,
  };

  return template.replace(/\{\{(\w+)\}\}/g, (match, key: string) => {
    return variables[key] ?? '';
  });
}
