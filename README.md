# Harari EBDAL Website

A modern React application for preserving and celebrating Harari culture, featuring newsletter subscription, donation functionality, and admin management.

## 🚀 Features

- **Newsletter Subscription**: Users can subscribe to receive cultural updates
- **Donation System**: Secure donations via Stripe integration
- **Admin Dashboard**: Manage subscribers and view analytics
- **Email Notifications**: Automated welcome emails and admin notifications
- **Responsive Design**: Modern UI with Tailwind CSS
- **Serverless Architecture**: Deployed on Vercel with MongoDB Atlas

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS
- **Backend**: Vercel Serverless Functions
- **Database**: MongoDB Atlas
- **Email Service**: Brevo SMTP
- **Payment Processing**: Stripe
- **Deployment**: Vercel

## 🔧 Environment Variables

Create a `.env` file in the root directory and add the following variables:

```env
# MongoDB
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/harari_ebdal

# Brevo Email Service
BREVO_EMAIL=your-email@example.com
BREVO_SMTP_LOGIN=your-smtp-login
BREVO_SMTP_PASSWORD=your-smtp-password
ADMIN_EMAIL=admin@example.com

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Admin
ADMIN_SECRET=your-admin-password

# Frontend URL
FRONTEND_URL=https://your-domain.vercel.app
```

## 📦 Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/harari-ebdal-website.git
cd harari-ebdal-website
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables (see above)

4. For local development:
```bash
npm run dev
```

## 🚀 Deployment to Vercel

### Prerequisites

1. **MongoDB Atlas Account**: Create a free cluster at [MongoDB Atlas](https://cloud.mongodb.com/)
2. **Brevo Account**: Sign up at [Brevo](https://brevo.com) for email services
3. **Stripe Account**: Create account at [Stripe](https://stripe.com) for payments
4. **Vercel Account**: Sign up at [Vercel](https://vercel.com)

### Step 1: Set up MongoDB Atlas

1. Create a new cluster in MongoDB Atlas
2. Create a database user with read/write permissions
3. Add your IP address to the IP whitelist (or allow all IPs: 0.0.0.0/0)
4. Get your connection string and add it to MONGODB_URI

### Step 2: Configure Brevo SMTP

1. Go to Brevo Dashboard → SMTP & API → SMTP tab
2. Create SMTP credentials
3. Note down the SMTP login and password
4. Add these to your environment variables

### Step 3: Set up Stripe

1. Create a Stripe account
2. Get your secret key from the dashboard
3. Set up a webhook endpoint for your domain
4. Add webhook secret to environment variables

### Step 4: Deploy to Vercel

1. **Install Vercel CLI**:
```bash
npm install -g vercel
```

2. **Build the project**:
```bash
npm run build
```

3. **Deploy to Vercel**:
```bash
vercel --prod
```

4. **Set Environment Variables in Vercel**:
   - Go to your project dashboard on Vercel
   - Navigate to Settings → Environment Variables
   - Add all the environment variables from your `.env` file

### Step 5: Configure Stripe Webhook

1. In your Stripe dashboard, go to Developers → Webhooks
2. Add a new webhook endpoint: `https://your-domain.vercel.app/api/webhook`
3. Select the event: `checkout.session.completed`
4. Copy the webhook secret and add it to your Vercel environment variables

## 🔗 API Endpoints

### Public Endpoints
- `GET /api/health` - Health check
- `POST /api/subscribe` - Subscribe to newsletter
- `POST /api/unsubscribe` - Unsubscribe from newsletter
- `GET /api/subscribers/count` - Get subscriber count
- `POST /api/create-checkout-session` - Create Stripe checkout session
- `POST /api/webhook` - Stripe webhook handler
- `GET /api/checkout-session/[sessionId]` - Get checkout session details
- `GET /api/donations/stats` - Get donation statistics
- `GET /api/test-email` - Test email configuration

### Admin Endpoints
- `POST /api/admin/login` - Admin login
- `GET /api/admin/subscribers` - Get all subscribers
- `DELETE /api/admin/subscribers/[id]` - Delete subscriber

## 📁 Project Structure

```
harari-ebdal-website/
├── api/                    # Vercel serverless functions
│   ├── utils/
│   │   ├── database.js     # Database operations
│   │   └── email.js        # Email service
│   ├── admin/
│   │   ├── login.js        # Admin authentication
│   │   └── subscribers.js  # Subscriber management
│   ├── donations/
│   │   └── stats.js        # Donation statistics
│   ├── subscribers/
│   │   └── count.js        # Subscriber count
│   ├── checkout-session/
│   │   └── [sessionId].js  # Session details
│   ├── health.js           # Health check
│   ├── subscribe.js        # Newsletter subscription
│   ├── unsubscribe.js      # Newsletter unsubscription
│   ├── create-checkout-session.js  # Stripe checkout
│   ├── webhook.js          # Stripe webhook
│   └── test-email.js       # Email testing
├── src/                    # React frontend
│   ├── components/         # React components
│   ├── constants/          # App constants
│   └── assets/             # Static assets
├── public/                 # Public assets
├── dist/                   # Build output
├── vercel.json             # Vercel configuration
└── package.json            # Dependencies
```

## 🔐 Security

- All API endpoints include CORS headers
- Admin routes require authentication
- Stripe webhook signature verification
- Email validation and sanitization
- MongoDB connection with authentication

## 📧 Email Templates

The application includes beautiful HTML email templates for:
- Welcome emails for new subscribers
- Admin notifications for new subscriptions
- Test emails for configuration verification

## 🎨 Frontend Features

- Responsive design with Tailwind CSS
- Modern React components
- Newsletter subscription form
- Donation form with Stripe integration
- Admin dashboard for subscriber management
- Cultural content sections

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support, please email your-email@example.com or create an issue in the GitHub repository.

---

**Note**: This project has been converted from Express.js to Vercel serverless functions for better scalability and cost-effectiveness. The original server.js file is kept for reference but is no longer used in production. 