"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { VCCreator, type VerifiableCredential } from "@/lib/vc-creator"
import { Copy, CheckCircle, XCircle, Wand2, BookOpen } from "lucide-react"

interface VCCreatorToolProps {
  trustedIssuers: string[]
}

export function VCCreatorTool({ trustedIssuers }: VCCreatorToolProps) {
  const [credentialType, setCredentialType] = useState("identity")
  const [issuerDID, setIssuerDID] = useState("")
  const [subjectDID, setSubjectDID] = useState("")
  const [claims, setClaims] = useState<Record<string, string>>({})
  const [createdVC, setCreatedVC] = useState<VerifiableCredential | null>(null)
  const [validationResult, setValidationResult] = useState<{ isValid: boolean; errors: string[] } | null>(null)
  const [showSample, setShowSample] = useState(false)

  // Dynamic claim fields based on credential type
  const getClaimFields = (type: string) => {
    switch (type) {
      case "employment":
        return [
          { key: "name", label: "Full Name", required: true },
          { key: "jobTitle", label: "Job Title", required: true },
          { key: "company", label: "Company", required: true },
          { key: "startDate", label: "Start Date", required: false },
          { key: "department", label: "Department", required: false },
          { key: "salary", label: "Salary", required: false },
        ]
      case "education":
        return [
          { key: "name", label: "Full Name", required: true },
          { key: "degree", label: "Degree", required: true },
          { key: "institution", label: "Institution", required: true },
          { key: "graduationDate", label: "Graduation Date", required: false },
          { key: "major", label: "Major", required: false },
          { key: "gpa", label: "GPA", required: false },
        ]
      case "identity":
      default:
        return [
          { key: "name", label: "Full Name", required: true },
          { key: "dateOfBirth", label: "Date of Birth", required: false },
          { key: "nationality", label: "Nationality", required: false },
          { key: "address", label: "Address", required: false },
        ]
    }
  }

  const handleClaimChange = (key: string, value: string) => {
    setClaims((prev) => ({ ...prev, [key]: value }))
  }

  const createVC = () => {
    try {
      const vc = VCCreator.createVC({
        issuerDID,
        subjectDID,
        credentialType,
        claims,
      })

      setCreatedVC(vc)

      // Validate the created VC
      const validation = VCCreator.validateVC(vc)
      setValidationResult(validation)
    } catch (error) {
      setValidationResult({
        isValid: false,
        errors: [error instanceof Error ? error.message : "Unknown error occurred"],
      })
      setCreatedVC(null)
    }
  }

  const generateSample = () => {
    const sample = VCCreator.generateSampleVC(credentialType)
    setCreatedVC(sample)
    setValidationResult(VCCreator.validateVC(sample))
    setShowSample(true)

    // Fill form with sample data
    setIssuerDID(sample.issuer)
    setSubjectDID(sample.credentialSubject.id)

    const sampleClaims: Record<string, string> = {}
    Object.keys(sample.credentialSubject).forEach((key) => {
      if (key !== "id") {
        sampleClaims[key] = String(sample.credentialSubject[key])
      }
    })
    setClaims(sampleClaims)
  }

  const copyToClipboard = () => {
    if (createdVC) {
      navigator.clipboard.writeText(JSON.stringify(createdVC, null, 2))
    }
  }

  const resetForm = () => {
    setIssuerDID("")
    setSubjectDID("")
    setClaims({})
    setCreatedVC(null)
    setValidationResult(null)
    setShowSample(false)
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wand2 className="h-5 w-5" />
          Verifiable Credential Creator
        </CardTitle>
        <CardDescription>Create properly formatted Verifiable Credentials for learning and testing</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Controls */}
        <div className="flex gap-2">
          <Button onClick={generateSample} variant="outline" size="sm">
            <BookOpen className="h-4 w-4 mr-2" />
            Generate Sample
          </Button>
          <Button onClick={resetForm} variant="outline" size="sm">
            Reset Form
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Input Form */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="credential-type">Credential Type</Label>
              <Select value={credentialType} onValueChange={setCredentialType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {VCCreator.getCredentialTypes().map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="issuer-did">Issuer DID</Label>
              <Select value={issuerDID} onValueChange={setIssuerDID}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a trusted issuer" />
                </SelectTrigger>
                <SelectContent>
                  {trustedIssuers.map((did, index) => (
                    <SelectItem key={index} value={did}>
                      <span className="font-mono text-xs">{did.slice(0, 30)}...</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="mt-1">
                <Input
                  placeholder="Or enter custom DID"
                  value={issuerDID}
                  onChange={(e) => setIssuerDID(e.target.value)}
                  className="text-xs font-mono"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="subject-did">Subject DID</Label>
              <Input
                id="subject-did"
                placeholder="did:key:z6Mk..."
                value={subjectDID}
                onChange={(e) => setSubjectDID(e.target.value)}
                className="font-mono text-xs"
              />
            </div>

            <Separator />

            <div>
              <Label className="text-sm font-semibold">Credential Claims</Label>
              <div className="space-y-3 mt-2">
                {getClaimFields(credentialType).map((field) => (
                  <div key={field.key}>
                    <Label htmlFor={field.key} className="text-xs">
                      {field.label}
                      {field.required && <span className="text-red-500 ml-1">*</span>}
                    </Label>
                    <Input
                      id={field.key}
                      value={claims[field.key] || ""}
                      onChange={(e) => handleClaimChange(field.key, e.target.value)}
                      placeholder={`Enter ${field.label.toLowerCase()}`}
                    />
                  </div>
                ))}
              </div>
            </div>

            <Button onClick={createVC} className="w-full">
              Create Verifiable Credential
            </Button>
          </div>

          {/* Output */}
          <div className="space-y-4">
            {validationResult && (
              <div
                className={`p-3 rounded border ${validationResult.isValid ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}`}
              >
                <div className="flex items-center gap-2 mb-2">
                  {validationResult.isValid ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-600" />
                  )}
                  <span className="text-sm font-medium">
                    {validationResult.isValid ? "Valid VC Structure" : "Invalid VC Structure"}
                  </span>
                </div>
                {!validationResult.isValid && (
                  <ul className="text-xs text-red-600 space-y-1">
                    {validationResult.errors.map((error, index) => (
                      <li key={index}>• {error}</li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            {createdVC && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-sm font-semibold">Generated Verifiable Credential</Label>
                  <Button onClick={copyToClipboard} size="sm" variant="outline">
                    <Copy className="h-4 w-4 mr-2" />
                    Copy
                  </Button>
                </div>
                <Textarea value={JSON.stringify(createdVC, null, 2)} readOnly className="font-mono text-xs h-80" />
              </div>
            )}

            {showSample && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded">
                <div className="flex items-center gap-2 mb-2">
                  <BookOpen className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-800">Sample Generated</span>
                </div>
                <p className="text-xs text-blue-600">
                  This is a sample {credentialType} credential. You can modify the fields above and regenerate.
                </p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
