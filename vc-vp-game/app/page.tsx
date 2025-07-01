"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { CheckCircle, XCircle, Trophy, User, Shield, Key, Info } from "lucide-react"
import { VCCreatorTool } from "@/components/vc-creator-tool"
import { CryptoVerification } from "@/components/crypto-verification"
import { DUMMY_DATA, CREDENTIAL_TYPES, getRandomItem, generateRandomDate } from "@/lib/dummy-data"
import { VigenereCipher } from "@/lib/vigenere-cipher"
import { VCCreator } from "@/lib/vc-creator"

// Trusted issuers list (global)
const TRUSTED_ISSUERS = [
  "did:key:z6MkhaXgBZDvotDkL5257faiztiGiC2QtKLGpbnnEGta2doK",
  "did:key:z6MkiTBz1ymuepAQ4HEHYSF1H8quG5GLVVQR3djdX3mDooWp",
  "did:key:z6MkjchhfUsD6mmvni8mCdXHw216Xrm9bQe2mBH1P5RDjVJG",
]

interface Challenge {
  id: string
  type: "creation" | "verification"
  data: any
  solution?: any
  credentialType?: string
}

interface GameState {
  score: number
  currentChallenge: Challenge | null
  challengeHistory: Array<{ challenge: Challenge; correct: boolean; points: number }>
}

