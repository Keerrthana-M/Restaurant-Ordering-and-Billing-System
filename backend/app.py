from dotenv import load_dotenv
load_dotenv()
from flask import Flask, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from config import Config
from models import db, User, Restaurant, MenuItem, RestaurantTable
from routes.auth import auth_bp
from routes.restaurant import restaurant_bp


def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    db.init_app(app)
    CORS(app)
    JWTManager(app)

    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(restaurant_bp, url_prefix='/api/restaurants')

    @app.route('/api/health', methods=['GET'])
    def health_check():
        return jsonify({'status': 'ok', 'message': 'FoodieXpress API is running'}), 200

    with app.app_context():
        # --- THE WORKAROUND: Forcefully wipe the database tables ---
        # -----------------------------------------------------------
        db.create_all()
        seed_data()

    return app


def seed_data():
    """Add starting restaurants, menu items, and accounts if database is empty."""
    if Restaurant.query.first():
        return  # already seeded, don't duplicate

    # 10 Authentic Chennai Restaurants
    r1 = Restaurant(name='Saravana Bhavan', address='Adyar, Chennai', area='Adyar', cuisine_type='South Indian', qr_code_token='qr-saravana-001')
    r2 = Restaurant(name='KFC', address='Anna Nagar, Chennai', area='Anna Nagar', cuisine_type='Fast Food', qr_code_token='qr-kfc-002')
    r3 = Restaurant(name='Murugan Idli Shop', address='T Nagar, Chennai', area='T Nagar', cuisine_type='South Indian', qr_code_token='qr-murugan-003')
    r4 = Restaurant(name='Buhari', address='Mount Road, Chennai', area='Mount Road', cuisine_type='Biryani', qr_code_token='qr-buhari-004')
    r5 = Restaurant(name='Toscano', address='Nungambakkam, Chennai', area='Nungambakkam', cuisine_type='Italian', qr_code_token='qr-toscano-005')
    r6 = Restaurant(name='Mainland China', address='Velachery, Chennai', area='Velachery', cuisine_type='Chinese', qr_code_token='qr-china-006')
    r7 = Restaurant(name='Burger King', address='OMR, Chennai', area='OMR', cuisine_type='Fast Food', qr_code_token='qr-bk-007')
    r8 = Restaurant(name='A2B - Adyar Ananda Bhavan', address='Mylapore, Chennai', area='Mylapore', cuisine_type='South Indian', qr_code_token='qr-a2b-008')
    r9 = Restaurant(name='Starbucks', address='Phoenix Mall, Chennai', area='Velachery', cuisine_type='Cafe', qr_code_token='qr-starbucks-009')
    r10 = Restaurant(name='Paradise Biryani', address='OMR, Chennai', area='OMR', cuisine_type='Biryani', qr_code_token='qr-paradise-010')

    db.session.add_all([r1, r2, r3, r4, r5, r6, r7, r8, r9, r10])
    db.session.commit()

    # -----------------------------
    # Create Restaurant Tables
    # -----------------------------
    restaurant_tables = [

        RestaurantTable(
            restaurant_id=r1.id,
            table_number=1,
            qr_code_token="saravana-table-1"
        ),

        RestaurantTable(
            restaurant_id=r1.id,
            table_number=2,
            qr_code_token="saravana-table-2"
        ),

        RestaurantTable(
            restaurant_id=r2.id,
            table_number=1,
            qr_code_token="kfc-table-1"
        ),

        RestaurantTable(
            restaurant_id=r2.id,
            table_number=2,
            qr_code_token="kfc-table-2"
        ),

        RestaurantTable(
            restaurant_id=r2.id,
            table_number=3,
            qr_code_token="kfc-table-3"
        ),

        RestaurantTable(
            restaurant_id=r3.id,
            table_number=1,
            qr_code_token="murugan-table-1"
        ),

        RestaurantTable(
            restaurant_id=r4.id,
            table_number=1,
            qr_code_token="buhari-table-1"
        ),

        RestaurantTable(
            restaurant_id=r5.id,
            table_number=1,
            qr_code_token="toscano-table-1"
        ),

        RestaurantTable(
            restaurant_id=r6.id,
            table_number=1,
            qr_code_token="china-table-1"
        ),

        RestaurantTable(
            restaurant_id=r7.id,
            table_number=1,
            qr_code_token="bk-table-1"
        ),
    ]

    db.session.add_all(restaurant_tables)
    db.session.commit()

    print("✅ Restaurant tables created")

    
    
    # Add at least one menu item for each so they aren't empty when clicked!
    menu_items = [

    # ===============================
    # Saravana Bhavan
    # ===============================

    MenuItem(
        restaurant_id=r1.id,
        name="Idli",
        category="Breakfast",
        price=40,
        description="Soft steamed idlis served with sambar and chutney.",
        image_url="https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=600&h=400&fit=crop"
    ),

    MenuItem(
        restaurant_id=r1.id,
        name="Mini Idli",
        category="Breakfast",
        price=60,
        description="Mini idlis soaked in hot sambar.",
        image_url="https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=600&h=400&fit=crop"
    ),

    MenuItem(
        restaurant_id=r1.id,
        name="Masala Dosa",
        category="Breakfast",
        price=90,
        description="Crispy dosa stuffed with potato masala.",
        image_url="https://images.unsplash.com/photo-1630383249896-424e482df921?w=600&h=400&fit=crop"
    ),

    MenuItem(
        restaurant_id=r1.id,
        name="Rava Dosa",
        category="Breakfast",
        price=100,
        description="Thin crispy rava dosa.",
        image_url="https://images.unsplash.com/photo-1630383249896-424e482df921?w=600&h=400&fit=crop"
    ),

    MenuItem(
        restaurant_id=r1.id,
        name="Pongal",
        category="Breakfast",
        price=80,
        description="Creamy pongal with ghee and pepper.",
        image_url="https://images.unsplash.com/photo-1617093727343-374698b1b08d?w=600&h=400&fit=crop"
    ),

    MenuItem(
        restaurant_id=r1.id,
        name="Medu Vada",
        category="Breakfast",
        price=35,
        description="Traditional crispy medu vada.",
        image_url="https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&h=400&fit=crop"
    ),

    MenuItem(
        restaurant_id=r1.id,
        name="Mini Meals",
        category="Main Course",
        price=180,
        description="Traditional South Indian mini meals.",
        image_url="https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=600&h=400&fit=crop"
    ),

    MenuItem(
        restaurant_id=r1.id,
        name="South Indian Meals",
        category="Main Course",
        price=220,
        description="Unlimited South Indian meals.",
        image_url="https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=600&h=400&fit=crop"
    ),

    MenuItem(
        restaurant_id=r1.id,
        name="Filter Coffee",
        category="Beverages",
        price=40,
        description="Authentic South Indian filter coffee.",
        image_url="https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&h=400&fit=crop"
    ),

    MenuItem(
        restaurant_id=r1.id,
        name="Badam Milk",
        category="Beverages",
        price=70,
        description="Refreshing chilled badam milk.",
        image_url="https://images.unsplash.com/photo-1551024709-8f23befc6cf7?w=600&h=400&fit=crop"
    ),

    # ===============================
    # KFC
    # ===============================

    MenuItem(
        restaurant_id=r2.id,
        name="Chicken Bucket",
        category="Main Course",
        price=350,
        description="8 pieces crispy fried chicken.",
        image_url="https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?w=600&h=400&fit=crop"
    ),

    MenuItem(
        restaurant_id=r2.id,
        name="Zinger Burger",
        category="Main Course",
        price=220,
        description="Crispy chicken burger with mayo.",
        image_url="https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&h=400&fit=crop"
    ),

    MenuItem(
        restaurant_id=r2.id,
        name="Hot & Crispy Chicken",
        category="Main Course",
        price=260,
        description="Original KFC Hot & Crispy Chicken.",
        image_url="https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?w=600&h=400&fit=crop"
    ),

    MenuItem(
        restaurant_id=r2.id,
        name="Chicken Wings",
        category="Starters",
        price=180,
        description="Spicy crispy chicken wings.",
        image_url="https://images.unsplash.com/photo-1608039755401-742074f0548d?w=600&h=400&fit=crop"
    ),

    MenuItem(
        restaurant_id=r2.id,
        name="Chicken Popcorn",
        category="Starters",
        price=170,
        description="Crunchy bite-sized chicken popcorn.",
        image_url="https://images.unsplash.com/photo-1562967916-eb82221dfb92?w=600&h=400&fit=crop"
    ),

    MenuItem(
        restaurant_id=r2.id,
        name="French Fries",
        category="Starters",
        price=120,
        description="Golden crispy French fries.",
        image_url="https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=600&h=400&fit=crop"
    ),

    MenuItem(
        restaurant_id=r2.id,
        name="Chocolate Sundae",
        category="Desserts",
        price=99,
        description="Creamy vanilla sundae with chocolate.",
        image_url="https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=600&h=400&fit=crop"
    ),

    MenuItem(
        restaurant_id=r2.id,
        name="Pepsi",
        category="Beverages",
        price=60,
        description="Chilled Pepsi.",
        image_url="https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=600&h=400&fit=crop"
    ),

    MenuItem(
        restaurant_id=r2.id,
        name="7UP",
        category="Beverages",
        price=60,
        description="Refreshing lemon drink.",
        image_url="https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=600&h=400&fit=crop"
    ),

    MenuItem(
        restaurant_id=r2.id,
        name="Veg Burger",
        category="Main Course",
        price=160,
        description="Delicious crispy veg burger.",
        image_url="https://images.unsplash.com/photo-1550547660-d9450f859349?w=600&h=400&fit=crop"
    ),
        # ===============================
    # Murugan Idli Shop
    # ===============================

    MenuItem(
        restaurant_id=r3.id,
        name="Idli",
        category="Breakfast",
        price=40,
        description="Soft steamed idlis with sambar and chutney.",
        image_url="https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=600&h=400&fit=crop"
    ),

    MenuItem(
        restaurant_id=r3.id,
        name="Ghee Pongal",
        category="Breakfast",
        price=85,
        description="Creamy pongal topped with pure ghee.",
        image_url="https://images.unsplash.com/photo-1617093727343-374698b1b08d?w=600&h=400&fit=crop"
    ),

    MenuItem(
        restaurant_id=r3.id,
        name="Poori Masala",
        category="Breakfast",
        price=95,
        description="Fluffy pooris served with potato masala.",
        image_url="https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&h=400&fit=crop"
    ),

    MenuItem(
        restaurant_id=r3.id,
        name="Onion Uttapam",
        category="Breakfast",
        price=110,
        description="Soft uttapam loaded with onions.",
        image_url="https://images.unsplash.com/photo-1630383249896-424e482df921?w=600&h=400&fit=crop"
    ),

    MenuItem(
        restaurant_id=r3.id,
        name="Rava Dosa",
        category="Breakfast",
        price=100,
        description="Golden crispy rava dosa.",
        image_url="https://images.unsplash.com/photo-1630383249896-424e482df921?w=600&h=400&fit=crop"
    ),

    MenuItem(
        restaurant_id=r3.id,
        name="Mini Idli",
        category="Breakfast",
        price=65,
        description="Mini idlis soaked in hot sambar.",
        image_url="https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=600&h=400&fit=crop"
    ),

    MenuItem(
        restaurant_id=r3.id,
        name="Medu Vada",
        category="Breakfast",
        price=40,
        description="Traditional crispy medu vada.",
        image_url="https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&h=400&fit=crop"
    ),

    MenuItem(
        restaurant_id=r3.id,
        name="Filter Coffee",
        category="Beverages",
        price=40,
        description="Fresh South Indian filter coffee.",
        image_url="https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&h=400&fit=crop"
    ),

    MenuItem(
        restaurant_id=r3.id,
        name="Jigarthanda",
        category="Beverages",
        price=90,
        description="Famous Madurai chilled drink.",
        image_url="https://images.unsplash.com/photo-1551024709-8f23befc6cf7?w=600&h=400&fit=crop"
    ),

    MenuItem(
        restaurant_id=r3.id,
        name="Kesari",
        category="Desserts",
        price=55,
        description="Traditional semolina sweet.",
        image_url="https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=600&h=400&fit=crop"
    ),

    # ===============================
    # Buhari
    # ===============================

    MenuItem(
        restaurant_id=r4.id,
        name="Chicken Biryani",
        category="Main Course",
        price=220,
        description="Authentic Buhari chicken biryani.",
        image_url="https://images.unsplash.com/photo-1633945274309-2c16f4a8b2c1?w=600&h=400&fit=crop"
    ),

    MenuItem(
        restaurant_id=r4.id,
        name="Mutton Biryani",
        category="Main Course",
        price=320,
        description="Traditional dum cooked mutton biryani.",
        image_url="https://images.unsplash.com/photo-1701579231349-7a1c89eacdd5?w=600&h=400&fit=crop"
    ),

    MenuItem(
        restaurant_id=r4.id,
        name="Veg Biryani",
        category="Main Course",
        price=180,
        description="Aromatic vegetable biryani.",
        image_url="https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=600&h=400&fit=crop"
    ),

    MenuItem(
        restaurant_id=r4.id,
        name="Chicken 65",
        category="Starters",
        price=180,
        description="Spicy South Indian fried chicken.",
        image_url="https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=600&h=400&fit=crop"
    ),

    MenuItem(
        restaurant_id=r4.id,
        name="Tandoori Chicken",
        category="Starters",
        price=280,
        description="Charcoal grilled tandoori chicken.",
        image_url="https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?w=600&h=400&fit=crop"
    ),

    MenuItem(
        restaurant_id=r4.id,
        name="Grill Chicken",
        category="Starters",
        price=320,
        description="Whole grilled spicy chicken.",
        image_url="https://images.unsplash.com/photo-1598515213692-5f252f75d785?w=600&h=400&fit=crop"
    ),

    MenuItem(
        restaurant_id=r4.id,
        name="Butter Naan",
        category="Breads",
        price=45,
        description="Soft butter naan.",
        image_url="https://images.unsplash.com/photo-1619535860434-cf9d6f0fd9a5?w=600&h=400&fit=crop"
    ),

    MenuItem(
        restaurant_id=r4.id,
        name="Butter Chicken",
        category="Main Course",
        price=260,
        description="Creamy butter chicken curry.",
        image_url="https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=600&h=400&fit=crop"
    ),

    MenuItem(
        restaurant_id=r4.id,
        name="Falooda",
        category="Desserts",
        price=120,
        description="Rose flavored falooda with ice cream.",
        image_url="https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=600&h=400&fit=crop"
    ),

    MenuItem(
        restaurant_id=r4.id,
        name="Lime Soda",
        category="Beverages",
        price=60,
        description="Fresh chilled lime soda.",
        image_url="https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=600&h=400&fit=crop"
    ),
        # ===============================
    # Toscano
    # ===============================

    MenuItem(
        restaurant_id=r5.id,
        name="Margherita Pizza",
        category="Main Course",
        price=450,
        description="Classic Italian pizza with mozzarella and basil.",
        image_url="https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&h=400&fit=crop"
    ),

    MenuItem(
        restaurant_id=r5.id,
        name="Farmhouse Pizza",
        category="Main Course",
        price=520,
        description="Loaded with fresh vegetables and cheese.",
        image_url="https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&h=400&fit=crop"
    ),

    MenuItem(
        restaurant_id=r5.id,
        name="Alfredo Pasta",
        category="Main Course",
        price=380,
        description="Creamy white sauce pasta.",
        image_url="https://images.unsplash.com/photo-1645112411341-6c4fd023882c?w=600&h=400&fit=crop"
    ),

    MenuItem(
        restaurant_id=r5.id,
        name="Arrabbiata Pasta",
        category="Main Course",
        price=360,
        description="Spicy tomato sauce pasta.",
        image_url="https://images.unsplash.com/photo-1645112411341-6c4fd023882c?w=600&h=400&fit=crop"
    ),

    MenuItem(
        restaurant_id=r5.id,
        name="Lasagna",
        category="Main Course",
        price=420,
        description="Layers of pasta with rich cheese filling.",
        image_url="https://images.unsplash.com/photo-1619895092538-128341789043?w=600&h=400&fit=crop"
    ),

    MenuItem(
        restaurant_id=r5.id,
        name="Garlic Bread",
        category="Starters",
        price=180,
        description="Toasted garlic bread with herbs.",
        image_url="https://images.unsplash.com/photo-1573140247632-f8fd74997d5c?w=600&h=400&fit=crop"
    ),

    MenuItem(
        restaurant_id=r5.id,
        name="Bruschetta",
        category="Starters",
        price=220,
        description="Italian bread topped with tomatoes and basil.",
        image_url="https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&h=400&fit=crop"
    ),

    MenuItem(
        restaurant_id=r5.id,
        name="Tiramisu",
        category="Desserts",
        price=250,
        description="Classic Italian coffee-flavored dessert.",
        image_url="https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=600&h=400&fit=crop"
    ),

    MenuItem(
        restaurant_id=r5.id,
        name="Chocolate Lava Cake",
        category="Desserts",
        price=230,
        description="Warm chocolate cake with molten center.",
        image_url="https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=600&h=400&fit=crop"
    ),

    MenuItem(
        restaurant_id=r5.id,
        name="Lemon Soda",
        category="Beverages",
        price=90,
        description="Fresh sparkling lemon soda.",
        image_url="https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=600&h=400&fit=crop"
    ),

    # ===============================
    # Mainland China
    # ===============================

    MenuItem(
        restaurant_id=r6.id,
        name="Hakka Noodles",
        category="Main Course",
        price=190,
        description="Stir-fried Hakka noodles.",
        image_url="https://images.unsplash.com/photo-1612929633738-8fe44f7ec841?w=600&h=400&fit=crop"
    ),

    MenuItem(
        restaurant_id=r6.id,
        name="Schezwan Noodles",
        category="Main Course",
        price=220,
        description="Spicy Schezwan noodles.",
        image_url="https://images.unsplash.com/photo-1612929633738-8fe44f7ec841?w=600&h=400&fit=crop"
    ),

    MenuItem(
        restaurant_id=r6.id,
        name="Fried Rice",
        category="Main Course",
        price=210,
        description="Chinese style vegetable fried rice.",
        image_url="https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=600&h=400&fit=crop"
    ),

    MenuItem(
        restaurant_id=r6.id,
        name="Triple Schezwan Rice",
        category="Main Course",
        price=260,
        description="Popular Indo-Chinese combo rice.",
        image_url="https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=600&h=400&fit=crop"
    ),

    MenuItem(
        restaurant_id=r6.id,
        name="Chicken Manchurian",
        category="Starters",
        price=240,
        description="Chicken tossed in spicy Manchurian sauce.",
        image_url="https://images.unsplash.com/photo-1626804475297-41608ea09aeb?w=600&h=400&fit=crop"
    ),

    MenuItem(
        restaurant_id=r6.id,
        name="Gobi Manchurian",
        category="Starters",
        price=180,
        description="Crispy cauliflower Manchurian.",
        image_url="https://images.unsplash.com/photo-1626804475297-41608ea09aeb?w=600&h=400&fit=crop"
    ),

    MenuItem(
        restaurant_id=r6.id,
        name="Spring Rolls",
        category="Starters",
        price=170,
        description="Crunchy vegetable spring rolls.",
        image_url="https://images.unsplash.com/photo-1603360946369-dc9bb6258143?w=600&h=400&fit=crop"
    ),

    MenuItem(
        restaurant_id=r6.id,
        name="Veg Momos",
        category="Starters",
        price=160,
        description="Steamed vegetable momos.",
        image_url="https://images.unsplash.com/photo-1626776876729-bab4369a5a5d?w=600&h=400&fit=crop"
    ),

    MenuItem(
        restaurant_id=r6.id,
        name="Green Tea",
        category="Beverages",
        price=90,
        description="Refreshing hot green tea.",
        image_url="https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&h=400&fit=crop"
    ),

    MenuItem(
        restaurant_id=r6.id,
        name="Honey Chilli Potato",
        category="Starters",
        price=190,
        description="Crispy potatoes tossed in honey chilli sauce.",
        image_url="https://images.unsplash.com/photo-1515003197210-e0cd71810b5f?w=600&h=400&fit=crop"
    ),
        # ===============================
    # Burger King
    # ===============================

    MenuItem(
        restaurant_id=r7.id,
        name="Whopper",
        category="Main Course",
        price=199,
        description="Signature flame-grilled Whopper burger.",
        image_url="https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&h=400&fit=crop"
    ),

    MenuItem(
        restaurant_id=r7.id,
        name="Veg Whopper",
        category="Main Course",
        price=179,
        description="Flame-grilled veg burger with fresh vegetables.",
        image_url="https://images.unsplash.com/photo-1550547660-d9450f859349?w=600&h=400&fit=crop"
    ),

    MenuItem(
        restaurant_id=r7.id,
        name="Crispy Chicken Burger",
        category="Main Course",
        price=189,
        description="Crunchy chicken burger with spicy sauce.",
        image_url="https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&h=400&fit=crop"
    ),

    MenuItem(
        restaurant_id=r7.id,
        name="Veg Burger",
        category="Main Course",
        price=149,
        description="Classic vegetarian burger.",
        image_url="https://images.unsplash.com/photo-1550547660-d9450f859349?w=600&h=400&fit=crop"
    ),

    MenuItem(
        restaurant_id=r7.id,
        name="French Fries",
        category="Starters",
        price=99,
        description="Golden crispy fries.",
        image_url="https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=600&h=400&fit=crop"
    ),

    MenuItem(
        restaurant_id=r7.id,
        name="Onion Rings",
        category="Starters",
        price=129,
        description="Crunchy onion rings.",
        image_url="https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=600&h=400&fit=crop"
    ),

    MenuItem(
        restaurant_id=r7.id,
        name="Chicken Nuggets",
        category="Starters",
        price=169,
        description="Crispy chicken nuggets.",
        image_url="https://images.unsplash.com/photo-1562967916-eb82221dfb92?w=600&h=400&fit=crop"
    ),

    MenuItem(
        restaurant_id=r7.id,
        name="Chocolate Shake",
        category="Beverages",
        price=149,
        description="Rich chocolate milkshake.",
        image_url="https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=600&h=400&fit=crop"
    ),

    MenuItem(
        restaurant_id=r7.id,
        name="Coke",
        category="Beverages",
        price=60,
        description="Chilled Coca-Cola.",
        image_url="https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=600&h=400&fit=crop"
    ),

    MenuItem(
        restaurant_id=r7.id,
        name="Brownie Sundae",
        category="Desserts",
        price=159,
        description="Brownie topped with vanilla ice cream.",
        image_url="https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=600&h=400&fit=crop"
    ),

    # ===============================
    # A2B - Adyar Ananda Bhavan
    # ===============================

    MenuItem(
        restaurant_id=r8.id,
        name="Idli",
        category="Breakfast",
        price=40,
        description="Soft idlis served with sambar.",
        image_url="https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=600&h=400&fit=crop"
    ),

    MenuItem(
        restaurant_id=r8.id,
        name="Masala Dosa",
        category="Breakfast",
        price=90,
        description="Crispy masala dosa.",
        image_url="https://images.unsplash.com/photo-1630383249896-424e482df921?w=600&h=400&fit=crop"
    ),

    MenuItem(
        restaurant_id=r8.id,
        name="Pongal",
        category="Breakfast",
        price=80,
        description="Traditional ghee pongal.",
        image_url="https://images.unsplash.com/photo-1617093727343-374698b1b08d?w=600&h=400&fit=crop"
    ),

    MenuItem(
        restaurant_id=r8.id,
        name="Poori",
        category="Breakfast",
        price=85,
        description="Poori served with potato masala.",
        image_url="https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&h=400&fit=crop"
    ),

    MenuItem(
        restaurant_id=r8.id,
        name="Samosa",
        category="Starters",
        price=30,
        description="Hot crispy vegetable samosa.",
        image_url="https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&h=400&fit=crop"
    ),

    MenuItem(
        restaurant_id=r8.id,
        name="Bonda",
        category="Starters",
        price=35,
        description="Golden fried potato bonda.",
        image_url="https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&h=400&fit=crop"
    ),

    MenuItem(
        restaurant_id=r8.id,
        name="Gulab Jamun",
        category="Desserts",
        price=70,
        description="Soft gulab jamuns in sugar syrup.",
        image_url="https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=600&h=400&fit=crop"
    ),

    MenuItem(
        restaurant_id=r8.id,
        name="Mysore Pak",
        category="Desserts",
        price=90,
        description="Traditional South Indian sweet.",
        image_url="https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=600&h=400&fit=crop"
    ),

    MenuItem(
        restaurant_id=r8.id,
        name="Filter Coffee",
        category="Beverages",
        price=35,
        description="Authentic filter coffee.",
        image_url="https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&h=400&fit=crop"
    ),

    MenuItem(
        restaurant_id=r8.id,
        name="Badam Milk",
        category="Beverages",
        price=65,
        description="Refreshing chilled badam milk.",
        image_url="https://images.unsplash.com/photo-1551024709-8f23befc6cf7?w=600&h=400&fit=crop"
    ),
        # ===============================
    # Starbucks
    # ===============================

    MenuItem(
        restaurant_id=r9.id,
        name="Cappuccino",
        category="Beverages",
        price=220,
        description="Freshly brewed espresso with steamed milk foam.",
        image_url="https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=600&h=400&fit=crop"
    ),

    MenuItem(
        restaurant_id=r9.id,
        name="Cafe Latte",
        category="Beverages",
        price=240,
        description="Smooth espresso blended with steamed milk.",
        image_url="https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&h=400&fit=crop"
    ),

    MenuItem(
        restaurant_id=r9.id,
        name="Espresso",
        category="Beverages",
        price=180,
        description="Rich and bold espresso shot.",
        image_url="https://images.unsplash.com/photo-1511920170033-f8396924c348?w=600&h=400&fit=crop"
    ),

    MenuItem(
        restaurant_id=r9.id,
        name="Cold Coffee",
        category="Beverages",
        price=250,
        description="Chilled coffee blended with ice cream.",
        image_url="https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=600&h=400&fit=crop"
    ),

    MenuItem(
        restaurant_id=r9.id,
        name="Caramel Frappuccino",
        category="Beverages",
        price=320,
        description="Creamy caramel frappuccino with whipped cream.",
        image_url="https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=600&h=400&fit=crop"
    ),

    MenuItem(
        restaurant_id=r9.id,
        name="Mocha",
        category="Beverages",
        price=280,
        description="Chocolate flavored espresso coffee.",
        image_url="https://images.unsplash.com/photo-1497636577773-f1231844b336?w=600&h=400&fit=crop"
    ),

    MenuItem(
        restaurant_id=r9.id,
        name="Brownie",
        category="Desserts",
        price=180,
        description="Chocolate brownie served warm.",
        image_url="https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=600&h=400&fit=crop"
    ),

    MenuItem(
        restaurant_id=r9.id,
        name="Blueberry Muffin",
        category="Desserts",
        price=170,
        description="Soft muffin filled with blueberries.",
        image_url="https://images.unsplash.com/photo-1607958996333-41aef7caefaa?w=600&h=400&fit=crop"
    ),

    MenuItem(
        restaurant_id=r9.id,
        name="Veg Sandwich",
        category="Main Course",
        price=190,
        description="Grilled vegetable sandwich.",
        image_url="https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=600&h=400&fit=crop"
    ),

    MenuItem(
        restaurant_id=r9.id,
        name="Cheese Croissant",
        category="Desserts",
        price=160,
        description="Buttery croissant with cheese filling.",
        image_url="https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&h=400&fit=crop"
    ),

    # ===============================
    # Paradise Biryani
    # ===============================

    MenuItem(
        restaurant_id=r10.id,
        name="Chicken Biryani",
        category="Main Course",
        price=260,
        description="Authentic Hyderabadi chicken biryani.",
        image_url="https://images.unsplash.com/photo-1633945274309-2c16f4a8b2c1?w=600&h=400&fit=crop"
    ),

    MenuItem(
        restaurant_id=r10.id,
        name="Mutton Biryani",
        category="Main Course",
        price=340,
        description="Traditional dum-cooked mutton biryani.",
        image_url="https://images.unsplash.com/photo-1701579231349-7a1c89eacdd5?w=600&h=400&fit=crop"
    ),

    MenuItem(
        restaurant_id=r10.id,
        name="Paneer Biryani",
        category="Main Course",
        price=230,
        description="Flavorful paneer dum biryani.",
        image_url="https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=600&h=400&fit=crop"
    ),

    MenuItem(
        restaurant_id=r10.id,
        name="Chicken 65",
        category="Starters",
        price=190,
        description="Spicy fried chicken pieces.",
        image_url="https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=600&h=400&fit=crop"
    ),

    MenuItem(
        restaurant_id=r10.id,
        name="Chicken Kebab",
        category="Starters",
        price=240,
        description="Juicy grilled chicken kebabs.",
        image_url="https://images.unsplash.com/photo-1544025162-d76694265947?w=600&h=400&fit=crop"
    ),

    MenuItem(
        restaurant_id=r10.id,
        name="Butter Naan",
        category="Breads",
        price=45,
        description="Fresh butter naan.",
        image_url="https://images.unsplash.com/photo-1619535860434-cf9d6f0fd9a5?w=600&h=400&fit=crop"
    ),

    MenuItem(
        restaurant_id=r10.id,
        name="Butter Chicken",
        category="Main Course",
        price=290,
        description="Creamy butter chicken curry.",
        image_url="https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=600&h=400&fit=crop"
    ),

    MenuItem(
        restaurant_id=r10.id,
        name="Double Ka Meetha",
        category="Desserts",
        price=120,
        description="Traditional Hyderabadi bread pudding.",
        image_url="https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=600&h=400&fit=crop"
    ),

    MenuItem(
        restaurant_id=r10.id,
        name="Qubani Ka Meetha",
        category="Desserts",
        price=140,
        description="Apricot dessert with cream.",
        image_url="https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=600&h=400&fit=crop"
    ),

    MenuItem(
        restaurant_id=r10.id,
        name="Sweet Lassi",
        category="Beverages",
        price=90,
        description="Refreshing sweet lassi.",
        image_url="https://images.unsplash.com/photo-1551024709-8f23befc6cf7?w=600&h=400&fit=crop"
    ),

]
    db.session.add_all(menu_items)
    db.session.commit()

    print('✅ Seed data added: 10 restaurants, 100 menu items')

    # -----------------------------------------------------------------------
    # FALLBACK SUPERUSER ADMIN — FOR DEVELOPMENT AND TESTING ONLY
    # This account is NOT exposed in the UI for production use.
    # Real restaurant owners register via /register-restaurant.
    # This seeded admin has no linked restaurant_id (can see all in future).
    # -----------------------------------------------------------------------
    from werkzeug.security import generate_password_hash
    admin = User(
        email='admin@foodiexpress.com',
        name='Platform Admin',
        role='admin',
        password_hash=generate_password_hash('admin123')
    )

    waiter1 = User(
    waiter_code='WAITER-001',
    role='waiter',
    restaurant_id=r2.id)

    db.session.add_all([admin, waiter1])
    db.session.commit()

    print('✅ Seed accounts added: admin (hashed password), waiter')


if __name__ == '__main__':
    app = create_app()
    app.run(debug=True, port=5000)