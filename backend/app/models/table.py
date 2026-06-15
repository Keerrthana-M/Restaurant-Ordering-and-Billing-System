from app import db

class RestaurantTable(db.Model):
    __tablename__ = 'tables'

    id = db.Column(db.Integer, primary_key=True)
    table_number = db.Column(db.String(20), nullable=False)
    seating_capacity = db.Column(db.Integer, nullable=False)
    
    # available / occupied / reserved
    status = db.Column(db.String(20), default='available')
    
    restaurant_id = db.Column(db.Integer, db.ForeignKey('restaurants.id'), nullable=False)

    def to_dict(self):
        return {
            'id': self.id,
            'table_number': self.table_number,
            'seating_capacity': self.seating_capacity,
            'status': self.status,
            'restaurant_id': self.restaurant_id
        }