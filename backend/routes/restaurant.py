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
            'opening_hours': r.opening_hours,
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
        'qr_code_token': restaurant.qr_code_token,
        'contact_number': restaurant.contact_number,
        'description': restaurant.description,
        'opening_hours': restaurant.opening_hours,
        'logo': restaurant.logo
    }), 200


# -----------------------------
# GET RESTAURANT USING QR TOKEN
# -----------------------------
@restaurant_bp.route('/qr/<string:token>', methods=['GET'])
def get_restaurant_by_qr(token):
    restaurant = Restaurant.query.filter_by(qr_code_token=token).first()

    if not restaurant:
        return jsonify({
            "error": "Invalid QR code"
        }), 404

    return jsonify({
        "restaurant_id": restaurant.id,
        "restaurant_name": restaurant.name,
        "area": restaurant.area,
        "cuisine_type": restaurant.cuisine_type
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
    order_type = data.get('order_type', 'dine_in')
    raw_table_number = data.get('table_number')
    if order_type == 'dine_in' and raw_table_number is not None and str(raw_table_number).strip() != '':
        try:
            table_number = int(raw_table_number)
        except (ValueError, TypeError):
            table_number = None
    else:
        table_number = None
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
            "order_type": order.order_type,
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
              "order_type": order.order_type,
              "status": order.status,
              "total_amount": order.total_amount,
              "created_at": order.created_at.strftime("%d-%m-%Y %H:%M"),
              "items": order_items
        })
    return jsonify(result), 200

# -----------------------------
# ADMIN STATS
# -----------------------------
from datetime import datetime, timedelta
from collections import defaultdict

@restaurant_bp.route('/admin-stats/<int:restaurant_id>', methods=['GET'])
def admin_stats(restaurant_id):
    orders = Order.query.filter_by(restaurant_id=restaurant_id).all()
    
    now = datetime.utcnow()
    today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
    week_start = today_start - timedelta(days=now.weekday())
    month_start = today_start.replace(day=1)
    
    todays_revenue = 0
    weekly_revenue = 0
    monthly_revenue = 0
    total_revenue = 0
    
    total_orders = len(orders)
    pending_orders = 0
    delivered_orders = 0
    
    recent_orders = []
    
    item_sales = defaultdict(int)
    item_names = {}
    category_sales = defaultdict(float)
    hour_counts = defaultdict(int)
    
    # Sort orders by created_at descending
    orders.sort(key=lambda x: x.created_at, reverse=True)
    
    for idx, order in enumerate(orders):
        if order.status == 'pending':
            pending_orders += 1
        elif order.status == 'delivered':
            delivered_orders += 1
            
        amt = order.total_amount
        total_revenue += amt
        
        if order.created_at >= today_start:
            todays_revenue += amt
        if order.created_at >= week_start:
            weekly_revenue += amt
        if order.created_at >= month_start:
            monthly_revenue += amt
            
        hour = order.created_at.hour
        hour_counts[hour] += 1
            
        for item in order.items:
            menu_item = MenuItem.query.get(item.menu_item_id)
            if menu_item:
                item_sales[item.menu_item_id] += item.quantity
                item_names[item.menu_item_id] = menu_item.name
                category_sales[menu_item.category or 'Uncategorized'] += (item.price * item.quantity)
            
        if idx < 5:
            restaurant = Restaurant.query.get(order.restaurant_id)
            recent_orders.append({
                "id": f"ORD-{order.id:03d}",
                "table": order.table_number,
                "restaurant": restaurant.name if restaurant else "Unknown",
                "total": amt,
                "status": order.status.capitalize()
            })
            
    avg_order_value = total_revenue / total_orders if total_orders > 0 else 0
    
    top_items = []
    sorted_items = sorted(item_sales.items(), key=lambda x: x[1], reverse=True)[:5]
    for k, v in sorted_items:
        top_items.append({"name": item_names[k], "sold": v})
        
    cat_sales_list = []
    for k, v in category_sales.items():
        cat_sales_list.append({"name": k, "value": v})
        
    peak_hour = max(hour_counts, key=hour_counts.get) if hour_counts else None
    peak_time_str = f"{peak_hour:02d}:00 - {(peak_hour+1):02d}:00" if peak_hour is not None else "N/A"
    
    return jsonify({
        "todays_revenue": todays_revenue,
        "weekly_revenue": weekly_revenue,
        "monthly_revenue": monthly_revenue,
        "total_orders": total_orders,
        "pending_orders": pending_orders,
        "delivered_orders": delivered_orders,
        "average_order_value": round(avg_order_value, 2),
        "recent_orders": recent_orders,
        "top_items": top_items,
        "category_sales": cat_sales_list,
        "peak_time": peak_time_str
    }), 200

# -----------------------------
# ADMIN MENU MANAGEMENT
# -----------------------------

@restaurant_bp.route('/admin-menu/<int:restaurant_id>', methods=['GET'])
def admin_get_menu(restaurant_id):
    menu_items = MenuItem.query.filter_by(restaurant_id=restaurant_id).all()
    result = []
    for item in menu_items:
        result.append({
            'id': item.id,
            'name': item.name,
            'category': item.category,
            'price': item.price,
            'description': item.description,
            'image_url': item.image_url,
            'is_available': item.is_available
        })
    return jsonify(result), 200

