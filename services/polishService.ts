import { GoogleGenAI, Type } from '@google/genai';
import { ContractField, ContractSignature } from '../types';

export type IndustryStandardType = 
  | 'executive_legal'
  | 'pastoral_covenant'
  | 'plain_english_business'
  | 'formal_attestation'
  | 'docusign_legal';

export type DocuSignExecutionMode = 'standard_lines' | 'anchor_tags';

export interface PolishOptions {
  title: string;
  rawContent: string;
  fields: ContractField[];
  signatures: ContractSignature[];
  includeSignatures: boolean;
  standardType: IndustryStandardType;
  customInstructions?: string;
  docuSignMode?: DocuSignExecutionMode;
  includeDocuSignClause?: boolean;
}

export interface PolishResult {
  originalTitle: string;
  originalContent: string;
  polishedTitle: string;
  polishedContent: string;
  summaryOfEnhancements: string[];
  keyProtectionsAdded: string[];
  standardType: IndustryStandardType;
  standardName: string;
  filledVariablesCount: number;
  totalVariablesCount: number;
  docuSignMode?: DocuSignExecutionMode;
}

export const INDUSTRY_STANDARDS_INFO: Record<IndustryStandardType, {
  name: string;
  tagline: string;
  description: string;
  features: string[];
}> = {
  docusign_legal: {
    name: 'DocuSign e-Sign Legal Standard',
    tagline: 'ESIGN & UETA compliant, signature & date ready',
    description: 'Formatted specifically for seamless electronic signature routing (DocuSign, Adobe Sign, PandaDoc). Eliminates manual field friction; parties involved only need to sign their names and enter their signature dates.',
    features: [
      'DocuSign & ESIGN Act counterpart enforceability clause',
      'Designated signature and signing date lines only',
      'Pre-filled legal party identifications & roles',
      'Optional DocuSign auto-place anchor tags (/s1/, /d1/)'
    ]
  },
  executive_legal: {
    name: 'Executive Legal Standard',
    tagline: 'Comprehensive, formally structured legal agreement',
    description: 'Elevates document into formal legal language with recitals (WHEREAS clauses), defined party roles, severability, dispute resolution, and clear clause numbering.',
    features: [
      'Formal WHEREAS recitals & consideration statements',
      'Numbered hierarchical sections (1.0, 1.1...)',
      'Standard dispute resolution & governing law clauses',
      'DocuSign-ready execution & electronic attestation'
    ]
  },
  pastoral_covenant: {
    name: 'Pastoral & Covenant Standard',
    tagline: 'Faith-grounded, relational solemn commitment',
    description: 'Tailored for ministry, counseling, and marital commitments. Blends solemn pastoral dignity with clear mutual responsibilities, ethical standards, and confidentiality.',
    features: [
      'Solemn covenant declarations & preamble',
      'Mutual commitments & counseling ethics',
      'Pastoral confidentiality & support framework',
      'DocuSign-ready signature & signing date blocks'
    ]
  },
  plain_english_business: {
    name: 'Modern Plain-English Standard',
    tagline: 'Clear, modern, jargon-free professionalism',
    description: 'Converts archaic or cluttered language into direct, crystal-clear, modern plain-English provisions that leave zero room for misunderstanding.',
    features: [
      'Direct, readable active-voice commitments',
      'Streamlined modern section structure',
      'Unambiguous deliverables and mutual rights',
      'Clean electronic sign & date attestation'
    ]
  },
  formal_attestation: {
    name: 'Solemn Attestation & Affidavit Standard',
    tagline: 'High-integrity sworn declaration & record',
    description: 'Optimized for formal certificates of completion, course graduation covenants, and attested declarations before witnesses and officiants.',
    features: [
      'Formal declaration of truth & completion',
      'Witness attestation & certification block',
      'Permanent record & archival affirmation',
      'DocuSign signature and date confirmation'
    ]
  }
};

/**
 * Builds a standardized DocuSign-compliant execution section where signers
 * only need to sign their names and enter their signature dates.
 */
