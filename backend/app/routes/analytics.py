from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required
from sqlalchemy import func, cast, Date
from datetime import datetime, timedelta
from app import db
from app.models.order import Order
from app.models.order_item import OrderItem
from app.models.menu_item import MenuItem
from app.models.bill import Bill
from app.routes.helpers import admin_required

analytics_bp = Blueprint('analytics', __name__)


# TODAY'S REVENUE VS YESTERDAY
@analytics_bp.route('/analytics/revenue', methods=['GET'])
@jwt_required()
@admin_required
def revenue_comparison():
    today = datetime.utcnow().date()
    yesterday = today - timedelta(days=1)

    def get_revenue(date):
        result = db.session.query(
            func.sum(Bill.grand_total)
        ).join(Order).filter(
            cast(Bill.billed_at, Date) == date,
            Bill.status == 'paid'
        ).scalar()
        return float(result or 0)

    return jsonify({
        "today": get_revenue(today),
        "yesterday": get_revenue(yesterday)
    }), 200


# TOP 5 BEST-SELLING ITEMS
@analytics_bp.route('/analytics/best-sellers', methods=['GET'])
@jwt_required()
@admin_required
def best_sellers():
    results = db.session.query(
        MenuItem.name,
        func.sum(OrderItem.quantity).label('total_quantity')
    ).join(OrderItem).group_by(MenuItem.id).order_by(
        func.sum(OrderItem.quantity).desc()
    ).limit(5).all()

    return jsonify([{
        "name": r.name,
        "total_quantity": int(r.total_quantity)
    } for r in results]), 200


# ORDER TYPE DISTRIBUTION (dine-in vs takeaway)
@analytics_bp.route('/analytics/order-types', methods=['GET'])
@jwt_required()
@admin_required
def order_type_distribution():
    results = db.session.query(
        Order.order_type,
        func.count(Order.id).label('count')
    ).group_by(Order.order_type).all()

    return jsonify([{
        "order_type": r.order_type,
        "count": r.count
    } for r in results]), 200


# REVENUE TREND — last 30 days
@analytics_bp.route('/analytics/revenue-trend', methods=['GET'])
@jwt_required()
@admin_required
def revenue_trend():
    thirty_days_ago = datetime.utcnow().date() - timedelta(days=30)

    results = db.session.query(
        cast(Bill.billed_at, Date).label('date'),
        func.sum(Bill.grand_total).label('revenue')
    ).filter(
        cast(Bill.billed_at, Date) >= thirty_days_ago,
        Bill.status == 'paid'
    ).group_by(
        cast(Bill.billed_at, Date)
    ).order_by(
        cast(Bill.billed_at, Date)
    ).all()

    return jsonify([{
        "date": str(r.date),
        "revenue": float(r.revenue)
    } for r in results]), 200