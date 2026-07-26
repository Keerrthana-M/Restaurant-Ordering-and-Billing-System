import qrcode
import io
import base64
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from app import db
from app.models.table import Table
from app.routes.helpers import admin_required

tables_bp = Blueprint('tables', __name__)


# GET all tables — admin only
@tables_bp.route('/tables', methods=['GET'])
@jwt_required()
@admin_required
def get_tables():
    tables = Table.query.all()
    return jsonify([{
        "id": t.id,
        "table_number": t.table_number,
        "seating_capacity": t.seating_capacity,
        "status": t.status
    } for t in tables]), 200


# CREATE a table — admin only
@tables_bp.route('/tables', methods=['POST'])
@jwt_required()
@admin_required
def create_table():
    data = request.get_json()

    new_table = Table(
        table_number=data.get('table_number'),
        seating_capacity=data.get('seating_capacity'),
        status='available'
    )
    db.session.add(new_table)
    db.session.commit()

    return jsonify({"message": "Table created", "id": new_table.id}), 201


# UPDATE table status — admin only
@tables_bp.route('/tables/<int:id>', methods=['PUT'])
@jwt_required()
@admin_required
def update_table(id):
    table = Table.query.get_or_404(id)
    data = request.get_json()

    table.table_number = data.get('table_number', table.table_number)
    table.seating_capacity = data.get('seating_capacity', table.seating_capacity)
    table.status = data.get('status', table.status)
    db.session.commit()

    return jsonify({"message": "Table updated"}), 200


# DELETE a table — admin only (cannot delete if active order exists)
@tables_bp.route('/tables/<int:id>', methods=['DELETE'])
@jwt_required()
@admin_required
def delete_table(id):
    table = Table.query.get_or_404(id)

    # Check for active orders on this table
    from app.models.order import Order
    active_order = Order.query.filter_by(
        table_id=id
    ).filter(
        Order.status.in_(['placed', 'preparing', 'served'])
    ).first()

    if active_order:
        return jsonify({"error": "Cannot delete table with active order"}), 400

    db.session.delete(table)
    db.session.commit()

    return jsonify({"message": "Table deleted"}), 200

# GENERATE QR
@tables_bp.route('/tables/<int:id>/generate-qr', methods=['POST'])
@jwt_required()
@admin_required
def generate_qr(id):
    table = Table.query.get_or_404(id)
    qr_data = f"http://localhost:3000/menu?table={table.table_number}"
    qr = qrcode.make(qr_data)
    buffer = io.BytesIO()
    qr.save(buffer, format='PNG')
    buffer.seek(0)
    qr_base64 = base64.b64encode(buffer.getvalue()).decode()
    qr_data_url = f"data:image/png;base64,{qr_base64}"
    table.qr_code = qr_data_url
    db.session.commit()
    return jsonify({
        "message": "QR generated",
        "qr_code": qr_data_url
    }), 200