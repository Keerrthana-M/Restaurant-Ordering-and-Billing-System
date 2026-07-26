from flask import Blueprint, request, jsonify
from models import db, Restaurant, RestaurantTable, MenuItem, Order, OrderItem

restaurant_bp = Blueprint('restaurant', __name__)


# -----------------------------
# GET ALL RESTAURANTS
# -----------------------------
@restaurant_bp.route('', methods=['GET'])
def get_restaurants():
    restaurants = Restaurant.query.filter_by(is_active=True).all()

    result = []
    for r in restaurants:
        result.append({
            'id': r.id,
            'name': r.name,
            'address': r.address,
            'area': r.area,
            'cuisine_type': r.cuisine_type,
            'qr_code_token': r.qr_code_token
        })

    return jsonify(result), 200


# -----------------------------
# GET RESTAURANT BY ID
# -----------------------------
@restaurant_bp.route('/<int:restaurant_id>', methods=['GET'])
def get_restaurant_by_id(restaurant_id):

    restaurant = Restaurant.query.get(restaurant_id)

    if not restaurant:
        return jsonify({'error': 'Restaurant not found'}), 404

    return jsonify({
        'id': restaurant.id,
        'name': restaurant.name,
        'address': restaurant.address,
        'area': restaurant.area,
        'cuisine_type': restaurant.cuisine_type,
        'qr_code_token': restaurant.qr_code_token
    }), 200


# -----------------------------
# GET RESTAURANT USING QR TOKEN
# -----------------------------
@restaurant_bp.route('/qr/<string:token>', methods=['GET'])
def get_restaurant_by_qr(token):

    table = RestaurantTable.query.filter_by(
        qr_code_token=token
    ).first()

    if not table:
        return jsonify({
            "error": "Invalid QR code"
        }), 404

    restaurant = Restaurant.query.get(table.restaurant_id)

    return jsonify({
        "restaurant_id": restaurant.id,
        "restaurant_name": restaurant.name,
        "area": restaurant.area,
        "cuisine_type": restaurant.cuisine_type,
        "table_number": table.table_number
    }), 200

# -----------------------------
# GET MENU
# -----------------------------
@restaurant_bp.route('/<int:restaurant_id>/menu', methods=['GET'])
def get_menu(restaurant_id):

    restaurant = Restaurant.query.get(restaurant_id)

    if not restaurant:
        return jsonify({'error': 'Restaurant not found'}), 404

    menu_items = MenuItem.query.filter_by(
    restaurant_id=restaurant_id,
    is_available=True
    ).all()

    result = []

    for item in menu_items:
        result.append({
           'id': item.id,
           'name': item.name,
           'category': item.category,
           'price': item.price,
           'description': item.description,
           'image_url': item.image_url
    })

    return jsonify(result), 200

# -----------------------------
# PLACE ORDER
# -----------------------------
@restaurant_bp.route('/place-order', methods=['POST'])
def place_order():

    data = request.get_json()

    restaurant_id = data.get('restaurant_id')
    customer_id = data.get('customer_id')
    
    print("Customer ID received:", customer_id)
    print("Full Request Data:", data)
    table_number = data.get('table_number')
    order_type = data.get('order_type', 'dine_in')
    items = data.get('items', [])

    # Validation

    if not restaurant_id:
        return jsonify({
            'error': 'Restaurant ID is required'
        }), 400

    if len(items) == 0:
        return jsonify({
            'error': 'Cart is empty'
        }), 400

    restaurant = Restaurant.query.get(restaurant_id)

    if not restaurant:
        return jsonify({
            'error': 'Restaurant not found'
        }), 404

    # Create Order

    new_order = Order(
        customer_id=customer_id,
        restaurant_id=restaurant_id,
        table_number=table_number,
        order_type=order_type,
        status='pending',
        total_amount=0
    )

    db.session.add(new_order)

    # Flush generates Order ID before commit
    db.session.flush()

    total_amount = 0

    # Create Order Items

    for item in items:

        menu_item = MenuItem.query.get(
            item.get('menu_item_id')
        )

        if not menu_item:
            continue

        quantity = item.get('quantity', 1)

        subtotal = menu_item.price * quantity

        total_amount += subtotal

        order_item = OrderItem(
            order_id=new_order.id,
            menu_item_id=menu_item.id,
            quantity=quantity,
            price=menu_item.price
        )

        db.session.add(order_item)

    new_order.total_amount = total_amount

    db.session.commit()

    return jsonify({
        'message': 'Order placed successfully',
        'order_id': new_order.id,
        'restaurant': restaurant.name,
        'total_amount': total_amount,
        'status': new_order.status
    }), 201


# -----------------------------
# GET ALL ORDERS FOR WAITER
# -----------------------------
@restaurant_bp.route('/orders/<int:restaurant_id>', methods=['GET'])
def get_orders(restaurant_id):

    orders = Order.query.filter_by(
        restaurant_id=restaurant_id
    ).order_by(Order.created_at.desc()).all()

    result = []

    for order in orders:

        order_items = []

        for item in order.items:

            menu = MenuItem.query.get(item.menu_item_id)

            order_items.append({
                "menu_item_id": item.menu_item_id,
                "name": menu.name if menu else "Unknown",
                "quantity": item.quantity,
                "price": item.price
            })

        result.append({
            "order_id": order.id,
            "table_number": order.table_number,
            "status": order.status,
            "total_amount": order.total_amount,
            "created_at": order.created_at.strftime("%d-%m-%Y %H:%M"),
            "items": order_items
        })

    return jsonify(result), 200


# -----------------------------
# UPDATE ORDER STATUS
# -----------------------------
@restaurant_bp.route('/order/<int:order_id>/status', methods=['PUT'])
def update_order_status(order_id):

    data = request.get_json()

    status = data.get("status")

    order = Order.query.get(order_id)

    if not order:
        return jsonify({
            "error": "Order not found"
        }), 404

    order.status = status

    db.session.commit()

    return jsonify({
        "message": "Order status updated",
        "status": status
    }), 200
# -----------------------------
# CUSTOMER ORDER HISTORY
# -----------------------------
@restaurant_bp.route('/customer-orders/<int:customer_id>', methods=['GET'])
def customer_orders(customer_id):

    orders = Order.query.filter_by(
        customer_id=customer_id
    ).order_by(Order.created_at.desc()).all()

    result = []

    for order in orders:

        order_items = []

        for item in order.items:

            menu = MenuItem.query.get(item.menu_item_id)

            order_items.append({
                "name": menu.name if menu else "Unknown",
                "quantity": item.quantity,
                "price": item.price
            })

        restaurant = Restaurant.query.get(order.restaurant_id)

        result.append({
              "order_id": order.id,
              "restaurant_id": order.restaurant_id,
              "restaurant_name": restaurant.name if restaurant else "Unknown Restaurant",
              "table_number": order.table_number,
              "status": order.status,
              "total_amount": order.total_amount,
              "created_at": order.created_at.strftime("%d-%m-%Y %H:%M"),
              "items": order_items
})
    return jsonify(result), 200