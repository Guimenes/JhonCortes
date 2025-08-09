import React, { useRef, useEffect } from 'react';
import { Award, Star, Users, Calendar, Scissors } from 'lucide-react';
import './styles.css';

const AboutSection: React.FC = () => {
  const sectionRef = useRef<HTMLDivElement>(null);

  // Efeito para animações ao rolar
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-in');
          }
        });
      },
      { threshold: 0.1 }
    );
    
    const animatedElements = document.querySelectorAll('.animate-on-scroll');
    animatedElements.forEach(el => observer.observe(el));
    
    return () => {
      animatedElements.forEach(el => observer.unobserve(el));
    };
  }, []);

  const achievements = [
    { 
      icon: <Award size={28} />, 
      count: '10+', 
      label: 'Anos de Experiência',
      description: 'Uma década transformando estilos e confiança' 
    },
    { 
      icon: <Star size={28} />, 
      count: '500+', 
      label: 'Clientes Satisfeitos',
      description: 'Construindo relações duradouras baseadas em confiança' 
    },
    { 
      icon: <Users size={28} />, 
      count: '15+', 
      label: 'Especialidades',
      description: 'Técnicas e estilos para todos os tipos de barba e cabelo' 
    },
    { 
      icon: <Calendar size={28} />, 
      count: '6K+', 
      label: 'Serviços Realizados',
      description: 'Transformando visuais e elevando a autoestima' 
    }
  ];

  return (
    <section id="sobre" className="about-section" ref={sectionRef}>
      <div className="about-container container">
        <div className="about-grid">
          {/* Coluna da Foto */}
          <div className="about-image-column animate-on-scroll">
            <div className="about-image-frame">
              <img 
                src="/uploads/barber.jpg" 
                alt="Jhon Cortes" 
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = 'https://placehold.co/600x800/1A1A1A/FFF?text=Jhon+Cortes';
                }}
              />
              <div className="experience-badge">
                <span className="experience-number">10+</span>
                <span className="experience-text">anos de experiência</span>
              </div>
            </div>
            <div className="signature">
              <img 
                src="/uploads/signature.png" 
                alt="Assinatura Jhon Cortes" 
                className="signature-img"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = 'https://placehold.co/300x100/1A1A1A/FFD700?text=Jhon+Cortes';
                }} 
              />
            </div>
          </div>
          
          {/* Coluna de Conteúdo */}
          <div className="about-content-column">
            <div className="section-subtitle animate-on-scroll">
              <div className="subtitle-icon">
                <Scissors size={16} />
              </div>
              <span>CONHEÇA A HISTÓRIA</span>
            </div>
            
            <h2 className="section-title animate-on-scroll">
              Sobre Jhon Cortes
            </h2>
            
            <div className="about-description animate-on-scroll">
              <p>
                Com mais de uma década de experiência, Jhon Cortes se destacou como um dos principais
                barbeiros do Brasil, trazendo técnicas inovadoras e um olhar único para cada cliente.
              </p>
              
              <p>
                Especializado em cortes modernos, barbas bem definidas e tratamentos capilares exclusivos,
                Jhon criou um espaço onde tradição e inovação se encontram para proporcionar uma
                experiência completa de cuidado masculino.
              </p>
              
              <p>
                Formado pelas melhores escolas de barbearia da Europa e América Latina, ele traz influências 
                internacionais para seu trabalho, sempre respeitando a personalidade e estilo de cada cliente.
              </p>
            </div>
            
            <div className="about-quote animate-on-scroll">
              <blockquote>
                "Para mim, a barbearia vai além da estética. É sobre confiança, bem-estar e fazer cada cliente 
                sair não apenas com um visual melhor, mas se sentindo melhor consigo mesmo."
                <cite>— Jhon Cortes</cite>
              </blockquote>
            </div>
          </div>
        </div>
        
        {/* Conquistas e Números */}
        <div className="achievements-section animate-on-scroll">
          <div className="achievements-grid">
            {achievements.map((item, index) => (
              <div className="achievement-card" key={index}>
                <div className="achievement-icon">
                  {item.icon}
                </div>
                <div className="achievement-content">
                  <div className="achievement-count">{item.count}</div>
                  <h3 className="achievement-title">{item.label}</h3>
                  <p className="achievement-description">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* CTA para Agendamento */}
        <div className="about-cta animate-on-scroll">
          <h3>Pronto para transformar seu visual?</h3>
          <p>Agende um horário e venha conhecer nosso trabalho de perto</p>
          <a href="#servicos" className="btn btn-primary btn-lg">
            Ver Serviços e Agendar
          </a>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
