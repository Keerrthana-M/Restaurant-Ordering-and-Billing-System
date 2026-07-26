from app import db

class Table(db.Model):
    __tablename__ = 'tables'

    id = db.Column(db.Integer, primary_key=True)
    table_number = db.Column(db.Integer, nullable=False, unique=True)
    seating_capacity = db.Column(db.Integer, nullable=False)
    status = db.Column(db.String(20), nullable=False, default='available')
    qr_code = db.Column(db.String(500), nullable=True)