/**
 * BAZAAR MARKETPLACE - PROHIBITED ITEMS POLICY & HEURISTICS
 * Multi-layer detection dictionary and pattern normalization
 */

export interface PolicyViolationCategory {
  id: string;
  name: string;
  description: string;
  riskLevel: 'critical' | 'high' | 'medium';
  keywords: string[];
  patterns: RegExp[];
}

export const PROHIBITED_CATEGORIES: PolicyViolationCategory[] = [
  {
    id: 'drugs-substances',
    name: 'Drugs & Illegal Substances',
    description: 'Narcotics, prescription drugs, cannabis, chemical highs, or drug paraphernalia.',
    riskLevel: 'critical',
    keywords: [
      'cocaine', 'coke', 'heroin', 'meth', 'methamphetamine', 'fentanyl', 'weed', 'cannabis', 
      'marijuana', 'ganja', 'charas', 'hashish', 'mdma', 'ecstasy', 'lsd', 'acid tabs', 
      'magic mushrooms', 'psilocybin', 'ketamine', 'oxycodone', 'xanax', 'tramadol', 
      'adderall', 'valium', 'morphine', 'codeine syrup', 'lean', 'vape cartridge thc'
    ],
    patterns: [
      /\b(w[e3]{2}d|m[a4]r[i1]ju[a4]n[a4]|g[a4]nj[a4]|ch[a4]r[a4]s)\b/i,
      /\b(c[o0]c[a4][i1]n[e3]|m[e3]th|f[e3]nt[a4]nyl)\b/i,
      /\b(x[a4]n[a4]x|tr[a4]m[a4]d[o0]l|[o0]xyc[o0]d[o0]n[e3])\b/i,
      /\b(high grade bud|buy weed|thc vape|kush)\b/i
    ]
  },
  {
    id: 'weapons-firearms',
    name: 'Weapons, Firearms & Ammunition',
    description: 'Guns, handguns, ammunition, silencers, tasers, switchblades, or combat weapons.',
    riskLevel: 'critical',
    keywords: [
      'firearm', 'pistol', 'revolver', 'shotgun', 'rifle', 'ak47', 'glock', 'ammunition', 
      'bullets', 'silencer', 'suppressor', 'grenade', 'knife switchblade', 'brass knuckles', 
      'taser gun', 'stun gun', 'semiautomatic', 'military rifle'
    ],
    patterns: [
      /\b(p[i1]st[o0]l|r[e3]v[o0]lv[e3]r|sh[o0]tg[u4]n|f[i1]r[e3][a4]rm|g[u4]n)\b/i,
      /\b(gl[o0]ck|b[u4]ll[e3]ts|[a4]mm[u4]n[i1]t[i1][o0]n)\b/i,
      /\b(br[a4]ss kn[u4]ckl[e3]s|sw[i1]tchbl[a4]d[e3])\b/i
    ]
  },
  {
    id: 'explosives-fireworks',
    name: 'Explosives & Pyrotechnics',
    description: 'Fireworks, dynamite, gunpowder, blasting caps, or detonators.',
    riskLevel: 'critical',
    keywords: [
      'dynamite', 'c4 explosive', 'gunpowder', 'blasting cap', 'detonator', 'bomb', 
      'pipe bomb', 'illegal fireworks', 'military explosive'
    ],
    patterns: [
      /\b(dyn[a4]m[i1]t[e3]|g[u4]np[o0]wd[e3]r|d[e3]t[o0]n[a4]t[o0]r|b[o0]mb)\b/i
    ]
  },
  {
    id: 'adult-services',
    name: 'Adult & Sexually Explicit Content',
    description: 'Pornographic media, sex toys, sexual services, escorts, or sexually explicit listings.',
    riskLevel: 'critical',
    keywords: [
      'porn', 'pornography', 'xxx', 'sex service', 'escort', 'call girl', 'sexual massage', 
      'erotic massage', 'prostitution', 'adult toy', 'dildo', 'fleshlight', 'sex tape', 
      'explicit nudes', 'onlyfans content', 'sugar baby', 'happy ending'
    ],
    patterns: [
      /\b(p[o0]rn|p[o0]rn[o0]|xxx|s[e3]x\s*s[e3]rv[i1]c[e3])\b/i,
      /\b([e3]sc[o0]rt|c[a4]ll\s*g[i1]rl|s[u4]g[a4]r\s*d[a4]ddy)\b/i,
      /\b(n[u4]d[e3]s|n[u4]d[e3]\s*p[i1]cs)\b/i
    ]
  },
  {
    id: 'fraudulent-docs',
    name: 'Fraudulent Documents & Fake IDs',
    description: 'Forged passports, fake Aadhaar/PAN cards, counterfeit money, fake driving licenses.',
    riskLevel: 'critical',
    keywords: [
      'fake id', 'counterfeit money', 'fake currency', 'fake passport', 'fake aadhaar', 
      'forged pan card', 'fake degree', 'fake certificate', 'cloned debit card', 
      'cloned atm card', 'counterfeit notes', 'fake driving license'
    ],
    patterns: [
      /\b(f[a4]k[e3]\s*([i1]d|p[a4]ssp[o0]rt|c[u4]rr[e3]ncy|d[e3]gr[e3]{2}))\b/i,
      /\b(c[o0]unt[e3]rf[e3][i1]t\s*(m[o0]n[e3]y|n[o0]t[e3]s|b[i1]lls))\b/i,
      /\b(cl[o0]n[e3]d\s*(c[a4]rd|stf|d[u4]mps))\b/i
    ]
  },
  {
    id: 'hacking-malware',
    name: 'Hacking Tools & Malware',
    description: 'Ransomware, keyloggers, botnets, cracked accounts, spyware, or stolen database dumps.',
    riskLevel: 'high',
    keywords: [
      'keylogger', 'ransomware', 'trojan virus', 'malware tool', 'ddos booter', 'wifi jammer', 
      'spyware phone', 'cracked netflix account', 'credit card dumps', 'stolen database', 
      'hacked paypal', 'imei repair bypass'
    ],
    patterns: [
      /\b(k[e3]yl[o0]gg[e3]r|r[a4]ns[o0]mw[a4]r[e3]|m[a4]lw[a4]r[e3]|dd[o0]s)\b/i,
      /\b(h[a4]ck[e3]d\s*[a4]cc[o0]unts|st[o0]l[e3]n\s*d[a4]t[a4])\b/i
    ]
  },
  {
    id: 'stolen-goods',
    name: 'Stolen & Blacklisted Property',
    description: 'Stolen phones, bypassed iCloud locks, scraped serial numbers, or lost property.',
    riskLevel: 'high',
    keywords: [
      'stolen phone', 'stolen bike', 'icloud bypass locked', 'blacklisted imei', 
      'serial number removed', 'scraped chasis', 'stolen laptop'
    ],
    patterns: [
      /\b(st[o0]l[e3]n\s*(ph[o0]n[e3]|b[i1]k[e3]|c[a4]r|g[o0][o0]ds))\b/i,
      /\b([i1]cl[o0]ud\s*byp[a4]ss|[i1]m[e3][i1]\s*bl[a4]ckl[i1]st)\b/i
    ]
  },
  {
    id: 'dangerous-chemicals',
    name: 'Hazardous Chemicals & Toxic Substances',
    description: 'Cyanide, mercury, toxic waste, radioactive elements, biological cultures.',
    riskLevel: 'critical',
    keywords: [
      'cyanide', 'mercury liquid', 'ricin', 'radioactive', 'uranium', 'toxic poison', 
      'hazardous waste', 'biological culture', 'chlorine gas cylinder'
    ],
    patterns: [
      /\b(cy[a4]n[i1]d[e3]|m[e3]rc[u4]ry\s*l[i1]qu[i1]d|p[o0][i1]s[o0]n)\b/i
    ]
  },
  {
    id: 'wire-scam-fraud',
    name: 'Scams & Suspicious Payment Requests',
    description: 'Wire transfer in advance, UPI advance payment, gift card trades, or suspicious schemes.',
    riskLevel: 'high',
    keywords: [
      'western union only', 'pay advance via upi', 'gift cards only', 'amazon gift card payment', 
      'send otp to confirm', 'advance token money mandatory', 'double your money investment'
    ],
    patterns: [
      /\b(w[e3]st[e3]rn\s*un[i1][o0]n|p[a4]y\s*[a4]dv[a4]nc[e3]\s*up[i1])\b/i,
      /\b(s[e3]nd\s*[o0]tp|g[i1]ft\s*c[a4]rd\s*p[a4]ym[e3]nt)\b/i
    ]
  }
];

