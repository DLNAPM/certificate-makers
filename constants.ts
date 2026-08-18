import { BackgroundOption, ContractTheme, StandardClause } from './types';

// Using high-quality placeholder images that resemble wedding/certificate themes
export const BACKGROUNDS: BackgroundOption[] = [
  {
    id: 'floral-soft',
    name: 'Soft White Roses',
    url: 'https://images.unsplash.com/photo-1562690868-60bbe7621e0c?q=80&w=2000&auto=format&fit=crop',
    textColor: 'text-slate-800',
    borderColor: 'border-slate-800',
    accentColor: 'bg-slate-800',
  },
  {
    id: 'parchment',
    name: 'Aged Parchment',
    url: 'https://images.unsplash.com/photo-1586075010923-2dd45eeed8bd?q=80&w=2000&auto=format&fit=crop',
    textColor: 'text-amber-950',
    borderColor: 'border-amber-950',
    accentColor: 'bg-amber-900',
  },
  {
    id: 'bible-open',
    name: 'Open Bible',
    url: 'https://images.unsplash.com/photo-1505521377774-103a8cc5f704?q=80&w=2000&auto=format&fit=crop',
    textColor: 'text-slate-900',
    borderColor: 'border-slate-800',
    accentColor: 'bg-slate-800',
  },
  {
    id: 'rose-on-bible',
    name: 'Rose on Bible',
    url: 'https://images.unsplash.com/photo-1510304982635-08101480f2d4?q=80&w=2000&auto=format&fit=crop',
    textColor: 'text-white',
    borderColor: 'border-rose-100',
    accentColor: 'bg-rose-100',
  },
  {
    id: 'clouds',
    name: 'Heavenly Clouds',
    url: 'https://images.unsplash.com/photo-1504608524841-42fe6f032b4b?q=80&w=2000&auto=format&fit=crop',
    textColor: 'text-slate-900',
    borderColor: 'border-slate-600',
    accentColor: 'bg-slate-600',
  },
  {
    id: 'vintage-paper',
    name: 'Vintage Texture',
    url: 'https://images.unsplash.com/photo-1576402830843-057d3637841f?q=80&w=2000&auto=format&fit=crop',
    textColor: 'text-stone-800',
    borderColor: 'border-stone-800',
    accentColor: 'bg-stone-800',
  },
  {
    id: 'gold-dust',
    name: 'Gold Dust',
    url: 'https://images.unsplash.com/photo-1509721434272-b79147e0e708?q=80&w=2000&auto=format&fit=crop',
    textColor: 'text-slate-900',
    borderColor: 'border-yellow-900',
    accentColor: 'bg-yellow-900',
  },
  {
    id: 'minimal-white',
    name: 'Minimalist White',
    url: 'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?q=80&w=2000&auto=format&fit=crop',
    textColor: 'text-slate-900',
    borderColor: 'border-slate-900',
    accentColor: 'bg-slate-900',
  },
  {
    id: 'botanical',
    name: 'Green Botanical',
    url: 'https://images.unsplash.com/photo-1493604812328-3232c7e0c810?q=80&w=2000&auto=format&fit=crop',
    textColor: 'text-slate-800',
    borderColor: 'border-green-900',
    accentColor: 'bg-green-900',
  },
  {
    id: 'blue-watercolor',
    name: 'Blue Watercolor',
    url: 'https://images.unsplash.com/photo-1510443906663-128a1c975a5e?q=80&w=2000&auto=format&fit=crop',
    textColor: 'text-slate-900',
    borderColor: 'border-blue-900',
    accentColor: 'bg-blue-900',
  },
  {
    id: 'classic-wood',
    name: 'Rustic Wood',
    url: 'https://images.unsplash.com/photo-1516962215378-7fa2e137ae91?q=80&w=2000&auto=format&fit=crop',
    textColor: 'text-white',
    borderColor: 'border-white',
    accentColor: 'bg-white',
  },
  {
    id: 'marble-white',
    name: 'Elegant Marble',
    url: 'https://images.unsplash.com/photo-1599054802207-90dcf306cc98?q=80&w=2000&auto=format&fit=crop',
    textColor: 'text-slate-800',
    borderColor: 'border-slate-400',
    accentColor: 'bg-slate-400',
  },
  {
    id: 'silk-cream',
    name: 'Cream Silk',
    url: 'https://images.unsplash.com/photo-1528458909336-e7a0adfed0a5?q=80&w=2000&auto=format&fit=crop',
    textColor: 'text-stone-800',
    borderColor: 'border-stone-400',
    accentColor: 'bg-stone-400',
  },
  {
    id: 'linen-texture',
    name: 'Linen Fabric',
    url: 'https://images.unsplash.com/photo-1521319550444-6725dc39b821?q=80&w=2000&auto=format&fit=crop',
    textColor: 'text-stone-900',
    borderColor: 'border-stone-600',
    accentColor: 'bg-stone-600',
  },
  {
    id: 'olive-branch',
    name: 'Olive Branch',
    url: 'https://images.unsplash.com/photo-1596522354195-e84570489608?q=80&w=2000&auto=format&fit=crop',
    textColor: 'text-slate-800',
    borderColor: 'border-green-800',
    accentColor: 'bg-green-800',
  }
];

