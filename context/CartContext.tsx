'use client'

import { createContext, useContext, useEffect, useState } from 'react'

type CartItem = {
  id: string
  name: string
  price: number
  image: string
  quantity: number
  is_on_sale?: boolean
  sale_price?: number | null
}

type Promo = {
  code: string
  discount_type: 'percentage' | 'fixed'
  discount_value: number
}

type CartContextType = {
  cart: CartItem[]
  promo: Promo | null

  addToCart: (product: Omit<CartItem, 'quantity'>) => void
  removeFromCart: (id: string) => void
  increaseQty: (id: string) => void
  decreaseQty: (id: string) => void
  clearCart: () => void

  applyPromo: (promo: Promo) => void
  removePromo: () => void

  subtotal: number
  discount: number
  total: number
}

const CartContext = createContext<CartContextType | null>(null)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([])
  const [promo, setPromo] = useState<Promo | null>(null)

  useEffect(() => {
    const storedCart = localStorage.getItem('cart')
    const storedPromo = localStorage.getItem('promo')

    if (storedCart) setCart(JSON.parse(storedCart))
    if (storedPromo) setPromo(JSON.parse(storedPromo))
  }, [])

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart))
  }, [cart])

  useEffect(() => {
    if (promo) {
      localStorage.setItem('promo', JSON.stringify(promo))
    } else {
      localStorage.removeItem('promo')
    }
  }, [promo])

  const addToCart = (product: Omit<CartItem, 'quantity'>) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id)

      if (existing) {
        return prev.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      }

      return [...prev, { ...product, quantity: 1 }]
    })
  }

  const removeFromCart = (id: string) => {
    setCart((prev) => prev.filter((item) => item.id !== id))
  }

  const increaseQty = (id: string) => {
    setCart((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      )
    )
  }

  const decreaseQty = (id: string) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item.id === id
            ? { ...item, quantity: item.quantity - 1 }
            : item
        )
        .filter((item) => item.quantity > 0)
    )
  }

  const clearCart = () => {
    setCart([])
    setPromo(null)
  }

  const applyPromo = (promo: Promo) => {
    setPromo(promo)
  }

  const removePromo = () => {
    setPromo(null)
  }

  const subtotal = cart.reduce((acc, item) => {
    const price =
      item.is_on_sale && item.sale_price
        ? item.sale_price
        : item.price

    return acc + price * item.quantity
  }, 0)

  let discount = 0

  if (promo) {
    if (promo.discount_type === 'percentage') {
      discount = (subtotal * promo.discount_value) / 100
    } else {
      discount = promo.discount_value
    }
  }

  const total = Math.max(subtotal - discount, 0)

  return (
    <CartContext.Provider
      value={{
        cart,
        promo,
        addToCart,
        removeFromCart,
        increaseQty,
        decreaseQty,
        clearCart,
        applyPromo,
        removePromo,
        subtotal,
        discount,
        total,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) throw new Error('useCart must be used inside CartProvider')
  return context
}