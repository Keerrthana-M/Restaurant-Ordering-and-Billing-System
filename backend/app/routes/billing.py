from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime
from app import db
from app.models.bill import Bill
from app.models.order import Order
from app.routes.helpers import admin_required

billing_bp = Blueprint('billing', __name__)


# GENERATE BILL — admin only (order must be in 'served' state)
@billing_bp.route('/bills', methods=['POST'])
@jwt_required()
@admin_required
def generate_bill():
    data = request.get_json()
    order_id = data.get('order_id')
    discount = data.get('discount', 0)
    payment_mode = data.get('payment_mode', 'cash')

    order = Order.query.get_or_404(order_id)

    # Only bill served orders
    if order.status != 'served':
        return jsonify({"error": "Order must be served before billing"}), 400

    # Check if bill already exists
    if order.bill:
        return jsonify({"error": "Bill already generated for this order"}), 400

    # Calculate totals from order items
    total_amount = float(sum(item.subtotal for item in order.items))
    tax_amount = total_amount * 0.05  # 5% tax
    grand_total = total_amount + tax_amount - discount

    # Create bill
    bill = Bill(
        order_id=order_id,
        total_amount=total_amount,
        tax_amount=tax_amount,
        discount=discount,
        grand_total=grand_total,
        payment_mode=payment_mode,
        status='paid',
        billed_at=datetime.utcnow()
    )
    db.session.add(bill)

    # Update order status to billed
    order.status = 'billed'

    # Free up the table if dine-in
    if order.table_id:
        from app.models.table import Table
        table = Table.query.get(order.table_id)
        if table:
            table.status = 'available'

    db.session.commit()

    return jsonify({
        "message": "Bill generated",
        "bill_id": bill.id,
        "total_amount": float(total_amount),
        "tax_amount": float(tax_amount),
        "discount": float(discount),
        "grand_total": float(grand_total),
        "payment_mode": payment_mode
    }), 201


# GET bill for a specific order — customer or admin
@billing_bp.route('/bills/order/<int:order_id>', methods=['GET'])
@jwt_required()
def get_bill(order_id):
    order = Order.query.get_or_404(order_id)
    bill = order.bill

    if not bill:
        return jsonify({"error": "No bill found for this order"}), 404

    return jsonify({
        "bill_id": bill.id,
        "order_id": order_id,
        "total_amount": float(bill.total_amount),
        "tax_amount": float(bill.tax_amount),
        "discount": float(bill.discount),
        "grand_total": float(bill.grand_total),
        "payment_mode": bill.payment_mode,
        "status": bill.status,
        "billed_at": bill.billed_at.isoformat(),
        "items": [{
            "name": item.menu_item.name,
            "quantity": item.quantity,
            "unit_price": float(item.unit_price),
            "subtotal": float(item.subtotal)
        } for item in order.items]
    }), 200


# GET all bills — admin only
@billing_bp.route('/bills', methods=['GET'])
@jwt_required()
@admin_required
def get_all_bills():
    bills = Bill.query.all()
    return jsonify([{
        "bill_id": b.id,
        "order_id": b.order_id,
        "grand_total": float(b.grand_total),
        "payment_mode": b.payment_mode,
        "status": b.status,
        "billed_at": b.billed_at.isoformat()
    } for b in bills]), 200