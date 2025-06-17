import asyncio
import didkit
import json

jwk = didkit.generate_ed25519_key()
did = didkit.key_to_did("key", jwk)
print("\nDID: ", did)

credential = {
    "@context": "https://www.w3.org/2018/credentials/v1",
    "id": "http://example.org/credentials/3731",
    "type": ["VerifiableCredential"],
    "issuer": did,
    "issuanceDate": "2020-08-19T21:41:50Z",
    "credentialSubject": {
        "id": "did:example:d23dd687a7dc6787646f2eb98d0",
    },
}
print("\nCredential Payload:")
print(json.dumps(credential, indent=2))

async def main():
    signed_credential = await didkit.issue_credential(
        json.dumps(credential),
        json.dumps({}),  
        jwk
    )
    print("\n✅ [RESULT] Signed Verifiable Credential:")
    print(json.dumps(json.loads(signed_credential), indent=2))

    verification_result = await didkit.verify_credential(
       signed_credential,
       json.dumps({})
    )
    print("\n✅ [RESULT] Verification Result:")
    print(json.dumps(json.loads(verification_result), indent=2))
    
    result = json.loads(verification_result)
    if result.get("errors"):
        print("\n❌ Verification FAILED!")
        for error in result["errors"]:
            print(f"Error: {error}")
    else:
        print("\n✅ Verification SUCCESSFUL!")

asyncio.run(main())
