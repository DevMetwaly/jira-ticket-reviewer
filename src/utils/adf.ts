/**
 * Convert Atlassian Document Format (ADF) to plain text.
 * ADF is a JSON-based format used by Jira for rich text fields.
 */

interface AdfNode {
  type: string;
  text?: string;
  content?: AdfNode[];
  attrs?: Record<string, unknown>;
}

export function convertAdfToText(adf: unknown): string {
  if (!adf || typeof adf !== 'object') {
    return '';
  }

  const node = adf as AdfNode;
  return processNode(node).trim();
}

function processNode(node: AdfNode): string {
  if (!node) return '';

  // Handle text nodes
  if (node.type === 'text' && node.text) {
    return node.text;
  }

  // Handle nodes with content
  if (node.content && Array.isArray(node.content)) {
    const childText = node.content.map(processNode).join('');

    // Add formatting based on node type
    switch (node.type) {
      case 'paragraph':
        return childText + '\n\n';
      case 'heading':
        return childText + '\n\n';
      case 'bulletList':
      case 'orderedList':
        return childText + '\n';
      case 'listItem':
        return '- ' + childText.trim() + '\n';
      case 'codeBlock':
        return '```\n' + childText + '\n```\n\n';
      case 'blockquote':
        return '> ' + childText.split('\n').join('\n> ') + '\n\n';
      case 'hardBreak':
        return '\n';
      default:
        return childText;
    }
  }

  return '';
}
