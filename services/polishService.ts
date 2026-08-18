import { GoogleGenAI, Type } from '@google/genai';
import { ContractField, ContractSignature } from '../types';

export type IndustryStandardType = 
  | 'executive_legal'
  | 'pastoral_covenant'
  | 'plain_english_business'
  | 'formal_attestation';

export interface PolishOptions {
  title: string;
  rawContent: string;
  fields: ContractField[];
  signatures: ContractSignature[];
  includeSignatures: boolean;
  standardType: IndustryStandardType;
  customInstructions?: string;
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
}

export const INDUSTRY_STANDARDS_INFO: Record<IndustryStandardType, {
  name: string;
  tagline: string;
  description: string;
  features: string[];
}> = {
  executive_legal: {
    name: 'Executive Legal Standard',
    tagline: 'Comprehensive, formally structured legal agreement',
    description: 'Elevates document into formal legal language with recitals (WHEREAS clauses), defined party roles, severability, dispute resolution, and clear clause numbering.',
    features: [
      'Formal WHEREAS recitals & consideration statements',
      'Numbered hierarchical sections (1.0, 1.1...)',
      'Standard dispute resolution & governing law clauses',
      'Severability and entire agreement protections'
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
      'Ceremonial blessing & formal attestations'
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
      'Clean modern signature attestation'
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
      'Verification authority seal formatting'
    ]
  }
};

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
 * Intelligent Local Rule-Based Legal Standardizer fallback
 */
function generateLocalIndustryStandardPolish(options: PolishOptions): PolishResult {
  const { title, rawContent, fields, signatures, standardType, customInstructions } = options;
  const substituted = substituteFilledFields(rawContent, fields);
  
  const filledCount = fields.filter(f => f.value && f.value.trim().length > 0).length;
  const standardInfo = INDUSTRY_STANDARDS_INFO[standardType];

  let polishedTitle = title;
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

  if (standardType === 'executive_legal') {
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
${substituted.trim()}

SECTION 3.0 — CONFIDENTIALITY & MUTUAL PRIVACY
3.1 Protection of Private Matters. All counseling discussions, personal disclosures, and private communications shared in connection with this Agreement shall be maintained in strict confidence, preserving mutual dignity and psychological safety.

SECTION 4.0 — DISPUTE RESOLUTION & COUNSELING FIRST
4.1 Reconciliation & Mediation. In the event of any disagreement, misunderstanding, or grievance arising under or related to this Agreement, the Parties agree to engage in constructive dialogue and, if necessary, seek the guidance of a mutually agreed-upon pastoral counselor or mediator before initiating any formal adverse action.

SECTION 5.0 — SEVERABILITY & ENTIRE AGREEMENT
5.1 Severability. If any provision of this Agreement is held to be invalid or unenforceable, the remaining provisions shall continue in full force and effect.
5.2 Entire Agreement. This Agreement constitutes the complete and finalized understanding between the Parties regarding the subject matter hereof, superseding all prior oral or written representations.

SECTION 6.0 — ELECTRONIC & PHYSICAL ATTESTATION
6.1 Counterparts & Attestation. This Agreement may be executed in counterparts, each of which shall be deemed an original, and all of which together shall constitute one and the same instrument.`;
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

ARTICLE I: MUTUAL COVENANTS & RESPONSIBILITIES
${substituted.trim()}

ARTICLE II: CONTINUED GROWTH & PASTORAL SUPPORT
1. The Parties pledge to maintain honest, empathetic, and forgiving communication.
2. In times of challenge, the Parties commit to seeking timely pastoral counseling, spiritual mentorship, and constructive guidance.

ARTICLE III: SOLEMN AFFIRMATION
We, the undersigned, joyfully and reverently enter into this Covenant, pledging our honor, our love, and our devotion to one another.`;
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
${substituted.trim()}

3. Privacy & Mutual Respect
Both parties agree to treat each other with dignity, respect private disclosures, and work through challenges with transparent communication.

4. Resolving Differences
If any disagreements arise, both parties agree to pause, talk through the matter constructively, and seek facilitator or counseling guidance if needed.

5. Final Agreement
This document represents our full and shared agreement. Any future changes will be agreed upon in writing by all parties.`;
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
  ${party1}
  AND
  ${party2}

Have satisfactorily fulfilled all requirements, counseling sessions, and mutual covenants required under this official program under the direction of ${authority}.

RECORD OF COVENANTS & FINDINGS:
${substituted.trim()}

ATTESTATION & AFFIRMATION:
The undersigned hereby certify that the statements and covenants recorded herein are true, accurate, and entered into with full mutual consent.`;
  }

  return {
    originalTitle: title,
    originalContent: rawContent,
    polishedTitle,
    polishedContent: polishedBody,
    summaryOfEnhancements: enhancements,
    keyProtectionsAdded: protections,
    standardType,
    standardName: standardInfo.name,
    filledVariablesCount: filledCount,
    totalVariablesCount: fields.length
  };
}

