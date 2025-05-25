# Fades n Braids Loyalty System

A comprehensive loyalty program system for Fades n Braids salon that allows customers to earn points with every visit and redeem rewards.

## Features

### Customer Features
- **Registration & Login**: Phone number-based authentication
- **Points System**: Earn 10 points per visit + 50 welcome bonus
- **QR/Digit Code Check-in**: Quick check-in system
- **Rewards Catalog**: Browse and redeem available rewards
- **Visit History**: Track all visits and points earned
- **Mobile-Responsive**: Optimized for mobile devices

### Business Features
- **Dashboard**: Overview of customers, visits, and statistics
- **Customer Management**: View and manage customer accounts
- **Rewards Management**: Create, edit, and manage reward offerings
- **Check-in Codes**: Display QR codes and digit codes for customer check-ins
- **Points Management**: Award bonus points to customers
- **Settings**: Configure points per visit, welcome bonus, etc.

## Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or cloud instance)

### Quick Start

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Create environment file**
   ```bash
   cp .env.example .env
   ```

   Edit `.env` with your MongoDB connection string and other settings.

3. **Initialize the database**
   ```bash
   npm run init
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Access the application**
   - Main site: http://localhost:3000
   - Business login: http://localhost:3000/business/login (admin@fadesbraids.com / admin123)

## Color Scheme

- Primary Orange: #ee752a
- Primary Pink: #e45462
- Primary Purple: #b95087
- Primary Violet: #7b5690
- Primary Blue: #44547c
- Primary Dark: #2f4858