import { describe, it, expect } from 'vitest';
import { renderTemplate } from './render-template.js';

describe('renderTemplate', () => {
  it('substitutes a placeholder with the matching body value', () => {
    const result = renderTemplate('Hello {{name}}!', { name: 'World' }, {});
    expect(result).toBe('Hello World!');
  });

  it('uses propsSchema mapping to resolve body keys', () => {
    const result = renderTemplate(
      '<h1>{{title}}</h1>',
      { headline: 'My Post' },
      { title: 'headline' },
    );
    expect(result).toBe('<h1>My Post</h1>');
  });

  it('falls back to placeholder name when no propsSchema entry exists', () => {
    const result = renderTemplate('{{foo}}', { foo: 'bar' }, {});
    expect(result).toBe('bar');
  });

  it('HTML-escapes < and > to prevent XSS', () => {
    const result = renderTemplate('{{content}}', { content: '<script>alert(1)</script>' }, {});
    expect(result).toBe('&lt;script&gt;alert(1)&lt;/script&gt;');
  });

  it('HTML-escapes double quotes', () => {
    const result = renderTemplate('{{val}}', { val: '"quoted"' }, {});
    expect(result).toBe('&quot;quoted&quot;');
  });

  it('HTML-escapes single quotes', () => {
    const result = renderTemplate('{{val}}', { val: "it's" }, {});
    expect(result).toBe('it&#39;s');
  });

  it('HTML-escapes ampersands', () => {
    const result = renderTemplate('{{val}}', { val: 'A & B' }, {});
    expect(result).toBe('A &amp; B');
  });

  it('replaces an unmatched placeholder with an empty string when body key is missing', () => {
    const result = renderTemplate('Hello {{missing}}!', {}, {});
    expect(result).toBe('Hello !');
  });

  it('handles a body value of null gracefully', () => {
    const result = renderTemplate('{{val}}', { val: null }, {});
    expect(result).toBe('null');
  });

  it('handles multiple placeholders in a single template', () => {
    const result = renderTemplate('{{first}} {{last}}', { first: 'Jane', last: 'Doe' }, {});
    expect(result).toBe('Jane Doe');
  });

  it('applies propsSchema and escaping together', () => {
    const result = renderTemplate(
      '<img src="{{image}}" />',
      { featured_image_url: 'https://example.com/img.png?a=1&b=2' },
      { image: 'featured_image_url' },
    );
    expect(result).toBe('<img src="https://example.com/img.png?a=1&amp;b=2" />');
  });
});
