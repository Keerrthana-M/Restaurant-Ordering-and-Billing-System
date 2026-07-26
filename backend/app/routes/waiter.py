from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from datetime import datetime
from app import db
from app.models.order import Order
from app.models.order_item import OrderItem
from app.models.bill import Bill

waiter_bp = Blueprint('waiter', __name__)

def waiter_required(fn):
    from functools import wraps
    from flask import jsonify
    @wraps(fn)
    def wrapper(*args, **kwargs):
        claims = get_jwt()
        if claims.get('role') not in ['waiter', 'admin']:
            return jsonify({"error": "Waiter access required"}), 403
        return fn(*args, **kwargs)
    return wrapper

@waiter_bp.route('/waiter/orders', methods=['GET'])
@jwt_required()
@waiter_required
def get_incoming_orders():
    orders = Order.query.filter(
        Order.status.in_(['placed', 'preparing'])
    ).all()
    return jsonify([{
        "id": o.id,
        "table_id": o.table_id,
        "order_type": o.order_type,
        "status": o.status,
        "placed_at": o.placed_at.isoformat(),
        "items": [{
            "name": item.menu_item.name,
            "quantity": item.quantity
        } for item in o.items]
    } for o in orders]), 200

@waiter_bp.route('/waiter/orders/<int:id>/status', methods=['PATCH'])
@jwt_required()
@waiter_required
def update_order_status(id):
    order = Order.query.get_or_404(id)
    data = request.get_json()
    new_status = data.get('status')
    allowed = ['preparing', 'served']
    if new_status not in allowed:
        return jsonify({"error": "Invalid status"}), 400
    order.status = new_status
    if new_status == 'served':
        order.served_at = datetime.utcnow()
    db.session.commit()
    return jsonify({"message": f"Order updated to {new_status}"}), 200

@waiter_bp.route('/waiter/orders/<int:id>/paid', methods=['POST'])
@jwt_required()
@waiter_required
def mark_as_paid(id):
    order = Order.query.get_or_404(id)
    if order.status != 'served':
        return jsonify({"error": "Order must be served first"}), 400
    if order.bill:
        return jsonify({"error": "Already billed"}), 400
    total_amount = float(sum(item.subtotal for item in order.items))
    tax_amount = total_amount * 0.05
    grand_total = total_amount + tax_amount
    bill = Bill(
        order_id=order.id,
        total_amount=total_amount,
        tax_amount=tax_amount,
        discount=0,
        grand_total=grand_total,
        payment_mode='cash',
        status='paid',
        billed_at=datetime.utcnow()
    )
    db.session.add(bill)
    order.status = 'billed'
    if order.table_id:
        from app.models.table import Table
        table = Table.query.get(order.table_id)
        if table:
            table.status = 'available'
    db.session.commit()
    return jsonify({
        "message": "Order marked as paid",
        "grand_total": grand_total
    }), 200

@waiter_bp.route('/waiter/summary', methods=['GET'])
@jwt_required()
@waiter_required
def today_summary():
    from datetime import date
    from sqlalchemy import func, cast, Date
    today = datetime.utcnow().date()
    orders_today = Order.query.filter(
        db.cast(Order.placed_at, db.Date) == today
    ).count()
    revenue_today = db.session.query(
        func.sum(Bill.grand_total)
    ).filter(
        db.cast(Bill.billed_at, db.Date) == today
    ).scalar()
    return jsonify({
        "orders_today": orders_today,
        "revenue_today": float(revenue_today or 0)
    }), 200