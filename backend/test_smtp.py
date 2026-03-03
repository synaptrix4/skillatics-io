import smtplib
import os
from dotenv import load_dotenv

load_dotenv()
sg_api_key = os.environ.get('SENDGRID_API_KEY')
print(f"API Key present: {bool(sg_api_key)}")

for port in [587, 465, 2525]:
    print(f"\nTrying port {port}...")
    try:
        if port == 465:
            server = smtplib.SMTP_SSL("smtp.sendgrid.net", port, timeout=10)
        else:
            server = smtplib.SMTP("smtp.sendgrid.net", port, timeout=10)
            server.ehlo()
            server.starttls()
            server.ehlo()
        server.login("apikey", sg_api_key)
        print(f"SUCCESS on port {port}!")
        server.quit()
        break
    except Exception as e:
        print(f"FAILED on port {port}: {e}")