// -------------------------------------------------------------
// CONTRACT STUDIO CONSTANTS & SAMPLES
// -------------------------------------------------------------

export const CONTRACT_THEMES: ContractTheme[] = [
  {
    id: 'parchment-classic',
    name: 'Classic Parchment & Gold',
    bgClass: 'bg-[#faf6ee] text-[#2c2416]',
    paperColor: '#faf6ee',
    borderClass: 'border-[#b89544]',
    headerFont: 'font-serif font-bold',
    bodyFont: 'font-serif',
    accentColor: '#b89544',
    sealType: 'covenant_gold',
    pageBorder: 'double'
  },
  {
    id: 'formal-executive',
    name: 'Executive Legal Formal',
    bgClass: 'bg-white text-slate-900',
    paperColor: '#ffffff',
    borderClass: 'border-slate-800',
    headerFont: 'font-sans font-extrabold tracking-wide uppercase',
    bodyFont: 'font-sans',
    accentColor: '#1e293b',
    sealType: 'classic_crest',
    pageBorder: 'single'
  },
  {
    id: 'covenant-royal',
    name: 'Royal Covenant Navy',
    bgClass: 'bg-[#fcfbf9] text-slate-900',
    paperColor: '#fcfbf9',
    borderClass: 'border-indigo-900',
    headerFont: 'font-serif font-bold',
    bodyFont: 'font-serif',
    accentColor: '#312e81',
    sealType: 'counseling_ribbon',
    pageBorder: 'ornate'
  },
  {
    id: 'modern-minimalist',
    name: 'Modern Clean Minimal',
    bgClass: 'bg-white text-slate-800',
    paperColor: '#ffffff',
    borderClass: 'border-slate-300',
    headerFont: 'font-sans font-bold',
    bodyFont: 'font-sans',
    accentColor: '#475569',
    sealType: 'none',
    pageBorder: 'clean'
  },
  {
    id: 'warm-ivory',
    name: 'Warm Ivory & Bronze',
    bgClass: 'bg-[#fdfaf3] text-[#332b21]',
    paperColor: '#fdfaf3',
    borderClass: 'border-[#a67c52]',
    headerFont: 'font-serif font-semibold',
    bodyFont: 'font-serif',
    accentColor: '#a67c52',
    sealType: 'covenant_gold',
    pageBorder: 'double'
  }
];

export interface SampleContractPreset {
  id: string;
  name: string;
  badge: string;
  description: string;
  title: string;
  content: string;
}

