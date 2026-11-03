import { Link, useSearchParams } from "react-router-dom";
export default function PaymentResult() {
  const [params] = useSearchParams(); const status = params.get("status") || "pending";
  const title = status === "success" ? "Estamos verificando tu pago." : status === "failure" ? "El pago no se completó." : "Pago pendiente.";
  const desc = status === "success" ? "Mercado Pago nos enviará la confirmación. El pedido quedará confirmado cuando recibamos la notificación del pago." : "Podés revisar el estado de tu operación o volver a intentarlo desde tu cuenta.";
  return <main className="page container empty-state"><p className="eyebrow">PAYMENT STATUS</p><h1>{title}</h1><p>{desc}</p><Link to="/pedidos" className="button button-dark">Ver mis pedidos</Link></main>;
}
