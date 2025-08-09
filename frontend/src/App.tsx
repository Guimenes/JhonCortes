import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Header from './components/Header'
import Footer from './components/Footer'
import Hero from './components/Hero'
import ServicesSection from './components/ServicesSection'
import AboutSection from './components/AboutSection'
import GallerySection from './components/GallerySection'
import AuthPage from './pages/Auth'
import AdminServices from './pages/AdminServices'
import AdminSchedules from './pages/AdminSchedules'
import AdminGallery from './pages/AdminGallery'
import UserBooking from './pages/UserBooking'
import BookingWizard from './components/BookingWizard'
import './App.css'
import { AuthProvider } from './hooks/useAuth'
import type { Service } from './types'

function App() {
  const [showBookingModal, setShowBookingModal] = useState(false)
  const [preSelectedService, setPreSelectedService] = useState<Service | null>(null)

  const handleBookingClick = (service?: Service) => {
    if (service) {
      setPreSelectedService(service)
    } else {
      setPreSelectedService(null)
    }
    setShowBookingModal(true)
  }

  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Header onBookingClick={handleBookingClick} />
        
        <Routes>
          <Route path="/" element={
            <main>
              <Hero onBookingClick={handleBookingClick} />
              
              {/* Seção de Serviços */}
              <ServicesSection onBookingClick={handleBookingClick} />
              
              <AboutSection />
              
              <GallerySection />
              
              <section id="contato" style={{ padding: '100px 0', textAlign: 'center' }}>
                <div className="container">
                  <h2>Contato</h2>
                  <p>Em breve: Informações de contato e localização</p>
                </div>
              </section>
            </main>
          } />
          <Route path="/login" element={<AuthPage />} />
          <Route path="/register" element={<AuthPage />} />
          <Route path="/booking" element={<UserBooking />} />
          <Route path="/admin/services" element={<AdminServices />} />
          <Route path="/admin/schedules" element={<AdminSchedules />} />
          <Route path="/admin/gallery" element={<AdminGallery />} />
        </Routes>
        
        {/* Modal de agendamento com BookingWizard */}
        {showBookingModal && (
          <BookingWizard 
            onClose={() => setShowBookingModal(false)}
            onSuccess={() => setShowBookingModal(false)} 
            initialService={preSelectedService}
          />
        )}
        <Footer />
        </div>
      </Router>
    </AuthProvider>
  )
}

export default App
