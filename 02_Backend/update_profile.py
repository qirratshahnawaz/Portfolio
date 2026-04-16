import httpx
from decouple import config
import json

# Configuration
PROJECT_ID = config("SANITY_PROJECT_ID")
DATASET = config("SANITY_DATASET", default="production")
API_VERSION = "v2025-01-20"
TOKEN = config("SANITY_API_TOKEN")

BASE_URL = f"https://{PROJECT_ID}.api.sanity.io/{API_VERSION}/mutate/{DATASET}"

# Comprehensive Profile Data from LinkedIn & Portfolio
profile_data = {
    "_id": "singleton-profile",
    "_type": "profile",
    "firstName": "Muhammad",
    "lastName": "Hamza",
    "headline": "Full-Stack Developer | Next.js · React · TypeScript · Python · Sanity CMS | AI-Powered & Cloud-Native Web Apps",
    "shortBio": "Full-Stack Developer & AI Enthusiast (Q4, GIAIC) focused on building AI-enabled, cloud-native web applications end-to-end. I design, implement, and ship production web products — from user interfaces to data models and agentic AI workflows — using modern tooling and best practices.",
    "location": "Karachi, Sindh, Pakistan",
    "email": "mhamza77188@gmail.com",
    "phone": "03332207909",
    "availability": "available",
    "yearsOfExperience": 1,
    "headlineStaticText": None,
    "headlineAnimatedWords": None,
    "headlineAnimationDuration": None,
    "socialLinks": {
        "github": "https://github.com/muhammadhamza718",
        "linkedin": "https://www.linkedin.com/in/muhammad-hamza-816290320/",
        "website": "https://3-d-portfolio-website-gamma.vercel.app/"
    }
}

def update_profile():
    headers = {
        "Authorization": f"Bearer {TOKEN}",
        "Content-Type": "application/json"
    }
    
    # Create or replace mutation
    mutation = {
        "mutations": [
            {
                "createOrReplace": profile_data
            }
        ]
    }
    
    print(f"Updating profile with ID: {profile_data['_id']}")
    
    try:
        with httpx.Client(timeout=10.0) as client:
            response = client.post(
                BASE_URL,
                content=json.dumps(mutation),
                headers=headers
            )
            response.raise_for_status()
            print("Successfully updated profile in Sanity with full data!")
            print(f"Response: {response.json()}")
    except Exception as e:
        print(f"Error updating Sanity: {e}")
        if hasattr(e, 'response') and e.response:
            print(f"Response body: {e.response.text}")

if __name__ == "__main__":
    update_profile()
