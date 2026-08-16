import Navbar from "../../components/shared/Navbar";
import Footer from "../../components/shared/Footer";

export default function AccountLayout({ children }) {
  return (
    <>
      <Navbar />
      <main className="min-h-screen">{children}</main>
      <Footer />
    </>
  );
}
