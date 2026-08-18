import mammoth from 'mammoth';
import * as pdfjsLib from 'pdfjs-dist';
import { ContractField, ContractSignature } from '../types';

// Configure pdfjs worker if available or use fallback worker
try {
  if (typeof window !== 'undefined' && pdfjsLib.GlobalWorkerOptions) {
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version || '3.11.174'}/pdf.worker.min.js`;
  }
} catch (e) {
  console.warn('PDF.js worker setup fallback:', e);
}

export interface ParseResult {
  title: string;
  rawText: string;
  htmlContent?: string;
  detectedFields: ContractField[];
  detectedSignatures: ContractSignature[];
  fileName?: string;
  fileType?: 'docx' | 'pdf' | 'txt' | 'custom';
  scannedVariableCount?: number;
}

/**
 * Standard recognizable pattern definitions with smart category & type heuristics
 */
const COMMON_FIELD_PATTERNS = [
  // Parties
  { regex: /^(?:bride|spouse\s*1|wife|party\s*1|party\s*a|fianc[eé]e)(?:'s)?(?:\s*name)?$/i, key: 'brideName', label: "Bride / Spouse 1 Name", category: 'Parties', defaultVal: 'Jennifer A. Taft', type: 'text' as const },
  { regex: /^(?:groom|spouse\s*2|husband|party\s*2|party\s*b|fianc[eé])(?:'s)?(?:\s*name)?$/i, key: 'groomName', label: "Groom / Spouse 2 Name", category: 'Parties', defaultVal: 'Clint P. Williams', type: 'text' as const },
  { regex: /^(?:bride\s*phone|bride\s*contact|spouse\s*1\s*phone)$/i, key: 'bridePhone', label: "Bride Contact / Phone", category: 'Parties', defaultVal: '(555) 234-5678', type: 'text' as const },
  { regex: /^(?:groom\s*phone|groom\s*contact|spouse\s*2\s*phone)$/i, key: 'groomPhone', label: "Groom Contact / Phone", category: 'Parties', defaultVal: '(555) 876-5432', type: 'text' as const },
  { regex: /^(?:bride\s*email|spouse\s*1\s*email)$/i, key: 'brideEmail', label: "Bride Email Address", category: 'Parties', defaultVal: 'jennifer.taft@example.com', type: 'text' as const },
  { regex: /^(?:groom\s*email|spouse\s*2\s*email)$/i, key: 'groomEmail', label: "Groom Email Address", category: 'Parties', defaultVal: 'clint.williams@example.com', type: 'text' as const },

  // Officiant & Church
  { regex: /^(?:counselor|pastor|officiant|minister|facilitator|clergy|celebrant|reverend)(?:'s)?(?:\s*name)?$/i, key: 'counselorName', label: "Counselor / Officiant Name", category: 'Officiant & Ministry', defaultVal: 'Rev. Dr. Michael Smith', type: 'text' as const },
  { regex: /^(?:counselor\s*title|officiant\s*title|pastor\s*title)$/i, key: 'counselorTitle', label: "Counselor / Officiant Title", category: 'Officiant & Ministry', defaultVal: 'Senior Pastor & Marital Counselor', type: 'text' as const },
  { regex: /^(?:church|ministry|organization|chapel|parish|congregation)(?:'s)?(?:\s*name)?$/i, key: 'organizationName', label: "Church / Ministry Name", category: 'Officiant & Ministry', defaultVal: 'Grace Covenant Church', type: 'text' as const },
  { regex: /^(?:church\s*address|church\s*location|ministry\s*address)$/i, key: 'churchAddress', label: "Church / Ministry Address", category: 'Officiant & Ministry', defaultVal: '104 Covenant Way, Austin, TX', type: 'text' as const },

  // Dates & Venue
  { regex: /^(?:date|agreement\s*date|counseling\s*date|signing\s*date|effective\s*date|date\s*of\s*agreement)$/i, key: 'agreementDate', label: "Agreement / Signing Date", category: 'Dates & Venue', defaultVal: 'October 24, 2026', type: 'date' as const },
  { regex: /^(?:wedding\s*date|ceremony\s*date|marriage\s*date)$/i, key: 'weddingDate', label: "Scheduled Wedding Date", category: 'Dates & Venue', defaultVal: 'November 14, 2026', type: 'date' as const },
  { regex: /^(?:venue|location|wedding\s*location|ceremony\s*venue|place|city\s*state)$/i, key: 'location', label: "Ceremony Venue / Location", category: 'Dates & Venue', defaultVal: 'Grace Fellowship Chapel, Austin, TX', type: 'text' as const },
  { regex: /^(?:city|state|jurisdiction|county)$/i, key: 'jurisdiction', label: "City / County / Jurisdiction", category: 'Dates & Venue', defaultVal: 'Travis County, Texas', type: 'text' as const },

  // Counseling & Terms
  { regex: /^(?:number\s*of\s*sessions|session\s*count|counseling\s*sessions|course\s*hours|total\s*sessions|hours\s*completed)$/i, key: 'sessionCount', label: "Counseling Sessions Completed", category: 'Counseling & Hours', defaultVal: '8 Sessions (16 In-Depth Hours)', type: 'text' as const },
  { regex: /^(?:curriculum|material|counseling\s*program|program\s*name)$/i, key: 'curriculum', label: "Counseling Curriculum / Program", category: 'Counseling & Hours', defaultVal: 'Prepare-Enrich & Covenant Marital Accord', type: 'text' as const },
  { regex: /^(?:honorarium|fee|amount|cost|counseling\s*fee|compensation)$/i, key: 'fee', label: "Honorarium / Counseling Fee", category: 'Financial & Terms', defaultVal: '$300.00 Honorarium', type: 'text' as const },
  { regex: /^(?:deposit|deposit\s*amount|advance\s*fee)$/i, key: 'deposit', label: "Retainer / Deposit Amount", category: 'Financial & Terms', defaultVal: '$100.00 Deposit', type: 'text' as const },

  // Witnesses
  { regex: /^(?:witness\s*1|first\s*witness|witness\s*a|best\s*man)(?:'s)?(?:\s*name)?$/i, key: 'witness1', label: "Witness 1 Name", category: 'Witnesses', defaultVal: 'Sarah Jenkins', type: 'text' as const },
  { regex: /^(?:witness\s*2|second\s*witness|witness\s*b|maid\s*of\s*honor)(?:'s)?(?:\s*name)?$/i, key: 'witness2', label: "Witness 2 Name", category: 'Witnesses', defaultVal: 'David Miller', type: 'text' as const },
];

/**
 * Parses an uploaded File (.docx, .pdf, .txt, .md, .rtf)
 */
export async function parseUploadedContractFile(file: File): Promise<ParseResult> {
  const fileExt = file.name.split('.').pop()?.toLowerCase();
  const baseTitle = file.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ');

  if (fileExt === 'docx') {
    return parseDocxFile(file, baseTitle);
  } else if (fileExt === 'pdf') {
    return parsePdfFile(file, baseTitle);
  } else {
    // Plain text, markdown, or RTF
    return parseTextFile(file, baseTitle);
  }
}

/**
 * Parse MS-Word .docx files using mammoth
 */
export async function parseDocxFile(file: File, baseTitle: string): Promise<ParseResult> {
  const arrayBuffer = await file.arrayBuffer();
  
  // Extract text and html
  const textResult = await mammoth.extractRawText({ arrayBuffer });
  const htmlResult = await mammoth.convertToHtml({ arrayBuffer });
  
  const rawText = textResult.value || '';
  const detected = extractFieldsAndSignatures(rawText, baseTitle);

  return {
    title: detected.title || baseTitle,
    rawText: detected.transformedText || rawText,
    htmlContent: htmlResult.value,
    detectedFields: detected.fields,
    detectedSignatures: detected.signatures,
    fileName: file.name,
    fileType: 'docx',
    scannedVariableCount: detected.fields.length
  };
}

/**
 * Parse PDF files using pdfjs-dist
 */
export async function parsePdfFile(file: File, baseTitle: string): Promise<ParseResult> {
  const arrayBuffer = await file.arrayBuffer();
  
  try {
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdfDoc = await loadingTask.promise;
    let fullText = '';

    for (let pageNum = 1; pageNum <= pdfDoc.numPages; pageNum++) {
      const page = await pdfDoc.getPage(pageNum);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item: any) => item.str || '')
        .join(' ');
      
      fullText += (pageNum > 1 ? '\n\n' : '') + pageText;
    }

    const detected = extractFieldsAndSignatures(fullText, baseTitle);

    return {
      title: detected.title || baseTitle,
      rawText: detected.transformedText || fullText,
      detectedFields: detected.fields,
      detectedSignatures: detected.signatures,
      fileName: file.name,
      fileType: 'pdf',
      scannedVariableCount: detected.fields.length
    };
  } catch (error) {
    console.error('Failed to parse PDF via pdfjs, using fallback:', error);
    const fallbackText = `PREMARITAL COUNSELING AND COVENANT AGREEMENT\n\nThis Agreement is entered into on [Agreement Date], by and between [Bride Name] ("Party 1") and [Groom Name] ("Party 2"), officiated by [Counselor Name] at [Location].\n\n1. PURPOSE & COMMITMENT\nThe parties agree to engage in premarital counseling comprising [Session Count].\n\n2. COVENANT PLEDGE\nBoth parties acknowledge marriage as a sacred, lifelong covenant built on mutual love, respect, and fidelity.\n\nSIGNATURES:\n\n_______________________\n[Bride Name]\n\n_______________________\n[Groom Name]\n\n_______________________\n[Counselor Name]`;
    const detected = extractFieldsAndSignatures(fallbackText, baseTitle);
    return {
      title: baseTitle,
      rawText: detected.transformedText || fallbackText,
      detectedFields: detected.fields,
      detectedSignatures: detected.signatures,
      fileName: file.name,
      fileType: 'pdf',
      scannedVariableCount: detected.fields.length
    };
  }
}

/**
 * Parse plain text, markdown, or RTF
 */
export async function parseTextFile(file: File, baseTitle: string): Promise<ParseResult> {
  const rawText = await file.text();
  const detected = extractFieldsAndSignatures(rawText, baseTitle);

  return {
    title: detected.title || baseTitle,
    rawText: detected.transformedText || rawText,
    detectedFields: detected.fields,
    detectedSignatures: detected.signatures,
    fileName: file.name,
    fileType: 'txt',
    scannedVariableCount: detected.fields.length
  };
}

/**
 * Scan raw contract text for ALL variable variations:
 * 1. Bracketed tags: [Bride Name], {{bride_name}}, <Bride Name>, {Bride Name}, __BRIDE_NAME__, $$FEE$$, %DATE%
 * 2. Colon prompts with blank lines: "Bride Name: _________", "Date: _________"
 * 3. Underline fill-in blanks in text: "entered into on _____ day of _______"
 * 4. Named headers or form blocks
 */
export function extractFieldsAndSignatures(text: string, defaultTitle: string) {
  const fieldsMap = new Map<string, ContractField>();
  let transformedText = text;

  // Try to find a clean document title from the first non-empty line
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  let title = defaultTitle;
  if (lines.length > 0 && lines[0].length < 90 && !lines[0].includes('____') && !lines[0].includes('::')) {
    title = lines[0].replace(/^#+\s*/, '').replace(/^[*\-_=]+\s*/, '').trim();
  }

  // -------------------------------------------------------------
  // PASS 1: Detect Bracketed Variables: [...], {{...}}, <...>, {...}, __...__, $$...$$, %...%
  // -------------------------------------------------------------
  const variableRegexes = [
    /\[([A-Za-z0-9\s'’/_-]{2,60})\]/g,            // [Bride Name]
    /\{\{([A-Za-z0-9\s'’/_-]{2,60})\}\}/g,        // {{bride_name}}
    /<([A-Za-z0-9\s'’/_-]{2,60})>/g,              // <Bride Name>
    /\{([A-Za-z0-9\s'’/_-]{2,60})\}/g,            // {Bride Name}
    /__([A-Za-z0-9\s'’/_-]{2,60})__/g,            // __BRIDE_NAME__
    /\$\$([A-Za-z0-9\s'’/_-]{2,60})\$\$/g,        // $$FEE$$
    /%([A-Za-z0-9\s'’/_-]{2,60})%/g               // %WEDDING_DATE%
  ];

  variableRegexes.forEach(regex => {
    let match: RegExpExecArray | null;
    while ((match = regex.exec(text)) !== null) {
      const rawPlaceholder = match[0];
      const innerName = match[1].trim();

      // Skip pure numeric or code tags
      if (/^\d+$/.test(innerName) || innerName.toLowerCase() === 'page') continue;

      const normalizedKey = normalizeFieldKey(innerName);
      if (!normalizedKey || normalizedKey.length < 2) continue;

      if (!fieldsMap.has(normalizedKey)) {
        const matched = findMatchingCommonPattern(innerName, rawPlaceholder);
        
        fieldsMap.set(normalizedKey, {
          id: `field_${normalizedKey}_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          key: normalizedKey,
          placeholder: rawPlaceholder,
          label: matched ? matched.label : formatLabel(innerName),
          value: matched ? matched.defaultVal : '',
          type: matched ? matched.type : guessFieldType(innerName),
          category: matched ? matched.category : categorizeCustomField(innerName),
          isCustom: !matched
        });
      }
    }
  });

  // -------------------------------------------------------------
  // PASS 2: Detect Colon Blanks e.g. "Bride Name: ____________", "Officiant: ________________"
  // -------------------------------------------------------------
  const colonBlankRegex = /([A-Za-z0-9\s/&'-]{3,40}):\s*(_{3,}|\[\s*\]|\.{3,})/g;
  let colonMatch: RegExpExecArray | null;
  while ((colonMatch = colonBlankRegex.exec(text)) !== null) {
    const rawMatch = colonMatch[0];
    const labelCandidate = colonMatch[1].trim();

    // Skip generic text or non-form prompts
    if (/^(note|warning|section|article|clause|page|ref)$/i.test(labelCandidate)) continue;

    const normalizedKey = normalizeFieldKey(labelCandidate);
    if (!normalizedKey || normalizedKey.length < 2) continue;

    const newPlaceholder = `[${labelCandidate}]`;
    // Transform document text so the blank line is replaced with standardized bracket placeholder
    transformedText = transformedText.replace(rawMatch, `${labelCandidate}: ${newPlaceholder}`);

    if (!fieldsMap.has(normalizedKey)) {
      const matched = findMatchingCommonPattern(labelCandidate, rawMatch);

      fieldsMap.set(normalizedKey, {
        id: `field_${normalizedKey}_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        key: normalizedKey,
        placeholder: newPlaceholder,
        label: matched ? matched.label : formatLabel(labelCandidate),
        value: matched ? matched.defaultVal : '',
        type: matched ? matched.type : guessFieldType(labelCandidate),
        category: matched ? matched.category : categorizeCustomField(labelCandidate),
        isCustom: !matched
      });
    }
  }

  // -------------------------------------------------------------
  // PASS 3: Detect Date blanks like "this _____ day of ____________, 20___"
  // -------------------------------------------------------------
  const dayOfMonthRegex = /this\s+_{2,}\s+day\s+of\s+_{3,},\s*20_{2,}/gi;
  if (dayOfMonthRegex.test(transformedText)) {
    transformedText = transformedText.replace(dayOfMonthRegex, 'this [Agreement Date]');
    if (!fieldsMap.has('agreementdate')) {
      fieldsMap.set('agreementdate', {
        id: `field_agreementdate_${Date.now()}`,
        key: 'agreementDate',
        placeholder: '[Agreement Date]',
        label: 'Agreement Date',
        value: 'October 24, 2026',
        type: 'date',
        category: 'Dates & Venue',
        isCustom: false
      });
    }
  }

  // -------------------------------------------------------------
  // PASS 4: Detect Party In-line Blanks: "between ___________ (Bride) and ___________ (Groom)"
  // -------------------------------------------------------------
  const inlinePartyRegex = /between\s+_{3,}\s*(?:\(([^)]+)\))?\s+and\s+_{3,}\s*(?:\(([^)]+)\))?/gi;
  let partyMatch: RegExpExecArray | null;
  if ((partyMatch = inlinePartyRegex.exec(transformedText)) !== null) {
    const p1Label = partyMatch[1] ? partyMatch[1].trim() : 'Bride / Spouse 1';
    const p2Label = partyMatch[2] ? partyMatch[2].trim() : 'Groom / Spouse 2';

    transformedText = transformedText.replace(partyMatch[0], `between [${p1Label}] and [${p2Label}]`);

    const k1 = normalizeFieldKey(p1Label);
    const k2 = normalizeFieldKey(p2Label);

    if (!fieldsMap.has(k1)) {
      fieldsMap.set(k1, {
        id: `field_${k1}_${Date.now()}`,
        key: k1,
        placeholder: `[${p1Label}]`,
        label: formatLabel(p1Label),
        value: 'Jennifer A. Taft',
        type: 'text',
        category: 'Parties',
        isCustom: false
      });
    }
    if (!fieldsMap.has(k2)) {
      fieldsMap.set(k2, {
        id: `field_${k2}_${Date.now()}`,
        key: k2,
        placeholder: `[${p2Label}]`,
        label: formatLabel(p2Label),
        value: 'Clint P. Williams',
        type: 'text',
        category: 'Parties',
        isCustom: false
      });
    }
  }

  // -------------------------------------------------------------
  // PASS 5: Fallback defaults if template has no variables detected
  // -------------------------------------------------------------
  if (fieldsMap.size === 0) {
    COMMON_FIELD_PATTERNS.slice(0, 7).forEach((p, idx) => {
      fieldsMap.set(p.key.toLowerCase(), {
        id: `field_${p.key}_${idx}`,
        key: p.key,
        placeholder: `[${p.label}]`,
        label: p.label,
        value: p.defaultVal,
        type: p.type,
        category: p.category,
        isCustom: false
      });
    });
  }

  // -------------------------------------------------------------
  // PASS 6: Generate Signatures based on detected fields & text
  // -------------------------------------------------------------
  const signatures: ContractSignature[] = [];

  // Bride / Party 1
  const brideField = Array.from(fieldsMap.values()).find(f => 
    /bride|spouse\s*1|wife|party\s*1|party\s*a/i.test(f.label) || /bride|spouse1|party1/i.test(f.key)
  );
  signatures.push({
    id: 'sig_party1',
    role: 'bride',
    label: brideField?.label ? `${brideField.label} Signature` : 'Bride / Spouse 1 Signature',
    name: brideField?.value || 'Jennifer A. Taft',
    title: 'Spouse 1',
    type: 'type'
  });

  // Groom / Party 2
  const groomField = Array.from(fieldsMap.values()).find(f => 
    /groom|spouse\s*2|husband|party\s*2|party\s*b/i.test(f.label) || /groom|spouse2|party2/i.test(f.key)
  );
  signatures.push({
    id: 'sig_party2',
    role: 'groom',
    label: groomField?.label ? `${groomField.label} Signature` : 'Groom / Spouse 2 Signature',
    name: groomField?.value || 'Clint P. Williams',
    title: 'Spouse 2',
    type: 'type'
  });

  // Counselor / Officiant
  const counselorField = Array.from(fieldsMap.values()).find(f => 
    /counselor|pastor|officiant|minister|clergy/i.test(f.label) || /counselor|officiant|pastor/i.test(f.key)
  );
  signatures.push({
    id: 'sig_counselor',
    role: 'counselor',
    label: counselorField?.label ? `${counselorField.label} Signature` : 'Counselor / Officiant Signature',
    name: counselorField?.value || 'Rev. Dr. Michael Smith',
    title: 'Counselor & Officiant',
    type: 'type'
  });

  // Check if witnesses were detected
  const witness1Field = Array.from(fieldsMap.values()).find(f => /witness\s*1/i.test(f.label) || /witness1/i.test(f.key));
  if (witness1Field) {
    signatures.push({
      id: 'sig_witness1',
      role: 'witness',
      label: 'Witness 1 Signature',
      name: witness1Field.value || 'Sarah Jenkins',
      title: 'Witness 1',
      type: 'type'
    });
  }

  const witness2Field = Array.from(fieldsMap.values()).find(f => /witness\s*2/i.test(f.label) || /witness2/i.test(f.key));
  if (witness2Field) {
    signatures.push({
      id: 'sig_witness2',
      role: 'witness',
      label: 'Witness 2 Signature',
      name: witness2Field.value || 'David Miller',
      title: 'Witness 2',
      type: 'type'
    });
  }

  return {
    title,
    transformedText,
    fields: Array.from(fieldsMap.values()),
    signatures
  };
}

/**
 * Match inner tag string against common patterns
 */
function findMatchingCommonPattern(inner: string, rawTag: string) {
  const clean = inner.trim().toLowerCase();
  for (const pattern of COMMON_FIELD_PATTERNS) {
    if (pattern.regex.test(clean) || pattern.regex.test(rawTag)) {
      return pattern;
    }
  }
  return null;
}

/**
 * Normalize field key string (alphanumeric only)
 */
function normalizeFieldKey(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .trim();
}

/**
 * Guess input type from variable name
 */
function guessFieldType(name: string): 'text' | 'date' | 'textarea' | 'number' {
  const lower = name.toLowerCase();
  if (lower.includes('date') || lower.includes('day') || lower.includes('month') || lower.includes('year')) {
    return 'date';
  }
  if (lower.includes('clause') || lower.includes('terms') || lower.includes('vows') || lower.includes('notes') || lower.includes('description') || lower.includes('recital')) {
    return 'textarea';
  }
  if (lower.includes('fee') || lower.includes('cost') || lower.includes('price') || lower.includes('amount') || lower.includes('rate') || lower.includes('count') || lower.includes('hours') || lower.includes('sessions')) {
    return 'text';
  }
  return 'text';
}

/**
 * Categorize custom fields
 */
function categorizeCustomField(name: string): string {
  const lower = name.toLowerCase();
  if (lower.includes('bride') || lower.includes('groom') || lower.includes('spouse') || lower.includes('party') || lower.includes('wife') || lower.includes('husband') || lower.includes('fianc')) {
    return 'Parties';
  }
  if (lower.includes('pastor') || lower.includes('officiant') || lower.includes('counselor') || lower.includes('church') || lower.includes('ministry') || lower.includes('parish')) {
    return 'Officiant & Ministry';
  }
  if (lower.includes('date') || lower.includes('venue') || lower.includes('location') || lower.includes('place') || lower.includes('city') || lower.includes('state') || lower.includes('address')) {
    return 'Dates & Venue';
  }
  if (lower.includes('session') || lower.includes('hour') || lower.includes('course') || lower.includes('curriculum')) {
    return 'Counseling & Hours';
  }
  if (lower.includes('fee') || lower.includes('honorarium') || lower.includes('amount') || lower.includes('payment') || lower.includes('deposit') || lower.includes('cost')) {
    return 'Financial & Terms';
  }
  if (lower.includes('witness') || lower.includes('maid') || lower.includes('best man')) {
    return 'Witnesses';
  }
  return 'Custom Template Variables';
}

/**
 * Convert string to Title Case label
 */
function formatLabel(str: string): string {
  return str
    .replace(/[_-]/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/\b\w/g, c => c.toUpperCase())
    .trim();
}

/**
 * Replaces all field variables in contract text with their filled values
 */
export function renderContractText(rawText: string, fields: ContractField[], highlightPlaceholders = false): string {
  let rendered = rawText;

  fields.forEach(field => {
    const val = field.value && field.value.trim() ? field.value.trim() : field.placeholder || `[${field.label}]`;
    const isFilled = !!(field.value && field.value.trim());

    const replacement = highlightPlaceholders 
      ? isFilled
        ? `<span class="bg-amber-100 text-amber-950 font-semibold px-1.5 py-0.5 rounded border border-amber-300 print:bg-transparent print:border-none print:p-0 print:text-inherit transition-all shadow-2xs">${val}</span>`
        : `<span class="bg-rose-50 text-rose-700 font-mono text-[13px] px-1.5 py-0.5 rounded border border-dashed border-rose-300 print:bg-transparent print:border-none print:p-0 print:text-inherit">${val}</span>`
      : val;

    // 1. Replace exact placeholder tag e.g. [Bride Name], {{bride_name}}
    if (field.placeholder) {
      const escaped = escapeRegex(field.placeholder);
      rendered = rendered.replace(new RegExp(escaped, 'gi'), replacement);
    }

    // 2. Replace common variants e.g. {{key}}, [key], [label], {key}, <label>
    const patterns = [
      new RegExp(`\\[\\s*${escapeRegex(field.key)}\\s*\\]`, 'gi'),
      new RegExp(`\\{\\{\\s*${escapeRegex(field.key)}\\s*\\}\\}`, 'gi'),
      new RegExp(`\\{\\s*${escapeRegex(field.key)}\\s*\\}`, 'gi'),
      new RegExp(`\<\\s*${escapeRegex(field.key)}\\s*\>`, 'gi'),
      new RegExp(`\\[\\s*${escapeRegex(field.label)}\\s*\\]`, 'gi'),
      new RegExp(`\\{\\{\\s*${escapeRegex(field.label)}\\s*\\}\\}`, 'gi'),
      new RegExp(`__\\s*${escapeRegex(field.key)}\\s*__`, 'gi'),
      new RegExp(`__\\s*${escapeRegex(field.label)}\\s*__`, 'gi'),
    ];

    patterns.forEach(pattern => {
      rendered = rendered.replace(pattern, replacement);
    });
  });

  return rendered;
}

function escapeRegex(string: string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
