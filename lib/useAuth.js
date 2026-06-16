import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'

export function useAuth(redirect = true) {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/auth/me')
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data?.user) setUser(data.user)
        else if (redirect) router.replace('/login')
      })
      .finally(() => setLoading(false))
  }, [])

  return { user, setUser, loading }
}
