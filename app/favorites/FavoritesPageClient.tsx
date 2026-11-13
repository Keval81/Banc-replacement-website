"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Trash2, ArrowRight } from "lucide-react";
import { PageBand } from "@/components/PageBand";
import { actionPrimary, actionSecondary } from "@/components/ui/form-styles";
import { cn } from "@/lib/utils";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Image from "next/image";

interface Favorite {
  id: string;
  propertyId: string;
  propertyTitle: string | null;
  propertyPrice: string | null;
  propertyImage: string | null;
  propertyAddress: string | null;
  createdAt: string;
}

export default function FavoritesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [removingId, setRemovingId] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login?callbackUrl=/favorites");
      return;
    }

    if (status === "authenticated") {
      fetchFavorites();
    }
  }, [status, router]);

  const fetchFavorites = async () => {
    try {
      const response = await fetch("/api/favorites");
      if (response.ok) {
        const data = await response.json();
        setFavorites(data);
      }
    } catch (error) {
      console.error("Error fetching favorites:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const removeFavorite = async (id: string) => {
    setRemovingId(id);
    try {
      const response = await fetch(`/api/favorites/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setFavorites((prev) => prev.filter((f) => f.id !== id));
      }
    } catch (error) {
      console.error("Error removing favorite:", error);
    } finally {
      setRemovingId(null);
    }
  };

  if (status === "loading" || isLoading) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-banc-grey-pale">
          <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-10 lg:py-20">
            <div className="flex h-64 items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-banc-focus border-t-transparent" />
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (!session) {
    return null; // Will redirect
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-banc-grey-pale">
        <PageBand
          eyebrow="Saved properties"
          title="Your Favorites"
          lede={
            favorites.length === 0
              ? "Properties you favorite will appear here"
              : `You have ${favorites.length} saved ${favorites.length === 1 ? "property" : "properties"}`
          }
        />

        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-10 lg:py-20">
          {/* Empty State */}
          {favorites.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <h2 className="mb-2 text-xl font-semibold text-banc-dark-deep">
                No favorites yet
              </h2>
              <p className="mb-6 text-banc-muted-readable">
                Start browsing and save properties you&apos;re interested in.
              </p>
              <Link href="/sales/properties" className={actionPrimary}>
                Browse Properties
              </Link>
            </motion.div>
          ) : (
            /* Favorites Grid */
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {favorites.map((favorite, index) => (
                <motion.div
                  key={favorite.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="group overflow-hidden rounded-[var(--radius-md)] border border-banc-line bg-white"
                >
                  {/* Property Image */}
                  <Link href={`/sales/properties/${favorite.propertyId}`}>
                    <div className="relative aspect-[4/3] w-full overflow-hidden bg-banc-grey-pale">
                      <Image
                        src={favorite.propertyImage || "/placeholder-property.jpg"}
                        alt={favorite.propertyTitle || "Property"}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                  </Link>

                  {/* Property Details */}
                  <div className="p-5">
                    <Link href={`/sales/properties/${favorite.propertyId}`}>
                      <h3 className="font-semibold text-banc-dark-deep transition-colors group-hover:text-banc-focus line-clamp-1">
                        {favorite.propertyTitle || "Property"}
                      </h3>
                    </Link>
                    <p className="mt-1 text-sm text-banc-muted-readable line-clamp-1">
                      {favorite.propertyAddress}
                    </p>
                    <p className="mt-3 font-display text-2xl font-light tracking-[-0.02em] text-banc-dark-deep">
                      {favorite.propertyPrice}
                    </p>

                    {/* Actions */}
                    <div className="mt-5 flex items-center gap-2">
                      <Link
                        href={`/sales/properties/${favorite.propertyId}`}
                        className={cn(actionSecondary, "flex-1 sm:w-full")}
                      >
                        View Details
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                      <button
                        onClick={() => removeFavorite(favorite.id)}
                        disabled={removingId === favorite.id}
                        className="inline-flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-[var(--radius-md)] border border-red-700/30 text-red-700 transition-colors duration-200 hover:border-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-banc-focus focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
