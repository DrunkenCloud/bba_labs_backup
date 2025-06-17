import asyncio
import didkit
import json

jwk_issuer = didkit.generate_ed25519_key()
jwk_alice = didkit.generate_ed25519_key()
jwk_bob = didkit.generate_ed25519_key()

did_issuer = didkit.key_to_did("key", jwk_issuer)
did_alice = didkit.key_to_did("key", jwk_alice)
did_bob = didkit.key_to_did("key", jwk_bob)

print(f"Issuer: {did_issuer}")
print(f"Alice:  {did_alice}")
print(f"Bob:    {did_bob}")

credential = {
    "@context": ["https://www.w3.org/2018/credentials/v1"],
    "type": ["VerifiableCredential"],
    "issuer": did_issuer,
    "issuanceDate": "2020-08-19T21:41:50Z",
    "credentialSubject": {
        "id": did_alice
    },
}

presentation_fraud = {
    "@context": ["https://www.w3.org/2018/credentials/v1"],
    "type": ["VerifiablePresentation"],
    "holder": did_bob,
    "verifiableCredential": [credential]
}

presentation_legit = {
    "@context": ["https://www.w3.org/2018/credentials/v1"],
    "type": ["VerifiablePresentation"],
    "holder": did_alice,
    "verifiableCredential": [credential]
}

async def verify_presentation_with_ownership_check(presentation, signer_key, test_name):
    print(f"\n{'='*50}")
    print(f"TEST CASE: {test_name}")
    print(f"{'='*50}")
    
    signed_presentation = await didkit.issue_presentation(
        json.dumps(presentation),
        json.dumps({}),
        signer_key
    )
    
    verification_result = await didkit.verify_presentation(
        signed_presentation,
        json.dumps({})
    )
    
    crypto_result = json.loads(verification_result)
    crypto_valid = not crypto_result.get("errors")
    
    print(f"Step 1 - Cryptographic verification: {'✅ PASS' if crypto_valid else '❌ FAIL'}")
    
    if not crypto_valid:
        print("Cryptographic errors:")
        for error in crypto_result["errors"]:
            print(f"  - {error}")
        return False
    
    pres_data = json.loads(signed_presentation)
    vc_subject = pres_data["verifiableCredential"][0]["credentialSubject"]["id"]
    presentation_holder = pres_data["holder"]
    
    print(f"Step 2 - Ownership check:")
    print(f"  VC subject:         {vc_subject}")
    print(f"  Presentation holder: {presentation_holder}")
    
    ownership_valid = (vc_subject == presentation_holder)
    print(f"  Ownership valid:    {'✅ PASS' if ownership_valid else '❌ FAIL'}")
    
    overall_valid = crypto_valid and ownership_valid
    print(f"\nFINAL RESULT: {'✅ VALID PRESENTATION' if overall_valid else '❌ INVALID PRESENTATION'}")
    
    if not ownership_valid:
        print("⚠️  SECURITY VIOLATION: Credential theft/impersonation detected!")
    
    return overall_valid

async def main():
    signed_credential = await didkit.issue_credential(
        json.dumps(credential),
        json.dumps({}),
        jwk_issuer
    )
    
    presentation_fraud["verifiableCredential"] = [json.loads(signed_credential)]
    presentation_legit["verifiableCredential"] = [json.loads(signed_credential)]
    
    await verify_presentation_with_ownership_check(
        presentation_fraud, 
        jwk_bob, 
        "Bob presenting Alice's credential (FRAUD)"
    )
    
    await verify_presentation_with_ownership_check(
        presentation_legit, 
        jwk_alice, 
        "Alice presenting her own credential (LEGITIMATE)"
    )

asyncio.run(main())