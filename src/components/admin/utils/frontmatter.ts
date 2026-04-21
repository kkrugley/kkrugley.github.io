export interface ParsedFrontmatter {
  frontmatter: Record<string, any>;
  body: string;
}

export function parseFrontmatter(mdxContent: string): ParsedFrontmatter {
  const trimmed = mdxContent.trim();
  
  if (!trimmed.startsWith('---')) {
    return { frontmatter: {}, body: mdxContent };
  }

  const endIndex = trimmed.indexOf('---', 3);
  
  if (endIndex === -1) {
    return { frontmatter: {}, body: mdxContent };
  }

  const yamlContent = trimmed.slice(3, endIndex).trim();
  const body = trimmed.slice(endIndex + 3).trim();

  const frontmatter = parseYamlSimple(yamlContent);

  return { frontmatter, body };
}

function parseYamlSimple(yaml: string): Record<string, any> {
  const result: Record<string, any> = {};
  const lines = yaml.split('\n');
  
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();
    
    if (!trimmed || trimmed.startsWith('#')) {
      i++;
      continue;
    }
    
    const { key, value, consumed } = parseKeyValue(lines, i);
    if (key) result[key] = value;
    i += consumed;
  }
  
  return result;
}

function parseKeyValue(lines: string[], startIndex: number): { key: string; value: any; consumed: number } {
  const line = lines[startIndex];
  const trimmed = line.trim();
  const indent = line.search(/\S/);
  
  const colonPos = trimmed.indexOf(':');
  if (colonPos === -1) {
    return { key: '', value: null, consumed: 1 };
  }
  
  const key = trimmed.slice(0, colonPos).trim();
  const valuePart = trimmed.slice(colonPos + 1).trim();
  
  if (valuePart === '') {
    const { obj, consumed } = parseObjectOrArray(lines, startIndex + 1, indent + 2);
    return { key, value: obj, consumed: consumed + 1 };
  }
  
  if (valuePart.startsWith('[') && valuePart.endsWith(']')) {
    return { key, value: parseInlineArray(valuePart), consumed: 1 };
  }
  
  if (valuePart.startsWith('{') && valuePart.endsWith('}')) {
    return { key, value: parseInlineObject(valuePart), consumed: 1 };
  }
  
  if (valuePart === '[]') {
    return { key, value: [], consumed: 1 };
  }
  
  if (valuePart === '{}') {
    return { key, value: {}, consumed: 1 };
  }
  
  if (valuePart.startsWith('|') || valuePart.startsWith('>')) {
    const { value, consumed } = parseBlockScalar(lines, startIndex + 1, indent + 2, valuePart[0]);
    return { key, value, consumed: consumed + 1 };
  }
  
  return { key, value: parseScalar(valuePart), consumed: 1 };
}

function parseObjectOrArray(lines: string[], startIndex: number, baseIndent: number): { obj: any; consumed: number } {
  const items: any[] = [];
  const obj: Record<string, any> = {};
  let i = startIndex;
  
  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();
    
    if (!trimmed) {
      i++;
      continue;
    }
    
    const indent = line.search(/\S/);
    
    if (indent < baseIndent && trimmed !== '') {
      break;
    }
    
    if (trimmed.startsWith('-')) {
      const value = trimmed.slice(1).trim();
      if (value) {
        items.push(parseScalar(value));
      } else {
        const { obj: nested, consumed } = parseObjectOrArray(lines, i + 1, indent + 2);
        items.push(nested);
        i += consumed;
        continue;
      }
      i++;
      continue;
    }
    
    const colonPos = trimmed.indexOf(':');
    if (colonPos === -1) {
      i++;
      continue;
    }
    
    const key = trimmed.slice(0, colonPos).trim();
    const valuePart = trimmed.slice(colonPos + 1).trim();
    
    if (valuePart === '') {
      const { obj: nested, consumed } = parseObjectOrArray(lines, i + 1, indent + 2);
      obj[key] = nested;
      i += consumed + 1;
    } else if (valuePart.startsWith('[') && valuePart.endsWith(']')) {
      obj[key] = parseInlineArray(valuePart);
      i++;
    } else if (valuePart.startsWith('{') && valuePart.endsWith('}')) {
      obj[key] = parseInlineObject(valuePart);
      i++;
    } else if (valuePart === '[]') {
      obj[key] = [];
      i++;
    } else if (valuePart === '{}') {
      obj[key] = {};
      i++;
    } else if (valuePart === '|' || valuePart === '>') {
      const { value, consumed } = parseBlockScalar(lines, i + 1, indent + 2, valuePart[0]);
      obj[key] = value;
      i += consumed + 1;
    } else {
      obj[key] = parseScalar(valuePart);
      i++;
    }
  }
  
  if (items.length > 0) {
    return { obj: items, consumed: i - startIndex };
  }
  
  const hasObjectKeys = Object.keys(obj).length > 0;
  return { obj: hasObjectKeys ? obj : null, consumed: i - startIndex };
}

