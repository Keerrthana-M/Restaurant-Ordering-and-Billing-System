from app import create_app, db
from app.models.user import User
from werkzeug.security import generate_password_hash

app = create_app()

with app.app_context():
    db.create_all()

    # Create admin if not exists
    admin = User.query.filter_by(role='admin').first()
    if not admin:
        admin = User(
            name='Super Admin',
            email='admin@foodiexpress.com',
            password_hash=generate_password_hash('admin123'),
            role='admin',
            mobile=None
        )
        db.session.add(admin)
        db.session.commit()
        print("Admin created: admin@foodiexpress.com / admin123")
    
    print("Database ready!")

app.run(debug=True)