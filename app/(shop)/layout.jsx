import Navbar from "../../components/shared/Navbar";
import Footer from "../../components/shared/Footer";
import CompareBar from "../../components/shared/CompareBar";
import CartSyncMount from "../../components/shared/CartSyncMount";

export default function ShopLayout({ children }) {
  return (
    <>
      <Navbar />
      <main className="min-h-screen">{children}</main>
      <Footer />
      <CompareBar />
      <CartSyncMount />
    </>
  );
}
