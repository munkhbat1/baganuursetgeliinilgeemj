import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { api } from "../api";

const CartContext = createContext(null);

export const DELIVERY_OPTIONS = {
  flower: { label: "Цэцэгт мэндчилгээ", fee: 20000 },
  regular: { label: "Энгийн хүргэлт", fee: 10000 },
};

export function CartProvider({ children }) {
  const [cartId, setCartId] = useState(null);
  const [cart, setCart] = useState({ items: [], total: 0, count: 0 });
  const [loading, setLoading] = useState(true);
  const [deliveryType, setDeliveryTypeState] = useState(() => {
    try {
      const saved = localStorage.getItem("astra_delivery_type");
      return saved === "flower" || saved === "regular" ? saved : "regular";
    } catch {
      return "regular";
    }
  });

  const setDeliveryType = (type) => {
    setDeliveryTypeState(type);
    try {
      localStorage.setItem("astra_delivery_type", type);
    } catch {
      // localStorage unavailable — selection still works for this session
    }
  };

  const deliveryFee = DELIVERY_OPTIONS[deliveryType].fee;
  const grandTotal = (cart.total || 0) + deliveryFee;

  const refreshCart = useCallback(async (id) => {
    const data = await api.getCart(id);
    setCart(data);
  }, []);

  useEffect(() => {
    (async () => {
      let id = localStorage.getItem("astra_cart_id");
      if (!id) {
        const created = await api.createCart();
        id = created.cartId;
        localStorage.setItem("astra_cart_id", id);
      }
      setCartId(id);
      await refreshCart(id);
      setLoading(false);
    })();
  }, [refreshCart]);

  const addItem = async (productId, qty = 1) => {
    const data = await api.addToCart(cartId, productId, qty);
    setCart(data);
  };

  const updateItem = async (productId, qty) => {
    const data = await api.updateCartItem(cartId, productId, qty);
    setCart(data);
  };

  const removeItem = async (productId) => {
    const data = await api.removeCartItem(cartId, productId);
    setCart(data);
  };

  return (
    <CartContext.Provider
      value={{
        cartId,
        cart,
        loading,
        addItem,
        updateItem,
        removeItem,
        refreshCart,
        deliveryType,
        setDeliveryType,
        deliveryFee,
        grandTotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
