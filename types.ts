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