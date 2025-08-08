# 💈 Jhon Cortes Barber Shop

Uma aplicação completa para gerenciamento de barbearia com sistema de agendamentos online, desenvolvida com as melhores tecnologias do mercado.

## 🎨 Design & Paleta de Cores

O projeto utiliza uma paleta moderna e elegante inspirada no universo das barbearias tradicionais:

- **Preto Principal**: #0D0D0D
- **Amarelo Principal**: #FFD700  
- **Dourado**: #B8860B
- **Variações**: Tons complementares para criar profundidade e elegância

## 🚀 Tecnologias Utilizadas

### Frontend
- **React 18** com TypeScript
- **Vite** para build e desenvolvimento
- **React Router DOM** para navegação
- **Axios** para requisições HTTP
- **React Hook Form** + **Zod** para formulários
- **Lucide React** para ícones
- **CSS Modules** com variáveis CSS customizadas

### Backend
- **Node.js** com TypeScript
- **Express.js** para API REST
- **MongoDB** com Mongoose
- **JWT** para autenticação
- **bcryptjs** para criptografia
- **Helmet** + **CORS** para segurança

## 📱 Funcionalidades

### 🎯 Landing Page
- [x] Design responsivo e moderno
- [x] Hero section com call-to-action
- [x] Seções: Serviços, Sobre, Galeria, Contato
- [x] Animações suaves e interativas
- [x] Otimizada para mobile

### 👤 Sistema de Usuários
- [ ] Cadastro e login de clientes
- [ ] Painel administrativo
- [ ] Gerenciamento de perfis
- [ ] Sistema de permissões (usuário/admin)

### ⏰ Sistema de Agendamentos
- [ ] Calendário interativo
- [ ] Seleção de serviços
- [ ] Horários disponíveis em tempo real
- [ ] Confirmação via email/SMS
- [ ] Reagendamento e cancelamento

### 💼 Gerenciamento de Serviços
- [ ] CRUD completo de serviços
- [ ] Categorização (corte, barba, combo, tratamento)
- [ ] Preços e duração
- [ ] Upload de imagens

### 📊 Dashboard Administrativo
- [ ] Visão geral de agendamentos
- [ ] Relatórios de faturamento
- [ ] Gestão de clientes
- [ ] Configurações da barbearia

## 🏗️ Estrutura do Projeto

```
JhonCortes/
├── frontend/                 # Aplicação React
│   ├── src/
│   │   ├── components/      # Componentes reutilizáveis
│   │   ├── pages/          # Páginas da aplicação
│   │   ├── hooks/          # Custom hooks
│   │   ├── services/       # Serviços e API calls
│   │   ├── types/          # Definições TypeScript
│   │   └── utils/          # Funções utilitárias
│   └── public/             # Assets estáticos
├── backend/                 # API Node.js
│   ├── src/
│   │   ├── controllers/    # Controladores
│   │   ├── models/         # Modelos do MongoDB
│   │   ├── routes/         # Rotas da API
│   │   ├── middleware/     # Middlewares
│   │   └── utils/          # Utilitários
│   └── dist/               # Código transpilado
└── README.md
```

## 🛠️ Instalação e Configuração

### Pré-requisitos
- Node.js (v18 ou superior)
- MongoDB
- npm ou yarn

### Backend

1. **Navegue para a pasta do backend:**
   ```bash
   cd backend
   ```

2. **Instale as dependências:**
   ```bash
   npm install
   ```

3. **Configure as variáveis de ambiente:**
   ```bash
   cp .env.example .env
   ```
   
   Edite o arquivo `.env` com suas configurações:
   ```env
   MONGODB_URI=mongodb://localhost:27017/jhon-cortes-barber
   JWT_SECRET=seu-jwt-secret-aqui
   PORT=5000
   ```

4. **Execute o servidor de desenvolvimento:**
   ```bash
   npm run dev
   ```

### Frontend

1. **Navegue para a pasta do frontend:**
   ```bash
   cd frontend
   ```

2. **Instale as dependências:**
   ```bash
   npm install
   ```

3. **Configure as variáveis de ambiente:**
   ```bash
   cp .env.example .env
   ```

4. **Execute o servidor de desenvolvimento:**
   ```bash
   npm run dev
   ```

5. **Acesse a aplicação:**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5000

## 📦 Scripts Disponíveis

### Frontend
- `npm run dev` - Inicia o servidor de desenvolvimento
- `npm run build` - Gera build de produção
- `npm run preview` - Preview do build de produção
- `npm run lint` - Executa o linter

### Backend
- `npm run dev` - Inicia o servidor com nodemon
- `npm run build` - Transpila TypeScript para JavaScript
- `npm start` - Inicia o servidor de produção

## 🎨 Padrões de Código

### Frontend
- Cada componente segue o padrão: `index.tsx` + `styles.css`
- Componentes em PascalCase
- Hooks customizados com prefixo `use`
- Tipagem forte com TypeScript

### Backend
- Arquitetura MVC
- Middlewares para autenticação e validação
- Modelos Mongoose com validação
- Tratamento de erros centralizado

## 🚦 API Endpoints

### Autenticação
- `POST /api/auth/register` - Cadastro de usuário
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Usuário atual
- `PUT /api/auth/profile` - Atualizar perfil

### Serviços
- `GET /api/services` - Listar serviços ativos
- `GET /api/services/:id` - Buscar serviço
- `POST /api/services` - Criar serviço (admin)
- `PUT /api/services/:id` - Atualizar serviço (admin)
- `DELETE /api/services/:id` - Desativar serviço (admin)

### Agendamentos
- `GET /api/appointments/my-appointments` - Meus agendamentos
- `GET /api/appointments` - Todos agendamentos (admin)
- `POST /api/appointments` - Criar agendamento
- `PATCH /api/appointments/:id/status` - Atualizar status (admin)
- `DELETE /api/appointments/:id` - Cancelar agendamento

## 🔐 Segurança

- Senhas criptografadas com bcryptjs
- Autenticação JWT
- Validação de dados de entrada
- Headers de segurança com Helmet
- CORS configurado
- Rate limiting (a implementar)

## 📱 Responsividade

O projeto foi desenvolvido com abordagem **mobile-first**, garantindo excelente experiência em:

- 📱 Mobile (320px+)
- 📱 Tablet (768px+)
- 💻 Desktop (1024px+)
- 🖥️ Large screens (1440px+)

## 🚀 Deploy

### Frontend (Vercel/Netlify)
1. Build do projeto: `npm run build`
2. Deploy da pasta `dist`
3. Configurar variáveis de ambiente

### Backend (Railway/Heroku)
1. Build do projeto: `npm run build`
2. Deploy com start script: `npm start`
3. Configurar MongoDB Atlas
4. Configurar variáveis de ambiente

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 👨‍💼 Autor

**Jhon Cortes Barber Shop**
- Website: [Em breve]
- Instagram: [@jhoncortes]
- WhatsApp: (11) 99999-9999

---

⚡ **Desenvolvido com React + TypeScript + Node.js + MongoDB** ⚡
