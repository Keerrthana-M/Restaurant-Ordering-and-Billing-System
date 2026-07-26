from app import create_app, db

app = create_app()

if __name__ == '__main__':
    with app.app_context():
        # This reads all your models and creates tables in SQLite
        # If tables already exist, it skips them — safe to run multiple times
        db.create_all()
        print("✅ Database ready!")
    
    # debug=True means Flask auto-restarts when you save a file
    # Never use debug=True in production
    app.run(debug=True)