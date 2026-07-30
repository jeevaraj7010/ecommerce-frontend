import { useEffect, useState, useMemo } from "react";
import axios from "axios";

function Dashboard() {
  const [data, setData] = useState({});
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [customizations, setCustomizations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");

    Promise.all([
      axios.get("https://ecommerce-backend-1-tsra.onrender.com/api/admin/overview", {
        headers: { Authorization: `Bearer ${token}` },
      }).catch(() => ({ data: {} })),
      axios.get("https://ecommerce-backend-1-tsra.onrender.com/api/products").catch(() => ({ data: [] })),
      axios.get("https://ecommerce-backend-1-tsra.onrender.com/api/orders/all", {
        headers: { Authorization: `Bearer ${token}` },
      }).catch(() => ({ data: [] })),
      axios.get("https://ecommerce-backend-1-tsra.onrender.com/api/admin/customizations", {
        headers: { Authorization: `Bearer ${token}` },
      }).catch(() => ({ data: [] })),
    ]).then(([overviewRes, prodRes, ordersRes, custRes]) => {
      setData(overviewRes.data || {});

      const prodList = Array.isArray(prodRes.data) ? prodRes.data : prodRes.data.content || [];
      const orderList = Array.isArray(ordersRes.data) ? ordersRes.data : ordersRes.data.content || [];
      const custList = Array.isArray(custRes.data) ? custRes.data : [];

      setProducts(prodList);
      setOrders(orderList);
      setCustomizations(custList);
      setLoading(false);
    });
  }, []);

  // Calculate 13 Analytics Metrics
  const totalUsers = data.users || 0;
  const totalProducts = data.products || products.length || 0;
  const totalOrders = data.orders || orders.length || 0;
  const totalRevenue = data.revenue || orders.reduce((sum, o) => sum + (o.totalPrice || 0), 0);

  const pendingOrders = orders.filter((o) => {
    const st = (o.status || "").toUpperCase();
    return st === "PLACED" || st === "PENDING" || st === "PRINTING STARTED" || st === "QUALITY CHECK";
  }).length;

  const customOrders = customizations.length || orders.filter((o) => Boolean(o.designImageUrl || o.customText)).length;
  const lowStockProducts = products.filter((p) => p.quantity > 0 && p.quantity <= 5);
  const outOfStockProducts = products.filter((p) => p.quantity <= 0);
  const recentlyAddedProductsCount = products.length;

  // Calculate Top Selling Products (Aggregated by Product Name from Orders)
  const topSellingProducts = useMemo(() => {
    const salesMap = {};
    orders.forEach((o) => {
      const name = o.productName || "Apparel";
      salesMap[name] = (salesMap[name] || 0) + (o.quantity || 1);
    });
    return Object.entries(salesMap)
      .map(([name, sales]) => {
        const prodMatch = products.find((p) => p.name === name);
        return { name, sales, category: prodMatch?.category || "Apparel" };
      })
      .sort((a, b) => b.sales - a.sales)
      .slice(0, 5);
  }, [orders, products]);

  // Calculate Today's Revenue
  const todayRevenue = useMemo(() => {
    const todayStr = new Date().toISOString().split("T")[0];
    return orders
      .filter((o) => o.orderDate && o.orderDate.startsWith(todayStr))
      .reduce((sum, o) => sum + (o.totalPrice || 0), 0);
  }, [orders]);

  // Recent 5 Orders
  const recentOrders = useMemo(() => {
    return [...orders].reverse().slice(0, 5);
  }, [orders]);

  const recentOrdersCount = recentOrders.length;

  // Pending Custom Orders
  const pendingCustomOrders = customizations.filter((c) => {
    const st = (c.status || "").toUpperCase();
    return st === "PENDING" || st === "PLACED" || st === "PRINTING STARTED";
  }).length;

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-dark" role="status">
          <span className="visually-hidden">Loading admin dashboard...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid py-3">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-extrabold text-dark m-0" style={{ letterSpacing: "-0.5px" }}>
            Admin Store Control Center 📊
          </h2>
          <p className="text-muted small m-0">Live revenue metrics, sales analytics, & order processing</p>
        </div>
      </div>

      {/* 📊 13 PREMIUM ANALYTICS CARDS GRID */}
      <div className="row g-3 mb-4">
        <div className="col-6 col-md-4 col-lg-3">
          <div className="card border-0 shadow-sm p-3 rounded-4 bg-white h-100">
            <span className="text-muted small fw-bold d-block mb-1">TOTAL USERS</span>
            <h3 className="fw-extrabold text-dark m-0">{totalUsers}</h3>
            <small className="text-success mt-1 d-block">👤 Registered Accounts</small>
          </div>
        </div>

        <div className="col-6 col-md-4 col-lg-3">
          <div className="card border-0 shadow-sm p-3 rounded-4 bg-white h-100">
            <span className="text-muted small fw-bold d-block mb-1">TOTAL PRODUCTS</span>
            <h3 className="fw-extrabold text-dark m-0">{totalProducts}</h3>
            <small className="text-muted mt-1 d-block">👕 Catalog Items</small>
          </div>
        </div>

        <div className="col-6 col-md-4 col-lg-3">
          <div className="card border-0 shadow-sm p-3 rounded-4 bg-white h-100">
            <span className="text-muted small fw-bold d-block mb-1">TOTAL ORDERS</span>
            <h3 className="fw-extrabold text-dark m-0">{totalOrders}</h3>
            <small className="text-primary mt-1 d-block">📦 Processed Orders</small>
          </div>
        </div>

        <div className="col-6 col-md-4 col-lg-3">
          <div className="card border-0 shadow-sm p-3 rounded-4 bg-white h-100">
            <span className="text-muted small fw-bold d-block mb-1">TOTAL REVENUE</span>
            <h3 className="fw-extrabold text-success m-0">₹{totalRevenue}</h3>
            <small className="text-success mt-1 d-block">💰 Gross Sales Revenue</small>
          </div>
        </div>

        <div className="col-6 col-md-4 col-lg-3">
          <div className="card border-0 shadow-sm p-3 rounded-4 bg-white h-100">
            <span className="text-muted small fw-bold d-block mb-1">PENDING ORDERS</span>
            <h3 className="fw-extrabold text-warning m-0">{pendingOrders}</h3>
            <small className="text-warning mt-1 d-block">⏳ In Fulfillment</small>
          </div>
        </div>

        <div className="col-6 col-md-4 col-lg-3">
          <div className="card border-0 shadow-sm p-3 rounded-4 bg-white h-100">
            <span className="text-muted small fw-bold d-block mb-1">CUSTOM ORDERS</span>
            <h3 className="fw-extrabold text-purple m-0" style={{ color: "#8B5CF6" }}>{customOrders}</h3>
            <small className="mt-1 d-block" style={{ color: "#8B5CF6" }}>✨ Print Requests</small>
          </div>
        </div>

        <div className="col-6 col-md-4 col-lg-3">
          <div className="card border-0 shadow-sm p-3 rounded-4 bg-white h-100">
            <span className="text-muted small fw-bold d-block mb-1">LOW STOCK PRODUCTS</span>
            <h3 className="fw-extrabold text-warning m-0">{lowStockProducts.length}</h3>
            <small className="text-warning mt-1 d-block">🟡 ≤ 5 Left in Inventory</small>
          </div>
        </div>

        <div className="col-6 col-md-4 col-lg-3">
          <div className="card border-0 shadow-sm p-3 rounded-4 bg-white h-100">
            <span className="text-muted small fw-bold d-block mb-1">OUT OF STOCK PRODUCTS</span>
            <h3 className="fw-extrabold text-danger m-0">{outOfStockProducts.length}</h3>
            <small className="text-danger mt-1 d-block">🔴 Restock Urgently</small>
          </div>
        </div>

        <div className="col-6 col-md-4 col-lg-3">
          <div className="card border-0 shadow-sm p-3 rounded-4 bg-white h-100">
            <span className="text-muted small fw-bold d-block mb-1">RECENTLY ADDED PRODUCTS</span>
            <h3 className="fw-extrabold text-dark m-0">{recentlyAddedProductsCount}</h3>
            <small className="text-muted mt-1 d-block">✨ Active Catalog Additions</small>
          </div>
        </div>

        <div className="col-6 col-md-4 col-lg-3">
          <div className="card border-0 shadow-sm p-3 rounded-4 bg-white h-100">
            <span className="text-muted small fw-bold d-block mb-1">TOP SELLING PRODUCTS</span>
            <h3 className="fw-extrabold text-primary m-0">{topSellingProducts.length}</h3>
            <small className="text-primary mt-1 d-block">🔥 Best Performers</small>
          </div>
        </div>

        <div className="col-6 col-md-4 col-lg-3">
          <div className="card border-0 shadow-sm p-3 rounded-4 bg-white h-100">
            <span className="text-muted small fw-bold d-block mb-1">TODAY'S REVENUE</span>
            <h3 className="fw-extrabold text-success m-0">₹{todayRevenue}</h3>
            <small className="text-success mt-1 d-block">📅 Today's Sales</small>
          </div>
        </div>

        <div className="col-6 col-md-4 col-lg-3">
          <div className="card border-0 shadow-sm p-3 rounded-4 bg-white h-100">
            <span className="text-muted small fw-bold d-block mb-1">RECENT ORDERS</span>
            <h3 className="fw-extrabold text-dark m-0">{recentOrdersCount}</h3>
            <small className="text-muted mt-1 d-block">⚡ Recent Activity</small>
          </div>
        </div>

        <div className="col-6 col-md-4 col-lg-3">
          <div className="card border-0 shadow-sm p-3 rounded-4 bg-white h-100">
            <span className="text-muted small fw-bold d-block mb-1">PENDING CUSTOM ORDERS</span>
            <h3 className="fw-extrabold text-purple m-0" style={{ color: "#8B5CF6" }}>{pendingCustomOrders}</h3>
            <small className="mt-1 d-block" style={{ color: "#8B5CF6" }}>🎨 Awaiting Print</small>
          </div>
        </div>
      </div>

      {/* 📦 RECENT ORDERS TABLE (SECTION 8) & TOP SELLING PRODUCTS (SECTION 9) */}
      <div className="row g-4 mb-4">
        {/* SECTION 8: RECENT ORDERS */}
        <div className="col-12 col-lg-7">
          <div className="card border-0 shadow-sm p-4 rounded-4 bg-white h-100">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="fw-bold text-dark m-0">Recent Orders 📦</h5>
              <span className="badge bg-light text-dark border">Latest 5 Orders</span>
            </div>

            {recentOrders.length === 0 ? (
              <p className="text-muted small">No recent orders recorded.</p>
            ) : (
              <div className="table-responsive">
                <table className="table align-middle small mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>Order ID</th>
                      <th>Customer</th>
                      <th>Product</th>
                      <th>Qty</th>
                      <th>Total</th>
                      <th>Status</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentOrders.map((o) => (
                      <tr key={o.id}>
                        <td className="fw-bold">#{o.id}</td>
                        <td>{o.username}</td>
                        <td className="fw-semibold text-truncate" style={{ maxWidth: "140px" }}>{o.productName}</td>
                        <td>{o.quantity}</td>
                        <td className="fw-bold text-dark">₹{o.totalPrice}</td>
                        <td>
                          <span className={`badge rounded-pill ${
                            (o.status || "").toUpperCase() === "DELIVERED" ? "bg-success" : (o.status || "").toUpperCase() === "CANCELLED" ? "bg-danger" : "bg-dark"
                          }`}>
                            {o.status}
                          </span>
                        </td>
                        <td className="text-muted small">
                          {o.orderDate ? new Date(o.orderDate).toLocaleDateString() : "Today"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* SECTION 9: TOP SELLING PRODUCTS */}
        <div className="col-12 col-lg-5">
          <div className="card border-0 shadow-sm p-4 rounded-4 bg-white h-100">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="fw-bold text-dark m-0">Top Selling Products 🔥</h5>
              <span className="badge bg-warning text-dark">Top 5 Best Sellers</span>
            </div>

            {topSellingProducts.length === 0 ? (
              <p className="text-muted small">No sales data recorded yet.</p>
            ) : (
              <div className="d-flex flex-column gap-3">
                {topSellingProducts.map((p, idx) => (
                  <div key={idx} className="d-flex align-items-center justify-content-between p-2 rounded-3 bg-light border">
                    <div className="d-flex align-items-center gap-3">
                      <span className="fw-bold text-muted fs-5">#{idx + 1}</span>
                      <div>
                        <h6 className="fw-bold text-dark mb-0 text-truncate" style={{ maxWidth: "180px" }}>{p.name}</h6>
                        <small className="text-muted">{p.category}</small>
                      </div>
                    </div>
                    <span className="badge bg-dark rounded-pill px-3 py-1.5 fw-bold">{p.sales} Sales</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;