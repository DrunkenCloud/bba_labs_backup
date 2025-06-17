import asyncio
import didkit
import json

jwk_issuer = didkit.generate_ed25519_key()
jwk_alice = didkit.generate_ed25519_key()

did_issuer = didkit.key_to_did("key", jwk_issuer)
did_alice = didkit.key_to_did("key", jwk_alice)

print(f"\n[STEP 1] DIDs Generated:")
print(f"Issuer DID: {did_issuer}")
print(f"Alice  DID: {did_alice}")

credential = {
    "@context": ["https://www.w3.org/2018/credentials/v1", "https://schema.org/"],
    "type": ["VerifiableCredential"],
    "issuer": did_issuer,
    "issuanceDate": "2020-08-19T21:41:50Z",
    "credentialSubject": {
        "id": did_alice,
        "name": "Alice",
        "jobTitle": "Faculty"
    },
}

presentation = {
    "@context": ["https://www.w3.org/2018/credentials/v1"],
    "type": ["VerifiablePresentation"],
    "holder": did_alice,
    "verifiableCredential": [credential]
}

Trusted_DIDs = [did_issuer]

async def verify_presentation_with_ownership_check(presentation):
    print("\n[STEP 3] Issuing Verifiable Presentation...")
    signed_presentation = await didkit.issue_presentation(
        json.dumps(presentation),
        json.dumps({}),
        jwk_alice
    )
    print("✅ Presentation signed!")

    print("\n[STEP 4] Verifying signed presentation cryptographically...")
    verification_result = await didkit.verify_presentation(
        signed_presentation,
        json.dumps({})
    )
    
    crypto_result = json.loads(verification_result)
    crypto_valid = not crypto_result.get("errors")

    if not crypto_valid:
        print("❌ Cryptographic verification failed:")
        for error in crypto_result["errors"]:
            print(f"  - {error}")
        return False
    else:
        print("✅ Cryptographic verification PASSED!")

    print("\n[STEP 5] Performing semantic/ownership checks...")

    pres_data = json.loads(signed_presentation)
    vc = pres_data["verifiableCredential"][0]
    vc_issuer = vc["issuer"]
    vc_subject = vc["credentialSubject"]["id"]
    jobTitle = vc["credentialSubject"]["jobTitle"]
    presentation_holder = pres_data["holder"]

    if vc_issuer != did_issuer:
        print("❌ Issuer is not trusted!")
        return False
    else:
        print("✅ Issuer check PASSED!")

    if vc_subject != presentation_holder:
        print("❌ Credential subject and presentation holder mismatch!")
        return False
    else:
        print("✅ Ownership check PASSED!")

    if jobTitle != "Faculty":
        print("❌ Job title check failed! Expected 'Faculty'")
        return False
    else:
        print("✅ Job title check PASSED!")

    print("\n🎉 Verifiable Presentation is VALID and fully trusted.")
    return True

async def main():
    print("\n[STEP 2] Issuing Verifiable Credential...")
    signed_credential = await didkit.issue_credential(
        json.dumps(credential),
        json.dumps({}),
        jwk_issuer
    )
    print("✅ Credential signed!")

    presentation["verifiableCredential"] = [json.loads(signed_credential)]
    await verify_presentation_with_ownership_check(presentation)

asyncio.run(main())