function parseBlockScalar(lines: string[], startIndex: number, baseIndent: number, style: string): { value: string; consumed: number } {
  const values: string[] = [];
  let i = startIndex;
  
  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();
    
    if (!trimmed) {
      values.push('');
      i++;
      continue;
    }
    
    const indent = line.search(/\S/);
    
    if (indent < baseIndent && trimmed !== '') {
      break;
    }
    
    values.push(line.slice(baseIndent));
    i++;
  }
  
  const joined = values.join('\n');
  return { value: style === '|' ? joined.replace(/\n+$/, '') : joined.replace(/\n+/g, ' ').trim(), consumed: i - startIndex };
}

function parseInlineArray(arrStr: string): any[] {
  const content = arrStr.slice(1, -1).trim();
  if (!content) return [];
  
  const items: any[] = [];
  let current = '';
  let depth = 0;
  let inString = false;
  let stringChar = '';
  
  for (let i = 0; i < content.length; i++) {
    const char = content[i];
    
    if (!inString && (char === '"' || char === "'")) {
      inString = true;
      stringChar = char;
      current += char;
    } else if (inString && char === stringChar && content[i - 1] !== '\\') {
      inString = false;
      current += char;
    } else if (!inString && char === '[') {
      depth++;
      current += char;
    } else if (!inString && char === ']') {
      depth--;
      current += char;
    } else if (!inString && char === ',' && depth === 0) {
      items.push(parseScalar(current.trim()));
      current = '';
    } else {
      current += char;
    }
  }
  
  if (current.trim()) {
    items.push(parseScalar(current.trim()));
  }
  
  return items;
}

function parseInlineObject(objStr: string): Record<string, any> {
  const content = objStr.slice(1, -1).trim();
  if (!content) return {};
  
  const result: Record<string, any> = {};
  let key = '';
  let value = '';
  let readingKey = true;
  let depth = 0;
  let inString = false;
  let stringChar = '';
  
  for (let i = 0; i < content.length; i++) {
    const char = content[i];
    
    if (!inString && (char === '"' || char === "'")) {
      inString = true;
      stringChar = char;
      if (readingKey) key += char;
      else value += char;
    } else if (inString && char === stringChar && content[i - 1] !== '\\') {
      inString = false;
      if (readingKey) key += char;
      else value += char;
    } else if (!inString) {
      if (readingKey) {
        if (char === ':') {
          readingKey = false;
        } else {
          key += char;
        }
      } else {
        if (char === '{') depth++;
        else if (char === '}') depth--;
        
        if (char === ',' && depth === 0) {
          const parts = value.split(':');
          if (parts.length >= 2) {
            const k = parts[0].trim();
            const v = parts.slice(1).join(':').trim();
            result[k] = parseScalar(v);
          }
          key = '';
          value = '';
          readingKey = true;
        } else {
          value += char;
        }
      }
    } else {
      if (readingKey) key += char;
      else value += char;
    }
  }
  
  if (key) {
    const parts = value.split(':');
    if (parts.length >= 2) {
      const k = parts[0].trim();
      const v = parts.slice(1).join(':').trim();
      result[k] = parseScalar(v);
    }
  }
  
  return result;
}