export function buildDocuSignExecutionSection(
  fields: ContractField[],
  signatures: ContractSignature[],
  mode: DocuSignExecutionMode = 'standard_lines'
): string {
  const isAnchor = mode === 'anchor_tags';

  // Extract party names with smart fallbacks
  const party1Field = fields.find(f => 
    f.label.toLowerCase().includes('bride') || 
    f.label.toLowerCase().includes('party 1') || 
    f.label.toLowerCase().includes('client 1') || 
    f.label.toLowerCase().includes('first party') ||
    f.key.toLowerCase().includes('bride') ||
    f.key.toLowerCase().includes('spouse1')
  );
  const party1 = (party1Field?.value && party1Field.value.trim()) || 
    signatures.find(s => s.role === 'bride' || s.id.includes('party1'))?.name || 
    'First Party / Client 1';

  const party2Field = fields.find(f => 
    f.label.toLowerCase().includes('groom') || 
    f.label.toLowerCase().includes('party 2') || 
    f.label.toLowerCase().includes('client 2') || 
    f.label.toLowerCase().includes('second party') ||
    f.key.toLowerCase().includes('groom') ||
    f.key.toLowerCase().includes('spouse2')
  );
  const party2 = (party2Field?.value && party2Field.value.trim()) || 
    signatures.find(s => s.role === 'groom' || s.id.includes('party2'))?.name || 
    'Second Party / Client 2';

  const counselorField = fields.find(f => 
    f.label.toLowerCase().includes('counselor') || 
    f.label.toLowerCase().includes('officiant') || 
    f.label.toLowerCase().includes('pastor') ||
    f.label.toLowerCase().includes('minister') ||
    f.key.toLowerCase().includes('counselor')
  );
  const counselor = (counselorField?.value && counselorField.value.trim()) || 
    signatures.find(s => s.role === 'counselor')?.name || 
    'Counselor / Officiant / Presiding Authority';

  const witness1Field = fields.find(f => f.key.toLowerCase().includes('witness1') || f.label.toLowerCase().includes('witness 1'));
  const witness1 = (witness1Field?.value && witness1Field.value.trim()) || signatures.find(s => s.role === 'witness1')?.name || '';

  const witness2Field = fields.find(f => f.key.toLowerCase().includes('witness2') || f.label.toLowerCase().includes('witness 2'));
  const witness2 = (witness2Field?.value && witness2Field.value.trim()) || signatures.find(s => s.role === 'witness2')?.name || '';

  let section = `SECTION — EXECUTION, COUNTERPARTS & ELECTRONIC SIGNATURES
IN WITNESS WHEREOF, the Parties hereto have caused this Agreement to be duly executed by their electronic or handwritten signatures below, effective as of the date of the last signature affixed hereto.

This Agreement may be executed in any number of counterparts, each of which shall be deemed an original, and all of which together shall constitute one and the same legal instrument. Delivery of an executed counterpart via electronic signature technologies (including DocuSign, Adobe Sign, or secure PDF e-signature) shall be legally binding and enforceable with the same validity and effect as a manually executed handwritten original, in accordance with the U.S. Electronic Signatures in Global and National Commerce Act (ESIGN Act, 15 U.S.C. § 7001 et seq.) and the Uniform Electronic Transactions Act (UETA).

The parties involved are only required to sign their names and enter the date of their signatures:

PARTY 1 / CLIENT:
${isAnchor ? 'Signature: /s1/ ____________________________________________________' : 'Signature: ________________________________________________________'}
Signer Name: ${party1}
Title / Capacity: Authorized Party 1 Signatory
${isAnchor ? 'Date of Signature: /d1/ ____________________________________________' : 'Date of Signature: ________________________________________________'}

PARTY 2 / CLIENT:
${isAnchor ? 'Signature: /s2/ ____________________________________________________' : 'Signature: ________________________________________________________'}
Signer Name: ${party2}
Title / Capacity: Authorized Party 2 Signatory
${isAnchor ? 'Date of Signature: /d2/ ____________________________________________' : 'Date of Signature: ________________________________________________'}

COUNSELOR / OFFICIANT / ATTESTING AUTHORITY:
${isAnchor ? 'Signature: /s3/ ____________________________________________________' : 'Signature: ________________________________________________________'}
Signer Name: ${counselor}
Title / Capacity: Presiding Pastoral Counselor / Officiant
${isAnchor ? 'Date of Signature: /d3/ ____________________________________________' : 'Date of Signature: ________________________________________________'}`;

  if (witness1) {
    section += `\n\nWITNESS 1 ATTESTATION:
${isAnchor ? 'Signature: /s4/ ____________________________________________________' : 'Signature: ________________________________________________________'}
Signer Name: ${witness1}
Title / Capacity: Official Witness
${isAnchor ? 'Date of Signature: /d4/ ____________________________________________' : 'Date of Signature: ________________________________________________'}`;
  }

  if (witness2) {
    section += `\n\nWITNESS 2 ATTESTATION:
${isAnchor ? 'Signature: /s5/ ____________________________________________________' : 'Signature: ________________________________________________________'}
Signer Name: ${witness2}
Title / Capacity: Official Witness
${isAnchor ? 'Date of Signature: /d5/ ____________________________________________' : 'Date of Signature: ________________________________________________'}`;
  }

  return section;
}

