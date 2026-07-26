from app import create_app, db
from app.models.customer import Customer
from werkzeug.security import generate_password_hash

app = create_app()

with app.app_context():
    # Check if admin already exists, to avoid creating duplicates
    existing_admin = Customer.query.filter_by(email='admin@foodiexpress.com').first()

    if existing_admin:
        print("Admin already exists, skipping.")
    else:
        admin = Customer(
            name='Admin',
            email='admin@foodiexpress.com',
            password_hash=generate_password_hash('admin123'),
            role='admin',
            is_active=True
        )
        db.session.add(admin)
        db.session.commit()
        print("✅ Admin user created!")