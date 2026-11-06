import { MessageCircle } from "lucide-react";
export default function WhatsAppButton() {
  return <a className="whatsapp-float" href="https://wa.me/5491154154628?text=Hola%20SS22%2C%20tengo%20una%20consulta." target="_blank" rel="noreferrer" aria-label="Contactar a SS22 por WhatsApp"><MessageCircle size={23}/><span>¿Necesitás ayuda?</span></a>;
}
