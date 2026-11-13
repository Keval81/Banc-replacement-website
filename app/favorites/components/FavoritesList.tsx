"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { Trash2, ArrowRight } from "lucide-react";
import { actionPrimary, actionSecondary } from "@/components/ui/form-styles";
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
            className="h-80 animate-pulse rounded-[var(--radius-md)] bg-banc-dark/5"
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
      >
        <h2 className="text-xl font-semibold text-banc-dark-deep">No favorites yet</h2>
        <p className="mt-2 max-w-md text-banc-muted-readable">
          Start browsing properties and click the heart icon to save your favorites here.
        </p>
        <Link href="/sales/properties" className={`${actionPrimary} mt-6`}>
          Browse Properties
          <ArrowRight className="h-4 w-4" />
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
          className="group relative overflow-hidden rounded-[var(--radius-md)] border border-banc-line bg-white"
        >
          {/* Property Image */}
          <Link href={`/sales/properties/${favorite.propertyId}`}>
            <div className="relative aspect-[4/3] overflow-hidden bg-banc-grey-pale">
              <Image
                src={favorite.propertyImage || "/placeholder-property.jpg"}
                alt={favorite.propertyTitle || "Property"}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div>
            <div className="px-5 pt-5">
              <p className="font-semibold text-banc-dark-deep line-clamp-1">
                {favorite.propertyTitle || "Property"}
              </p>
              {favorite.propertyAddress && (
                <p className="mt-1 text-sm text-banc-muted-readable line-clamp-1">
                  {favorite.propertyAddress}
                </p>
              )}
            </div>
          </Link>

          {/* Actions */}
          <div className="p-5">
            <div>
              {favorite.propertyPrice && (
                <p className="font-display text-2xl font-light tracking-[-0.02em] text-banc-dark-deep">
                  {favorite.propertyPrice}
                </p>
              )}
              <p className="mt-1 text-xs text-banc-muted-readable">
                Saved {new Date(favorite.createdAt).toLocaleDateString()}
              </p>
            </div>
            <div className="mt-5 flex gap-2">
              <Link
                href={`/sales/properties/${favorite.propertyId}`}
                className={`${actionSecondary} flex-1 sm:w-full`}
              >
                View
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
  );
}
