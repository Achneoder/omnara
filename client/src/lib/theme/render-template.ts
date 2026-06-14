function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function renderTemplate(
  template: string,
  body: Record<string, unknown>,
  propsSchema: Record<string, string>,
): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, placeholder: string) => {
    const bodyKey = propsSchema[placeholder] ?? placeholder;
    const raw = String(body[bodyKey] ?? '');
    return escapeHtml(raw);
  });
}
