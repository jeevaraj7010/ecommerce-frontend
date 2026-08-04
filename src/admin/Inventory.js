import React, { useEffect, useState, useMemo } from "react";
import API from "../api/axios";
import { toast } from "react-toastify";
import Pagination from "../components/Pagination";

const ITEMS_PER_PAGE = 10;
const ALL_SIZES = ["XS", "S", "M", "L", "XL", "XXL", "3XL"];

function Inventory() {
  const [overview, setOverview] = useState({
    totalProducts: 0,
    variantEnabledProducts: 0,
    totalVariants: 0,
    totalInventoryUnits: 0,
    lowStockVariants: 0,
    outOfStockVariants: 0,
    inventory: [],
  });

  const [allProducts, setAllProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sizeFilter, setSizeFilter] = useState("all");
  const [stockFilter, setStockFilter] = useState("all"); // 'all', 'low', 'out', 'in'
  const [sortBy, setSortBy] = useState("name"); // 'name', 'lowStock', 'highStock'

  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);

  // Inline editing stock
  const [editingStock, setEditingStock] = useState({});

  // Modals & Drawers
  const [showAddVariantModal, setShowAddVariantModal] = useState(false);
  const [addVariantForm, setAddVariantForm] = useState({ productId: "", size: "M", stockQuantity: 10 });

  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedProductForImages, setSelectedProductForImages] = useState(null);
  const [newImageUrl, setNewImageUrl] = useState("");
  const [newImageOrder, setNewImageOrder] = useState(1);

  const [showAuditModal, setShowAuditModal] = useState(false);
  const [auditLogs, setAuditLogs] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [invRes, prodRes] = await Promise.all([
        API.get("/api/admin/inventory"),
        API.get("/api/products"),
      ]);

      setOverview(invRes.data || {});
      setAllProducts(prodRes.data || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load inventory data ❌");
    } finally {
      setLoading(false);
    }
  };

  const handleStockChange = (variantId, val) => {
    setEditingStock((prev) => ({
      ...prev,
      [variantId]: val,
    }));
  };

  const saveStockUpdate = async (variantId, currentStock) => {
    const newQty = parseInt(editingStock[variantId], 10);
    if (isNaN(newQty) || newQty < 0) {
      toast.error("Stock cannot be negative ❌");
      return;
    }

    try {
      await API.put(`/api/admin/inventory/variant/${variantId}`, {
        stockQuantity: newQty,
        reason: `Admin updated stock from ${currentStock} to ${newQty}`,
      });
      toast.success("Stock updated successfully ✅");
      fetchData();
      setEditingStock((prev) => {
        const copy = { ...prev };
        delete copy[variantId];
        return copy;
      });
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to update stock ❌");
    }
  };

  const handleDeleteVariant = async (variantId, size, productName) => {
    if (!window.confirm(`Are you sure you want to deactivate/delete size '${size}' for ${productName}?`)) {
      return;
    }

    try {
      await API.delete(`/api/admin/inventory/variant/${variantId}`);
      toast.success(`Variant ${size} deactivated/deleted ✅`);
      fetchData();
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete variant ❌");
    }
  };

  const handleToggleVariantMode = async (productId, currentStatus) => {
    try {
      await API.put(`/api/admin/inventory/product/${productId}/toggle-variant`, {
        variantEnabled: !currentStatus,
      });
      toast.success(`Variant mode ${!currentStatus ? "Enabled" : "Disabled"} for product ✅`);
      fetchData();
    } catch (err) {
      console.error(err);
      toast.error("Failed to toggle variant mode ❌");
    }
  };

  const handleAddVariantSubmit = async (e) => {
    e.preventDefault();
    if (!addVariantForm.productId) {
      toast.warning("Please select a product ⚠️");
      return;
    }

    if (addVariantForm.stockQuantity < 0) {
      toast.error("Stock cannot be negative ❌");
      return;
    }

    try {
      await API.post("/api/admin/inventory/variant", {
        productId: addVariantForm.productId,
        size: addVariantForm.size,
        stockQuantity: addVariantForm.stockQuantity,
      });
      toast.success(`Added size ${addVariantForm.size} variant successfully 🎉`);
      setShowAddVariantModal(false);
      fetchData();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to add variant ❌");
    }
  };

  const handleAddProductImageSubmit = async (e) => {
    e.preventDefault();
    if (!newImageUrl.trim()) {
      toast.warning("Please enter a valid image URL 🖼️");
      return;
    }

    try {
      await API.post(`/api/admin/products/${selectedProductForImages.id}/images`, {
        imageUrl: newImageUrl.trim(),
        displayOrder: newImageOrder,
      });
      toast.success("Product image added ✅");
      setNewImageUrl("");
      fetchData();
      // Update local product reference
      const res = await API.get(`/api/products/${selectedProductForImages.id}`);
      setSelectedProductForImages(res.data);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to add image ❌");
    }
  };

  const handleDeleteProductImage = async (imageId) => {
    try {
      await API.delete(`/api/admin/products/${selectedProductForImages.id}/images/${imageId}`);
      toast.success("Image deleted ✅");
      fetchData();
      const res = await API.get(`/api/products/${selectedProductForImages.id}`);
      setSelectedProductForImages(res.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete image ❌");
    }
  };

  const fetchAuditLogs = async () => {
    try {
      const res = await API.get("/api/admin/inventory/audit-logs");
      setAuditLogs(res.data || []);
      setShowAuditModal(true);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load audit logs ❌");
    }
  };

  // Categories list
  const categories = useMemo(() => {
    const set = new Set();
    allProducts.forEach((p) => p.category && set.add(p.category));
    return Array.from(set);
  }, [allProducts]);

  // Filtering & Sorting
  const filteredInventory = useMemo(() => {
    const list = overview.inventory || [];

    return list
      .filter((v) => {
        const matchesSearch =
          !search.trim() ||
          (v.productName && v.productName.toLowerCase().includes(search.toLowerCase())) ||
          (v.category && v.category.toLowerCase().includes(search.toLowerCase()));

        const matchesCategory = categoryFilter === "all" || v.category === categoryFilter;
        const matchesSize = sizeFilter === "all" || (v.size && v.size.toUpperCase() === sizeFilter.toUpperCase());

        let matchesStock = true;
        if (stockFilter === "low") matchesStock = v.stockQuantity > 0 && v.stockQuantity <= 5;
        else if (stockFilter === "out") matchesStock = v.stockQuantity <= 0;
        else if (stockFilter === "in") matchesStock = v.stockQuantity > 5;

        return matchesSearch && matchesCategory && matchesSize && matchesStock;
      })
      .sort((a, b) => {
        if (sortBy === "lowStock") return a.stockQuantity - b.stockQuantity;
        if (sortBy === "highStock") return b.stockQuantity - a.stockQuantity;
        return (a.productName || "").localeCompare(b.productName || "");
      });
  }, [overview.inventory, search, categoryFilter, sizeFilter, stockFilter, sortBy]);

  const totalPages = Math.ceil(filteredInventory.length / ITEMS_PER_PAGE) || 1;
  const currentItems = filteredInventory.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="container-fluid py-3 py-md-4">
      {/* HEADER */}
      <div className="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-2">
        <div>
          <h3 className="fw-bold m-0 fs-4 text-dark">Inventory & Stock Management 📦</h3>
          <p className="text-muted small m-0">Monitor size-level variants, update stock, manage multi-image galleries, and view audit history.</p>
        </div>

        <div className="d-flex gap-2 flex-wrap">
          <button className="btn btn-outline-dark btn-sm rounded-pill px-3" onClick={fetchAuditLogs}>
            Audit History 📜
          </button>

          <button className="btn btn-dark btn-sm rounded-pill px-3 fw-bold" onClick={() => setShowAddVariantModal(true)}>
            + Add Size Variant
          </button>
        </div>
      </div>

      {/* DASHBOARD METRICS CARDS (SUMMARY METRICS) */}
      <div className="row g-3 mb-4">
        <div className="col-6 col-md-4 col-lg-2">
          <div className="card border-0 shadow-sm p-3 rounded-4 bg-white text-center">
            <span className="text-muted small fw-bold text-uppercase" style={{ fontSize: "11px" }}>Total Products</span>
            <h4 className="fw-extrabold text-dark mt-1 mb-0">{overview.totalProducts || 0}</h4>
          </div>
        </div>

        <div className="col-6 col-md-4 col-lg-2">
          <div className="card border-0 shadow-sm p-3 rounded-4 bg-white text-center">
            <span className="text-muted small fw-bold text-uppercase" style={{ fontSize: "11px" }}>Variant Enabled</span>
            <h4 className="fw-extrabold text-primary mt-1 mb-0">{overview.variantEnabledProducts || 0}</h4>
          </div>
        </div>

        <div className="col-6 col-md-4 col-lg-2">
          <div className="card border-0 shadow-sm p-3 rounded-4 bg-white text-center">
            <span className="text-muted small fw-bold text-uppercase" style={{ fontSize: "11px" }}>Active Variants</span>
            <h4 className="fw-extrabold text-info mt-1 mb-0">{overview.totalVariants || 0}</h4>
          </div>
        </div>

        <div className="col-6 col-md-4 col-lg-2">
          <div className="card border-0 shadow-sm p-3 rounded-4 bg-white text-center">
            <span className="text-muted small fw-bold text-uppercase" style={{ fontSize: "11px" }}>Total Units</span>
            <h4 className="fw-extrabold text-success mt-1 mb-0">{overview.totalInventoryUnits || 0}</h4>
          </div>
        </div>

        <div className="col-6 col-md-4 col-lg-2">
          <div className="card border-0 shadow-sm p-3 rounded-4 bg-white text-center">
            <span className="text-muted small fw-bold text-uppercase" style={{ fontSize: "11px" }}>Low Stock (≤5)</span>
            <h4 className="fw-extrabold text-warning mt-1 mb-0">{overview.lowStockVariants || 0}</h4>
          </div>
        </div>

        <div className="col-6 col-md-4 col-lg-2">
          <div className="card border-0 shadow-sm p-3 rounded-4 bg-white text-center">
            <span className="text-muted small fw-bold text-uppercase" style={{ fontSize: "11px" }}>Out Of Stock</span>
            <h4 className="fw-extrabold text-danger mt-1 mb-0">{overview.outOfStockVariants || 0}</h4>
          </div>
        </div>
      </div>

      {/* FILTERS & SEARCH BAR */}
      <div className="card border-0 shadow-sm p-3 rounded-4 bg-white mb-4">
        <div className="row g-2 align-items-center">
          <div className="col-12 col-md-4">
            <input
              type="text"
              className="form-control rounded-pill px-3 shadow-sm border-0 bg-light"
              placeholder="Search by product name or category..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              style={{ height: "42px", fontSize: "14px" }}
            />
          </div>

          <div className="col-6 col-md-2">
            <select
              className="form-select rounded-pill border-0 bg-light text-xs"
              value={categoryFilter}
              onChange={(e) => { setCategoryFilter(e.target.value); setCurrentPage(1); }}
              style={{ height: "42px" }}
            >
              <option value="all">All Categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div className="col-6 col-md-2">
            <select
              className="form-select rounded-pill border-0 bg-light text-xs"
              value={sizeFilter}
              onChange={(e) => { setSizeFilter(e.target.value); setCurrentPage(1); }}
              style={{ height: "42px" }}
            >
              <option value="all">All Sizes</option>
              {ALL_SIZES.map((sz) => (
                <option key={sz} value={sz}>Size {sz}</option>
              ))}
            </select>
          </div>

          <div className="col-6 col-md-2">
            <select
              className="form-select rounded-pill border-0 bg-light text-xs"
              value={stockFilter}
              onChange={(e) => { setStockFilter(e.target.value); setCurrentPage(1); }}
              style={{ height: "42px" }}
            >
              <option value="all">All Stock Status</option>
              <option value="in">In Stock (&gt;5)</option>
              <option value="low">Low Stock (1-5)</option>
              <option value="out">Out Of Stock (0)</option>
            </select>
          </div>

          <div className="col-6 col-md-2">
            <select
              className="form-select rounded-pill border-0 bg-light text-xs"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={{ height: "42px" }}
            >
              <option value="name">Sort by Name</option>
              <option value="lowStock">Sort: Low Stock First</option>
              <option value="highStock">Sort: High Stock First</option>
            </select>
          </div>
        </div>
      </div>

      {/* TABLE */}
      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-dark" role="status">
            <span className="visually-hidden">Loading inventory...</span>
          </div>
        </div>
      ) : currentItems.length === 0 ? (
        <div className="text-center py-5 bg-white rounded-4 shadow-sm p-4">
          <h5 className="fw-bold mb-2">No matching inventory records found</h5>
          <p className="text-muted small mb-0">Try resetting search or filters.</p>
        </div>
      ) : (
        <div className="card border-0 shadow-sm rounded-4 overflow-hidden mb-4">
          <div className="table-responsive">
            <table className="table align-middle mb-0 text-nowrap">
              <thead className="table-dark">
                <tr>
                  <th>Product</th>
                  <th>Category</th>
                  <th>Size</th>
                  <th>Stock Status</th>
                  <th>Current Stock</th>
                  <th>Quick Update</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentItems.map((item) => {
                  const editVal = editingStock[item.variantId] !== undefined ? editingStock[item.variantId] : item.stockQuantity;
                  const isOut = item.stockQuantity <= 0;
                  const isLow = item.stockQuantity > 0 && item.stockQuantity <= 5;

                  const parentProd = allProducts.find((p) => p.id === item.productId);

                  return (
                    <tr key={item.variantId}>
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          <img
                            src={item.imageUrl || "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=500&auto=format&fit=crop&q=80"}
                            alt={item.productName}
                            style={{ width: "42px", height: "42px", objectFit: "cover" }}
                            className="rounded cursor-pointer"
                            onClick={() => {
                              if (parentProd) {
                                setSelectedProductForImages(parentProd);
                                setShowImageModal(true);
                              }
                            }}
                            title="Click to manage images"
                          />
                          <div>
                            <span className="fw-semibold text-dark d-block text-truncate" style={{ maxWidth: "180px" }}>{item.productName}</span>
                            <small className="text-muted" style={{ fontSize: "11px" }}>ID: #{item.productId}</small>
                          </div>
                        </div>
                      </td>
                      <td>{item.category || "Uncategorized"}</td>
                      <td>
                        <span className="badge bg-dark text-white px-2.5 py-1 text-xs fw-bold">
                          {item.size}
                        </span>
                      </td>
                      <td>
                        {isOut ? (
                          <span className="badge bg-danger">Out of Stock</span>
                        ) : isLow ? (
                          <span className="badge bg-warning text-dark">Low Stock ({item.stockQuantity})</span>
                        ) : (
                          <span className="badge bg-success">In Stock</span>
                        )}
                      </td>
                      <td className="fw-bold fs-6">{item.stockQuantity} units</td>
                      <td>
                        <div className="d-flex align-items-center gap-2" style={{ maxWidth: "180px" }}>
                          <input
                            type="number"
                            className="form-control form-control-sm rounded"
                            value={editVal}
                            min="0"
                            onChange={(e) => handleStockChange(item.variantId, e.target.value)}
                          />
                          <button
                            className="btn btn-sm btn-success text-nowrap"
                            onClick={() => saveStockUpdate(item.variantId, item.stockQuantity)}
                          >
                            Save
                          </button>
                        </div>
                      </td>
                      <td>
                        <div className="d-flex gap-1">
                          <button
                            className="btn btn-sm btn-outline-primary text-nowrap"
                            onClick={() => {
                              if (parentProd) {
                                setSelectedProductForImages(parentProd);
                                setShowImageModal(true);
                              }
                            }}
                            title="Manage Product Images"
                          >
                            🖼️ Images
                          </button>
                          {parentProd && (
                            <button
                              className={`btn btn-sm text-nowrap ${parentProd.variantEnabled ? "btn-outline-secondary" : "btn-outline-success"}`}
                              onClick={() => handleToggleVariantMode(parentProd.id, parentProd.variantEnabled)}
                              title={parentProd.variantEnabled ? "Disable Variant Mode for Product" : "Enable Variant Mode for Product"}
                            >
                              {parentProd.variantEnabled ? "Disable Variants" : "Enable Variants"}
                            </button>
                          )}
                          <button
                            className="btn btn-sm btn-outline-danger text-nowrap"
                            onClick={() => handleDeleteVariant(item.variantId, item.size, item.productName)}
                            title="Delete/Deactivate Variant"
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {!loading && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={(p) => setCurrentPage(p)}
        />
      )}

      {/* MODAL 1: ADD VARIANT MODAL */}
      {showAddVariantModal && (
        <div className="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50 d-flex align-items-center justify-content-center z-3 p-3" style={{ zIndex: 1050 }}>
          <div className="bg-white p-4 rounded-4 shadow-lg" style={{ maxWidth: "480px", width: "100%" }}>
            <h5 className="fw-bold mb-3">Add Size Variant to Product 📦</h5>
            <form onSubmit={handleAddVariantSubmit}>
              <div className="mb-3">
                <label className="form-label small fw-bold text-muted">Select Product</label>
                <select
                  className="form-select rounded-3"
                  value={addVariantForm.productId}
                  onChange={(e) => setAddVariantForm({ ...addVariantForm, productId: e.target.value })}
                  required
                >
                  <option value="">-- Choose Product --</option>
                  {allProducts.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.category || "General"})
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-3">
                <label className="form-label small fw-bold text-muted">Select Size</label>
                <select
                  className="form-select rounded-3"
                  value={addVariantForm.size}
                  onChange={(e) => setAddVariantForm({ ...addVariantForm, size: e.target.value })}
                >
                  {ALL_SIZES.map((sz) => (
                    <option key={sz} value={sz}>{sz}</option>
                  ))}
                </select>
              </div>

              <div className="mb-4">
                <label className="form-label small fw-bold text-muted">Initial Stock Quantity</label>
                <input
                  type="number"
                  className="form-control rounded-3"
                  min="0"
                  value={addVariantForm.stockQuantity}
                  onChange={(e) => setAddVariantForm({ ...addVariantForm, stockQuantity: parseInt(e.target.value, 10) || 0 })}
                  required
                />
              </div>

              <div className="d-flex justify-content-end gap-2">
                <button type="button" className="btn btn-light rounded-pill px-4" onClick={() => setShowAddVariantModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-dark rounded-pill px-4 fw-bold">
                  Save Variant
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: IMAGE MANAGEMENT MODAL */}
      {showImageModal && selectedProductForImages && (
        <div className="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50 d-flex align-items-center justify-content-center z-3 p-3" style={{ zIndex: 1055 }}>
          <div className="bg-white p-4 rounded-4 shadow-lg overflow-auto" style={{ maxWidth: "600px", width: "100%", maxHeight: "90vh" }}>
            <div className="d-flex align-items-center justify-content-between mb-3 border-bottom pb-2">
              <h5 className="fw-bold m-0 text-dark">Image Gallery Management 🖼️</h5>
              <button className="btn btn-sm btn-outline-secondary rounded-circle" onClick={() => setShowImageModal(false)}>✕</button>
            </div>

            <p className="small text-muted mb-3">Product: <strong>{selectedProductForImages.name}</strong></p>

            {/* ADD IMAGE FORM */}
            <form onSubmit={handleAddProductImageSubmit} className="mb-4 p-3 bg-light rounded-3 border">
              <h6 className="fw-bold mb-2 text-sm">Add New Gallery Image</h6>
              <div className="row g-2 align-items-center">
                <div className="col-8">
                  <input
                    type="url"
                    className="form-control form-control-sm rounded"
                    placeholder="Enter Image URL (e.g. https://...)"
                    value={newImageUrl}
                    onChange={(e) => setNewImageUrl(e.target.value)}
                    required
                  />
                </div>
                <div className="col-2">
                  <input
                    type="number"
                    className="form-control form-control-sm rounded"
                    min="1"
                    max="8"
                    value={newImageOrder}
                    onChange={(e) => setNewImageOrder(parseInt(e.target.value, 10) || 1)}
                    title="Display order"
                  />
                </div>
                <div className="col-2">
                  <button type="submit" className="btn btn-sm btn-dark w-100">Add</button>
                </div>
              </div>
            </form>

            {/* EXISTING IMAGES LIST */}
            <h6 className="fw-bold mb-2 text-sm">Current Gallery Images ({selectedProductForImages.images?.length || 0}/8)</h6>
            {(!selectedProductForImages.images || selectedProductForImages.images.length === 0) ? (
              <div className="p-3 bg-light rounded-3 text-center mb-3">
                <p className="small text-muted mb-1">No gallery images added yet. Main product image:</p>
                <img src={selectedProductForImages.imageUrl} alt="Main" style={{ height: "80px", objectFit: "contain" }} className="rounded border" />
              </div>
            ) : (
              <div className="row g-3 mb-4">
                {selectedProductForImages.images.map((img, idx) => (
                  <div key={idx} className="col-4 text-center">
                    <div className="position-relative border rounded p-1 bg-white">
                      <img src={img} alt={`Gallery ${idx}`} style={{ height: "90px", width: "100%", objectFit: "contain" }} />
                      <button
                        className="btn btn-sm btn-danger position-absolute top-0 end-0 m-1 rounded-circle p-0"
                        style={{ width: "22px", height: "22px", fontSize: "11px" }}
                        onClick={() => handleDeleteProductImage(selectedProductForImages.images[idx]?.id || idx)}
                      >
                        ✕
                      </button>
                    </div>
                    <small className="text-muted d-block mt-1">Order #{idx + 1}</small>
                  </div>
                ))}
              </div>
            )}

            <div className="text-end">
              <button className="btn btn-secondary rounded-pill px-4" onClick={() => setShowImageModal(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: AUDIT HISTORY DRAWER/MODAL */}
      {showAuditModal && (
        <div className="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50 d-flex align-items-center justify-content-center z-3 p-3" style={{ zIndex: 1060 }}>
          <div className="bg-white p-4 rounded-4 shadow-lg overflow-auto" style={{ maxWidth: "720px", width: "100%", maxHeight: "85vh" }}>
            <div className="d-flex align-items-center justify-content-between mb-3 border-bottom pb-2">
              <h5 className="fw-bold m-0 text-dark">Inventory Audit History 📜</h5>
              <button className="btn btn-sm btn-outline-secondary rounded-circle" onClick={() => setShowAuditModal(false)}>✕</button>
            </div>

            {auditLogs.length === 0 ? (
              <p className="text-muted text-center py-4">No audit logs recorded yet.</p>
            ) : (
              <div className="table-responsive">
                <table className="table align-middle text-nowrap small">
                  <thead className="table-light">
                    <tr>
                      <th>Date / Time</th>
                      <th>Admin</th>
                      <th>Product</th>
                      <th>Size</th>
                      <th>Old Stock</th>
                      <th>New Stock</th>
                      <th>Reason</th>
                    </tr>
                  </thead>
                  <tbody>
                    {auditLogs.map((log) => (
                      <tr key={log.id}>
                        <td>{new Date(log.timestamp).toLocaleString()}</td>
                        <td className="fw-bold text-dark">{log.adminUsername}</td>
                        <td>{log.productName}</td>
                        <td><span className="badge bg-dark">{log.size}</span></td>
                        <td className="text-muted">{log.previousStock}</td>
                        <td className="fw-bold text-success">{log.newStock}</td>
                        <td>{log.reason || "Manual update"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="text-end mt-3">
              <button className="btn btn-secondary rounded-pill px-4" onClick={() => setShowAuditModal(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Inventory;
