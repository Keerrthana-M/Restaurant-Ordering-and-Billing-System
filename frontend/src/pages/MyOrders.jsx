import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";

const statusColor = {
  pending: "warning",
  preparing: "info",
  ready: "success",
  delivered: "secondary",
};

const MyOrders = () => {

  const [orders, setOrders] = useState([]);

  const user = JSON.parse(localStorage.getItem("user"));

  const loadOrders = async () => {

    try {

      const res = await fetch(
        `http://127.0.0.1:5000/api/restaurants/customer-orders/${user.id}`
      );

      const data = await res.json();

      console.log("Customer:", user);
      console.log("Orders:", data);

      setOrders(data);

    } catch (err) {
      console.log(err);
    }

  };

  useEffect(() => {

    loadOrders();

    const interval = setInterval(loadOrders, 5000);

    return () => clearInterval(interval);

  }, []);
  const statusSteps = [
  "pending",
  "preparing",
  "ready",
  "delivered"
];

const getStepStatus = (currentStatus, step) => {
  return statusSteps.indexOf(step) <= statusSteps.indexOf(currentStatus);
};

  return (

    <div className="page-body">

      <Navbar />

      <div className="container py-4">

        <h2 className="top-bar-title">
          My Orders
        </h2>

        <p className="top-bar-sub mb-4">
          Track your order status
        </p>

        {orders.map(order => (

          <div
            key={order.order_id}
            className="glass-card mb-4 p-4"
          >

            <div className="d-flex justify-content-between">

              <div>

                <div className="mb-3">

  <h5 className="restaurant-card-title mb-1">
    🍽 {order.restaurant_name}
  </h5>

  <h6 className="text-warning">
    Order #{order.order_id}
  </h6>

</div>

               <div className="text-secondary small">

  <div>
    🪑 Table {order.table_number}
  </div>

  <div>
    📅 {order.created_at}
  </div>

</div> 

              </div>

              <span
  className="badge-pill gold"
>
  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
</span>

            </div>

            <hr/>

            {order.items.map((item,index)=>(

              <div
                key={index}
                className="d-flex justify-content-between mb-2"
              >

                <span>

                  {item.name} × {item.quantity}

                </span>

                <span>

                  ₹{item.price*item.quantity}

                </span>

              </div>

            ))}
         <hr />

<h6 className="mt-4 mb-3">
  Order Progress
</h6>

<div className="timeline">

  {statusSteps.map((step, index) => {

    const active = getStepStatus(order.status, step);

    return (

      <div
        key={step}
        className="d-flex align-items-start mb-3"
      >

        <div className="d-flex flex-column align-items-center">

          <div
            style={{
              width: "28px",
              height: "28px",
              borderRadius: "50%",
              background: active ? "#ffc107" : "#2d3748",
              color: active ? "#000" : "#888",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: "bold"
            }}
          >
            {active ? "✓" : ""}
          </div>

          {index !== statusSteps.length - 1 && (
            <div
              style={{
                width: "3px",
                height: "30px",
                background: active ? "#ffc107" : "#2d3748"
              }}
            />
          )}

        </div>

        <div className="ms-3">

          <div
            className={`fw-bold ${
              active ? "text-warning" : "text-secondary"
            }`}
          >
            {step.charAt(0).toUpperCase() + step.slice(1)}
          </div>

        </div>

      </div>

    );

  })}

</div>
            

          </div>

        ))}

      </div>

    </div>

  );

};

export default MyOrders;