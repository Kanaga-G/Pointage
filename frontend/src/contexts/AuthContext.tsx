import React from 'react'

const AuthContext = React.createContext<{
  user: any | null
  login: (user: any) => void
  logout: () => void
}>({
  user: null,
  login: () => {},
  logout: () => {}
})

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = React.useState<any | null>(null)

  const login = (userData: any) => setUser(userData)
  const logout = () => setUser(null)

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export default AuthContext
