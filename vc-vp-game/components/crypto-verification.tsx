"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { VigenereCipher } from "@/lib/vigenere-cipher"
import { Key, Hash, Eye, EyeOff } from "lucide-react"

interface CryptoVerificationProps {
  vcData: any
  vpData: any
  vcSignature: string
  vpSignature: string
  onVerificationComplete: (results: {
    cryptoCorrect: boolean
    subjectHolderMatch: boolean
    trustedIssuer: boolean
  }) => void
  trustedIssuers: string[]
}

export function CryptoVerification({
  vcData,
  vpData,
  vcSignature,
  vpSignature,
  onVerificationComplete,
  trustedIssuers,
}: CryptoVerificationProps) {
  const [didKey, setDidKey] = useState("")
  const [decodedVCSignature, setDecodedVCSignature] = useState("")
  const [decodedVPSignature, setDecodedVPSignature] = useState("")
  const [vcHash, setVCHash] = useState("")
  const [vpHash, setVPHash] = useState("")
  const [showSignatures, setShowSignatures] = useState(false)

  const [verificationChoices, setVerificationChoices] = useState({
    cryptoCorrect: null as boolean | null,
    subjectHolderMatch: null as boolean | null,
    trustedIssuer: null as boolean | null,
  })

  const decodeSignatures = () => {
    if (!didKey) return

    const keyForCipher = didKey.replace("did:key:", "").slice(0, 10) // Use first 10 chars as key
    const decodedVC = VigenereCipher.decode(vcSignature, keyForCipher)
    const decodedVP = VigenereCipher.decode(vpSignature, keyForCipher)

    setDecodedVCSignature(decodedVC)
    setDecodedVPSignature(decodedVP)
  }

  const generateHashes = () => {
    const vcHashValue = VigenereCipher.generateHash(vcData)
    const vpHashValue = VigenereCipher.generateHash(vpData)

    setVCHash(vcHashValue)
    setVPHash(vpHashValue)
  }

  const handleVerificationChoice = (type: keyof typeof verificationChoices, value: boolean) => {
    setVerificationChoices((prev) => ({ ...prev, [type]: value }))
  }

  const submitVerification = () => {
    if (
      verificationChoices.cryptoCorrect !== null &&
      verificationChoices.subjectHolderMatch !== null &&
      verificationChoices.trustedIssuer !== null
    ) {
      onVerificationComplete(verificationChoices as any)
    }
  }

  const allChoicesMade = Object.values(verificationChoices).every((choice) => choice !== null)

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Key className="h-5 w-5" />
          Cryptographic Verification Challenge
        </CardTitle>
        <CardDescription>Decode signatures and verify the Verifiable Presentation</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Step 1: Signature Decoding */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Step 1: Decode Signatures</h3>
            <Button variant="outline" size="sm" onClick={() => setShowSignatures(!showSignatures)}>
              {showSignatures ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              {showSignatures ? "Hide" : "Show"} Signatures
            </Button>
          </div>

          {showSignatures && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium">Encoded VC Signature:</Label>
                <Textarea value={vcSignature} readOnly className="font-mono text-xs h-20 bg-red-50" />
              </div>
              <div>
                <Label className="text-sm font-medium">Encoded VP Signature:</Label>
                <Textarea value={vpSignature} readOnly className="font-mono text-xs h-20 bg-blue-50" />
              </div>
            </div>
          )}

          <div className="flex gap-2">
            <div className="flex-1">
              <Label htmlFor="did-key">Enter DID Key for Decoding:</Label>
              <Input
                id="did-key"
                value={didKey}
                onChange={(e) => setDidKey(e.target.value)}
                placeholder="did:key:z6Mk..."
                className="font-mono text-xs"
              />
            </div>
            <Button onClick={decodeSignatures} disabled={!didKey} className="mt-6">
              Decode Signatures
            </Button>
          </div>

          {(decodedVCSignature || decodedVPSignature) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium">Decoded VC Signature:</Label>
                <Textarea value={decodedVCSignature} readOnly className="font-mono text-xs h-20 bg-green-50" />
              </div>
              <div>
                <Label className="text-sm font-medium">Decoded VP Signature:</Label>
                <Textarea value={decodedVPSignature} readOnly className="font-mono text-xs h-20 bg-green-50" />
              </div>
            </div>
          )}
        </div>

        <Separator />

        {/* Step 2: Hash Generation */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Step 2: Generate Data Hashes</h3>
            <Button onClick={generateHashes} variant="outline">
              <Hash className="h-4 w-4 mr-2" />
              Generate Hashes
            </Button>
          </div>

          {(vcHash || vpHash) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium">VC Data Hash:</Label>
                <Input value={vcHash} readOnly className="font-mono text-sm bg-yellow-50" />
              </div>
              <div>
                <Label className="text-sm font-medium">VP Data Hash:</Label>
                <Input value={vpHash} readOnly className="font-mono text-sm bg-yellow-50" />
              </div>
            </div>
          )}
        </div>

        <Separator />

        {/* Step 3: Manual Verification */}
        <div className="space-y-6">
          <h3 className="text-lg font-semibold">Step 3: Make Your Verification Decisions</h3>

          {/* Cryptographic Verification */}
          <div className="p-4 border rounded-lg">
            <Label className="text-sm font-medium mb-3 block">
              1. Cryptographic Verification: Do the decoded signatures match the generated hashes?
            </Label>
            <div className="flex gap-2">
              <Button
                variant={verificationChoices.cryptoCorrect === true ? "default" : "outline"}
                size="sm"
                onClick={() => handleVerificationChoice("cryptoCorrect", true)}
              >
                Signatures Valid ✓
              </Button>
              <Button
                variant={verificationChoices.cryptoCorrect === false ? "default" : "outline"}
                size="sm"
                onClick={() => handleVerificationChoice("cryptoCorrect", false)}
              >
                Signatures Invalid ✗
              </Button>
            </div>
          </div>

          {/* Subject-Holder Match */}
          <div className="p-4 border rounded-lg">
            <Label className="text-sm font-medium mb-3 block">
              2. Subject-Holder Match: Does the VP holder match the VC subject?
            </Label>
            <div className="space-y-2 mb-3">
              <div>
                <Label className="text-xs text-gray-500">VP Holder:</Label>
                <div className="font-mono text-xs bg-yellow-50 p-2 rounded border">{vpData.holder}</div>
              </div>
              <div>
                <Label className="text-xs text-gray-500">VC Subject:</Label>
                <div className="font-mono text-xs bg-yellow-50 p-2 rounded border">{vcData.credentialSubject.id}</div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant={verificationChoices.subjectHolderMatch === true ? "default" : "outline"}
                size="sm"
                onClick={() => handleVerificationChoice("subjectHolderMatch", true)}
              >
                Match ✓
              </Button>
              <Button
                variant={verificationChoices.subjectHolderMatch === false ? "default" : "outline"}
                size="sm"
                onClick={() => handleVerificationChoice("subjectHolderMatch", false)}
              >
                No Match ✗
              </Button>
            </div>
          </div>

          {/* Trusted Issuer */}
          <div className="p-4 border rounded-lg">
            <Label className="text-sm font-medium mb-3 block">
              3. Trusted Issuer: Is the VC issuer in the trusted registry?
            </Label>
            <div className="mb-3">
              <Label className="text-xs text-gray-500">VC Issuer:</Label>
              <div className="font-mono text-xs bg-yellow-50 p-2 rounded border">{vcData.issuer}</div>
            </div>
            <div className="flex gap-2">
              <Button
                variant={verificationChoices.trustedIssuer === true ? "default" : "outline"}
                size="sm"
                onClick={() => handleVerificationChoice("trustedIssuer", true)}
              >
                Trusted ✓
              </Button>
              <Button
                variant={verificationChoices.trustedIssuer === false ? "default" : "outline"}
                size="sm"
                onClick={() => handleVerificationChoice("trustedIssuer", false)}
              >
                Not Trusted ✗
              </Button>
            </div>
          </div>
        </div>

        <Button onClick={submitVerification} disabled={!allChoicesMade} className="w-full" size="lg">
          Submit Verification Results
        </Button>
      </CardContent>
    </Card>
  )
}
