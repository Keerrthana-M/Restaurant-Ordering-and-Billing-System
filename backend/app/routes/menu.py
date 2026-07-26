from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from app import db
from app.models.category import Category
from app.models.menu_item import MenuItem
from app.routes.helpers import admin_required

menu_bp = Blueprint('menu', __name__)

# ─── CATEGORY ROUTES ─────────────────────────────────────────────

# GET all categories — open to everyone
@menu_bp.route('/categories', methods=['GET'])
def get_categories():
    categories = Category.query.all()
    return jsonify([{
        "id": c.id,
        "name": c.name,
        "description": c.description
    } for c in categories]), 200


# CREATE a category — admin only
@menu_bp.route('/categories', methods=['POST'])
@jwt_required()
@admin_required
def create_category():
    data = request.get_json()

    new_category = Category(
        name=data.get('name'),
        description=data.get('description')
    )
    db.session.add(new_category)
    db.session.commit()

    return jsonify({"message": "Category created", "id": new_category.id}), 201


# UPDATE a category — admin only
@menu_bp.route('/categories/<int:id>', methods=['PUT'])
@jwt_required()
@admin_required
def update_category(id):
    category = Category.query.get_or_404(id)
    data = request.get_json()

    category.name = data.get('name', category.name)
    category.description = data.get('description', category.description)
    db.session.commit()

    return jsonify({"message": "Category updated"}), 200


# DELETE a category — admin only
@menu_bp.route('/categories/<int:id>', methods=['DELETE'])
@jwt_required()
@admin_required
def delete_category(id):
    category = Category.query.get_or_404(id)
    db.session.delete(category)
    db.session.commit()

    return jsonify({"message": "Category deleted"}), 200



# ─── MENU ITEM ROUTES ─────────────────────────────────────────────

# GET all menu items — open to everyone
# Optional: filter by category (?category_id=1) or dietary (?veg=true)
@menu_bp.route('/menu-items', methods=['GET'])
def get_menu_items():
    category_id = request.args.get('category_id')
    veg_only = request.args.get('veg')

    query = MenuItem.query

    if category_id:
        query = query.filter_by(category_id=int(category_id))
    if veg_only == 'true':
        query = query.filter_by(is_vegetarian=True)

    items = query.all()
    return jsonify([{
        "id": item.id,
        "name": item.name,
        "description": item.description,
        "price": float(item.price),
        "category_id": item.category_id,
        "is_vegetarian": item.is_vegetarian,
        "is_available": item.is_available
    } for item in items]), 200


# CREATE a menu item — admin only
@menu_bp.route('/menu-items', methods=['POST'])
@jwt_required()
@admin_required
def create_menu_item():
    data = request.get_json()

    new_item = MenuItem(
        name=data.get('name'),
        description=data.get('description'),
        price=data.get('price'),
        category_id=data.get('category_id'),
        is_vegetarian=data.get('is_vegetarian', False),
        is_available=data.get('is_available', True)
    )
    db.session.add(new_item)
    db.session.commit()

    return jsonify({"message": "Menu item created", "id": new_item.id}), 201


# UPDATE a menu item — admin only
@menu_bp.route('/menu-items/<int:id>', methods=['PUT'])
@jwt_required()
@admin_required
def update_menu_item(id):
    item = MenuItem.query.get_or_404(id)
    data = request.get_json()

    item.name = data.get('name', item.name)
    item.description = data.get('description', item.description)
    item.price = data.get('price', item.price)
    item.category_id = data.get('category_id', item.category_id)
    item.is_vegetarian = data.get('is_vegetarian', item.is_vegetarian)
    item.is_available = data.get('is_available', item.is_available)
    db.session.commit()

    return jsonify({"message": "Menu item updated"}), 200


# TOGGLE availability — admin only
@menu_bp.route('/menu-items/<int:id>/toggle', methods=['PATCH'])
@jwt_required()
@admin_or_waiter_required
def toggle_availability(id):
    item = MenuItem.query.get_or_404(id)
    item.is_available = not item.is_available
    db.session.commit()

    return jsonify({
        "message": "Availability updated",
        "is_available": item.is_available
    }), 200


# DELETE a menu item — admin only
@menu_bp.route('/menu-items/<int:id>', methods=['DELETE'])
@jwt_required()
@admin_required
def delete_menu_item(id):
    item = MenuItem.query.get_or_404(id)
    db.session.delete(item)
    db.session.commit()

    return jsonify({"message": "Menu item deleted"}), 200