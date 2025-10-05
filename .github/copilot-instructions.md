# HR Management Dashboard - Coding Ninjas Club

This workspace contains a complete HR Management Dashboard application built for Coding Ninjas Club with the following architecture:

## Project Structure
- **Frontend**: Next.js 15 with App Router, TypeScript, Tailwind CSS
- **Backend**: Node.js with Express.js, JWT authentication
- **Database**: MongoDB Atlas with Mongoose ODM
- **Email System**: Nodemailer with SMTP integration

## Key Features
- Member management with comprehensive profiles
- Warning system with automated email notifications
- Analytics dashboard with charts and metrics
- Secure authentication and role-based access
- Custom email templates for communication

## Development Servers
- Frontend: `npm run dev` in `/frontend` (http://localhost:3000)
- Backend: `npm start` in `/backend` (http://localhost:5000)

## Custom Color Scheme  
- Primary Orange: #ff6b35
- Secondary Blue: #1e3a8a  
- Dark Blue: #1e293b
- Accent Black: #000000

## Environment Setup Required
1. MongoDB Atlas connection string in backend/.env
2. SMTP email credentials for automated notifications
3. JWT secret key for authentication

## Development Notes
- Uses Tailwind CSS v4 with custom variables
- Implements JWT-based authentication flow
- Includes comprehensive API documentation
- Features responsive design with mobile support