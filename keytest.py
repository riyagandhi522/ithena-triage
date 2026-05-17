import os
from google import genai

# NOTE: It is best practice to set your API key as an environment variable.
# For a quick test, you can uncomment the line below and paste your key inside the quotes.
os.environ["GEMINI_API_KEY"] = "YOUR_API_KEY_HERE"

def test_gemini_key():
    # Fetch the key from the environment
    api_key = os.environ.get("GEMINI_API_KEY")
    
    if not api_key or api_key == "YOUR_API_KEY_HERE":
        print("⚠️ Please set your GEMINI_API_KEY before running the script.")
        return

    try:
        # Initialize the client with your key
        client = genai.Client(api_key=api_key)
        
        print("Sending a test request to Gemini...")
        
        # Send a simple prompt to a lightweight, fast model
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents='Please reply with a short, cheerful message confirming that my Gemini API key is working!'
        )
        
        print("\n✅ Success! Your API key is perfectly valid.")
        print("-" * 40)
        print(f"🤖 Gemini says: {response.text.strip()}")
        print("-" * 40)
        
    except Exception as e:
        print("\n❌ Error: Something went wrong. Your API key might be invalid or restricted.")
        print(f"Details: {e}")

if __name__ == "__main__":
    test_gemini_key()