export default function VCGame() {
  const [gameState, setGameState] = useState<GameState>({
    score: 0,
    currentChallenge: null,
    challengeHistory: [],
  })

  const [userInput, setUserInput] = useState("")
  const [showSolution, setShowSolution] = useState(false)
  const [verificationResults, setVerificationResults] = useState<{
    cryptoCorrect: boolean
    subjectHolderMatch: boolean
    trustedIssuer: boolean
  } | null>(null)

  // Generate random DID
  const generateDID = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
    let result = "did:key:z6Mk"
    for (let i = 0; i < 40; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return result
  }

  // Generate creation challenge with specific credential type
  const generateCreationChallenge = (): Challenge => {
    const holderDID = generateDID()
    const issuerDID = TRUSTED_ISSUERS[Math.floor(Math.random() * TRUSTED_ISSUERS.length)]

    // Randomly select credential type
    const credentialTypeKeys = Object.keys(CREDENTIAL_TYPES) as Array<keyof typeof CREDENTIAL_TYPES>
    const selectedType = getRandomItem(credentialTypeKeys)
    const credentialInfo = CREDENTIAL_TYPES[selectedType]

    let challengeData: any = {
      holderDID,
      issuerDID,
      name: getRandomItem(DUMMY_DATA.names),
    }

    // Generate data based on credential type
    switch (selectedType) {
      case "employment":
        challengeData = {
          ...challengeData,
          jobTitle: getRandomItem(DUMMY_DATA.jobTitles),
          company: getRandomItem(DUMMY_DATA.companies),
          department: getRandomItem(DUMMY_DATA.departments),
          startDate: generateRandomDate(2020, 2024),
          salary: getRandomItem(DUMMY_DATA.salaries),
        }
        break

      case "education":
        challengeData = {
          ...challengeData,
          degree: getRandomItem(DUMMY_DATA.degrees),
          institution: getRandomItem(DUMMY_DATA.institutions),
          graduationDate: generateRandomDate(2015, 2024),
          major: getRandomItem(DUMMY_DATA.majors),
          gpa: getRandomItem(DUMMY_DATA.gpas),
        }
        break

      case "identity":
        challengeData = {
          ...challengeData,
          dateOfBirth: generateRandomDate(1970, 2000),
          nationality: getRandomItem(DUMMY_DATA.nationalities),
          address: getRandomItem(DUMMY_DATA.addresses),
          idNumber: getRandomItem(DUMMY_DATA.idNumbers),
          issueDate: generateRandomDate(2020, 2024),
        }
        break

      case "license":
        challengeData = {
          ...challengeData,
          licenseType: getRandomItem(DUMMY_DATA.licenseTypes),
          licenseNumber: getRandomItem(DUMMY_DATA.licenseNumbers),
          issuingAuthority: getRandomItem(DUMMY_DATA.issuingAuthorities),
          issueDate: generateRandomDate(2020, 2024),
          expirationDate: generateRandomDate(2025, 2030),
        }
        break

      case "membership":
        challengeData = {
          ...challengeData,
          organizationName: getRandomItem(DUMMY_DATA.organizationNames),
          membershipType: getRandomItem(DUMMY_DATA.membershipTypes),
          membershipNumber: getRandomItem(DUMMY_DATA.membershipNumbers),
          joinDate: generateRandomDate(2018, 2024),
          membershipLevel: getRandomItem(DUMMY_DATA.membershipLevels),
        }
        break
    }

    // Only pass the fields that would be on the form (exclude holderDID, issuerDID)
    const claims = Object.fromEntries(
      Object.entries(challengeData).filter(([key]) => !["holderDID", "issuerDID"].includes(key))
    )

    // Use VCCreator.createVC to generate the solution
    const solution = VCCreator.createVC({
      issuerDID,
      subjectDID: holderDID,
      credentialType: selectedType,
      claims,
    })

    return {
      id: `creation-${Date.now()}`,
      type: "creation",
      data: challengeData,
      solution,
      credentialType: selectedType,
    }
  }

  // Generate verification challenge with crypto puzzle
  const generateVerificationChallenge = (): Challenge => {
    const holderDID = generateDID()
    const issuerDID =
      Math.random() > 0.3 ? TRUSTED_ISSUERS[Math.floor(Math.random() * TRUSTED_ISSUERS.length)] : generateDID()

    // Sometimes make subject different from holder for testing
    const subjectDID = Math.random() > 0.2 ? holderDID : generateDID()

    const vcData = {
      "@context": ["https://www.w3.org/2018/credentials/v1"],
      type: ["VerifiableCredential"],
      issuer: issuerDID,
      issuanceDate: new Date().toISOString(),
      credentialSubject: {
        id: subjectDID,
        name: getRandomItem(DUMMY_DATA.names),
        jobTitle: getRandomItem(DUMMY_DATA.jobTitles),
        company: getRandomItem(DUMMY_DATA.companies),
        dateOfBirth: generateRandomDate(1980, 2000),
      },
    }

    const vpData = {
      "@context": ["https://www.w3.org/2018/credentials/v1"],
      type: ["VerifiablePresentation"],
      holder: holderDID,
      verifiableCredential: [vcData],
    }

    // Generate signatures and encode them
    const vcHash = VigenereCipher.generateHash(vcData)
    const vpHash = VigenereCipher.generateHash(vpData)

    // Use issuerDID for VC signature, holderDID for VP signature
    const vcCipherKey = issuerDID.replace("did:key:", "").slice(0, 10)
    const vpCipherKey = holderDID.replace("did:key:", "").slice(0, 10)

    // Sometimes corrupt the signatures to make them invalid
    const vcSignatureValid = Math.random() > 0.2
    const vpSignatureValid = Math.random() > 0.2
    console.log(vcSignatureValid, vpSignatureValid);

    let vcSignatureToEncode = vcHash
    let vpSignatureToEncode = vpHash

    if (!vcSignatureValid) {
      // Corrupt a few characters
      const chars = vcHash.split("")
      for (let i = 0; i < 2; i++) {
        const randomIndex = Math.floor(Math.random() * chars.length)
        chars[randomIndex] = Math.random() > 0.5 ? "X" : "Y"
      }
      vcSignatureToEncode = chars.join("")
    }

    if (!vpSignatureValid) {
      // Corrupt a few characters
      const chars = vpHash.split("")
      for (let i = 0; i < 2; i++) {
        const randomIndex = Math.floor(Math.random() * chars.length)
        chars[randomIndex] = Math.random() > 0.5 ? "Z" : "W"
      }
      vpSignatureToEncode = chars.join("")
    }

    const encodedVCSignature = VigenereCipher.encode(vcSignatureToEncode, vcCipherKey)
    const encodedVPSignature = VigenereCipher.encode(vpSignatureToEncode, vpCipherKey)

    return {
      id: `verification-${Date.now()}`,
      type: "verification",
      data: {
        vcData,
        vpData,
        vcSignature: encodedVCSignature,
        vpSignature: encodedVPSignature,
      },
      solution: {
        cryptoValid: vcSignatureValid && vpSignatureValid,
        subjectHolderMatch: subjectDID === holderDID,
        trustedIssuer: TRUSTED_ISSUERS.includes(issuerDID),
        issuerDID,
        subjectDID,
        holderDID,
      },
    }
  }

  // Start new challenge
  const startNewChallenge = () => {
    const challengeType = Math.random() > 0.5 ? "creation" : "verification"
    const challenge = challengeType === "creation" ? generateCreationChallenge() : generateVerificationChallenge()

    setGameState((prev) => ({ ...prev, currentChallenge: challenge }))
    setUserInput("")
    setShowSolution(false)
    setVerificationResults(null)
  }

  // Submit creation answer
  const submitCreation = () => {
    if (!gameState.currentChallenge) return

    try {
      const userVC = JSON.parse(userInput)
      const challenge = gameState.currentChallenge
      const challengeData = challenge.data
      const credentialType = challenge.credentialType
      const issuerDID = challengeData.issuerDID
      const subjectDID = challengeData.holderDID
      const claims = Object.fromEntries(
        Object.entries(challengeData).filter(([key]) => !["holderDID", "issuerDID"].includes(key))
      )

      // Recreate the expected VC using the same logic as the challenge
      const expectedVC = VCCreator.createVC({
        issuerDID,
        subjectDID,
        credentialType,
        claims,
      })

      // Compare userVC and expectedVC (ignoring issuanceDate and proof fields)
      const stripFields = (vc: any) => {
        const { issuanceDate, proof, ...rest } = vc
        return {
          ...rest,
          credentialSubject: { ...vc.credentialSubject },
        }
      }
      const userVCStripped = stripFields(userVC)
      const expectedVCStripped = stripFields(expectedVC)
      // Remove issuanceDate and proof from credentialSubject if present
      delete userVCStripped.credentialSubject.issuanceDate
      delete userVCStripped.credentialSubject.proof
      delete expectedVCStripped.credentialSubject.issuanceDate
      delete expectedVCStripped.credentialSubject.proof

      const isCorrect = JSON.stringify(userVCStripped) === JSON.stringify(expectedVCStripped)

      const points = isCorrect ? 15 : 0
      setGameState((prev) => ({
        ...prev,
        score: prev.score + points,
        challengeHistory: [
          ...prev.challengeHistory,
          { challenge: gameState.currentChallenge!, correct: isCorrect, points },
        ],
      }))

      setShowSolution(true)
    } catch (error) {
      alert("Invalid JSON format")
    }
  }

  // Handle verification completion
  const handleVerificationComplete = (results: {
    cryptoCorrect: boolean
    subjectHolderMatch: boolean
    trustedIssuer: boolean
  }) => {
    if (!gameState.currentChallenge?.solution) return

    const solution = gameState.currentChallenge.solution
    let points = 0
    let correctCount = 0

    if (results.cryptoCorrect === solution.cryptoValid) {
      points += 5
      correctCount++
    }
    if (results.subjectHolderMatch === solution.subjectHolderMatch) {
      points += 3
      correctCount++
    }
    if (results.trustedIssuer === solution.trustedIssuer) {
      points += 4
      correctCount++
    }

    const allCorrect = correctCount === 3

    setGameState((prev) => ({
      ...prev,
      score: prev.score + points,
      challengeHistory: [
        ...prev.challengeHistory,
        { challenge: gameState.currentChallenge!, correct: allCorrect, points },
      ],
    }))

    setVerificationResults(results)
    setShowSolution(true)
  }

  // Initialize with first challenge
  useEffect(() => {
    startNewChallenge()
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold flex items-center justify-center gap-2">
              <Shield className="h-8 w-8 text-blue-600" />
              Verifiable Credentials Game
            </CardTitle>
            <CardDescription>Learn to create and verify Verifiable Credentials and Presentations</CardDescription>
            <div className="flex items-center justify-center gap-4 mt-4">
              <Badge variant="secondary" className="text-lg px-4 py-2">
                <Trophy className="h-4 w-4 mr-2" />
                Score: {gameState.score}
              </Badge>
            </div>
          </CardHeader>
        </Card>

        {/* Trusted Issuers */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Trusted Issuers Registry</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {TRUSTED_ISSUERS.map((did, index) => (
                <div key={index} className="font-mono text-sm bg-green-50 p-2 rounded border overflow-x-auto">
                  {did}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* VC Creator Tool */}
        <VCCreatorTool trustedIssuers={TRUSTED_ISSUERS} />

        {/* Current Challenge */}
        {gameState.currentChallenge && (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Challenge Card */}
            <div className="xl:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {gameState.currentChallenge.type === "creation" ? (
                      <>
                        <Key className="h-5 w-5" />
                        Creation Challenge
                      </>
                    ) : (
                      <>
                        <Shield className="h-5 w-5" />
                        Verification Challenge
                      </>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {gameState.currentChallenge.type === "creation" ? (
                    <div className="space-y-4">
                      {/* Credential Type Info */}
                      <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <Info className="h-4 w-4 text-blue-600" />
                          <Label className="text-sm font-semibold text-blue-800">Credential Type Required:</Label>
                        </div>
                        <p className="text-sm text-blue-700">
                          Create a{" "}
                          <strong>
                            {
                              CREDENTIAL_TYPES[
                                gameState.currentChallenge.credentialType as keyof typeof CREDENTIAL_TYPES
                              ]?.name
                            }
                          </strong>{" "}
                          with the following information:
                        </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label className="text-xs text-gray-500">Holder DID:</Label>
                          <div className="font-mono text-sm bg-gray-50 p-2 rounded border overflow-x-auto max-w-full">
                            {gameState.currentChallenge.data.holderDID}
                          </div>
                        </div>
                        <div>
                          <Label className="text-xs text-gray-500">Issuer DID:</Label>
                          <div className="font-mono text-sm bg-gray-50 p-2 rounded border overflow-x-auto max-w-full">
                            {gameState.currentChallenge.data.issuerDID}
                          </div>
                        </div>
                        {Object.entries(gameState.currentChallenge.data)
                          .filter(([key]) => !["holderDID", "issuerDID"].includes(key))
                          .map(([key, value]) => (
                            <div key={key}>
                              <Label className="text-xs text-gray-500 capitalize">
                                {key.replace(/([A-Z])/g, " $1").trim()}:
                              </Label>
                              <div className="text-sm bg-gray-50 p-2 rounded border">{String(value)}</div>
                            </div>
                          ))}
                      </div>

                      <div>
                        <Label htmlFor="vc-input">Your Verifiable Credential (JSON):</Label>
                        <Textarea
                          id="vc-input"
                          value={userInput}
                          onChange={(e) => setUserInput(e.target.value)}
                          placeholder={`Enter your ${CREDENTIAL_TYPES[gameState.currentChallenge.credentialType as keyof typeof CREDENTIAL_TYPES]?.name} JSON here...`}
                          className="font-mono text-sm h-60"
                        />
                      </div>

                      <Button onClick={submitCreation} className="w-full">
                        Submit{" "}
                        {
                          CREDENTIAL_TYPES[gameState.currentChallenge.credentialType as keyof typeof CREDENTIAL_TYPES]
                            ?.name
                        }
                      </Button>

                      {showSolution && (
                        <div className="mt-4 p-4 bg-blue-50 rounded border">
                          <Label className="text-sm font-semibold">Correct Solution:</Label>
                          <pre className="text-xs mt-2 bg-white p-2 rounded border overflow-auto max-h-60">
                            {JSON.stringify(gameState.currentChallenge.solution, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* Show the Verifiable Presentation and signatures as a combined object */}
                      {(() => {
                        const vpData = gameState.currentChallenge.data.vpData
                        const vcSignature = gameState.currentChallenge.data.vcSignature
                        const vpSignature = gameState.currentChallenge.data.vpSignature
                        // Deep clone vpData to avoid mutating original
                        const vpWithSignatures = JSON.parse(JSON.stringify(vpData))
                        if (vpWithSignatures.verifiableCredential && vpWithSignatures.verifiableCredential[0]) {
                          vpWithSignatures.verifiableCredential[0].vcSignature = vcSignature
                        }
                        vpWithSignatures.vpSignature = vpSignature
                        return (
                          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                              <Info className="h-4 w-4 text-blue-600" />
                              <Label className="text-sm font-semibold text-blue-800">Verifiable Presentation:</Label>
                            </div>
                            <pre className="text-xs bg-white p-2 rounded border overflow-auto max-h-60 mb-2">
                              {JSON.stringify(vpWithSignatures, null, 2)}
                            </pre>
                          </div>
                        )
                      })()}
                      {!verificationResults ? (
                        <CryptoVerification
                          vcData={gameState.currentChallenge.data.vcData}
                          vpData={gameState.currentChallenge.data.vpData}
                          vcSignature={gameState.currentChallenge.data.vcSignature}
                          vpSignature={gameState.currentChallenge.data.vpSignature}
                          onVerificationComplete={handleVerificationComplete}
                          trustedIssuers={TRUSTED_ISSUERS}
                        />
                      ) : (
                        <div className="space-y-4">
                          <h3 className="text-lg font-semibold">Verification Results</h3>

                          <div className="space-y-3">
                            <div className="flex items-center justify-between p-3 border rounded">
                              <span>Cryptographic Verification</span>
                              {verificationResults.cryptoCorrect ===
                              gameState.currentChallenge.solution?.cryptoValid ? (
                                <CheckCircle className="h-5 w-5 text-green-600" />
                              ) : (
                                <XCircle className="h-5 w-5 text-red-600" />
                              )}
                            </div>

                            <div className="flex items-center justify-between p-3 border rounded">
                              <span>Subject-Holder Match</span>
                              {verificationResults.subjectHolderMatch ===
                              gameState.currentChallenge.solution?.subjectHolderMatch ? (
                                <CheckCircle className="h-5 w-5 text-green-600" />
                              ) : (
                                <XCircle className="h-5 w-5 text-red-600" />
                              )}
                            </div>

                            <div className="flex items-center justify-between p-3 border rounded">
                              <span>Trusted Issuer</span>
                              {verificationResults.trustedIssuer ===
                              gameState.currentChallenge.solution?.trustedIssuer ? (
                                <CheckCircle className="h-5 w-5 text-green-600" />
                              ) : (
                                <XCircle className="h-5 w-5 text-red-600" />
                              )}
                            </div>
                          </div>

                          <div className="p-4 bg-blue-50 rounded border">
                            <Label className="text-sm font-semibold">Correct Answers:</Label>
                            <ul className="text-sm mt-2 space-y-1">
                              <li>• Crypto Valid: {gameState.currentChallenge.solution?.cryptoValid ? "Yes" : "No"}</li>
                              <li>
                                • Subject-Holder Match:{" "}
                                {gameState.currentChallenge.solution?.subjectHolderMatch ? "Yes" : "No"}
                              </li>
                              <li>
                                • Trusted Issuer: {gameState.currentChallenge.solution?.trustedIssuer ? "Yes" : "No"}
                              </li>
                            </ul>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Game Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Game Progress
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">{gameState.score}</div>
                  <div className="text-sm text-gray-500">Total Points</div>
                </div>

                <Separator />

                <div>
                  <Label className="text-sm font-semibold">Scoring:</Label>
                  <ul className="text-sm text-gray-600 mt-2 space-y-1">
                    <li>• Creation Challenge: 15 points</li>
                    <li>• Crypto Verification: 5 points</li>
                    <li>• Subject-Holder Check: 3 points</li>
                    <li>• Trusted Issuer Check: 4 points</li>
                  </ul>
                </div>

                <Separator />

                <div>
                  <Label className="text-sm font-semibold">Recent Challenges:</Label>
                  <div className="mt-2 space-y-1">
                    {gameState.challengeHistory.slice(-5).map((item, index) => (
                      <div key={index} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          {item.correct ? (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          ) : (
                            <XCircle className="h-4 w-4 text-red-600" />
                          )}
                          <span className="capitalize">{item.challenge.type}</span>
                        </div>
                        <span className="text-xs text-gray-500">+{item.points}pts</span>
                      </div>
                    ))}
                  </div>
                </div>

                <Button onClick={startNewChallenge} className="w-full bg-transparent" variant="outline">
                  New Challenge
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
