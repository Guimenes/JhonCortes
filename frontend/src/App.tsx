import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Header from './components/Header'
import Hero from './components/Hero'
import './App.css'
import LoginPage from './pages/Login'
import RegisterPage from './pages/Register'
import { AuthProvider } from './hooks/useAuth'

function App() {
  const [showBookingModal, setShowBookingModal] = useState(false)

  const handleBookingClick = () => {
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
              
              {/* Placeholder sections for the landing page */}
              <section id="servicos" style={{ padding: '100px 0', textAlign: 'center', background: '#f5f5f5' }}>
                <div className="container">
                  <h2>Nossos Serviços</h2>
                  <p>Em breve: Seção completa de serviços</p>
                </div>
              </section>
              
              <section id="sobre" style={{ padding: '100px 0', textAlign: 'center' }}>
                <div className="container">
                  <h2>Sobre Jhon Cortes</h2>
                  <p>Em breve: História e experiência do profissional</p>
                </div>
              </section>
              
              <section id="galeria" style={{ padding: '100px 0', textAlign: 'center', background: '#f5f5f5' }}>
                <div className="container">
                  <h2>Galeria</h2>
                  <p>Em breve: Galeria de trabalhos realizados</p>
                </div>
              </section>
              
              <section id="contato" style={{ padding: '100px 0', textAlign: 'center' }}>
                <div className="container">
                  <h2>Contato</h2>
                  <p>Em breve: Informações de contato e localização</p>
                </div>
              </section>
            </main>
          } />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Routes>
        
        {/* Modal de agendamento - placeholder */}
        {showBookingModal && (
          <div 
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0,0,0,0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 9999
            }}
            onClick={() => setShowBookingModal(false)}
          >
            <div 
              style={{
                background: 'white',
                padding: '2rem',
                borderRadius: '12px',
                maxWidth: '400px',
                width: '90%',
                textAlign: 'center'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3>Sistema de Agendamento</h3>
              <p>Em desenvolvimento...</p>
              <p>Em breve você poderá agendar seus horários online!</p>
              <button 
                className="btn btn-primary mt-4"
                onClick={() => setShowBookingModal(false)}
              >
                Fechar
              </button>
            </div>
          </div>
        )}
        </div>
      </Router>
    </AuthProvider>
  )
}

export default App
