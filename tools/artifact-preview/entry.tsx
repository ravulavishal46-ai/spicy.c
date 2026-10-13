/**
 * Entry point of the single-file preview build.
 * Maps URLs to the real SPICY page components (same code as the Next.js app).
 */
import { Component, StrictMode, Suspense, type ReactNode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider, useRouterContext } from "./shims/router";
import { Toaster } from "@/components/ui/toaster";

import ShopLayout from "@/app/(shop)/layout";
import HomePage from "@/app/(shop)/page";
import MenuPage from "@/app/(shop)/menu/page";
import ComboPage from "@/app/(shop)/combo/page";
import CartPage from "@/app/(shop)/cart/page";
import CheckoutPage from "@/app/(shop)/checkout/page";
import OffersPage from "@/app/(shop)/offers/page";
import SupportPage from "@/app/(shop)/support/page";
import AccountLayout from "@/app/(shop)/account/layout";
import AccountPage from "@/app/(shop)/account/page";
import OrdersPage from "@/app/(shop)/account/orders/page";
import FavoritesPage from "@/app/(shop)/account/favorites/page";
import AddressesPage from "@/app/(shop)/account/addresses/page";
import ShopError from "@/app/(shop)/error";
import { FoodDetail } from "@/components/shop/food-detail";
import { CategoryView } from "@/components/shop/category-view";
import { OrderTracker } from "@/components/account/order-tracker";

import AuthLayout from "@/app/(auth)/layout";
import LoginPage from "@/app/(auth)/login/page";
import RegisterPage from "@/app/(auth)/register/page";

import AdminLayout from "@/app/admin/layout";
import AdminOverview from "@/app/admin/page";
import AdminOrders from "@/app/admin/orders/page";
import AdminMenu from "@/app/admin/menu/page";
import AdminCategories from "@/app/admin/categories/page";
import AdminCustomers from "@/app/admin/customers/page";
import AdminCoupons from "@/app/admin/coupons/page";
import AdminInventory from "@/app/admin/inventory/page";
import AdminReviews from "@/app/admin/reviews/page";
import AdminAnalytics from "@/app/admin/analytics/page";
import AdminSettings from "@/app/admin/settings/page";

import NotFound from "@/app/not-found";
import { getCategory, getDish } from "@/lib/data/menu";

type Group = "shop" | "account" | "auth" | "admin" | "none";
type Match = { group: Group; page: ReactNode };

const fixed: Record<string, Match> = {
  "/": { group: "shop", page: <HomePage /> },
  "/menu": { group: "shop", page: <MenuPage /> },
  "/combo": { group: "shop", page: <ComboPage /> },
  "/cart": { group: "shop", page: <CartPage /> },
  "/checkout": { group: "shop", page: <CheckoutPage /> },
  "/offers": { group: "shop", page: <OffersPage /> },
  "/support": { group: "shop", page: <SupportPage /> },
  "/account": { group: "account", page: <AccountPage /> },
  "/account/orders": { group: "account", page: <OrdersPage /> },
  "/account/favorites": { group: "account", page: <FavoritesPage /> },
  "/account/addresses": { group: "account", page: <AddressesPage /> },
  "/login": { group: "auth", page: <LoginPage /> },
  "/register": { group: "auth", page: <RegisterPage /> },
  "/admin": { group: "admin", page: <AdminOverview /> },
  "/admin/orders": { group: "admin", page: <AdminOrders /> },
  "/admin/menu": { group: "admin", page: <AdminMenu /> },
  "/admin/categories": { group: "admin", page: <AdminCategories /> },
  "/admin/customers": { group: "admin", page: <AdminCustomers /> },
  "/admin/coupons": { group: "admin", page: <AdminCoupons /> },
  "/admin/inventory": { group: "admin", page: <AdminInventory /> },
  "/admin/reviews": { group: "admin", page: <AdminReviews /> },
  "/admin/analytics": { group: "admin", page: <AdminAnalytics /> },
  "/admin/settings": { group: "admin", page: <AdminSettings /> },
};

function match(pathname: string): Match {
  const path = pathname.length > 1 ? pathname.replace(/\/+$/, "") : pathname;
  if (fixed[path]) return fixed[path];
  let m = path.match(/^\/food\/([^/]+)$/);
  if (m) {
    const dish = getDish(decodeURIComponent(m[1]));
    if (dish) return { group: "shop", page: <FoodDetail dish={dish} /> };
  }
  m = path.match(/^\/menu\/([^/]+)$/);
  if (m) {
    const category = getCategory(decodeURIComponent(m[1]));
    if (category) return { group: "shop", page: <CategoryView category={category} /> };
  }
  m = path.match(/^\/account\/orders\/([^/]+)$/);
  if (m) return { group: "account", page: <OrderTracker id={decodeURIComponent(m[1])} /> };
  return { group: "none", page: <NotFound /> };
}

/** Shows the app's own error screen if a page crashes, instead of a blank page. */
class ErrorBoundary extends Component<{ children: ReactNode; resetKey: string }, { error: Error | null }> {
  state = { error: null as Error | null };
  static getDerivedStateFromError(error: Error) {
    return { error };
  }
  componentDidUpdate(prev: { resetKey: string }) {
    if (prev.resetKey !== this.props.resetKey && this.state.error) this.setState({ error: null });
  }
  componentDidCatch(error: Error) {
    console.error("[SPICY preview] page error:", error);
  }
  render() {
    if (this.state.error) return <ShopError error={this.state.error} reset={() => this.setState({ error: null })} />;
    return this.props.children;
  }
}

function App() {
  const { location } = useRouterContext();
  const { group, page } = match(location.pathname);
  const keyed = (
    <ErrorBoundary resetKey={location.pathname}>
      <Suspense>
        <div key={location.pathname} style={{ display: "contents" }}>
          {page}
        </div>
      </Suspense>
    </ErrorBoundary>
  );
  if (group === "shop") return <ShopLayout>{keyed}</ShopLayout>;
  if (group === "account")
    return (
      <ShopLayout>
        <AccountLayout>{keyed}</AccountLayout>
      </ShopLayout>
    );
  if (group === "auth") return <AuthLayout>{keyed}</AuthLayout>;
  if (group === "admin") return <AdminLayout>{keyed}</AdminLayout>;
  return keyed;
}

createRoot(document.getElementById("spicy-root")!).render(
  <StrictMode>
    <RouterProvider>
      <App />
      <Toaster />
    </RouterProvider>
  </StrictMode>,
);
