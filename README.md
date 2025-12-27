# LibraryLogix Mobile App

A React Native Expo mobile application for library management system with role-based access (Admin, Student, Parent).

## Features

- **Role-Based Access**: Support for Admin, Student, and Parent roles
- **Dark & Light Themes**: Automatic theme switching with manual override
- **Modern UI**: Clean, card-based design inspired by financial tracking apps
- **Expo Router**: File-based routing for navigation
- **TypeScript**: Full type safety throughout the application

## Project Structure

```
libraryDashboardMobile/
├── app/                    # Expo Router screens
│   ├── (auth)/            # Authentication screens
│   ├── (tabs)/            # Tab navigation screens
│   └── _layout.tsx        # Root layout
├── components/            # Reusable UI components
├── constants/             # Theme, colors, typography
├── contexts/              # React contexts (Theme, Auth)
├── types/                 # TypeScript type definitions
└── utils/                 # Utility functions
```

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Expo CLI
- iOS Simulator (for Mac) or Android Emulator

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm start
```

3. Run on iOS:
```bash
npm run ios
```

4. Run on Android:
```bash
npm run android
```

## Design System

### Colors

**Light Theme:**
- Primary: #2563EB (Blue)
- Secondary: #10B981 (Green)
- Accent: #F59E0B (Amber)
- Background: #FFFFFF
- Surface: #F9FAFB

**Dark Theme:**
- Primary: #3B82F6 (Lighter Blue)
- Secondary: #34D399 (Lighter Green)
- Accent: #FBBF24 (Lighter Amber)
- Background: #111827
- Surface: #1F2937

### Typography

- Heading 1: 28px, Bold
- Heading 2: 24px, SemiBold
- Heading 3: 20px, SemiBold
- Body Large: 16px, Regular
- Body: 14px, Regular
- Caption: 12px, Regular

## Screens

### Authentication
- Login
- Sign Up
- Forgot Password

### Dashboard
- Admin Dashboard (with stats and quick actions)
- Student Dashboard (with attendance status and stats)
- Parent Dashboard (with children's information)

### Modules
- Attendance (mark attendance, view history)
- Queries/Support (submit and manage queries)
- Events & Workshops (browse and register for events)
- Exams (view upcoming exams and results)
- Fees Management (view and pay fees)
- Profile & Settings (edit profile, theme settings)

## Components

### Reusable Components
- `Card`: Container component with shadow and rounded corners
- `Button`: Multiple variants (primary, secondary, outline, text)
- `Input`: Text input with label, error handling, and icons
- `Badge`: Status and priority badges
- `EmptyState`: Empty state component with icon and message
- `LoadingSpinner`: Loading indicator

## Navigation

The app uses Expo Router for navigation:
- **Stack Navigation**: For authentication and detail screens
- **Tab Navigation**: For main app sections (Dashboard, Attendance, Queries, Events, Profile)
- **Drawer Navigation**: For settings and additional options (to be implemented)

## State Management

- **Theme Context**: Manages theme state (light/dark mode)
- **Auth Context**: Manages authentication state and user data
- **AsyncStorage**: Persists theme preference and user data

## Development

### Adding New Screens

1. Create a new file in the appropriate directory under `app/`
2. Use the theme context for styling: `const { theme } = useTheme()`
3. Follow the existing component patterns

### Adding New Components

1. Create component file in `components/`
2. Use TypeScript for type safety
3. Use theme context for consistent styling
4. Export the component for reuse

## TODO

- [ ] Implement actual authentication API integration
- [ ] Add seat management screens
- [ ] Implement charts for attendance trends
- [ ] Add file upload functionality for queries
- [ ] Implement push notifications
- [ ] Add offline support
- [ ] Write unit tests
- [ ] Add E2E tests

## License

MIT

