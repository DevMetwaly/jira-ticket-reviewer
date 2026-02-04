import type { JiraIssue } from '@/types';
import { convertAdfToText } from '@/utils/adf';

interface JiraApiResponse {
  key: string;
  fields: {
    summary: string;
    status: { name: string };
    priority: { name: string } | null;
    issuetype: { name: string };
    assignee: { displayName: string } | null;
    reporter: { displayName: string } | null;
    created: string;
    updated: string;
    labels: string[];
    components: { name: string }[];
    fixVersions: { name: string }[];
    project: { name: string; key: string };
    description: unknown;
  };
}

export async function fetchJiraIssue(
  baseUrl: string,
  issueKey: string,
  email: string,
  token: string
): Promise<JiraApiResponse> {
  const url = `${baseUrl.replace(/\/$/, '')}/rest/api/3/issue/${issueKey}`;

  const auth = Buffer.from(`${email}:${token}`).toString('base64');

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      Authorization: `Basic ${auth}`,
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Failed to fetch Jira issue ${issueKey}: ${response.status} ${response.statusText}\n${errorText}`
    );
  }

  return response.json() as Promise<JiraApiResponse>;
}

export function normalizeJiraResponse(response: JiraApiResponse, baseUrl: string): JiraIssue {
  const { key, fields } = response;

  // Handle description - can be ADF (Atlassian Document Format) or plain text
  let description = '';
  if (fields.description) {
    if (typeof fields.description === 'string') {
      description = fields.description;
    } else if (typeof fields.description === 'object') {
      // ADF format
      description = convertAdfToText(fields.description);
    }
  }

  return {
    key,
    summary: fields.summary || '',
    status: fields.status?.name || '',
    priority: fields.priority?.name || '',
    issueType: fields.issuetype?.name || '',
    assignee: fields.assignee?.displayName || 'Unassigned',
    reporter: fields.reporter?.displayName || '',
    created: fields.created || '',
    updated: fields.updated || '',
    labels: fields.labels?.join(', ') || '',
    components: fields.components?.map((c) => c.name).join(', ') || '',
    fixVersions: fields.fixVersions?.map((v) => v.name).join(', ') || '',
    project: fields.project?.name || '',
    url: `${baseUrl.replace(/\/$/, '')}/browse/${key}`,
    description,
  };
}

export function parseManualInput(jsonContent: string): JiraIssue {
  const data = JSON.parse(jsonContent);

  // If it looks like a raw Jira API response, normalize it
  if (data.fields && data.key) {
    return normalizeJiraResponse(
      data as JiraApiResponse,
      data.baseUrl || 'https://jira.example.com'
    );
  }

  // Otherwise, assume it's already in our normalized format
  return {
    key: data.key || 'UNKNOWN',
    summary: data.summary || '',
    status: data.status || '',
    priority: data.priority || '',
    issueType: data.issueType || data.type || '',
    assignee: data.assignee || 'Unassigned',
    reporter: data.reporter || '',
    created: data.created || '',
    updated: data.updated || '',
    labels: Array.isArray(data.labels) ? data.labels.join(', ') : data.labels || '',
    components: Array.isArray(data.components) ? data.components.join(', ') : data.components || '',
    fixVersions: Array.isArray(data.fixVersions)
      ? data.fixVersions.join(', ')
      : data.fixVersions || '',
    project: data.project || '',
    url: data.url || '',
    description: data.description || '',
  };
}
