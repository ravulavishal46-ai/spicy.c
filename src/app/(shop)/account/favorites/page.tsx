import type { Metadata } from "next";
import { Favorites } from "@/components/account/favorites";

export const metadata: Metadata = { title: "Favorites" };

export default function FavoritesPage() {
  return <Favorites />;
}