export const SAMPLE_CONTRACTS: SampleContractPreset[] = [
  {
    id: 'premarital-covenant-accord',
    name: 'Premarital Counseling & Covenant Agreement',
    badge: 'Most Popular',
    description: 'Comprehensive covenant accord covering counseling completion, marital commitments, and fidelity.',
    title: 'PREMARITAL COUNSELING AND SACRED COVENANT AGREEMENT',
    content: `PREMARITAL COUNSELING AND SACRED COVENANT AGREEMENT

THIS AGREEMENT is entered into on [Agreement Date], by and between [Bride Name] ("Party 1 / Bride") and [Groom Name] ("Party 2 / Groom"), collectively referred to as the "Couples," under the pastoral counseling and spiritual guidance of [Counselor Name] at [Church Name], located in [Location].

RECITALS & PURPOSE
WHEREAS, the parties desire to establish a Christ-centered, lifelong covenant of marriage founded upon unconditional love, mutual honor, fidelity, and spiritual unity; and
WHEREAS, the parties have faithfully engaged in and completed [Session Count] of premarital counseling and spiritual preparation;

NOW, THEREFORE, in solemn witness whereof, the parties covenant and agree as follows:

1. COMPLETION OF PREMARITAL COUNSELING
The counselor hereby certifies that [Bride Name] and [Groom Name] have successfully completed all prescribed courses, dialogue modules, and developmental assessments in premarital education, demonstrating sound readiness for holy matrimony.

2. SACRED COVENANT AND MUTUAL FIDELITY
The parties covenant to hold their marriage in sacred regard as a permanent, lifelong bond. Both individuals pledge absolute emotional, physical, and spiritual fidelity to each other, forsaking all others.

3. COMMUNICATION & CONFLICT RESOLUTION
The couples commit to resolving all disputes through open, honest dialogue, patience, and forgiveness. In the event of unresolved marital strain, both parties agree to seek pastoral guidance and marital counseling before taking any unilateral steps toward separation.

4. FINANCIAL STEWARDSHIP & TRANSPARENCY
The parties agree to practice total transparency in all marital finances, debts, assets, and budgeting, treating all resources as mutual blessings to be stewarded in unity.

5. SPIRITUAL FOUNDATION & FAMILY LIFE
The parties pledge to nurture prayer, spiritual growth, and an environment of peace, warmth, and grace within their household.

IN WITNESS WHEREOF, the parties hereto have executed this Covenant Agreement on the day and year first written above.

__________________________________________
[Bride Name], Bride / Spouse 1

__________________________________________
[Groom Name], Groom / Spouse 2

__________________________________________
[Counselor Name], Pastoral Counselor & Officiant
[Church Name]`
  },
  {
    id: 'officiant-service-contract',
    name: 'Wedding Officiant & Ceremony Service Agreement',
    badge: 'Officiant & Ministry',
    description: 'Formal agreement between wedding officiant and couple detailing ceremony schedule, rehearsals, and honorarium.',
    title: 'WEDDING CEREMONY OFFICIANT & MINISTRY AGREEMENT',
    content: `WEDDING CEREMONY OFFICIANT & MINISTRY AGREEMENT

THIS AGREEMENT is entered into on [Agreement Date], between the Wedding Couple, [Bride Name] and [Groom Name] ("The Couple"), and [Counselor Name] ("The Officiant"), representing [Church Name].

1. DATE, TIME, AND VENUE
The wedding ceremony shall take place on [Agreement Date] at [Location]. The rehearsal is scheduled for the day prior at the agreed hour.

2. COUNSELING REQUIREMENT
The Couple agrees to attend [Session Count] prior to the ceremony to review vows, readings, and marital principles.

3. CEREMONY CUSTOMIZATION
The Officiant shall prepare a customized ceremony script reflecting the Couple's beliefs and personal vows, provided to the Couple for review at least two weeks prior to the date.

4. HONORARIUM & FEES
The agreed honorarium for pastoral preparation and officiating services is [Honorarium Fee], payable on or before the ceremony date.

5. MARRIAGE LICENSE EXECUTION
The Couple is responsible for obtaining a valid marriage license from the appropriate civil authority. The Officiant will execute and return the legal license following the ceremony.

EXECUTED by the parties on [Agreement Date]:

__________________________________________
[Bride Name], Bride

__________________________________________
[Groom Name], Groom

__________________________________________
[Counselor Name], Officiant`
  },
  {
    id: 'couples-vows-accord',
    name: 'Couples Mutual Vows & Covenant Accord',
    badge: 'Ceremony Keepsake',
    description: 'Personal vows and mutual covenants to frame and preserve as a sacred reminder.',
    title: 'SOLEMN COVENANT OF LIFELONG COMMITMENT',
    content: `SOLEMN COVENANT OF LIFELONG COMMITMENT

"Therefore what God has joined together, let no one separate."

ON THIS DAY, [Agreement Date], in the presence of God, family, and beloved witnesses at [Location], we, [Bride Name] and [Groom Name], enter into holy covenant.

I. OUR SACRED PROMISES
1. To love unconditionally through all seasons of joy, hardship, abundance, and trial.
2. To speak with kindness, listen with empathy, and forgive with generosity.
3. To encourage each other's dreams, faith, and personal calling.
4. To maintain fidelity, trust, and unyielding loyalty.

II. WITNESS & BENEDICTION
Having completed our premarital counseling sessions with [Counselor Name], we dedicate our union to be a source of light, hospitality, and enduring grace.

SEALED AND ATTESTED:

__________________________________________
[Bride Name]

__________________________________________
[Groom Name]

CONFIRMED BY COUNSELOR / OFFICIANT:

__________________________________________
[Counselor Name]`
  }
];

export const STANDARD_CLAUSES: StandardClause[] = [
  {
    id: 'clause-fidelity',
    title: 'Covenant of Fidelity & Exclusivity',
    category: 'fidelity',
    content: 'Both parties pledge unconditional emotional, spiritual, and physical fidelity to one another, keeping their marriage sacred and forsaking all others for the duration of their natural lives.'
  },
  {
    id: 'clause-counseling',
    title: 'Counseling & Continuous Growth',
    category: 'counseling',
    content: 'The parties agree to prioritize ongoing marital health and communication, committing to seek pastoral counseling or accredited couples therapy should relational distress arise.'
  },
  {
    id: 'clause-financial',
    title: 'Financial Unity & Transparency',
    category: 'financial',
    content: 'Both spouses pledge open disclosure of all financial accounts, assets, and liabilities, agreeing to consult one another on major expenditures and cultivate unified financial stewardship.'
  },
  {
    id: 'clause-resolution',
    title: 'Peaceful Conflict Resolution',
    category: 'resolution',
    content: 'The parties agree to resolve grievances with gentleness and forbearance, committing to never let unresolved anger persist overnight and to reject contempt or malice in marital communications.'
  },
  {
    id: 'clause-spiritual',
    title: 'Spiritual Heritage & Family Blessing',
    category: 'covenant',
    content: 'The parties pledge to build a home rooted in prayer, warmth, hospitality, and righteous love, passing down a legacy of blessing to future generations.'
  }
];
