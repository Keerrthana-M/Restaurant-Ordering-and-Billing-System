import smtplib
import random
import string
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from flask import current_app

def generate_otp():
    return ''.join(random.choices(string.digits, k=6))

def send_otp_email(to_email, otp):
    from_email = current_app.config['MAIL_EMAIL']
    password = current_app.config['MAIL_PASSWORD']

    msg = MIMEMultipart()
    msg['From'] = from_email
    msg['To'] = to_email
    msg['Subject'] = 'FoodieXpress - Your OTP'

    body = f"""
    Hello!
    
    Your OTP for FoodieXpress login is: {otp}
    
    This OTP is valid for 10 minutes.
    
    If you did not request this, please ignore this email.
    
    - FoodieXpress Team
    """

    msg.attach(MIMEText(body, 'plain'))

    try:
        server = smtplib.SMTP('smtp.gmail.com', 587)
        server.starttls()
        server.login(from_email, password)
        server.sendmail(from_email, to_email, msg.as_string())
        server.quit()
        return True
    except Exception as e:
        print(f"Email error: {e}")
        return False