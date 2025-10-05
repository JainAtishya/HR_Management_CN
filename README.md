# HR Management Dashboard - Coding Ninjas Club

A comprehensive HR management system built for Coding Ninjas Club to manage members, track warnings, send communications, and analyze performance metrics.

## 🚀 Features

### Core Functionality
- **Member Management**: Complete member database with profiles, contact info, and status tracking
- **Warning System**: Issue warnings with severity levels and automatic email notifications
- **Email Management**: Automated onboarding emails, custom templates, and email logging
- **Analytics Dashboard**: Real-time insights with charts and performance metrics
- **Secure Authentication**: JWT-based login system with role-based access

### Technical Features
- **Modern Tech Stack**: Next.js 15, Node.js/Express, MongoDB Atlas
- **Responsive Design**: Beautiful UI with Tailwind CSS and custom color scheme
- **Real-time Updates**: Dynamic data loading and state management
- **Email Templates**: Professional HTML email templates with SMTP integration
- **Data Export**: Export analytics and reports in multiple formats

## 🛠 Tech Stack

### Frontend
- **Framework**: Next.js 15 with App Router
- **Styling**: Tailwind CSS with custom theme
- **Charts**: Recharts for data visualization
- **HTTP Client**: Axios for API communication
- **Icons**: Heroicons and Lucide React

### Backend
- **Runtime**: Node.js with Express.js
- **Database**: MongoDB Atlas with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Email**: Nodemailer with SMTP support
- **Validation**: Joi for request validation
- **Security**: Helmet, CORS, Rate limiting

## 📁 Project Structure

```
HR Management/
├── frontend/                 # Next.js Frontend
│   ├── src/
│   │   ├── app/             # App Router pages
│   │   │   ├── dashboard/   # Dashboard pages
│   │   │   │   ├── members/
│   │   │   │   ├── warnings/
│   │   │   │   ├── emails/
│   │   │   │   ├── analytics/
│   │   │   │   └── settings/
│   │   │   ├── login/       # Authentication
│   │   │   └── layout.tsx
│   │   ├── components/      # Reusable components
│   │   └── lib/            # API helpers & utilities
├── backend/                 # Node.js Backend
│   ├── routes/             # API routes
│   │   ├── auth.js
│   │   ├── members.js
│   │   ├── warnings.js
│   │   ├── emails.js
│   │   └── analytics.js
│   ├── models/             # MongoDB schemas
│   │   ├── HRUser.js
│   │   ├── Member.js
│   │   ├── Warning.js
│   │   └── EmailLog.js
│   ├── controllers/        # Business logic
│   ├── middlewares/        # Auth & validation
│   └── server.js          # Express server
└── README.md
```

## ⚙️ Installation & Setup

### Prerequisites
- Node.js (v18 or higher)
- MongoDB Atlas account
- SMTP email service (Gmail recommended)

### 1. Clone the Repository
```bash
git clone <repository-url>
cd "HR Management"
```

### 2. Backend Setup
```bash
cd backend
npm install
```

Create `.env` file in the backend directory:
```env
NODE_ENV=development
PORT=5000

# Database
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/hr-management?retryWrites=true&w=majority

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here-make-it-very-long-and-random
JWT_EXPIRES_IN=7d

# Email Configuration (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
FROM_EMAIL=hr@codingninjasclub.com
FROM_NAME=Coding Ninjas Club HR

# Frontend URL
FRONTEND_URL=http://localhost:3000
```

### 3. Frontend Setup
```bash
cd ../frontend
npm install
```

Create `.env.local` file in the frontend directory:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

### 4. Database Setup

1. Create a MongoDB Atlas cluster
2. Create a database named `hr-management`
3. Update the `MONGODB_URI` in your `.env` file
4. The application will automatically create the required collections

### 5. Email Configuration

For Gmail SMTP:
1. Enable 2-Factor Authentication
2. Generate an App Password
3. Use the App Password in `SMTP_PASS`

## 🚀 Running the Application

### Development Mode

1. **Start the Backend Server**:
```bash
cd backend
npm run dev
```
Server will run on http://localhost:5000

2. **Start the Frontend Development Server**:
```bash
cd frontend
npm run dev
```
Application will be available at http://localhost:3000

### Production Mode

1. **Build the Frontend**:
```bash
cd frontend
npm run build
npm start
```

2. **Start the Backend**:
```bash
cd backend
npm start
```

## 👥 Default Users

The system includes demo credentials for testing:

**Admin Account**:
- Email: `admin@codingninjasclub.com`
- Password: `admin123`
- Role: Admin (full access)

**HR Account**:
- Email: `hr@codingninjasclub.com`
- Password: `hr123`
- Role: HR (standard access)

## 📊 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update profile
- `POST /api/auth/change-password` - Change password

### Members
- `GET /api/members` - Get all members (with filtering)
- `POST /api/members` - Create new member
- `GET /api/members/:id` - Get member by ID
- `PUT /api/members/:id` - Update member
- `DELETE /api/members/:id` - Delete member

### Warnings
- `GET /api/warnings` - Get all warnings
- `POST /api/warnings` - Create warning
- `PUT /api/warnings/:id/resolve` - Resolve warning
- `GET /api/warnings/member/:memberId` - Get member warnings

### Emails
- `POST /api/emails/send` - Send custom email
- `GET /api/emails/logs` - Get email logs
- `GET /api/emails/templates` - Get email templates
- `POST /api/emails/resend/:id` - Resend failed email

### Analytics
- `GET /api/analytics/dashboard` - Dashboard statistics
- `GET /api/analytics/members` - Member analytics
- `GET /api/analytics/warnings` - Warning analytics
- `GET /api/analytics/emails` - Email analytics

## 🎨 Color Scheme

The application uses a custom color palette:

- **Primary Orange**: `#ff6b35` - Main brand color
- **Secondary Blue**: `#1e3a8a` - Secondary brand color  
- **Dark Blue**: `#1e293b` - Accent and navigation
- **Black**: `#000000` - Text and emphasis

## 🔧 Customization

### Adding New Features
1. Create new API routes in `backend/routes/`
2. Add corresponding database models in `backend/models/`
3. Create frontend pages in `frontend/src/app/dashboard/`
4. Update navigation in `dashboard/layout.tsx`

### Email Templates
Email templates are defined in `backend/controllers/emailController.js`. Customize the HTML templates to match your branding.

### Styling
The application uses Tailwind CSS with a custom configuration in `frontend/src/app/globals.css`. Modify the CSS variables to change the color scheme.

## 🐛 Troubleshooting

### Common Issues

1. **Database Connection Error**:
   - Verify MongoDB URI is correct
   - Check network access in MongoDB Atlas
   - Ensure database user has proper permissions

2. **Email Not Sending**:
   - Verify SMTP credentials
   - Check if Gmail App Password is used (not regular password)
   - Ensure "Less Secure Apps" is enabled if not using App Password

3. **Authentication Issues**:
   - Verify JWT_SECRET is set
   - Clear browser localStorage
   - Check if backend server is running

4. **Build Errors**:
   - Clear node_modules and reinstall dependencies
   - Check Node.js version compatibility
   - Verify all environment variables are set

## 📝 License

This project is developed for the Coding Ninjas Club and is intended for educational and organizational use.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📞 Support

For support and questions:
- Email: hr@codingninjasclub.com
- Create an issue in the repository
- Contact the development team

---

**Built with ❤️ for Coding Ninjas Club**