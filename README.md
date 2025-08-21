# SMPL Save App

A service mapping MVP built with clean architecture principles, allowing users to authenticate via phone and track their service subscriptions across categories like streaming, groceries, and internet providers.

## 🏗️ Architecture

This project follows **Clean Architecture** principles with a 3-layer structure:

```
src/
├── core/              # Domain layer (entities, business logic)
│   ├── entities/      # User, Service entities
│   ├── services/      # Business logic services
│   └── types/         # TypeScript interfaces
├── services/          # Infrastructure layer
│   ├── auth/          # Twilio SMS authentication
│   ├── database/      # Supabase database client
│   └── analytics/     # Future analytics integrations
└── ui/                # Presentation layer
    ├── components/    # React components
    ├── hooks/         # Custom React hooks
    └── pages/         # Page-level components
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ (or 20+ for optimal performance)
- npm or yarn
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd smpl-save-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Fill in your environment variables:
   ```env
   # Supabase Configuration
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   
   # Twilio Configuration
   TWILIO_ACCOUNT_SID=your_twilio_account_sid
   TWILIO_AUTH_TOKEN=your_twilio_auth_token
   TWILIO_VERIFY_SERVICE_SID=your_verify_service_sid
   ```

4. **Set up the database**
   ```bash
   # Run the SQL schema in your Supabase dashboard
   # Or use the Supabase CLI:
   npx supabase db reset
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🧪 Testing

This project uses **Test-Driven Development (TDD)** with comprehensive testing:

### Unit Tests (135 tests)
```bash
# Run all unit tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage
```

### End-to-End Tests
```bash
# Run E2E tests (headless)
npm run test:e2e

# Run E2E tests with UI
npm run test:e2e:ui

# Run E2E tests in headed mode
npm run test:e2e:headed
```

### Test Structure
- **Unit Tests**: `src/__tests__/` - Test business logic and components
- **E2E Tests**: `e2e/` - Test complete user workflows
- **Test Coverage**: All core business logic has 100% test coverage

## 🔧 Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm test             # Run unit tests
npm run test:e2e     # Run E2E tests
```

## 🗄️ Database Setup

### Supabase Schema

Run this SQL in your Supabase dashboard:

```sql
-- Create categories table
CREATE TABLE categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  icon TEXT NOT NULL,
  display_order INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create services table
