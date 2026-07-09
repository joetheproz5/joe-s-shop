import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { HelmetProvider } from 'react-helmet-async'
import { Toaster } from 'react-hot-toast'
import App from './App'
import { ThemeProvider } from './context/ThemeContext'
import { AuthProvider } from './context/AuthContext'
import './styles/globals.css'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

const routerBasename =
  import.meta.env.BASE_URL === '/'
    ? undefined
    : import.meta.env.BASE_URL.replace(/\/$/, '')

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <HelmetProvider>
        <ThemeProvider>
          <AuthProvider>
            <BrowserRouter basename={routerBasename}>
              <App />
              <Toaster
                position="bottom-right"
                toastOptions={{
                  duration: 4000,
                  style: {
                    borderRadius: '1rem',
                    background: 'rgba(255,255,255,0.9)',
                    backdropFilter: 'blur(12px)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    color: '#212529',
                    fontSize: '14px',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                  },
                  className: '!dark:bg-surface-900/90 !dark:text-surface-50 !dark:border-surface-700/50',
                }}
              />
            </BrowserRouter>
          </AuthProvider>
        </ThemeProvider>
      </HelmetProvider>
    </QueryClientProvider>
  </React.StrictMode>,
)
