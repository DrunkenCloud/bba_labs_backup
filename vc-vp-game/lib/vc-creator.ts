// Verifiable Credential Creation Library

export interface CredentialSubject {
  id: string // DID of the subject
  [key: string]: any // Additional claims
}

export interface VerifiableCredential {
  "@context": string[]
  type: string[]
  issuer: string
  issuanceDate: string
  expirationDate?: string
  credentialSubject: CredentialSubject
  proof?: any // Simplified for educational purposes
}

export interface VCCreationParams {
  issuerDID: string
  subjectDID: string
  credentialType?: string
  claims: Record<string, any>
  expirationDate?: Date
}

export class VCCreator {
  private static readonly DEFAULT_CONTEXT = ["https://www.w3.org/2018/credentials/v1"]

  private static readonly CREDENTIAL_TYPES = {
    identity: "IdentityCredential",
    employment: "EmploymentCredential",
    education: "EducationCredential",
    license: "LicenseCredential",
    membership: "MembershipCredential",
  }

  /**
   * Create a Verifiable Credential
   */
  static createVC(params: VCCreationParams): VerifiableCredential {
    const { issuerDID, subjectDID, credentialType = "identity", claims, expirationDate } = params

    // Validate inputs
    this.validateInputs(params)

    const vc: VerifiableCredential = {
      "@context": [...this.DEFAULT_CONTEXT],
      type: ["VerifiableCredential"],
      issuer: issuerDID,
      issuanceDate: new Date().toISOString(),
      credentialSubject: {
        id: subjectDID,
        ...claims,
      },
    }

    // Add specific credential type
    if (credentialType && this.CREDENTIAL_TYPES[credentialType as keyof typeof this.CREDENTIAL_TYPES]) {
      vc.type.push(this.CREDENTIAL_TYPES[credentialType as keyof typeof this.CREDENTIAL_TYPES])
    }

    // Add expiration date if provided
    if (expirationDate) {
      vc.expirationDate = expirationDate.toISOString()
    }

    // Add context for specific credential types
    this.addSpecificContext(vc, credentialType)

    return vc
  }

  /**
   * Create an Employment Credential
   */
  static createEmploymentCredential(
    issuerDID: string,
    subjectDID: string,
    employmentData: {
      name: string
      jobTitle: string
      company: string
      startDate: string
      salary?: number
      department?: string
    },
  ): VerifiableCredential {
    return this.createVC({
      issuerDID,
      subjectDID,
      credentialType: "employment",
      claims: employmentData,
    })
  }

  /**
   * Create an Education Credential
   */
  static createEducationCredential(
    issuerDID: string,
    subjectDID: string,
    educationData: {
      name: string
      degree: string
      institution: string
      graduationDate: string
      gpa?: number
      major?: string
    },
  ): VerifiableCredential {
    return this.createVC({
      issuerDID,
      subjectDID,
      credentialType: "education",
      claims: educationData,
    })
  }

  /**
   * Create an Identity Credential
   */
  static createIdentityCredential(
    issuerDID: string,
    subjectDID: string,
    identityData: {
      name: string
      dateOfBirth?: string
      nationality?: string
      address?: string
    },
  ): VerifiableCredential {
    return this.createVC({
      issuerDID,
      subjectDID,
      credentialType: "identity",
      claims: identityData,
    })
  }

  /**
   * Validate VC creation parameters
   */
  private static validateInputs(params: VCCreationParams): void {
    const { issuerDID, subjectDID, claims } = params

    if (!issuerDID || !this.isValidDID(issuerDID)) {
      throw new Error("Invalid issuer DID")
    }

    if (!subjectDID || !this.isValidDID(subjectDID)) {
      throw new Error("Invalid subject DID")
    }

    if (!claims || Object.keys(claims).length === 0) {
      throw new Error("Claims cannot be empty")
    }

    // Validate required fields based on credential type
    if (params.credentialType === "employment") {
      const required = ["name", "jobTitle", "company"]
      for (const field of required) {
        if (!claims[field]) {
          throw new Error(`Missing required field for employment credential: ${field}`)
        }
      }
    }

    if (params.credentialType === "education") {
      const required = ["name", "degree", "institution"]
      for (const field of required) {
        if (!claims[field]) {
          throw new Error(`Missing required field for education credential: ${field}`)
        }
      }
    }
  }

  /**
   * Basic DID validation
   */
  private static isValidDID(did: string): boolean {
    return did.startsWith("did:") && did.length > 10
  }

  /**
   * Add specific context for credential types
   */
  private static addSpecificContext(vc: VerifiableCredential, credentialType?: string): void {
    switch (credentialType) {
      case "employment":
        vc["@context"].push("https://schema.org/")
        break
      case "education":
        vc["@context"].push("https://schema.org/")
        break
      default:
        break
    }
  }

  /**
   * Validate a created VC structure
   */
  static validateVC(vc: any): { isValid: boolean; errors: string[] } {
    const errors: string[] = []

    // Check required fields
    if (!vc["@context"] || !Array.isArray(vc["@context"])) {
      errors.push("Missing or invalid @context")
    }

    if (!vc.type || !Array.isArray(vc.type) || !vc.type.includes("VerifiableCredential")) {
      errors.push("Missing or invalid type field")
    }

    if (!vc.issuer || !this.isValidDID(vc.issuer)) {
      errors.push("Missing or invalid issuer")
    }

    if (!vc.issuanceDate) {
      errors.push("Missing issuanceDate")
    }

    if (!vc.credentialSubject || !vc.credentialSubject.id) {
      errors.push("Missing or invalid credentialSubject")
    }

    if (vc.credentialSubject?.id && !this.isValidDID(vc.credentialSubject.id)) {
      errors.push("Invalid subject DID")
    }

    return {
      isValid: errors.length === 0,
      errors,
    }
  }

  /**
   * Get available credential types
   */
  static getCredentialTypes(): Array<{ value: string; label: string }> {
    return [
      { value: "identity", label: "Identity Credential" },
      { value: "employment", label: "Employment Credential" },
      { value: "education", label: "Education Credential" },
      { value: "license", label: "License Credential" },
      { value: "membership", label: "Membership Credential" },
    ]
  }

  /**
   * Generate a sample VC for educational purposes
   */
  static generateSampleVC(type = "identity"): VerifiableCredential {
    const sampleDIDs = [
      "did:key:z6MkhaXgBZDvotDkL5257faiztiGiC2QtKLGpbnnEGta2doK",
      "did:key:z6MkiTBz1ymuepAQ4HEHYSF1H8quG5GLVVQR3djdX3mDooWp",
    ]

    const samples = {
      identity: {
        name: "Alice Johnson",
        dateOfBirth: "1990-05-15",
        nationality: "US",
      },
      employment: {
        name: "Bob Smith",
        jobTitle: "Software Engineer",
        company: "Tech Corp",
        startDate: "2023-01-15",
        department: "Engineering",
      },
      education: {
        name: "Carol Davis",
        degree: "Bachelor of Science",
        institution: "University of Technology",
        graduationDate: "2022-06-15",
        major: "Computer Science",
      },
    }

    return this.createVC({
      issuerDID: sampleDIDs[0],
      subjectDID: sampleDIDs[1],
      credentialType: type,
      claims: samples[type as keyof typeof samples] || samples.identity,
    })
  }
}
