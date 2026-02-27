"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";

interface LocalFavorite {
  propertyId: string;
  propertyTitle?: string;
  propertyPrice?: string;
  propertyImage?: string;
  propertyAddress?: string;
  addedAt: string;
}

interface UseFavoritesReturn {
  favorites: string[];
  isFavorite: (propertyId: string) => boolean;
  toggleFavorite: (property: {
    id: string;
    title?: string;
    price?: string;
    image?: string;
    address?: string;
  }) => Promise<void>;
  isLoading: boolean;
}

const STORAGE_KEY = "banc_anonymous_favorites";

export function useFavorites(): UseFavoritesReturn {
  const { data: session, status } = useSession();
  const [favorites, setFavorites] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const isAuthenticated = status === "authenticated";

  // Load favorites on mount
  useEffect(() => {
    const loadFavorites = async () => {
      if (isAuthenticated && session?.user?.id) {
        // Load from server
        try {
          const response = await fetch("/api/favorites");
          if (response.ok) {
            const data = await response.json();
            setFavorites(data.map((f: any) => f.propertyId));
          }
        } catch (error) {
          console.error("Error loading favorites:", error);
        }
      } else {
        // Load from localStorage
        try {
          const stored = localStorage.getItem(STORAGE_KEY);
          if (stored) {
            const localFavs: LocalFavorite[] = JSON.parse(stored);
            setFavorites(localFavs.map((f) => f.propertyId));
          }
        } catch (error) {
          console.error("Error loading local favorites:", error);
        }
      }
      setIsLoading(false);
    };

    if (status !== "loading") {
      loadFavorites();
    }
  }, [isAuthenticated, session, status]);

  // Sync anonymous favorites on login
  useEffect(() => {
    const syncFavorites = async () => {
      if (isAuthenticated && session?.user?.id) {
        try {
          const stored = localStorage.getItem(STORAGE_KEY);
          if (stored) {
            const localFavs: LocalFavorite[] = JSON.parse(stored);
            if (localFavs.length > 0) {
              // Sync with server
              const response = await fetch("/api/favorites/sync", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ favorites: localFavs }),
              });

              if (response.ok) {
                // Clear local storage after successful sync
                localStorage.removeItem(STORAGE_KEY);
                // Refresh favorites from server
                const favsResponse = await fetch("/api/favorites");
                if (favsResponse.ok) {
                  const data = await favsResponse.json();
                  setFavorites(data.map((f: any) => f.propertyId));
                }
              }
            }
          }
        } catch (error) {
          console.error("Error syncing favorites:", error);
        }
      }
    };

    if (isAuthenticated) {
      syncFavorites();
    }
  }, [isAuthenticated, session]);

  const isFavorite = useCallback(
    (propertyId: string) => favorites.includes(propertyId),
    [favorites]
  );

  const toggleFavorite = async (property: {
    id: string;
    title?: string;
    price?: string;
    image?: string;
    address?: string;
  }) => {
    if (isAuthenticated) {
      // Use server API
      if (favorites.includes(property.id)) {
        // Find the favorite ID and delete
        try {
          const response = await fetch("/api/favorites");
          if (response.ok) {
            const data = await response.json();
            const fav = data.find((f: any) => f.propertyId === property.id);
            if (fav) {
              await fetch(`/api/favorites/${fav.id}`, { method: "DELETE" });
              setFavorites((prev) => prev.filter((id) => id !== property.id));
            }
          }
        } catch (error) {
          console.error("Error removing favorite:", error);
        }
      } else {
        // Add favorite
        try {
          const response = await fetch("/api/favorites", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              propertyId: property.id,
              propertyTitle: property.title,
              propertyPrice: property.price,
              propertyImage: property.image,
              propertyAddress: property.address,
            }),
          });

          if (response.ok) {
            setFavorites((prev) => [...prev, property.id]);
          }
        } catch (error) {
          console.error("Error adding favorite:", error);
        }
      }
    } else {
      // Use localStorage
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        let localFavs: LocalFavorite[] = stored ? JSON.parse(stored) : [];

        if (favorites.includes(property.id)) {
          // Remove
          localFavs = localFavs.filter((f) => f.propertyId !== property.id);
          setFavorites((prev) => prev.filter((id) => id !== property.id));
        } else {
          // Add
          localFavs.push({
            propertyId: property.id,
            propertyTitle: property.title,
            propertyPrice: property.price,
            propertyImage: property.image,
            propertyAddress: property.address,
            addedAt: new Date().toISOString(),
          });
          setFavorites((prev) => [...prev, property.id]);
        }

        localStorage.setItem(STORAGE_KEY, JSON.stringify(localFavs));
      } catch (error) {
        console.error("Error updating local favorites:", error);
      }
    }
  };

  return {
    favorites,
    isFavorite,
    toggleFavorite,
    isLoading,
  };
}