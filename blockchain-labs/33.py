import asyncio
import didkit
import json

async def main():
    print("[1] Generating issuer JWK and DID...")
    jwk = didkit.generate_ed25519_key()
    did = didkit.key_to_did("key", jwk)
    print(f"Issuer DID: {did}\n")

    print("[2] Creating a Verifiable Credential...")
    credential = {
        "@context": [
            "https://www.w3.org/2018/credentials/v1",
            "https://schema.org/"
        ],
        "id": "http://example.org/credentials/3731",
        "type": ["VerifiableCredential"],
        "issuer": did,
        "issuanceDate": "2020-08-19T21:41:50Z",
        "credentialSubject": {
            "id": "did:example:d23dd687a7dc6787646f2eb98d0",
            "name": "Niranjhan",
            "jobTitle": "Faculty"
        },
    }

    print("[3] Issuing (signing) the credential...")
    signed_credential = await didkit.issue_credential(
        json.dumps(credential),
        json.dumps({}),
        jwk
    )
    print("✅ Credential successfully signed!\n")


    print("\n[4] Verifying the signed credential...")
    verification_result = await didkit.verify_credential(
        signed_credential,
        json.dumps({})
    )

    result_dict = json.loads(verification_result)

    if not result_dict.get("errors"):
        print("\n✅ Credential verification successful!")
    else:
        print("\n❌ Credential verification failed. Errors:")
        for error in result_dict.get("errors", []):
            print(f"- {error}")

asyncio.run(main())