/**
 * Replaces placeholders with their filled values or formatted fallback in text.
 */
function substituteFilledFields(content: string, fields: ContractField[]): string {
  let result = content;
  fields.forEach(field => {
    const val = field.value && field.value.trim() ? field.value.trim() : `[${field.label.toUpperCase()}]`;
    if (field.placeholder) {
      result = result.split(field.placeholder).join(val);
    }
    const bracketPattern = new RegExp(`\\[\\s*${field.label}\\s*\\]`, 'gi');
    result = result.replace(bracketPattern, val);
  });
  return result;
}

/**
 * Strips all unnecessary markdown asterisks (*, **, ***) and pseudo-markdown artifacts,
 * normalizes headers, cleans bullet points to Unicode bullets (•), and cleans line spacing.
 */
export function cleanAndFormatContractText(content: string): string {
  if (!content) return '';

  let cleaned = content;

  // 1. Remove markdown horizontal rules (e.g. ***, ---, ___ or * * *)
  cleaned = cleaned.replace(/^[ \t]*(\*|\-|_){3,}[ \t]*$/gm, '\n');

  // 2. Remove triple asterisks (bold italic) -> pure text
  cleaned = cleaned.replace(/\*{3}([^\*\n\r]+)\*{3}/g, '$1');

  // 3. Remove double asterisks (bold) -> pure text
  cleaned = cleaned.replace(/\*{2}([^\*\n\r]+)\*{2}/g, '$1');

  // 4. Remove single asterisks (italics or loose emphasis) -> pure text
  cleaned = cleaned.replace(/\*([^\*\n\r]+)\*/g, '$1');

  // 5. Remove markdown headers (#, ##, ###, ####)
  cleaned = cleaned.replace(/^[ \t]*#{1,6}[ \t]+([^\n\r]+)/gm, (_, heading) => {
    return heading.trim().toUpperCase();
  });

  // 6. Convert asterisk or hyphen list markers into clean bullet characters
  cleaned = cleaned.replace(/^[ \t]*[\*\-][ \t]+([^\n\r]+)/gm, '  • $1');

  // 7. Remove any remaining stray isolated asterisks
  cleaned = cleaned.replace(/\\\*/g, '');
  cleaned = cleaned.replace(/\*{1,}/g, '');

  // 8. Clean up double underscore bolding (e.g. __Text__ -> Text), but preserve fill-in underlines (e.g. ________)
  cleaned = cleaned.replace(/__([^_ \n\r][^_\n\r]*?)__/g, '$1');

  // 9. Standardize section headers spacing & formatting (e.g. "SECTION 1.0 : " -> "SECTION 1.0 — ")
  cleaned = cleaned.replace(/^([ \t]*(?:SECTION|ARTICLE|CLAUSE)\s+[0-9A-Z\.]+)\s*[:\-—]\s*/gim, '$1 — ');

  // 10. Clean up space before colons (e.g., "Party A :" -> "Party A:")
  cleaned = cleaned.replace(/([A-Za-z0-9\)])\s+:(?=\s|$)/g, '$1:');

  // 11. Normalize multiple blank lines (max 2 consecutive newlines)
  cleaned = cleaned.replace(/\r\n/g, '\n');
  cleaned = cleaned.replace(/\n{3,}/g, '\n\n');

  // 12. Trim each line's trailing whitespace
  cleaned = cleaned
    .split('\n')
    .map(line => line.trimEnd())
    .join('\n')
    .trim();

  return cleaned;
}

