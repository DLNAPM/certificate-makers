export interface CertificateData {
  brideName: string;
  groomName: string;
  counselorName: string;
  date: string;
  slogan: string;
}

export interface Position {
  x: number;
  y: number;
}

export interface CertificateLayout {
  sloganSize: number;
  signatureWidth: number;
  brideSigPos: Position;
  groomSigPos: Position;
  counselorSigPos: Position;
}

export interface BackgroundOption {
  id: string;
  name: string;
  url: string;
  textColor: string; // 'text-slate-900' or 'text-white'
  borderColor: string;
  accentColor: string; // For lines/dividers
}

export interface UserProfile {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
}

export interface SavedTemplate {
  id?: string;
  name: string;
  type?: 'certificate' | 'contract';
  data: CertificateData;
  layout: CertificateLayout;
  background: BackgroundOption;
  createdBy: string; // uid
  creatorName: string;
  createdAt: number;
  isPublic: boolean;
  sharedWith?: string[]; // List of emails
}

// -------------------------------------------------------------
// CONTRACT STUDIO TYPES
// -------------------------------------------------------------

export interface ContractField {
  id: string;
  key: string;
  label: string;
  value: string;
  placeholder: string;
  type: 'text' | 'date' | 'textarea' | 'select' | 'number';
  category?: string;
  required?: boolean;
  isCustom?: boolean;
  options?: string[];
}

export interface ContractSignature {
  id: string;
  role: 'bride' | 'groom' | 'counselor' | 'witness' | 'other';
  label: string;
  name: string;
  title?: string;
  signatureData?: string; // base64 canvas image
  signedDate?: string;
  type: 'type' | 'draw' | 'upload';
}

export interface ContractTheme {
  id: string;
  name: string;
  bgClass: string;
  paperColor: string;
  borderClass: string;
  headerFont: string;
  bodyFont: string;
  accentColor: string;
  sealType: 'covenant_gold' | 'counseling_ribbon' | 'classic_crest' | 'none';
  pageBorder: 'double' | 'single' | 'ornate' | 'clean';
}

export interface ContractDocument {
  id: string;
  title: string;
  subtitle?: string;
  originalFileName?: string;
  fileType?: 'docx' | 'pdf' | 'txt' | 'custom';
  rawContent: string;
  fields: ContractField[];
  signatures: ContractSignature[];
  themeId: string;
  sealType: 'covenant_gold' | 'counseling_ribbon' | 'classic_crest' | 'none';
  createdAt: number;
  updatedAt: number;
  notes?: string;
}

export interface StandardClause {
  id: string;
  title: string;
  category: 'covenant' | 'counseling' | 'fidelity' | 'financial' | 'resolution' | 'officiant';
  content: string;
}
