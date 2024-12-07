# Who I'm | من أنا

A bilingual (Arabic/English) personality analysis web application powered by AI, with Google Pay integration.

## 🌟 Features

- 🤖 Interactive AI Personality Analysis
- 💳 Google Pay Integration
- 🌐 Bilingual Support (Arabic/English)
- 🔥 Firebase Backend
- 📱 Responsive Design

## 🏗️ Project Structure

```
├── frontend/
│   ├── public/
│   │   ├── index.html
│   │   ├── styles/
│   │   └── assets/
│   └── src/
│       ├── components/
│       ├── services/
│       └── utils/
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   └── services/
└── firebase/
    └── config/
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v14 or higher)
- Firebase account
- Google Pay merchant account
- ChatGPT/Grok API access

### Installation

1. Clone the repository:
```bash
git clone https://github.com/alshfa0e/who-im.git
cd who-im
```

2. Install dependencies:
```bash
# Frontend
cd frontend
npm install

# Backend
cd ../backend
npm install
```

3. Configure environment variables:
```bash
# Create .env files in both frontend and backend directories
cp .env.example .env
```

### Configuration

1. Firebase Setup:
   - Create a new Firebase project
   - Add configuration to `firebase/config/firebase.config.js`

2. Google Pay Setup:
   - Configure merchant account
   - Add merchant ID to payment configuration

## 💻 Development

```bash
# Start frontend development server
cd frontend
npm run dev

# Start backend development server
cd ../backend
npm run dev
```

## 🌐 Available Languages

- English (EN)
- Arabic (AR)

## 💰 Payment Features

- Free 4-line personality summary
- Premium detailed analysis report
- Secure payment processing via Google Pay

## 📱 User Experience

1. Start personality assessment chat
2. Receive free personality summary
3. Option to purchase detailed analysis
4. Access full report after payment
5. Save and review past analyses

## 🔒 Security Features

- Secure payment processing
- Data encryption
- User authentication
- Session management

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License