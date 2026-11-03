
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { money } from "../lib/format";

const statuses = [
  "pending_payment",
  "paid",
  "ordered",
  "in_transit",
  "arrived",
  "ready",
  "completed",
  "cancelled",
];

const statusLabels = {
  pending_payment: "Pendiente de pago",
  paid: "Pago verificado",
  ordered: "Pedido realizado",
  in_transit: "En tránsito",
  arrived: "Llegó",
  ready: "Listo para entregar",
  completed: "Entregado",
  cancelled: "Cancelado",
};

const emptyProduct = {
  name: "",
  category: "Remeras",
  price: "",
  description: "",
  image_url: "",
  sizes: "S,M,L,XL",
  colors: "Negro,Blanco",
  deposit_percent: 30,
  stock: 1,
};

export default function Admin() {
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [product, setProduct] = useState({ ...emptyProduct });
  const [saving, setSaving] = useState(false);

  async function refresh() {
    const [p, o] = await Promise.all([
      supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false }),
      supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false }),
    ]);

    if (p.error || o.error) {
      setError(p.error?.message || o.error?.message);
      return;
    }

    setProducts(p.data || []);
    setOrders(o.data || []);
  }

  useEffect(() => {
    refresh();
  }, []);

  async function createProduct(e) {
    e.preventDefault();
    setError("");
    setSuccess("");

    const price = Number(product.price);
    const stock = Number(product.stock);

    if (!Number.isFinite(price) || price <= 0) {
      setError("Ingresá un precio válido.");
      return;
    }

    if (!Number.isInteger(stock) || stock < 0) {
      setError("El stock debe ser un número entero igual o mayor que cero.");
      return;
    }

    const payload = {
      name: product.name.trim(),
      category: product.category.trim(),
      price,
      description: product.description.trim(),
      image_url: product.image_url.trim(),
      sizes: product.sizes
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      colors: product.colors
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      deposit_percent: Number(product.deposit_percent),
      stock,
      active: true,
    };

    setSaving(true);

    const { error: insertError } = await supabase
      .from("products")
      .insert(payload);

    setSaving(false);

    if (insertError) {
      setError(insertError.message);
      return;
    }

    setProduct({ ...emptyProduct });
    setSuccess("Producto guardado correctamente.");
    await refresh();
  }

  async function updateStatus(id, status) {
    setError("");
    setSuccess("");

    const { error: updateError } = await supabase
      .from("orders")
      .update({ status })
      .eq("id", id);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    setSuccess("Estado del pedido actualizado.");
    await refresh();
  }

  async function toggleProduct(id, active) {
    setError("");
    setSuccess("");

    const { error: updateError } = await supabase
      .from("products")
      .update({ active: !active })
      .eq("id", id);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    setSuccess("Producto actualizado.");
    await refresh();
  }

  return (
    <main className="page container admin-page">
      <div className="page-title">
        <p className="eyebrow">PRIVATE AREA</p>
        <h1>
          Administración<span>.</span>
        </h1>
      </div>

      {error && <p className="notice">{error}</p>}
      {success && <p className="notice">{success}</p>}

      <section className="admin-section">
        <h2>Agregar producto</h2>

        <form className="admin-form" onSubmit={createProduct}>
          {[
            ["name", "Nombre"],
            ["category", "Categoría"],
            ["price", "Precio en ARS"],
            ["image_url", "URL de imagen"],
            ["description", "Descripción"],
            ["sizes", "Talles separados por coma"],
            ["colors", "Colores separados por coma"],
          ].map(([key, label]) => (
            <label key={key}>
              {label}
              <input
                required={["name", "price"].includes(key)}
                type={key === "price" ? "number" : "text"}
                min={key === "price" ? "1" : undefined}
                step={key === "price" ? "1" : undefined}
                value={product[key]}
                onChange={(e) =>
                  setProduct({ ...product, [key]: e.target.value })
                }
              />
            </label>
          ))}

          <label>
            Stock disponible
            <input
              type="number"
              min="0"
              step="1"
              required
              value={product.stock}
              onChange={(e) =>
                setProduct({ ...product, stock: e.target.value })
              }
            />
          </label>

          <label>
            Porcentaje de seña
            <input
              type="number"
              min="1"
              max="100"
              step="1"
              required
              value={product.deposit_percent}
              onChange={(e) =>
                setProduct({
                  ...product,
                  deposit_percent: e.target.value,
                })
              }
            />
          </label>

          <button
            className="button button-dark"
            type="submit"
            disabled={saving}
          >
            {saving ? "Guardando..." : "Guardar producto"}
          </button>
        </form>
      </section>

      <section className="admin-section">
        <h2>Productos ({products.length})</h2>

        {products.length === 0 && <p>Todavía no hay productos cargados.</p>}

        {products.map((p) => (
          <div className="admin-row" key={p.id}>
            <div>
              <span>
                {p.name} · {money(p.price)}
              </span>
              <p>
                Stock: {Number(p.stock ?? 1)} ·{" "}
                {p.active ? "Activo" : "Inactivo"}
              </p>
            </div>

            <button
              className="button button-outline small"
              type="button"
              onClick={() => toggleProduct(p.id, p.active)}
            >
              {p.active ? "Desactivar" : "Activar"}
            </button>
          </div>
        ))}
      </section>

      <section className="admin-section">
        <h2>Pedidos ({orders.length})</h2>

        {orders.map((o) => (
          <div className="admin-row order-admin" key={o.id}>
            <div>
              <b>#{String(o.id).slice(0, 8)}</b>
              <span>
                {money(o.total_amount)} · {statusLabels[o.status] || o.status}
              </span>
            </div>

            <select
              value={o.status}
              onChange={(e) => updateStatus(o.id, e.target.value)}
            >
              {statuses.map((status) => (
                <option key={status} value={status}>
                  {statusLabels[status]}
                </option>
              ))}
            </select>
          </div>
        ))}
      </section>
    </main>
  );
}