/**
 * Text normalizer that strips common obfuscations:
 * e.g. "w-3-3-d", "C.O.C.A.I.N.E", "f@ke !d", "g u n"
 */
export function normalizeText(input: string): string {
  if (!input) return '';

  let text = input.toLowerCase();

  // Leetspeak translation table
  const leetMap: { [key: string]: string } = {
    '0': 'o',
    '1': 'i',
    '3': 'e',
    '4': 'a',
    '@': 'a',
    '$': 's',
    '5': 's',
    '7': 't',
    '8': 'b',
    '!': 'i',
    '+': 't',
    '(': 'c',
  };

  // Replace leet characters
  text = text.replace(/[0134@$578!+()]/g, (char) => leetMap[char] || char);

  // Normalize repeated spaces or hyphens used to break up words (e.g., "g - u - n")
  // Create a version without spaces/punctuation for detecting spaced-out words
  return text;
}

export function detectObfuscatedPhrases(text: string): string[] {
  // Collapse whitespace and punctuation: "c-o-k-e" -> "coke"
  const collapsed = text.toLowerCase().replace(/[\s\-_.,/\\*#@!]+/g, '');
  const matches: string[] = [];

  const highRiskTokens = [
    'cocaine', 'heroin', 'fentanyl', 'ganja', 'charas', 'marijuana', 
    'firearm', 'pistol', 'shotgun', 'silencer', 'dynamite', 'fakeid', 
    'counterfeit', 'keylogger', 'ransomware', 'escortservice', 'cyanide'
  ];

  for (const token of highRiskTokens) {
    if (collapsed.includes(token)) {
      matches.push(token);
    }
  }

  return matches;
}