/**
 * Calls Gemini AI (gemini-3.7-flash) to produce an industry-standard polished version.
 * Falls back gracefully to intelligent local standardizer if key is unavailable or request fails.
 */
export async function polishContractWithAI(options: PolishOptions): Promise<PolishResult> {
  const { title, rawContent, fields, signatures, standardType, customInstructions } = options;
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

    const systemInstruction = `You are a Senior Legal Counsel and Pastoral Covenant Drafting Specialist.
Your task is to take a draft contract or covenant template that has had its variables filled in, and produce a more Polished, Industry-Standard version.

Rules:
1. PRESERVE ALL USER INPUTS: Every filled value (names, dates, amounts, locations, specific promises) MUST be seamlessly and accurately incorporated into the polished text.
2. ADAPT TO SELECTED STANDARD:
   - "executive_legal": Formal legal agreement with WHEREAS recitals, numbered hierarchical sections (1.0, 1.1...), standard dispute resolution, severability, confidentiality, and execution terms.
   - "pastoral_covenant": Solemn, dignified premarital/marital/counseling covenant with spiritual/ethical gravity, mutual commitments, pastoral care, and affirmation.
   - "plain_english_business": Crystal-clear, modern, readable provisions with zero archaic clutter, transparent mutual duties, and straightforward remedies.
   - "formal_attestation": Formal sworn affidavit/certificate of completion with record of covenants, witness affirmation, and authentic seal block.
3. FORMATTING: Clean Markdown with bold section titles, bulleted party rosters, and clear paragraphing.
4. DO NOT OUTPUT HTML TAGS or code fences around the text. Return a clean JSON object according to the response schema.`;

    const promptText = `Please polish and standardize the following contract document to the "${standardInfo.name}" (${standardType}).

Original Document Title: ${title}

Filled Variables Data:
${filledVariablesJson}

Signature Blocks Data:
${signaturesJson}

Original Template Text:
"""
${rawContent}
"""

${customInstructions ? `Additional User Instructions: "${customInstructions}"` : ''}

Generate a comprehensive, beautifully drafted, professional industry-standard version.`;

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
              description: 'An elevated, professional, formal title for the agreement.'
            },
            polishedContent: {
              type: Type.STRING,
              description: 'The complete, fully drafted, polished industry-standard contract text incorporating all filled variables.'
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
      return {
        originalTitle: title,
        originalContent: rawContent,
        polishedTitle: parsed.polishedTitle || title,
        polishedContent: parsed.polishedContent || rawContent,
        summaryOfEnhancements: parsed.summaryOfEnhancements || [
          'Standardized document hierarchy and clause structure',
          'Incorporated filled variables seamlessly',
          'Enhanced enforceability and clarity'
        ],
        keyProtectionsAdded: parsed.keyProtectionsAdded || [
          'Confidentiality & Mutual Care Safeguards',
          'Dispute Resolution & Severability'
        ],
        standardType,
        standardName: standardInfo.name,
        filledVariablesCount: filledCount,
        totalVariablesCount: fields.length
      };
    }
  } catch (error) {
    console.warn('Gemini API polish call encountered error, using local legal standardizer:', error);
  }

  // Guaranteed fallback
  return generateLocalIndustryStandardPolish(options);
}
