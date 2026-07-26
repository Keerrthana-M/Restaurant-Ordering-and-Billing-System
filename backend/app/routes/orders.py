from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from datetime import datetime
from app import db
from app.models.order import Order
from app.models.order_item import OrderItem
from app.models.menu_item import MenuItem
from app.models.table import Table
from app.routes.helpers import admin_required

orders_bp = Blueprint('orders', __name__)


# PLACE AN ORDER — customer only
@orders_bp.route('/orders', methods=['POST'])
@jwt_required()
def place_order():
    data = request.get_json()
    claims = get_jwt()
    customer_id = int(get_jwt_identity())

    order_type = data.get('order_type')  # 'dine-in' or 'takeaway'
    table_id = data.get('table_id')      # nullable for takeaway
    items = data.get('items', [])        # list of {menu_item_id, quantity}

    if not items:
        return jsonify({"error": "No items in order"}), 400

    # Create the Order row
    new_order = Order(
        customer_id=customer_id,
        table_id=table_id,
        order_type=order_type,
        status='placed'
    )
    db.session.add(new_order)
    db.session.flush()  # gets new_order.id without committing yet

    # Create OrderItem rows
    for item_data in items:
        menu_item = MenuItem.query.get(item_data['menu_item_id'])
        if not menu_item or not menu_item.is_available:
            db.session.rollback()
            return jsonify({"error": f"Item {item_data['menu_item_id']} unavailable"}), 400

        quantity = item_data['quantity']
        unit_price = menu_item.price
        subtotal = unit_price * quantity

        order_item = OrderItem(
            order_id=new_order.id,
            menu_item_id=menu_item.id,
            quantity=quantity,
            unit_price=unit_price,
            subtotal=subtotal
        )
        db.session.add(order_item)

    # Mark table as occupied if dine-in
    if order_type == 'dine-in' and table_id:
        table = Table.query.get(table_id)
        if table:
            table.status = 'occupied'

    db.session.commit()

    return jsonify({
        "message": "Order placed successfully",
        "order_id": new_order.id
    }), 201


# GET customer's own orders
@orders_bp.route('/orders/my', methods=['GET'])
@jwt_required()
def get_my_orders():
    customer_id = int(get_jwt_identity())
    orders = Order.query.filter_by(customer_id=customer_id).all()

    return jsonify([{
        "id": o.id,
        "order_type": o.order_type,
        "status": o.status,
        "placed_at": o.placed_at.isoformat(),
        "items": [{
            "name": item.menu_item.name,
            "quantity": item.quantity,
            "unit_price": float(item.unit_price),
            "subtotal": float(item.subtotal)
        } for item in o.items]
    } for o in orders]), 200


# GET all orders — admin only
@orders_bp.route('/orders', methods=['GET'])
@jwt_required()
@admin_required
def get_all_orders():
    orders = Order.query.all()
    return jsonify([{
        "id": o.id,
        "customer_id": o.customer_id,
        "order_type": o.order_type,
        "status": o.status,
        "placed_at": o.placed_at.isoformat(),
        "table_id": o.table_id
    } for o in orders]), 200


# UPDATE order status — admin only
@orders_bp.route('/orders/<int:id>/status', methods=['PATCH'])
@jwt_required()
@admin_required
def update_order_status(id):
    order = Order.query.get_or_404(id)
    data = request.get_json()
    new_status = data.get('status')

    allowed = ['placed', 'preparing', 'served', 'billed']
    if new_status not in allowed:
        return jsonify({"error": "Invalid status"}), 400

    order.status = new_status
    if new_status == 'served':
        order.served_at = datetime.utcnow()

    db.session.commit()

    return jsonify({
        "message": f"Order status updated to {new_status}"
    }), 200