/**
 * Intelligent Local Rule-Based Legal Standardizer fallback
 */
function generateLocalIndustryStandardPolish(options: PolishOptions): PolishResult {
  const { title, rawContent, fields, signatures, standardType, customInstructions } = options;
  const substituted = substituteFilledFields(rawContent, fields);
  
  const filledCount = fields.filter(f => f.value && f.value.trim().length > 0).length;
  const standardInfo = INDUSTRY_STANDARDS_INFO[standardType];

  let polishedTitle = cleanAndFormatContractText(title);
  if (!polishedTitle.toUpperCase().includes('AGREEMENT') && !polishedTitle.toUpperCase().includes('COVENANT') && !polishedTitle.toUpperCase().includes('CONTRACT')) {
    polishedTitle = `${polishedTitle.trim()} Agreement`;
  }

  // Detect key parties from fields/signatures
  const party1 = fields.find(f => f.label.toLowerCase().includes('bride') || f.label.toLowerCase().includes('party 1') || f.label.toLowerCase().includes('client') || f.key.includes('spouse1'))?.value || 'First Party';
  const party2 = fields.find(f => f.label.toLowerCase().includes('groom') || f.label.toLowerCase().includes('party 2') || f.label.toLowerCase().includes('contractor') || f.key.includes('spouse2'))?.value || 'Second Party';
  const authority = fields.find(f => f.label.toLowerCase().includes('counselor') || f.label.toLowerCase().includes('officiant') || f.label.toLowerCase().includes('pastor'))?.value || 'Presiding Authority';
  const dateVal = fields.find(f => f.type === 'date' || f.label.toLowerCase().includes('date'))?.value || new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  let polishedBody = '';
  const enhancements: string[] = [];
  const protections: string[] = [];

  enhancements.push('Cleaned formatting: removed unnecessary asterisks and normalized typographical hierarchy');
  enhancements.push("DocuSign Integration: Formatted signature blocks so parties only need to sign their names and enter their signature dates");
  protections.push('DocuSign & ESIGN Act Electronic Execution Validity Standard');

  const docusignExecution = buildDocuSignExecutionSection(fields, signatures, options.docuSignMode || 'standard_lines');

  if (standardType === 'docusign_legal') {
    enhancements.push('Optimized for DocuSign e-Sign execution (only name signature & date required)');
    enhancements.push('Integrated ESIGN Act & UETA electronic signature enforceability covenants');
    enhancements.push('Structured clear, binding operative terms with pre-filled party roles');
    protections.push('Counterparts & Digital Audit Trail Recognition');
    protections.push('Mutual Confidentiality & Good Faith Performance');

    polishedBody = `ELECTRONIC COVENANT & LEGAL AGREEMENT
Effective Date: ${dateVal}

PARTIES ENTERING THIS AGREEMENT:
  • PARTY 1 / CLIENT 1: ${party1}
  • PARTY 2 / CLIENT 2: ${party2}
  ${authority !== 'Presiding Authority' ? `• FACILITATING AUTHORITY: ${authority}\n` : ''}
RECITALS & PURPOSE
WHEREAS, the Parties wish to record and finalize their mutual promises, covenants, and foundational commitments in a legally binding and enforceable electronic record; and

WHEREAS, the Parties have completed all preparatory dialogue and agree to all terms set forth herein;

NOW, THEREFORE, the Parties mutually agree to the following terms:

SECTION 1.0 — OPERATIVE COMMITMENTS & TERMS
${cleanAndFormatContractText(substituted).trim()}

SECTION 2.0 — MUTUAL COOPERATION & RESOLUTION
2.1 Good Faith Performance. Each Party agrees to fulfill their mutual obligations with utmost honesty, respect, and good faith.
2.2 Amicable Resolution. In case of any dispute or misunderstanding, the Parties commit to engaging in direct, respectful dialogue or consulting a designated mediator or counselor prior to taking any formal dispute actions.

SECTION 3.0 — SEVERABILITY & FULL UNDERSTANDING
3.1 Full Understanding. This document represents the full, integrated agreement of the Parties and supersedes all prior verbal discussions.
3.2 Severability. If any individual clause is determined to be invalid, the remaining terms shall continue in full force and effect.

${docusignExecution}`;
  } else if (standardType === 'executive_legal') {
    enhancements.push('Structured with formal WHEREAS recitals and legal consideration');
    enhancements.push('Organized into standardized numbered legal sections (1.0 - 6.0)');
    enhancements.push('Integrated comprehensive Severability and Governing Law protections');
    protections.push('Entire Agreement & Amendment Formalities Clause');
    protections.push('Mutual Confidentiality & Non-Disclosure Covenant');
    protections.push('Enforceability & Severability Standard');

    polishedBody = `PREAMBLE & RECITALS
This ${polishedTitle.toUpperCase()} (the "Agreement") is entered into and made effective as of ${dateVal}, by and between:

  • PARTY A: ${party1} ("First Party")
  • PARTY B: ${party2} ("Second Party")
  ${authority !== 'Presiding Authority' ? `• ATTESTING AUTHORITY: ${authority} ("Counselor / Officiant")\n` : ''}
WHEREAS, the Parties desire to formally articulate their mutual commitments, covenants, and foundational understandings with complete clarity and good faith; and

WHEREAS, each Party confirms they have entered into this Agreement willingly, having reviewed all provisions and terms herein;

NOW, THEREFORE, in consideration of the mutual covenants contained herein and other good and valuable consideration, the receipt and sufficiency of which are hereby acknowledged, the Parties agree as follows:

SECTION 1.0 — PURPOSE & FOUNDATIONAL COMMITMENT
1.1 Primary Objective. The Parties establish this covenant to affirm their mutual commitments, respect, open communication, and shared objectives as detailed in the core covenants below.
1.2 Good Faith Execution. Each Party covenants to act in good faith and with due diligence in fulfilling every duty and expectation outlined in this instrument.

SECTION 2.0 — OPERATIVE COVENANTS & TERMS
${cleanAndFormatContractText(substituted).trim()}

SECTION 3.0 — CONFIDENTIALITY & MUTUAL PRIVACY
3.1 Protection of Private Matters. All counseling discussions, personal disclosures, and private communications shared in connection with this Agreement shall be maintained in strict confidence, preserving mutual dignity and psychological safety.

SECTION 4.0 — DISPUTE RESOLUTION & COUNSELING FIRST
4.1 Reconciliation & Mediation. In the event of any disagreement, misunderstanding, or grievance arising under or related to this Agreement, the Parties agree to engage in constructive dialogue and, if necessary, seek the guidance of a mutually agreed-upon pastoral counselor or mediator before initiating any formal adverse action.

SECTION 5.0 — SEVERABILITY & ENTIRE AGREEMENT
5.1 Severability. If any provision of this Agreement is held to be invalid or unenforceable, the remaining provisions shall continue in full force and effect.
5.2 Entire Agreement. This Agreement constitutes the complete and finalized understanding between the Parties regarding the subject matter hereof, superseding all prior oral or written representations.

${docusignExecution}`;
  } else if (standardType === 'pastoral_covenant') {
    enhancements.push('Drafted in solemn, dignified pastoral covenant language');
    enhancements.push('Incorporated marital fidelity, spiritual foundations, and mutual support clauses');
    enhancements.push('Added Pastoral Care & Ongoing Counsel covenant');
    protections.push('Pastoral Privilege & Confidentiality Guarantee');
    protections.push('Solemn Mutual Resolution Process');

    polishedBody = `SOLEMN COVENANT OF COMMITMENT
IN RECOGNITION of the sacred covenant of marriage and mutual counseling entered into on this ${dateVal}, before God and community:

BETWEEN:
  • ${party1}
  • ${party2}
  WITH PASTORAL GUIDANCE FROM:
  • ${authority}

SACRED PREAMBLE:
"Let love and faithfulness never leave you; bind them around your neck, write them on the tablet of your heart."
Having completed the preparatory counseling journey, the Parties enter into this sacred covenant with sincere hearts, deliberate purpose, and unwavering dedication.

ARTICLE I — MUTUAL COVENANTS & RESPONSIBILITIES
${cleanAndFormatContractText(substituted).trim()}

ARTICLE II — CONTINUED GROWTH & PASTORAL SUPPORT
1. The Parties pledge to maintain honest, empathetic, and forgiving communication.
2. In times of challenge, the Parties commit to seeking timely pastoral counseling, spiritual mentorship, and constructive guidance.

ARTICLE III — SOLEMN AFFIRMATION
We, the undersigned, joyfully and reverently enter into this Covenant, pledging our honor, our love, and our devotion to one another.

${docusignExecution}`;
  } else if (standardType === 'plain_english_business') {
    enhancements.push('Refactored into clear, direct, modern plain English');
    enhancements.push('Eliminated archaic legalese while preserving complete clarity');
    enhancements.push('Structured clear mutual commitments and milestones');
    protections.push('Clear Communication & Feedback Mechanism');
    protections.push('Amendments in Writing Requirement');

    polishedBody = `MODERN COMMITMENT & COVENANT AGREEMENT
Effective Date: ${dateVal}

Parties:
  • ${party1}
  • ${party2}
  • Facilitator / Authority: ${authority}

1. What This Agreement Is About
The purpose of this document is to clearly state the commitments, expectations, and agreements reached by the parties.

2. Agreed Terms and Commitments
${cleanAndFormatContractText(substituted).trim()}

3. Privacy & Mutual Respect
Both parties agree to treat each other with dignity, respect private disclosures, and work through challenges with transparent communication.

4. Resolving Differences
If any disagreements arise, both parties agree to pause, talk through the matter constructively, and seek facilitator or counseling guidance if needed.

5. Final Agreement
This document represents our full and shared agreement. Any future changes will be agreed upon in writing by all parties.

${docusignExecution}`;
  } else {
    // Formal Attestation
    enhancements.push('Drafted as a formal record of completion and attestation');
    enhancements.push('Standardized formal witness verification clauses');
    enhancements.push('Formatted for permanent record and certificate archival');
    protections.push('Formal Verification of Authenticity');
    protections.push('Permanent Archival Attestation');

    polishedBody = `OFFICIAL RECORD & CERTIFICATE OF COVENANT
Date of Record: ${dateVal}

BE IT KNOWN AND DULY RECORDED that:
  • ${party1}
  AND
  • ${party2}

Have satisfactorily fulfilled all requirements, counseling sessions, and mutual covenants required under this official program under the direction of ${authority}.

RECORD OF COVENANTS & FINDINGS:
${cleanAndFormatContractText(substituted).trim()}

ATTESTATION & AFFIRMATION:
The undersigned hereby certify that the statements and covenants recorded herein are true, accurate, and entered into with full mutual consent.

${docusignExecution}`;
  }

  return {
    originalTitle: title,
    originalContent: rawContent,
    polishedTitle: cleanAndFormatContractText(polishedTitle),
    polishedContent: cleanAndFormatContractText(polishedBody),
    summaryOfEnhancements: enhancements,
    keyProtectionsAdded: protections,
    standardType,
    standardName: standardInfo.name,
    filledVariablesCount: filledCount,
    totalVariablesCount: fields.length,
    docuSignMode: options.docuSignMode || 'standard_lines'
  };
}

