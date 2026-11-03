import { Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider } from "./context/AuthContext";
import Home from "./pages/Home";
import Shop from "./pages/Shop";
import Product from "./pages/Product";
import Cart from "./pages/Cart";
import Account from "./pages/Account";
import Checkout from "./pages/Checkout";
import Orders from "./pages/Orders";
import Admin from "./pages/Admin";
import Info from "./pages/Info";

function AppContent() {
  return <><Header/><Routes>
    <Route path="/" element={<Home/>}/><Route path="/tienda" element={<Shop/>}/><Route path="/producto/:id" element={<Product/>}/>
    <Route path="/carrito" element={<Cart/>}/><Route path="/cuenta" element={<Account/>}/><Route path="/checkout" element={<Checkout/>}/>
    <Route path="/pedidos" element={<ProtectedRoute><Orders/></ProtectedRoute>}/>
    <Route path="/admin" element={<ProtectedRoute admin><Admin/></ProtectedRoute>}/>
    <Route path="/preguntas" element={<Info/>}/>    <Route path="*" element={<main className="page container empty-state"><h1>Página no encontrada.</h1></main>}/>
  </Routes><Footer/></>;
}
export default function App() { return <AuthProvider><AppContent/></AuthProvider>; }
