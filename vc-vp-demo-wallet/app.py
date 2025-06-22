from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import didkit
import json
from typing import Dict, Any, List

app = FastAPI(title="DIDKit API", description="Verifiable Credentials and Presentations API")

jwk_issuer = didkit.generate_ed25519_key()
did_issuer = didkit.key_to_did("key", jwk_issuer)
Trusted_DIDs = [did_issuer]

class UserIdentity(BaseModel):
    jwk: str
    did: str

class CredentialRequest(BaseModel):
    subject_did: str
    name: str
    job_title: str

class CredentialResponse(BaseModel):
    credential: Dict[str, Any]

class PresentationRequest(BaseModel):
    verifiable_credential: Dict[str, Any]
    holder_jwk: str

class PresentationResponse(BaseModel):
    presentation: Dict[str, Any]

class VerificationRequest(BaseModel):
    signed_presentation: Dict[str, Any]

class VerificationResponse(BaseModel):
    valid: bool
    message: str
    details: Dict[str, Any] = {}

class AddTrustedDIDsRequest(BaseModel):
    dids: List[str]

@app.get("/")
async def root():
    return {"message": "DIDKit API Server", "issuer_did": did_issuer}

@app.post("/generate-identity", response_model=UserIdentity)
async def generate_user_identity():
    """
    Generate a new JWK and DID for a user
    """
    try:
        jwk = didkit.generate_ed25519_key()
        did = didkit.key_to_did("key", jwk)
        
        return UserIdentity(jwk=jwk, did=did)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate identity: {str(e)}")

@app.post("/create-credential", response_model=CredentialResponse)
async def create_signed_credential(request: CredentialRequest):
    """
    Create and sign a verifiable credential
    """
    try:
        credential = {
            "@context": ["https://www.w3.org/2018/credentials/v1", "https://schema.org/"],
            "type": ["VerifiableCredential"],
            "issuer": did_issuer,
            "issuanceDate": "2020-08-19T21:41:50Z",
            "credentialSubject": {
                "id": request.subject_did,
                "name": request.name,
                "jobTitle": request.job_title
            },
        }
        
        signed_credential = await didkit.issue_credential(
            json.dumps(credential),
            json.dumps({}),
            jwk_issuer
        )
        
        return CredentialResponse(credential=json.loads(signed_credential))
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create credential: {str(e)}")

@app.post("/create-presentation", response_model=PresentationResponse)
async def create_signed_presentation(request: PresentationRequest):
    """
    Create and sign a verifiable presentation
    """
    try:
        holder_did = didkit.key_to_did("key", request.holder_jwk)
        
        presentation = {
            "@context": ["https://www.w3.org/2018/credentials/v1"],
            "type": ["VerifiablePresentation"],
            "holder": holder_did,
            "verifiableCredential": [request.verifiable_credential]
        }
        
        signed_presentation = await didkit.issue_presentation(
            json.dumps(presentation),
            json.dumps({}),
            request.holder_jwk
        )
        
        return PresentationResponse(presentation=json.loads(signed_presentation))
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create presentation: {str(e)}")

@app.post("/verify-presentation", response_model=VerificationResponse)
async def verify_presentation_endpoint(request: VerificationRequest):
    """
    Verify a signed presentation with ownership and semantic checks
    """
    try:
        signed_presentation = request.signed_presentation
        
        # Step 1: Cryptographic verification
        verification_result = await didkit.verify_presentation(
            json.dumps(signed_presentation),
            json.dumps({})
        )
        
        crypto_result = json.loads(verification_result)
        crypto_valid = not crypto_result.get("errors")
        
        if not crypto_valid:
            return VerificationResponse(
                valid=False,
                message="Cryptographic verification failed",
                details={
                    "crypto_errors": crypto_result.get("errors", []),
                    "step": "cryptographic_verification"
                }
            )
        
        # Step 2: Semantic and ownership checks
        vc = signed_presentation["verifiableCredential"][0]
        vc_issuer = vc["issuer"]
        vc_subject = vc["credentialSubject"]["id"]
        job_title = vc["credentialSubject"]["jobTitle"]
        presentation_holder = signed_presentation["holder"]
        
        # Check if issuer is trusted
        if vc_issuer not in Trusted_DIDs:
            return VerificationResponse(
                valid=False,
                message="Issuer is not trusted",
                details={
                    "issuer": vc_issuer,
                    "trusted_dids": Trusted_DIDs,
                    "step": "issuer_check"
                }
            )
        
        # Check ownership (subject == holder)
        if vc_subject != presentation_holder:
            return VerificationResponse(
                valid=False,
                message="Credential subject and presentation holder mismatch",
                details={
                    "subject": vc_subject,
                    "holder": presentation_holder,
                    "step": "ownership_check"
                }
            )
        
        # Check job title (if needed)
        if job_title != "Faculty":
            return VerificationResponse(
                valid=False,
                message="Job title check failed - Expected 'Faculty'",
                details={
                    "actual_job_title": job_title,
                    "expected_job_title": "Faculty",
                    "step": "job_title_check"
                }
            )
        
        # All checks passed
        return VerificationResponse(
            valid=True,
            message="Verifiable Presentation is valid and fully trusted",
            details={
                "issuer": vc_issuer,
                "subject": vc_subject,
                "holder": presentation_holder,
                "job_title": job_title,
                "all_checks": "passed"
            }
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Verification failed: {str(e)}")

# Additional utility endpoints
@app.get("/trusted-dids")
async def get_trusted_dids():
    """Get list of trusted DIDs"""
    return {"trusted_dids": Trusted_DIDs}

@app.post("/add-trusted-dids")
async def add_trusted_dids(request: AddTrustedDIDsRequest):
    """
    Append one or more DIDs to the list of trusted DIDs.
    """
    try:
        for did in request.dids:
            if did not in Trusted_DIDs:
                Trusted_DIDs.append(did)
        return {"message": "Trusted DIDs updated successfully", "current_trusted_dids": Trusted_DIDs}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to add trusted DIDs: {str(e)}")

@app.get("/issuer-info")
async def get_issuer_info():
    """Get issuer DID information"""
    return {"issuer_did": did_issuer}

from fastapi.middleware.cors import CORSMiddleware
origins = [
    "http://localhost", # If serving via a simple web server like http-server
    "http://localhost:8000", # If your client is also at 8000
    "null", # For file:// access in some browsers, but not recommended for production
    "*"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Be specific in production, e.g., ["http://localhost:8000"]
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=5004)