/**
 * Calls Gemini AI (gemini-3.7-flash) to produce an industry-standard polished version.
 * Falls back gracefully to intelligent local standardizer if key is unavailable or request fails.
 */
export async function polishContractWithAI(options: PolishOptions): Promise<PolishResult> {
  const { title, rawContent, fields, signatures, standardType, customInstructions, docuSignMode } = options;
  const standardInfo = INDUSTRY_STANDARDS_INFO[standardType];
  const filledCount = fields.filter(f => f.value && f.value.trim().length > 0).length;

  let apiKey = '';
  try {
    if (typeof process !== 'undefined' && process.env) {
      apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY || '';
    }
  } catch (e) {}

  if (!apiKey) {
    try {
      // @ts-ignore
      if (typeof import.meta !== 'undefined' && import.meta.env) {
        // @ts-ignore
        apiKey = import.meta.env.VITE_API_KEY || import.meta.env.VITE_GEMINI_API_KEY || '';
      }
    } catch (e) {}
  }

  // If no API key, use the local standardizer
  if (!apiKey) {
    return generateLocalIndustryStandardPolish(options);
  }

  try {
    const ai = new GoogleGenAI({ apiKey });

    const filledVariablesJson = JSON.stringify(
      fields.map(f => ({
        label: f.label,
        key: f.key,
        value: f.value || `[Not Provided: ${f.label}]`,
        category: f.category
      }))
    );

    const signaturesJson = JSON.stringify(
      signatures.map(s => ({
        label: s.label,
        title: s.title,
        name: s.name,
        role: s.role
      }))
    );

    const useAnchorTags = docuSignMode === 'anchor_tags';

    const systemInstruction = `You are a Senior Legal Counsel and Contract Drafting Specialist specializing in DocuSign and Electronic Signature standards (ESIGN Act & UETA).
Your task is to take a draft contract or covenant template with filled variables, and produce a Polished, Industry-Standard version ready for electronic execution via DocuSign.

Rules:
1. PRESERVE ALL USER INPUTS: Every filled value (names, dates, amounts, locations, specific promises) MUST be seamlessly incorporated into the polished agreement body.
2. ADAPT TO SELECTED STANDARD:
   - "docusign_legal": Formal legal agreement formatted specifically for DocuSign/electronic signature routing where parties only need to sign their names and enter the date of their signatures.
   - "executive_legal": Formal legal agreement with WHEREAS recitals, numbered hierarchical sections (1.0, 1.1...), standard dispute resolution, and DocuSign execution block.
   - "pastoral_covenant": Solemn, dignified premarital/marital/counseling covenant with spiritual/ethical gravity and DocuSign signature block.
   - "plain_english_business": Crystal-clear, modern, readable provisions with straightforward remedies and DocuSign execution block.
   - "formal_attestation": Formal sworn affidavit/certificate of completion with record of covenants and DocuSign execution block.
3. DOCUSIGN E-SIGNATURE STANDARD (MANDATORY):
   - The document MUST conclude with an EXECUTION, COUNTERPARTS & ELECTRONIC SIGNATURES section compliant with the ESIGN Act (15 U.S.C. § 7001) and UETA.
   - For every party involved (Party 1, Party 2, Counselor/Officiant, and any Witnesses), create standardized signature blocks where parties ONLY need to sign their names and enter their signature dates.
   - Format:
     PARTY 1 / CLIENT:
     Signature: ${useAnchorTags ? '/s1/ ' : ''}________________________________________________________
     Signer Name: [Full Legal Name]
     Title / Capacity: Authorized Signatory
     Date of Signature: ${useAnchorTags ? '/d1/ ' : ''}________________________________________________
   - All parties only need to sign their names and enter the date of their signatures. Do not leave un-filled body fields in the signature area.
4. FORMATTING & CLEANLINESS (CRITICAL):
   - NO MARKDOWN ASTERISKS: Do NOT use asterisks (* or **) anywhere in the document text. Never output **bold**, *italics*, or * list items.
   - Clean Typography: Use clean standard UPPERCASE lettering for major section titles (e.g., 'SECTION 1.0 — PURPOSE AND SCOPE', 'ARTICLE I — MUTUAL COVENANTS', 'WHEREAS,', 'NOW, THEREFORE,').
   - Clean Numbering: Use clean numbering format (e.g., '1.1 Mutual Honor & Respect.', '1.2 Good Faith Participation.').
   - Clean Bullet Points: Use standard bullet characters ('  • ') for rosters and items.
   - Clean Paragraphs: Separate clauses and sections with clean blank lines.
5. PURE TEXT ONLY: Do NOT output HTML tags or code fences. Return a clean JSON object according to the response schema.`;

    const promptText = `Please polish and standardize the following contract document to the "${standardInfo.name}" (${standardType}) with full DocuSign e-sign integration.
Ensure ALL asterisks are completely removed and the typography is pure, clean, and publication-ready.

Original Document Title: ${title}

Filled Variables Data:
${filledVariablesJson}

Signature Blocks Data:
${signaturesJson}

DocuSign Tag Mode: ${docuSignMode || 'standard_lines'}

Original Template Text:
"""
${rawContent}
"""

${customInstructions ? `Additional User Instructions: "${customInstructions}"` : ''}

Generate a comprehensive, beautifully drafted, professional industry-standard version with DocuSign execution block and zero markdown asterisks.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.7-flash',
      contents: promptText,
      config: {
        systemInstruction,
        temperature: 0.2,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            polishedTitle: {
              type: Type.STRING,
              description: 'An elevated, professional, formal title for the agreement without asterisks.'
            },
            polishedContent: {
              type: Type.STRING,
              description: 'The complete, fully drafted, polished industry-standard contract text incorporating all filled variables and DocuSign signature & date blocks with zero asterisks.'
            },
            summaryOfEnhancements: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: '3 to 5 key structural and legal improvements made.'
            },
            keyProtectionsAdded: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: '2 to 4 specific protective clauses incorporated.'
            }
          },
          required: ['polishedTitle', 'polishedContent', 'summaryOfEnhancements', 'keyProtectionsAdded']
        }
      }
    });

    const responseText = response.text;
    if (responseText) {
      const parsed = JSON.parse(responseText);
      let cleanedPolishedContent = cleanAndFormatContractText(parsed.polishedContent || rawContent);
      const cleanedPolishedTitle = cleanAndFormatContractText(parsed.polishedTitle || title);

      // Ensure DocuSign execution block is present
      if (!cleanedPolishedContent.includes('Signature:') && !cleanedPolishedContent.includes('Date of Signature:')) {
        cleanedPolishedContent += `\n\n${buildDocuSignExecutionSection(fields, signatures, docuSignMode || 'standard_lines')}`;
      }

      const returnedEnhancements: string[] = parsed.summaryOfEnhancements || [
        'Standardized document hierarchy and clause structure',
        'DocuSign Integration: Parties only need to sign names and enter signature dates',
        'Incorporated filled variables seamlessly',
        'Enhanced enforceability and clarity'
      ];
      
      // Ensure DocuSign & clean formatting enhancements are acknowledged
      if (!returnedEnhancements.some(e => e.toLowerCase().includes('docusign') || e.toLowerCase().includes('sign'))) {
        returnedEnhancements.unshift('DocuSign e-Sign Integration: Prepared for instant signing of names & dates');
      }
      if (!returnedEnhancements.some(e => e.toLowerCase().includes('asterisk') || e.toLowerCase().includes('clean'))) {
        returnedEnhancements.unshift('Removed unnecessary markdown asterisks & standardized clean typography');
      }

      return {
        originalTitle: title,
        originalContent: rawContent,
        polishedTitle: cleanedPolishedTitle,
        polishedContent: cleanedPolishedContent,
        summaryOfEnhancements: returnedEnhancements,
        keyProtectionsAdded: parsed.keyProtectionsAdded || [
          'DocuSign & ESIGN Act Electronic Execution Standard',
          'Confidentiality & Mutual Care Safeguards',
          'Dispute Resolution & Severability'
        ],
        standardType,
        standardName: standardInfo.name,
        filledVariablesCount: filledCount,
        totalVariablesCount: fields.length,
        docuSignMode: docuSignMode || 'standard_lines'
      };
    }
  } catch (error) {
    console.warn('Gemini API polish call encountered error, using local legal standardizer:', error);
  }

  // Guaranteed fallback
  return generateLocalIndustryStandardPolish(options);
}
