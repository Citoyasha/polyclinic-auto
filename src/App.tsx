import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'sonner'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import Login from '@/pages/Login'
import Home from '@/pages/Home'
import NewVisit from '@/pages/NewVisit'
import CarDetail from '@/pages/CarDetail'
import Customers from '@/pages/Customers'
import Customer from '@/pages/Customer'
import Receipt from '@/pages/Receipt'
import Stock from '@/pages/Stock'
import StockItem from '@/pages/StockItem'
import Search from '@/pages/Search'
import Settings from '@/pages/Settings'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      refetchOnWindowFocus: false,
    },
  },
})

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            }
          />
          <Route
            path="/nouvelle-visite"
            element={
              <ProtectedRoute>
                <NewVisit />
              </ProtectedRoute>
            }
          />
          <Route
            path="/voiture/:plate"
            element={
              <ProtectedRoute>
                <CarDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/voiture/:plate/recu"
            element={
              <ProtectedRoute>
                <Receipt />
              </ProtectedRoute>
            }
          />
          <Route
            path="/visite/:visitId/recu"
            element={
              <ProtectedRoute>
                <Receipt />
              </ProtectedRoute>
            }
          />
          <Route
            path="/clients"
            element={
              <ProtectedRoute>
                <Customers />
              </ProtectedRoute>
            }
          />
          <Route
            path="/client/:phone"
            element={
              <ProtectedRoute>
                <Customer />
              </ProtectedRoute>
            }
          />
          <Route
            path="/stock"
            element={
              <ProtectedRoute>
                <Stock />
              </ProtectedRoute>
            }
          />
          <Route
            path="/stock/:itemId"
            element={
              <ProtectedRoute>
                <StockItem />
              </ProtectedRoute>
            }
          />
          <Route
            path="/recherche"
            element={
              <ProtectedRoute>
                <Search />
              </ProtectedRoute>
            }
          />
          <Route
            path="/parametres"
            element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
      <Toaster richColors position="top-center" />
    </QueryClientProvider>
  )
}
