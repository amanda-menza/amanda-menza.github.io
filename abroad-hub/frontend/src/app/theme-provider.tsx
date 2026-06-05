'use client'

import api from "../api";
import { useEffect } from 'react'

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    async function fetchColor() {
      try {
        const primary_response = await api.get(`/api/primary-color/`);
        const secondary_response = await api.get(`/api/secondary-color/`);
        const primary_color = primary_response.data.color || '#D3D3D3'
        const secondary_color = secondary_response.data.color || '#000000'
        document.documentElement.style.setProperty('--theme-color', primary_color)
        document.documentElement.style.setProperty('--secondary-color', secondary_color)
      } catch (err) {
        console.error('Failed to fetch theme colors:', err)
      }
    }

    fetchColor()
  }, [])

  return <>{children}</>
}
