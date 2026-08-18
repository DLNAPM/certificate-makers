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

export type OfficialSealType = 
  | 'covenant_gold' 
  | 'counseling_ribbon' 
  | 'classic_crest' 
  | 'cross_rings' 
  | 'dove_peace' 
  | 'custom' 
  | 'none';

export type SealPosition = 
  | 'header_right' 
  | 'header_left' 
  | 'header_center' 
  | 'bottom_left' 
  | 'bottom_center' 
  | 'bottom_right' 
  | 'watermark';

export type SealEffectStyle = 
  | 'original' 
  | 'gold_foil' 
  | 'silver_notary' 
  | 'wax_stamp';

export interface OfficialSealConfig {
  type: OfficialSealType;
  customUrl?: string;
  position?: SealPosition;
  size?: number; // pixel diameter e.g. 80
  effect?: SealEffectStyle;
  ribbonColor?: 'gold' | 'navy' | 'burgundy' | 'emerald' | 'none';
  customTitle?: string;
  customSubtitle?: string;
}

export interface CertificateLayout {
  sloganSize: number;
  signatureWidth: number;
  brideSigPos: Position;
  groomSigPos: Position;
  counselorSigPos: Position;
  sealPos?: Position;
  showSeal?: boolean;
  sealType?: OfficialSealType;
  customSealUrl?: string;
  sealSize?: number;
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
  orderIndex?: number; // Appearance order in template
}

export interface ContractSignature {
  id: string;
  role: 'bride' | 'groom' | 'counselor' | 'witness' | 'other' | string;
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
  sealType: OfficialSealType;
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
  includeSignatures?: boolean;
  themeId: string;
  sealType: OfficialSealType;
  customSealUrl?: string;
  sealPosition?: SealPosition;
  sealSize?: number;
  sealEffect?: SealEffectStyle;
  ribbonColor?: 'gold' | 'navy' | 'burgundy' | 'emerald' | 'none';
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
