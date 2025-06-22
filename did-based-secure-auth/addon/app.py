from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, EmailStr
from typing import Dict, Any
import smtplib
from email.mime.text import MIMEText
import random
import string
import json
import didkit
from fastapi.middleware.cors import CORSMiddleware

jwk_issuer = didkit.generate_ed25519_key()
did_issuer = didkit.key_to_did("key", jwk_issuer)
Trusted_DIDs = [did_issuer]

app = FastAPI(title="VC + SMTP OTP Authentication")

SMTP_SERVER = "smtp.gmail.com"
SMTP_PORT = 587
SMTP_USERNAME = "niranjhansu@gmail.com"
SMTP_PASSWORD = ""

users_db = {}
otp_store = {}

class UserCreate(BaseModel):
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    signed_presentation: Dict[str, Any]
    email: EmailStr
    password: str
    otp: str
    VP: dict

class OTPGet(BaseModel):
    email: EmailStr

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

class VerificationResponse(BaseModel):
    valid: bool
    message: str
    details: Dict[str, Any] = {}

def generate_otp():
    return ''.join(random.choices(string.digits, k=6))

def send_otp_email(email: str, otp: str):
    msg = MIMEText(f"Your OTP for authentication is: {otp}")
    msg['Subject'] = 'Authentication OTP'
    msg['From'] = SMTP_USERNAME
    msg['To'] = email
    with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as server:
        server.starttls()
        server.login(SMTP_USERNAME, SMTP_PASSWORD)
        server.send_message(msg)

@app.post("/register")
async def register(user: UserCreate):
    if user.email in users_db:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    try:
        users_db[user.email] = user.password
        
        return {"message": "Registration successful"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Registration failed: {str(e)}")

@app.post("/get-otp")
async def getOTP(user: OTPGet):
    if user.email not in users_db:
        raise HTTPException(status_code=400, detail="User not found")
    
    otp = generate_otp()
    otp_store[user.email] = otp

    try:
        send_otp_email(user.email, otp)
        return {"message": "OTP sent successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to send OTP: {str(e)}")

@app.post("/login")
async def login(user: UserLogin):
    if user.email not in users_db:
        raise HTTPException(status_code=400, detail="User not found")
    
    if users_db[user.email] != user.password:
        raise HTTPException(status_code=400, detail="Incorrect password")
    
    if user.email not in otp_store:
        raise HTTPException(status_code=406, detail="OTP not sent")
    
    if user.otp != otp_store[user.email]:
        raise HTTPException(status_code=401, details="Wrong OTP")
    
    try:
        signed_presentation = user.signed_presentation
        
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
        
        vc = signed_presentation["verifiableCredential"][0]
        vc_issuer = vc["issuer"]
        vc_subject = vc["credentialSubject"]["id"]
        job_title = vc["credentialSubject"]["jobTitle"]
        presentation_holder = signed_presentation["holder"]
        
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

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=5000) 