@restaurant_bp.route('/admin-menu/<int:restaurant_id>', methods=['POST'])
def admin_add_menu_item(restaurant_id):
    data = request.get_json()
    
    new_item = MenuItem(
        restaurant_id=restaurant_id,
        name=data.get('name'),
        category=data.get('category'),
        price=data.get('price'),
        description=data.get('description'),
        image_url=data.get('image_url'),
        is_available=data.get('is_available', True)
    )
    
    db.session.add(new_item)
    db.session.commit()
    
    return jsonify({'message': 'Menu item added successfully', 'id': new_item.id}), 201

@restaurant_bp.route('/admin-menu/<int:item_id>', methods=['PUT'])
def admin_update_menu_item(item_id):
    data = request.get_json()
    item = MenuItem.query.get(item_id)
    
    if not item:
        return jsonify({'error': 'Menu item not found'}), 404
        
    item.name = data.get('name', item.name)
    item.category = data.get('category', item.category)
    item.price = data.get('price', item.price)
    item.description = data.get('description', item.description)
    item.image_url = data.get('image_url', item.image_url)
    
    if 'is_available' in data:
        item.is_available = data.get('is_available')
        
    db.session.commit()
    return jsonify({'message': 'Menu item updated successfully'}), 200

@restaurant_bp.route('/admin-menu/<int:item_id>', methods=['DELETE'])
def admin_delete_menu_item(item_id):
    item = MenuItem.query.get(item_id)
    if not item:
        return jsonify({'error': 'Menu item not found'}), 404
        
    db.session.delete(item)
    db.session.commit()
    return jsonify({'message': 'Menu item deleted successfully'}), 200

# -----------------------------
# ADMIN WAITER MANAGEMENT
# -----------------------------
import random
import string

def generate_waiter_code():
    chars = string.ascii_uppercase + string.digits
    return 'W-' + ''.join(random.choice(chars) for _ in range(6))

from models import User

@restaurant_bp.route('/admin-waiters/<int:restaurant_id>', methods=['GET'])
def admin_get_waiters(restaurant_id):
    waiters = User.query.filter(
        User.restaurant_id == restaurant_id,
        User.role.in_(['waiter', 'disabled_waiter'])
    ).all()
    
    result = []
    for w in waiters:
        result.append({
            'id': w.id,
            'name': w.name,
            'waiter_code': w.waiter_code,
            'is_active': w.role == 'waiter',
            'created_at': w.created_at.strftime("%d-%m-%Y %H:%M") if w.created_at else None
        })
    return jsonify(result), 200

@restaurant_bp.route('/admin-waiters/<int:restaurant_id>', methods=['POST'])
def admin_add_waiter(restaurant_id):
    data = request.get_json()
    name = data.get('name')
    
    if not name:
        return jsonify({'error': 'Name is required'}), 400
        
    code = generate_waiter_code()
    # Ensure uniqueness
    while User.query.filter_by(waiter_code=code).first():
        code = generate_waiter_code()
        
    new_waiter = User(
        name=name,
        role='waiter',
        waiter_code=code,
        restaurant_id=restaurant_id
    )
    
    db.session.add(new_waiter)
    db.session.commit()
    
    return jsonify({
        'message': 'Waiter added successfully', 
        'waiter': {
            'id': new_waiter.id,
            'name': new_waiter.name,
            'waiter_code': new_waiter.waiter_code,
            'is_active': True
        }
    }), 201

@restaurant_bp.route('/admin-waiters/<int:waiter_id>', methods=['PUT'])
def admin_update_waiter(waiter_id):
    data = request.get_json()
    waiter = User.query.get(waiter_id)
    
    if not waiter or waiter.role not in ['waiter', 'disabled_waiter']:
        return jsonify({'error': 'Waiter not found'}), 404
        
    if 'is_active' in data:
        is_active = data.get('is_active')
        waiter.role = 'waiter' if is_active else 'disabled_waiter'
        
    if data.get('regenerate_code'):
        code = generate_waiter_code()
        while User.query.filter_by(waiter_code=code).first():
            code = generate_waiter_code()
        waiter.waiter_code = code
        
    if 'name' in data:
        waiter.name = data.get('name')
        
    db.session.commit()
    return jsonify({'message': 'Waiter updated successfully', 'waiter_code': waiter.waiter_code}), 200

@restaurant_bp.route('/admin-waiters/<int:waiter_id>', methods=['DELETE'])
def admin_delete_waiter(waiter_id):
    waiter = User.query.get(waiter_id)
    
    if not waiter or waiter.role not in ['waiter', 'disabled_waiter']:
        return jsonify({'error': 'Waiter not found'}), 404
        
    db.session.delete(waiter)
    db.session.commit()
    return jsonify({'message': 'Waiter deleted successfully'}), 200

# -----------------------------
# ADMIN RESTAURANT PROFILE
# -----------------------------
@restaurant_bp.route('/admin-profile/<int:restaurant_id>', methods=['PUT'])
def admin_update_profile(restaurant_id):
    data = request.get_json()
    restaurant = Restaurant.query.get(restaurant_id)
    
    if not restaurant:
        return jsonify({'error': 'Restaurant not found'}), 404
        
    restaurant.name = data.get('name', restaurant.name)
    restaurant.address = data.get('address', restaurant.address)
    restaurant.contact_number = data.get('contact_number', restaurant.contact_number)
    restaurant.description = data.get('description', restaurant.description)
    restaurant.opening_hours = data.get('opening_hours', restaurant.opening_hours)
    restaurant.logo = data.get('logo', restaurant.logo)
    
    db.session.commit()
    return jsonify({'message': 'Profile updated successfully'}), 200