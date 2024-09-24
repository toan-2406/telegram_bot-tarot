import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { LoadingProvider, useLoading } from './contexts/loading.context.tsx'

const LoadingScreen = () => {
  const { loading } = useLoading();
  return loading ? (
    <div className="loading-screen">
      <div className="spinner"></div>
    </div>
  ) : null;
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <LoadingProvider>
      <LoadingScreen />
      <App />
    </LoadingProvider>
  </StrictMode>,
)
