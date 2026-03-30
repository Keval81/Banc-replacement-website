"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Heart, Trash2, ArrowRight, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
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
        <main className="min-h-screen bg-gradient-to-br from-[#1A1917] via-[#1a1d21] to-[#0f1113] pt-24 pb-16">
          <div className="mx-auto max-w-7xl px-4 lg:px-10">
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin h-8 w-8 border-2 border-[#4AC8E8] border-t-transparent rounded-full" />
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
      <main className="min-h-screen bg-gradient-to-br from-[#1A1917] via-[#1a1d21] to-[#0f1113] pt-24 pb-16">
        <div className="mx-auto max-w-7xl px-4 lg:px-10">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-center gap-3 mb-2">
              <Heart className="h-6 w-6 text-red-400" />
              <h1 className="text-3xl font-bold text-white">Your Favorites</h1>
            </div>
            <p className="text-white/60">
              {favorites.length === 0
                ? "Properties you favorite will appear here"
                : `You have ${favorites.length} saved ${favorites.length === 1 ? "property" : "properties"}`}
            </p>
          </motion.div>

          {/* Empty State */}
          {favorites.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="rounded-2xl border border-white/10 bg-white/5 p-12 text-center"
            >
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-white/5">
                <Heart className="h-8 w-8 text-white/40" />
              </div>
              <h2 className="mb-2 text-xl font-semibold text-white">
                No favorites yet
              </h2>
              <p className="mb-6 text-white/60">
                Start browsing and save properties you&apos;re interested in.
              </p>
              <Link href="/sales/properties">
                <Button className="bg-[#4AC8E8] hover:bg-[#1A9BBF] text-white">
                  <Home className="mr-2 h-4 w-4" />
                  Browse Properties
                </Button>
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
                  className="group overflow-hidden rounded-2xl border border-white/10 bg-white/5 transition-colors hover:border-white/20"
                >
                  {/* Property Image */}
                  <Link href={`/sales/properties/${favorite.propertyId}`}>
                    <div className="relative aspect-[4/3] w-full overflow-hidden bg-white/5">
                      <Image
                        src={favorite.propertyImage || "/placeholder-property.jpg"}
                        alt={favorite.propertyTitle || "Property"}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                  </Link>

                  {/* Property Details */}
                  <div className="p-4">
                    <Link href={`/sales/properties/${favorite.propertyId}`}>
                      <h3 className="font-semibold text-white group-hover:text-[#4AC8E8] transition-colors line-clamp-1">
                        {favorite.propertyTitle || "Property"}
                      </h3>
                    </Link>
                    <p className="mt-1 text-sm text-white/60 line-clamp-1">
                      {favorite.propertyAddress}
                    </p>
                    <p className="mt-2 text-lg font-bold text-[#4AC8E8]">
                      {favorite.propertyPrice}
                    </p>

                    {/* Actions */}
                    <div className="mt-4 flex items-center gap-2">
                      <Link
                        href={`/sales/properties/${favorite.propertyId}`}
                        className="flex-1"
                      >
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full border-white/20 bg-white/5 text-white hover:bg-white/10"
                        >
                          View Details
                          <ArrowRight className="ml-2 h-3 w-3" />
                        </Button>
                      </Link>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeFavorite(favorite.id)}
                        disabled={removingId === favorite.id}
                        className="border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
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
