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
 * 
 * Preserves the EXACT sequential order of variables as they appear in the template from top to bottom.
 */
export function extractFieldsAndSignatures(text: string, defaultTitle: string) {
  let transformedText = text;

  // Try to find a clean document title from the first non-empty line
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  let title = defaultTitle;
  if (lines.length > 0 && lines[0].length < 90 && !lines[0].includes('____') && !lines[0].includes('::')) {
    title = lines[0].replace(/^#+\s*/, '').replace(/^[*\-_=]+\s*/, '').trim();
  }

  // -------------------------------------------------------------
  // PRE-PASS A: Transform Colon Blanks e.g. "Bride Name: ____________" -> "Bride Name: [Bride Name]"
  // -------------------------------------------------------------
  const colonBlankRegex = /([A-Za-z0-9\s/&'-]{3,40}):\s*(_{3,}|\[\s*\]|\.{3,})/g;
  let colonMatch: RegExpExecArray | null;
  while ((colonMatch = colonBlankRegex.exec(text)) !== null) {
    const rawMatch = colonMatch[0];
    const labelCandidate = colonMatch[1].trim();

    // Skip non-form prompt headers
    if (!/^(note|warning|section|article|clause|page|ref|tel|fax)$/i.test(labelCandidate)) {
      const newPlaceholder = `[${labelCandidate}]`;
      transformedText = transformedText.replace(rawMatch, `${labelCandidate}: ${newPlaceholder}`);
    }
  }

  // -------------------------------------------------------------
  // PRE-PASS B: Transform Date Blanks like "this _____ day of ____________, 20___"
  // -------------------------------------------------------------
  const dayOfMonthRegex = /this\s+_{2,}\s+day\s+of\s+_{3,},\s*20_{2,}/gi;
  if (dayOfMonthRegex.test(transformedText)) {
    transformedText = transformedText.replace(dayOfMonthRegex, 'this [Agreement Date]');
  }

  // -------------------------------------------------------------
  // PRE-PASS C: Transform Inline Blanks "between ___________ (Party 1) and ___________ (Party 2)"
  // -------------------------------------------------------------
  const inlinePartyRegex = /between\s+_{3,}\s*(?:\(([^)]+)\))?\s+and\s+_{3,}\s*(?:\(([^)]+)\))?/gi;
  let partyMatch: RegExpExecArray | null;
  if ((partyMatch = inlinePartyRegex.exec(transformedText)) !== null) {
    const p1Label = partyMatch[1] ? partyMatch[1].trim() : 'Party 1 Name';
    const p2Label = partyMatch[2] ? partyMatch[2].trim() : 'Party 2 Name';
    transformedText = transformedText.replace(partyMatch[0], `between [${p1Label}] and [${p2Label}]`);
  }

  // -------------------------------------------------------------
  // SEQUENTIAL SCAN: Find all placeholders in the EXACT order they appear in text
  // -------------------------------------------------------------
  // Master regex matching all placeholder conventions
  const masterPlaceholderRegex = /\[([A-Za-z0-9\s'’/_-]{2,60})\]|\{\{([A-Za-z0-9\s'’/_-]{2,60})\}\}|<([A-Za-z0-9\s'’/_-]{2,60})>|\{([A-Za-z0-9\s'’/_-]{2,60})\}|__([A-Za-z0-9\s'’/_-]{2,60})__|\$\$([A-Za-z0-9\s'’/_-]{2,60})\$\$|%([A-Za-z0-9\s'’/_-]{2,60})%/g;

  interface DetectedOccurrence {
    key: string;
    rawTag: string;
    innerName: string;
    firstIndex: number;
  }

  const occurrencesMap = new Map<string, DetectedOccurrence>();
  let scanMatch: RegExpExecArray | null;

  while ((scanMatch = masterPlaceholderRegex.exec(transformedText)) !== null) {
    const rawTag = scanMatch[0];
    // Find non-undefined capture group
    const innerName = (scanMatch[1] || scanMatch[2] || scanMatch[3] || scanMatch[4] || scanMatch[5] || scanMatch[6] || scanMatch[7] || '').trim();

    // Skip pure numbers or code identifiers like page numbers
    if (!innerName || /^\d+$/.test(innerName) || innerName.toLowerCase() === 'page') continue;

    const normalizedKey = normalizeFieldKey(innerName);
    if (!normalizedKey || normalizedKey.length < 2) continue;

    // Only record first appearance index to preserve reading order
    if (!occurrencesMap.has(normalizedKey)) {
      occurrencesMap.set(normalizedKey, {
        key: normalizedKey,
        rawTag,
        innerName,
        firstIndex: scanMatch.index
      });
    }
  }

  // Convert to sorted array based on first occurrence position in document
  const sortedOccurrences = Array.from(occurrencesMap.values()).sort((a, b) => a.firstIndex - b.firstIndex);

  // Build ordered ContractField objects
  const orderedFields: ContractField[] = sortedOccurrences.map((occ, idx) => {
    const matchedPattern = findMatchingCommonPattern(occ.innerName, occ.rawTag);
    return {
      id: `field_${occ.key}_${idx}_${Date.now()}`,
      key: occ.key,
      placeholder: occ.rawTag,
      label: matchedPattern ? matchedPattern.label : formatLabel(occ.innerName),
      value: matchedPattern ? matchedPattern.defaultVal : '',
      type: matchedPattern ? matchedPattern.type : guessFieldType(occ.innerName),
      category: matchedPattern ? matchedPattern.category : categorizeCustomField(occ.innerName),
      isCustom: !matchedPattern,
      orderIndex: idx + 1
    };
  });

  // Fallback defaults if template has zero detected variables
  if (orderedFields.length === 0) {
    COMMON_FIELD_PATTERNS.slice(0, 7).forEach((p, idx) => {
      orderedFields.push({
        id: `field_${p.key}_${idx}`,
        key: p.key,
        placeholder: `[${p.label}]`,
        label: p.label,
        value: p.defaultVal,
        type: p.type,
        category: p.category,
        isCustom: false,
        orderIndex: idx + 1
      });
    });
  }

  // -------------------------------------------------------------
  // DYNAMIC SIGNATURE GENERATION (Tailored to the uploaded template)
  // -------------------------------------------------------------
  const signatures: ContractSignature[] = [];
  const fieldsMap = new Map<string, ContractField>();
  orderedFields.forEach(f => fieldsMap.set(f.key.toLowerCase(), f));

  // 1. Identify primary parties from the uploaded document
  // Check for Bride / Spouse 1 / Party 1 / Client / Husband / Mentee
  const party1Field = orderedFields.find(f => 
    /bride|spouse\s*1|wife|party\s*1|party\s*a|client|participant\s*1|buyer|tenant|employee/i.test(f.label) ||
    /bride|spouse1|party1|partya|client|participant1/i.test(f.key)
  );

  // Check for Groom / Spouse 2 / Party 2 / Provider / Contractor / Wife / Mentor
  const party2Field = orderedFields.find(f => 
    /groom|spouse\s*2|husband|party\s*2|party\s*b|provider|contractor|vendor|participant\s*2|seller|landlord|employer/i.test(f.label) ||
    /groom|spouse2|party2|partyb|provider|contractor|vendor|participant2/i.test(f.key)
  );

  // Check for Counselor / Officiant / Pastor / Facilitator / Authority / Minister
  const authorityField = orderedFields.find(f => 
    /counselor|pastor|officiant|minister|clergy|celebrant|facilitator|director|mediator|attorney|notary/i.test(f.label) ||
    /counselor|officiant|pastor|minister|facilitator/i.test(f.key)
  );

  // Add Party 1 signature block
  if (party1Field) {
    const isBride = /bride|wife|fianc[eé]e/i.test(party1Field.label);
    signatures.push({
      id: 'sig_party_1',
      role: isBride ? 'bride' : 'party1',
      label: `${party1Field.label} Signature`,
      name: party1Field.value || 'Jennifer A. Taft',
      title: formatPartyTitle(party1Field.label, 'Party 1'),
      type: 'type'
    });
  } else {
    signatures.push({
      id: 'sig_party_1',
      role: 'party1',
      label: 'Primary Party / Bride Signature',
      name: 'Jennifer A. Taft',
      title: 'Party 1',
      type: 'type'
    });
  }

  // Add Party 2 signature block
  if (party2Field) {
    const isGroom = /groom|husband|fianc[eé]/i.test(party2Field.label);
    signatures.push({
      id: 'sig_party_2',
      role: isGroom ? 'groom' : 'party2',
      label: `${party2Field.label} Signature`,
      name: party2Field.value || 'Clint P. Williams',
      title: formatPartyTitle(party2Field.label, 'Party 2'),
      type: 'type'
    });
  } else {
    signatures.push({
      id: 'sig_party_2',
      role: 'party2',
      label: 'Second Party / Groom Signature',
      name: 'Clint P. Williams',
      title: 'Party 2',
      type: 'type'
    });
  }

  // Add Authority / Officiant / Counselor signature block if relevant
  if (authorityField) {
    signatures.push({
      id: 'sig_authority',
      role: 'counselor',
      label: `${authorityField.label} Signature`,
      name: authorityField.value || 'Rev. Dr. Michael Smith',
      title: formatPartyTitle(authorityField.label, 'Counselor / Officiant'),
      type: 'type'
    });
  } else if (/counsel|pastor|church|marriage|wedding|premarital/i.test(transformedText) || /counsel|pastor|church|marriage|wedding/i.test(title)) {
    signatures.push({
      id: 'sig_authority',
      role: 'counselor',
      label: 'Officiant / Counselor Signature',
      name: 'Rev. Dr. Michael Smith',
      title: 'Officiant & Marital Counselor',
      type: 'type'
    });
  }

  // Check for Witness 1 & Witness 2 in uploaded file
  const witness1Field = orderedFields.find(f => /witness\s*1|first\s*witness/i.test(f.label) || /witness1/i.test(f.key));
  if (witness1Field) {
    signatures.push({
      id: 'sig_witness1',
      role: 'witness',
      label: `${witness1Field.label} Signature`,
      name: witness1Field.value || 'Sarah Jenkins',
      title: 'Attesting Witness 1',
      type: 'type'
    });
  }

  const witness2Field = orderedFields.find(f => /witness\s*2|second\s*witness/i.test(f.label) || /witness2/i.test(f.key));
  if (witness2Field) {
    signatures.push({
      id: 'sig_witness2',
      role: 'witness',
      label: `${witness2Field.label} Signature`,
      name: witness2Field.value || 'David Miller',
      title: 'Attesting Witness 2',
      type: 'type'
    });
  }

  return {
    title,
    transformedText,
    fields: orderedFields,
    signatures
  };
}

/**
 * Format party title for signature section based on field label
 */
function formatPartyTitle(fieldLabel: string, defaultFallback: string): string {
  const clean = fieldLabel.replace(/\s*Name\b/i, '').replace(/\s*Signature\b/i, '').trim();
  return clean || defaultFallback;
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
