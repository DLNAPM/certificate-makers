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
}

/**
 * Standard field categories and recognizable patterns
 */
const COMMON_FIELD_PATTERNS = [
  { regex: /\[?(?:Bride|Spouse\s*1|Wife|Party\s*1|Party\s*A)(?:'s)?(?:\s*Name)?\]?/i, key: 'brideName', label: "Bride / Spouse 1 Name", category: 'Parties', defaultVal: 'Jennifer A. Taft' },
  { regex: /\[?(?:Groom|Spouse\s*2|Husband|Party\s*2|Party\s*B)(?:'s)?(?:\s*Name)?\]?/i, key: 'groomName', label: "Groom / Spouse 2 Name", category: 'Parties', defaultVal: 'Clint P. Williams' },
  { regex: /\[?(?:Counselor|Pastor|Officiant|Minister|Facilitator|Clergy)(?:'s)?(?:\s*Name)?\]?/i, key: 'counselorName', label: "Counselor / Officiant Name", category: 'Officiant', defaultVal: 'Rev. Michael Smith' },
  { regex: /\[?(?:Church|Ministry|Organization|Chapel|Parish)(?:'s)?(?:\s*Name)?\]?/i, key: 'organizationName', label: "Church / Ministry Name", category: 'Officiant', defaultVal: 'Grace Covenant Fellowship' },
  { regex: /\[?(?:Date|Agreement\s*Date|Wedding\s*Date|Ceremony\s*Date|Effective\s*Date)\]?/i, key: 'agreementDate', label: "Agreement / Wedding Date", category: 'Dates & Venue', defaultVal: 'October 14, 2026' },
  { regex: /\[?(?:Venue|Location|City|State|Address|Place)\]?/i, key: 'location', label: "Location / Venue", category: 'Dates & Venue', defaultVal: 'Saint Michael’s Chapel, Austin, TX' },
  { regex: /\[?(?:Number\s*of\s*Sessions|Session\s*Count|Course\s*Hours)\]?/i, key: 'sessionCount', label: "Counseling Sessions Completed", category: 'Counseling Details', defaultVal: '8 Sessions (16 Hours)' },
  { regex: /\[?(?:Honorarium|Fee|Amount|Cost)\]?/i, key: 'fee', label: "Honorarium / Fee", category: 'Terms', defaultVal: '$250.00' },
  { regex: /\[?(?:Witness|Witness\s*1)(?:'s)?(?:\s*Name)?\]?/i, key: 'witness1', label: "Witness 1 Name", category: 'Witnesses', defaultVal: 'Sarah Jenkins' },
  { regex: /\[?(?:Witness\s*2)(?:'s)?(?:\s*Name)?\]?/i, key: 'witness2', label: "Witness 2 Name", category: 'Witnesses', defaultVal: 'David Miller' },
];

/**
 * Parses an uploaded File (.docx, .pdf, .txt, .md)
 */
export async function parseUploadedContractFile(file: File): Promise<ParseResult> {
  const fileExt = file.name.split('.').pop()?.toLowerCase();
  const baseTitle = file.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ');

  if (fileExt === 'docx') {
    return parseDocxFile(file, baseTitle);
  } else if (fileExt === 'pdf') {
    return parsePdfFile(file, baseTitle);
  } else {
    // Plain text or markdown
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
    rawText: rawText,
    htmlContent: htmlResult.value,
    detectedFields: detected.fields,
    detectedSignatures: detected.signatures,
    fileName: file.name,
    fileType: 'docx'
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
      rawText: fullText,
      detectedFields: detected.fields,
      detectedSignatures: detected.signatures,
      fileName: file.name,
      fileType: 'pdf'
    };
  } catch (error) {
    console.error('Failed to parse PDF via pdfjs, using fallback:', error);
    // If PDF parsing fails, return a clean template with the title
    const fallbackText = `PREMARITAL COUNSELING AND COVENANT AGREEMENT\n\nThis Agreement is entered into on [Agreement Date], by and between [Bride Name] ("Party 1") and [Groom Name] ("Party 2"), officiated by [Counselor Name] at [Location].\n\n1. PURPOSE & COMMITMENT\nThe parties agree to engage in premarital counseling comprising [Session Count].\n\n2. COVENANT PLEDGE\nBoth parties acknowledge marriage as a sacred, lifelong covenant built on mutual love, respect, and fidelity.\n\nSIGNATURES:\n\n_______________________\n[Bride Name]\n\n_______________________\n[Groom Name]\n\n_______________________\n[Counselor Name]`;
    const detected = extractFieldsAndSignatures(fallbackText, baseTitle);
    return {
      title: baseTitle,
      rawText: fallbackText,
      detectedFields: detected.fields,
      detectedSignatures: detected.signatures,
      fileName: file.name,
      fileType: 'pdf'
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
    rawText: rawText,
    detectedFields: detected.fields,
    detectedSignatures: detected.signatures,
    fileName: file.name,
    fileType: 'txt'
  };
}

/**
 * Scan raw contract text for placeholders, bracketed terms, underline blanks, and key headings
 */
export function extractFieldsAndSignatures(text: string, defaultTitle: string) {
  const fieldsMap = new Map<string, ContractField>();
  
  // Try to find a document title from the first non-empty lines
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  let title = defaultTitle;
  if (lines.length > 0 && lines[0].length < 80 && !lines[0].includes('____')) {
    title = lines[0].replace(/^#+\s*/, '').trim();
  }

  // 1. Look for brackets like [Bride Name], {{Bride_Name}}, <Bride Name>, etc.
  const bracketRegex = /(?:\[|\{\{|\<)([\w\s'’-]{2,40})(?:\]|\}\}|\>)/g;
  let match;
  while ((match = bracketRegex.exec(text)) !== null) {
    const rawTag = match[0];
    const innerName = match[1].trim();
    
    // Normalize key
    const normalizedKey = innerName.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (!normalizedKey || normalizedKey.length < 2) continue;

    if (!fieldsMap.has(normalizedKey)) {
      // Find matching pattern if possible
      const matchedPattern = COMMON_FIELD_PATTERNS.find(p => p.regex.test(innerName) || p.regex.test(rawTag));
      
      fieldsMap.set(normalizedKey, {
        id: `field_${normalizedKey}_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        key: normalizedKey,
        placeholder: rawTag,
        label: matchedPattern ? matchedPattern.label : formatLabel(innerName),
        value: matchedPattern ? matchedPattern.defaultVal : '',
        type: innerName.toLowerCase().includes('date') ? 'date' : 'text',
        category: matchedPattern ? matchedPattern.category : 'General Details',
        isCustom: !matchedPattern
      });
    }
  }

  // 2. Look for common blank underscore lines like "Name: ___________" or "Dated: _____________"
  const linePattern = /(Bride|Groom|Husband|Wife|Counselor|Officiant|Pastor|Date|Venue|Location|Witness)[\s:]+_{3,}/gi;
  while ((match = linePattern.exec(text)) !== null) {
    const labelCandidate = match[1];
    const normalizedKey = labelCandidate.toLowerCase().replace(/[^a-z0-9]/g, '');
    
    if (!fieldsMap.has(normalizedKey)) {
      const matchedPattern = COMMON_FIELD_PATTERNS.find(p => p.regex.test(labelCandidate));
      fieldsMap.set(normalizedKey, {
        id: `field_${normalizedKey}_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        key: normalizedKey,
        placeholder: match[0],
        label: matchedPattern ? matchedPattern.label : formatLabel(labelCandidate),
        value: matchedPattern ? matchedPattern.defaultVal : '',
        type: labelCandidate.toLowerCase().includes('date') ? 'date' : 'text',
        category: matchedPattern ? matchedPattern.category : 'Contract Blanks',
        isCustom: false
      });
    }
  }

  // 3. Ensure at least standard core fields exist if text is general
  if (fieldsMap.size === 0) {
    // Inject common core fields so user can fill them
    COMMON_FIELD_PATTERNS.slice(0, 5).forEach((p, idx) => {
      fieldsMap.set(p.key, {
        id: `field_${p.key}_${idx}`,
        key: p.key,
        placeholder: `[${p.label}]`,
        label: p.label,
        value: p.defaultVal,
        type: p.key.toLowerCase().includes('date') ? 'date' : 'text',
        category: p.category,
        isCustom: false
      });
    });
  }

  // Generate standard signatures
  const signatures: ContractSignature[] = [
    {
      id: 'sig_party1',
      role: 'bride',
      label: 'Bride / Spouse 1 Signature',
      name: (fieldsMap.get('bridename') || fieldsMap.get('brideName'))?.value || 'Jennifer A. Taft',
      title: 'Spouse 1',
      type: 'type'
    },
    {
      id: 'sig_party2',
      role: 'groom',
      label: 'Groom / Spouse 2 Signature',
      name: (fieldsMap.get('groomname') || fieldsMap.get('groomName'))?.value || 'Clint P. Williams',
      title: 'Spouse 2',
      type: 'type'
    },
    {
      id: 'sig_counselor',
      role: 'counselor',
      label: 'Counselor / Officiant Signature',
      name: (fieldsMap.get('counselorname') || fieldsMap.get('counselorName'))?.value || 'Rev. Michael Smith',
      title: 'Counselor & Officiant',
      type: 'type'
    }
  ];

  return {
    title,
    fields: Array.from(fieldsMap.values()),
    signatures
  };
}

function formatLabel(str: string): string {
  return str
    .replace(/[_-]/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase())
    .trim();
}

/**
 * Replaces all field variables in contract text with their filled values
 */
export function renderContractText(rawText: string, fields: ContractField[], highlightPlaceholders = false): string {
  let rendered = rawText;

  fields.forEach(field => {
    const val = field.value.trim() || `[${field.label}]`;
    const replacement = highlightPlaceholders 
      ? `<span class="bg-amber-100 text-amber-900 font-semibold px-1.5 py-0.5 rounded border border-amber-300 print:bg-transparent print:border-none print:p-0 print:text-inherit">${val}</span>`
      : val;

    // Replace bracketed placeholders e.g. [Bride Name], [Bride's Name]
    if (field.placeholder) {
      const escaped = escapeRegex(field.placeholder);
      rendered = rendered.replace(new RegExp(escaped, 'gi'), replacement);
    }

    // Also replace direct key patterns e.g. {{brideName}}, [brideName]
    const keyPatterns = [
      new RegExp(`\\[\\s*${escapeRegex(field.key)}\\s*\\]`, 'gi'),
      new RegExp(`\\{\\{\\s*${escapeRegex(field.key)}\\s*\\}\\}`, 'gi'),
      new RegExp(`\\[\\s*${escapeRegex(field.label)}\\s*\\]`, 'gi'),
    ];

    keyPatterns.forEach(pattern => {
      rendered = rendered.replace(pattern, replacement);
    });
  });

  return rendered;
}

function escapeRegex(string: string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
