from app import db
from datetime import datetime

class Bill(db.Model):
    __tablename__ = 'bills'

    id = db.Column(db.Integer, primary_key=True)
    order_id = db.Column(db.Integer, db.ForeignKey('orders.id'), nullable=False)
    
    total_amount = db.Column(db.Float, nullable=False)
    tax_amount = db.Column(db.Float, nullable=False)
    discount = db.Column(db.Float, default=0.0)
    grand_total = db.Column(db.Float, nullable=False)
    
    # cash / card / upi
    payment_mode = db.Column(db.String(20), nullable=True)
    
    # paid / unpaid
    status = db.Column(db.String(20), default='unpaid')
    
    billed_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'order_id': self.order_id,
            'total_amount': self.total_amount,
            'tax_amount': self.tax_amount,
            'discount': self.discount,
            'grand_total': self.grand_total,
            'payment_mode': self.payment_mode,
            'status': self.status,
            'billed_at': self.billed_at.isoformat()
        }