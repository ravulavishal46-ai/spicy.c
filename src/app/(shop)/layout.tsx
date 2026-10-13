import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { CartDrawer } from "@/components/shop/cart-drawer";
import { SignInPrompt } from "@/components/auth/sign-in-prompt";

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <main id="main" tabIndex={-1} className="outline-none">
        {children}
      </main>
      <Footer />
      <CartDrawer />
      <SignInPrompt />
    </>
  );
}
