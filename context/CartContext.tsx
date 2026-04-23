'use client'

import { createContext, useContext, useEffect, useRef, useState } from 'react'
import { supabase } from '@/lib/supabase/client'

type CartItem = {
  id: string
  name: string
  price: number
  image: string
  quantity: number
  is_on_sale?: boolean
  sale_price?: number | null
  is_out_of_stock?: boolean
}

type Promo = {
  code: string
  discount_type: 'percentage' | 'fixed'
  discount_value: number
}

type ProductSnapshot = {
  id: string
  name: string
  price: number
  image_url: string | null
  is_on_sale: boolean
  sale_price: number | null
  is_out_of_stock: boolean
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
  const hasSyncedInventory = useRef(false)
  const [cart, setCart] = useState<CartItem[]>(() => {
    if (typeof window === 'undefined') return []

    const storedCart = localStorage.getItem('cart')
    return storedCart ? (JSON.parse(storedCart) as CartItem[]) : []
  })

  const [promo, setPromo] = useState<Promo | null>(() => {
    if (typeof window === 'undefined') return null

    const storedPromo = localStorage.getItem('promo')
    return storedPromo ? (JSON.parse(storedPromo) as Promo) : null
  })

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

  useEffect(() => {
    const syncCartWithInventory = async () => {
      if (cart.length === 0) return

      const cartIds = [...new Set(cart.map((item) => item.id))]
      const { data, error } = await supabase
        .from('products')
        .select('id, name, price, image_url, is_on_sale, sale_price, is_out_of_stock')
        .in('id', cartIds)

      if (error || !data) return

      const productMap = new Map(
        (data as ProductSnapshot[]).map((product) => [product.id, product])
      )

      setCart((prev) =>
        prev.reduce<CartItem[]>((acc, item) => {
          const liveProduct = productMap.get(item.id)
          if (!liveProduct) return acc

          acc.push({
            ...item,
            name: liveProduct.name,
            price: liveProduct.price,
            image: liveProduct.image_url || item.image,
            is_on_sale: liveProduct.is_on_sale,
            sale_price: liveProduct.sale_price,
            is_out_of_stock: liveProduct.is_out_of_stock,
          })

          return acc
        }, [])
      )
    }

    if (hasSyncedInventory.current) {
      return
    }

    hasSyncedInventory.current = true
    void syncCartWithInventory()
  }, [cart])

  const addToCart = (product: Omit<CartItem, 'quantity'>) => {
    if (product.is_out_of_stock) return

    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id)

      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
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
          ? item.is_out_of_stock
            ? item
            : { ...item, quantity: item.quantity + 1 }
          : item
      )
    )
  }

  const decreaseQty = (id: string) => {
    setCart((prev) =>
      prev
        .map((item) => (item.id === id ? { ...item, quantity: item.quantity - 1 } : item))
        .filter((item) => item.quantity > 0)
    )
  }

  const clearCart = () => {
    setCart([])
    setPromo(null)
  }

  const applyPromo = (nextPromo: Promo) => {
    setPromo(nextPromo)
  }

  const removePromo = () => {
    setPromo(null)
  }

  const subtotal = cart.reduce((acc, item) => {
    const price = item.is_on_sale && item.sale_price ? item.sale_price : item.price
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