function parseScalar(value: string): any {
  const trimmed = value.trim();
  
  if (trimmed === 'true') return true;
  if (trimmed === 'false') return false;
  if (trimmed === 'null' || trimmed === '~') return null;
  
  const numberMatch = trimmed.match(/^-?\d+(\.\d+)?$/);
  if (numberMatch) {
    return Number(trimmed);
  }
  
  if ((trimmed.startsWith('"') && trimmed.endsWith('"')) ||
      (trimmed.startsWith("'") && trimmed.endsWith("'"))) {
    return trimmed.slice(1, -1);
  }
  
  if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
    return parseInlineArray(trimmed);
  }
  
  if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
    return parseInlineObject(trimmed);
  }
  
  return trimmed;
}

export function serializeFrontmatter(frontmatter: Record<string, any>): string {
  const lines: string[] = [];
  
  for (const [key, value] of Object.entries(frontmatter)) {
    lines.push(serializeValue(key, value, 0));
  }
  
  return lines.join('\n');
}

function serializeValue(key: string, value: any, indent: number): string {
  const prefix = '  '.repeat(indent);
  
  if (value === null) {
    return `${prefix}${key}: null`;
  }
  
  if (typeof value === 'boolean') {
    return `${prefix}${key}: ${value}`;
  }
  
  if (typeof value === 'number') {
    return `${prefix}${key}: ${value}`;
  }
  
  if (typeof value === 'string') {
    if (value.includes('\n')) {
      const blockIndent = '  '.repeat(indent + 1);
      const lines = value.split('\n').map(l => `${blockIndent}${l}`).join('\n');
      return `${prefix}${key}: |\n${lines}`;
    }
    if (!value || value.includes(':') || value.includes('#') ||
        value.includes('"') || value.startsWith(' ') || value.endsWith(' ')) {
      const escaped = value.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
      return `${prefix}${key}: "${escaped}"`;
    }
    return `${prefix}${key}: ${value}`;
  }
  
  if (Array.isArray(value)) {
    if (value.length === 0) {
      return `${prefix}${key}: []`;
    }
    
    const items = value.map(item => serializeArrayItem(item, indent + 1)).join('\n');
    return `${prefix}${key}:\n${items}`;
  }
  
  if (typeof value === 'object' && value !== null) {
    if (Object.keys(value).length === 0) {
      return `${prefix}${key}: {}`;
    }
    
    const nested = Object.entries(value)
      .map(([k, v]) => serializeValue(k, v, indent + 1))
      .join('\n');
    return `${prefix}${key}:\n${nested}`;
  }
  
  return `${prefix}${key}: ${String(value)}`;
}

function serializeArrayItem(item: any, indent: number): string {
  const prefix = '  '.repeat(indent);
  
  if (item === null) return `${prefix}- null`;
  if (typeof item === 'boolean') return `${prefix}- ${item}`;
  if (typeof item === 'number') return `${prefix}- ${item}`;
  
  if (typeof item === 'string') {
    if (item.includes('\n') || item.includes(':') || item.includes('#') ||
        item.includes('"') || item.startsWith(' ') || item.endsWith(' ')) {
      const escaped = item.replace(/"/g, '\\"');
      return `${prefix}- "${escaped}"`;
    }
    return `${prefix}- ${item}`;
  }
  
  if (Array.isArray(item)) {
    return `${prefix}-\n${item.map(i => serializeArrayItem(i, indent + 1)).join('\n')}`;
  }
  
  if (typeof item === 'object' && item !== null) {
    const nested = Object.entries(item)
      .map(([k, v]) => serializeValue(k, v, indent + 1))
      .join('\n');
    return `${prefix}-\n${nested}`;
  }
  
  return `${prefix}- ${String(item)}`;
}

export function serializeMDX(frontmatter: Record<string, any>, body: string): string {
  const yaml = serializeFrontmatter(frontmatter);
  
  if (!yaml) {
    return body;
  }
  
  return `---\n${yaml}\n---\n\n${body}`;
}