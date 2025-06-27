
export interface CertificateAuthority {
  id: string;
  name: string;
  isRoot: boolean;
  parentCAId: string | null;
  level: number;
}

export interface Certificate {
  id: string;
  name: string;
  domain: string;
  issuingCAId: string;
  validFrom: Date;
  validTo: Date;
}

export interface Website {
  id: string;
  name: string;
  domain: string;
  trustedCAIds: string[];
}

export interface ValidationResult {
  isValid: boolean;
  validationPath: string[];
  rejectionReason?: string;
  trustedCAFound?: string;
}

export interface ValidationStep {
  caId: string;
  caName: string;
  action: 'checking' | 'trusted' | 'not_trusted' | 'following_chain';
  description: string;
}
