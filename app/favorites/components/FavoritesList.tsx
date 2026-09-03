"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { Heart, Trash2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Favorite } from "@/types";

export default function FavoritesList() {
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [removingId, setRemovingId] = useState<string | null>(null);

  useEffect(() => {
    fetchFavorites();
  }, []);

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

  if (isLoading) {
    return (
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-80 animate-pulse rounded-2xl bg-white/5"
          />
        ))}
      </div>
    );
  }

  if (favorites.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center rounded-2xl border border-white/10 bg-white/5 py-16"
      >
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white/5">
          <Heart className="h-8 w-8 text-white/40" />
        </div>
        <h2 className="text-xl font-semibold text-white">No favorites yet</h2>
        <p className="mt-2 max-w-md text-center text-white/60">
          Start browsing properties and click the heart icon to save your favorites here.
        </p>
        <Link href="/sales/properties" className="mt-6">
          <Button className="bg-banc-focus hover:bg-banc-focus-hover text-white">
            Browse Properties
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </motion.div>
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {favorites.map((favorite, index) => (
        <motion.div
          key={favorite.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5"
        >
          {/* Property Image */}
          <Link href={`/sales/properties/${favorite.propertyId}`}>
            <div className="relative aspect-[4/3] overflow-hidden">
              <Image
                src={favorite.propertyImage || "/placeholder-property.jpg"}
                alt={favorite.propertyTitle || "Property"}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4">
                <p className="text-lg font-semibold text-white line-clamp-1">
                  {favorite.propertyTitle || "Property"}
                </p>
                {favorite.propertyAddress && (
                  <p className="text-sm text-white/70 line-clamp-1">
                    {favorite.propertyAddress}
                  </p>
                )}
              </div>
            </div>
          </Link>

          {/* Actions */}
          <div className="flex items-center justify-between p-4">
            <div>
              {favorite.propertyPrice && (
                <p className="text-lg font-bold text-banc-focus">
                  {favorite.propertyPrice}
                </p>
              )}
              <p className="text-xs text-white/40">
                Saved {new Date(favorite.createdAt).toLocaleDateString()}
              </p>
            </div>
            <div className="flex gap-2">
              <Link href={`/sales/properties/${favorite.propertyId}`}>
                <Button
                  size="sm"
                  className="bg-banc-focus hover:bg-banc-focus-hover text-white"
                >
                  View
                </Button>
              </Link>
              <Button
                size="sm"
                variant="outline"
                onClick={() => removeFavorite(favorite.id)}
                disabled={removingId === favorite.id}
                className="border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:text-red-300"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}