CREATE TABLE services (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  logo_url TEXT,
  category_id TEXT REFERENCES categories(id),
  is_featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create users table
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  phone TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_services table
CREATE TABLE user_services (
  id SERIAL PRIMARY KEY,
  user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  service_id TEXT REFERENCES services(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, service_id)
);

-- Insert sample categories
INSERT INTO categories (id, name, icon, display_order) VALUES
  ('streaming', 'Streaming & Entertainment', '🎬', 1),
  ('groceries', 'Groceries', '🛒', 2),
  ('internet', 'Internet / Phone', '📡', 3),
  ('food-delivery', 'Food Delivery', '🍕', 4),
  ('transportation', 'Transportation', '🚗', 5);

-- Insert sample services
INSERT INTO services (id, name, logo_url, category_id, is_featured) VALUES
  ('netflix', 'Netflix', '/logos/netflix.png', 'streaming', true),
  ('hulu', 'Hulu', '/logos/hulu.png', 'streaming', false),
  ('disney', 'Disney+', '/logos/disney.png', 'streaming', true),
  ('walmart', 'Walmart', '/logos/walmart.png', 'groceries', true),
  ('target', 'Target', '/logos/target.png', 'groceries', true),
  ('verizon', 'Verizon', '/logos/verizon.png', 'internet', true);
```

## 🔐 Authentication Setup

### Twilio SMS Verification

1. **Create a Twilio account** at [twilio.com](https://twilio.com)
2. **Create a Verify Service** in the Twilio Console
3. **Get your credentials**:
   - Account SID
   - Auth Token  
   - Verify Service SID
4. **Add to environment variables**

### Phone Number Format
- Supports US and international numbers
- Automatically formats US numbers: `(123) 456-7890`
- International numbers: `+44 7777 777777`

## 🎨 UI Components

### AuthPage
- Phone number input with formatting
- SMS verification code input
- Form validation and error handling
- Loading states and accessibility

### ServiceSelector
- Grid layout with service cards
- Search functionality
- Keyboard navigation
- Selection/deselection with visual feedback

### ProgressTracker
- Circular progress indicator
- Category completion status
- Responsive design
- Accessibility compliant

## 🛠️ Development

### Project Structure

```
smpl-save-app/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── layout.tsx         # Root layout
│   │   ├── page.tsx           # Home page
│   │   └── globals.css        # Global styles
│   ├── core/                  # Domain layer
│   │   ├── entities/          # Business entities
│   │   ├── services/          # Business logic
│   │   └── types/             # TypeScript interfaces
│   ├── services/              # Infrastructure layer
│   │   ├── auth/              # Authentication providers
│   │   └── database/          # Database clients
│   ├── ui/                    # Presentation layer
│   │   └── components/        # React components
│   └── __tests__/             # Unit tests
├── e2e/                       # End-to-end tests
├── database/                  # Database schema and migrations
├── playwright.config.ts       # Playwright configuration
├── vitest.config.ts          # Vitest configuration
└── tailwind.config.js        # Tailwind CSS configuration
```

### Adding New Features

1. **Write failing tests first** (TDD approach)
2. **Implement the minimal code** to pass tests
3. **Refactor** while keeping tests green
4. **Update documentation** as needed

### Code Quality

- **TypeScript**: Strict type checking enabled
- **ESLint**: Configured with Next.js rules
- **Prettier**: Code formatting (run `npm run lint`)
- **Clean Architecture**: Maintain separation of concerns

## 🚀 Deployment

### Vercel (Recommended)

1. **Connect your repository** to Vercel
2. **Set environment variables** in Vercel dashboard
3. **Deploy** - automatic builds on push to main

### Manual Deployment

```bash
# Build the project
npm run build

# Start production server
npm run start
```

### Environment Variables for Production

Make sure to set all required environment variables in your deployment platform:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `TWILIO_ACCOUNT_SID`
- `TWILIO_AUTH_TOKEN`
- `TWILIO_VERIFY_SERVICE_SID`

## 🔍 Monitoring & Analytics

### Performance
- Built-in Next.js analytics
- Core Web Vitals tracking
- Bundle analysis with `npm run build`

### Error Tracking
- Console error logging in development
- Production error boundaries
- Supabase logs for database errors

## 🤝 Contributing

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Write tests** for your changes
4. **Ensure all tests pass**: `npm test && npm run test:e2e`
5. **Commit your changes**: `git commit -m 'Add amazing feature'`
6. **Push to the branch**: `git push origin feature/amazing-feature`
7. **Open a Pull Request**

### Development Guidelines

- Follow TDD principles
- Maintain clean architecture patterns
- Write comprehensive tests
- Use TypeScript strictly
- Follow existing code conventions

## 📝 API Documentation

### Core Interfaces

```typescript
// User entity
interface User {
  id: string
  phone: string
  createdAt: Date
  updatedAt: Date
}

// Service entity
interface Service {
  id: string
  name: string
  logoUrl: string
  categoryId: string
  isFeatured: boolean
}

// Category entity
interface Category {
  id: string
  name: string
  icon: string
  displayOrder: number
}
```

### Service Layer

All services implement clean interfaces for easy swapping:

- `AuthProvider` - SMS authentication
- `DatabaseClient` - Data persistence
- `AnalyticsProvider` - Usage tracking (future)

## 🐛 Troubleshooting

### Common Issues

1. **Build Errors**
   ```bash
   # Clear Next.js cache
   rm -rf .next
   npm run dev
   ```

2. **Test Failures**
   ```bash
   # Clear test cache
   npm test -- --clearCache
   ```

3. **Database Connection Issues**
   - Check Supabase URL and keys
   - Verify network connectivity
   - Check RLS policies in Supabase

4. **SMS Not Sending**
   - Verify Twilio credentials
   - Check phone number format
   - Ensure Twilio service is active

### Getting Help

- **Issues**: Create an issue in this repository
- **Documentation**: Check inline code comments
- **Tests**: Review test files for usage examples

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🎯 Next Steps

### Planned Features
- [ ] API routes for production backend
- [ ] Real-time progress sync
- [ ] Service recommendation engine
- [ ] Advanced analytics dashboard
- [ ] Multi-language support
- [ ] Social sharing features

### Technical Improvements
- [ ] Add Redis caching layer
- [ ] Implement GraphQL API
- [ ] Add CI/CD pipeline
- [ ] Performance monitoring
- [ ] Advanced error tracking

---

**Built with ❤️ using Next.js, TypeScript, and Clean Architecture**
