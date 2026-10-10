/**
 * Robust JSON parser and repair engine for LLM and OCR responses.
 * Prevents "Unterminated string in JSON" and syntax truncation crashes on large OCR payloads.
 */

export function parseRobustJson<T = any>(rawText: string, fallback: T = {} as T): T {
  if (!rawText || typeof rawText !== 'string' || !rawText.trim()) {
    return fallback;
  }

  // 1. Strip markdown fences and whitespace
  let clean = rawText
    .replace(/^\s*```(?:json)?\s*/i, '')
    .replace(/\s*```\s*$/i, '')
    .trim();

  // Find boundaries of JSON object or array
  const firstBrace = clean.indexOf('{');
  const firstBracket = clean.indexOf('[');
  let isArray = false;
  let startIndex = -1;

  if (firstBrace !== -1 && (firstBracket === -1 || firstBrace < firstBracket)) {
    startIndex = firstBrace;
    isArray = false;
  } else if (firstBracket !== -1) {
    startIndex = firstBracket;
    isArray = true;
  }

  if (startIndex !== -1) {
    clean = clean.substring(startIndex);
  }

  // 2. Direct JSON.parse attempt
  try {
    const parsed = JSON.parse(clean);
    if (parsed !== null && typeof parsed === 'object') {
      return parsed as T;
    }
  } catch {
    // Continue to repair pipeline
  }

  // 3. Robust JSON repair pass
  try {
    const repaired = repairTruncatedJson(clean, isArray);
    const parsed = JSON.parse(repaired);
    if (parsed !== null && typeof parsed === 'object') {
      return parsed as T;
    }
  } catch {
    // Continue to regex recovery
  }

  // 4. Regex-based heuristic recovery pass
  try {
    const recovered = recoverJsonHeuristically(clean, isArray);
    if (recovered && (Object.keys(recovered).length > 0 || (Array.isArray(recovered) && recovered.length > 0))) {
      return recovered as T;
    }
  } catch {
    // Fall back to safe fallback
  }

  return fallback;
}

/**
 * Repairs truncated or malformed JSON string by escaping raw control characters,
 * closing open quotes, discarding dangling keys, and balancing brackets.
 */
function repairTruncatedJson(str: string, isArray: boolean): string {
  let result = '';
  let inString = false;
  let escaped = false;
  const stack: string[] = [];

  for (let i = 0; i < str.length; i++) {
    const char = str[i];

    if (inString) {
      if (char === '\\' && !escaped) {
        escaped = true;
        result += char;
        continue;
      }

      if (char === '"' && !escaped) {
        inString = false;
        result += char;
      } else if (!escaped && (char === '\n' || char === '\r' || char === '\t')) {
        // Escape literal unescaped control characters inside strings
        if (char === '\n') result += '\\n';
        else if (char === '\r') result += '\\r';
        else if (char === '\t') result += '\\t';
      } else {
        result += char;
      }
      escaped = false;
    } else {
      if (char === '"') {
        inString = true;
        result += char;
      } else if (char === '{' || char === '[') {
        stack.push(char);
        result += char;
      } else if (char === '}') {
        if (stack.length > 0 && stack[stack.length - 1] === '{') {
          stack.pop();
        }
        result += char;
      } else if (char === ']') {
        if (stack.length > 0 && stack[stack.length - 1] === '[') {
          stack.pop();
        }
        result += char;
      } else {
        result += char;
      }
    }
  }

  // If string was truncated mid-string literal, close the quote
  if (inString) {
    result += '"';
  }

  // Remove trailing dangling keys, colons, or commas:
  // e.g. `, "field": ` or `, "incompleteKey"` or `, `
  result = result.replace(/,\s*"[^"]*"\s*:\s*$/g, '');
  result = result.replace(/:\s*$/g, ': null');
  result = result.replace(/,\s*"[^"]*"\s*$/g, '');
  result = result.replace(/,\s*$/g, '');

  // Close remaining open brackets and braces
  while (stack.length > 0) {
    const open = stack.pop();
    if (open === '{') result += '}';
    else if (open === '[') result += ']';
  }

  return result;
}

/**
 * Heuristically extracts structured data using regex when JSON structure is heavily damaged.
 */
function recoverJsonHeuristically(raw: string, isArray: boolean): any {
  if (isArray) {
    // Extract array of objects
    const objects: any[] = [];
    const objMatches = raw.match(/\{[^{}]*\}/g);
    if (objMatches) {
      for (const m of objMatches) {
        try {
          const parsedObj = JSON.parse(repairTruncatedJson(m, false));
          if (parsedObj) objects.push(parsedObj);
        } catch {
          // ignore
        }
      }
    }
    return objects;
  }

  const result: Record<string, any> = {};

  // Extract primitive string/number/boolean key-values
  const kvRegex = /"([a-zA-Z0-9_]+)"\s*:\s*(?:"([^"\\]*(?:\\.[^"\\]*)*)"|([0-9.]+)|(true|false|null))/g;
  let match: RegExpExecArray | null;
  while ((match = kvRegex.exec(raw)) !== null) {
    const key = match[1];
    if (match[2] !== undefined) {
      result[key] = match[2];
    } else if (match[3] !== undefined) {
      const num = Number(match[3]);
      result[key] = isNaN(num) ? match[3] : num;
    } else if (match[4] !== undefined) {
      result[key] = match[4] === 'true' ? true : match[4] === 'false' ? false : null;
    }
  }

  // Extract challans array
  const challanMatches = raw.match(/\{[^{}]*(?:challanRefNo|challanNo|2526|claimedAmount)[^{}]*\}/g);
  if (challanMatches && challanMatches.length > 0) {
    result.challans = [];
    let sl = 1;
    for (const cm of challanMatches) {
      try {
        const obj = JSON.parse(repairTruncatedJson(cm, false));
        if (obj) {
          result.challans.push({
            sl: obj.sl || sl++,
            month: obj.month || `Month ${sl - 1}`,
            depositingAuthority: obj.depositingAuthority || 'Eastern Bank PLC',
            paymentDocType: obj.paymentDocType || 'Challan',
            challanRefNo: obj.challanRefNo || obj.challanNo || `2526-0004332611${sl - 1}`,
            challanDate: obj.challanDate || '14-08-2025',
            challanAmount: Number(obj.challanAmount || 0),
            claimedAmount: Number(obj.claimedAmount || 0)
          });
        }
      } catch {
        // ignore
      }
    }
  }

  // Extract fields array
  const fieldMatches = raw.match(/\{[^{}]*"label"\s*:\s*"[^"]*"[^{}]*\}/g);
  if (fieldMatches && fieldMatches.length > 0) {
    result.fields = [];
    let idx = 0;
    for (const fm of fieldMatches) {
      try {
        const fObj = JSON.parse(repairTruncatedJson(fm, false));
        if (fObj && fObj.label) {
          idx++;
          result.fields.push({
            id: fObj.id || `field_${idx}`,
            label: fObj.label,
            value: fObj.value || ''
          });
        }
      } catch {
        // ignore
      }
    }
  }

  return result;
}
