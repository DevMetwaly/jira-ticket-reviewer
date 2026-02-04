export type TemplateVariables = Record<string, string | number | boolean | null | undefined>;

const tokenPattern = /\{\{\s*([a-zA-Z0-9_.-]+)\s*\}\}/g;

export function renderTemplate(template: string, variables: TemplateVariables): string {
  return template.replace(tokenPattern, (_, key: string) => {
    const value = getValueByPath(variables, key);
    if (value === null || value === undefined) {
      return '';
    }
    return String(value);
  });
}

function getValueByPath(variables: TemplateVariables, path: string): unknown {
  if (Object.prototype.hasOwnProperty.call(variables, path)) {
    return variables[path];
  }

  const segments = path.split('.');
  let current: unknown = variables;
  for (const segment of segments) {
    if (current && typeof current === 'object' && segment in current) {
      current = (current as Record<string, unknown>)[segment];
    } else {
      return undefined;
    }
  }
  return current;
}
