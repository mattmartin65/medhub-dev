# Medhub Documentation

## Table of Contents
1. [Introduction](#introduction)
2. [Getting Started](#getting-started)
3. [Architecture Overview](#architecture-overview)
4. [User Authentication](#user-authentication)
5. [Personalization](#personalization)
6. [Notifications and Reminders](#notifications-and-reminders)
7. [User Settings](#user-settings)
8. [Mobile Optimization](#mobile-optimization)
9. [Progressive Web App Features](#progressive-web-app-features)
10. [Security and Compliance](#security-and-compliance)
11. [Integration with Automated Form System](#integration-with-automated-form-system)
12. [QR Code Implementation](#qr-code-implementation)
13. [Supabase Integration](#supabase-integration)
14. [Next.js Optimization](#nextjs-optimization)
28. [User Experience and Design](#user-experience-and-design)
29. [Testing and Deployment](#testing-and-deployment)
30. [Monitoring and Analytics](#monitoring-and-analytics)
31. [Troubleshooting](#troubleshooting)
32. [API Reference](#api-reference)
33. [Changelog](#changelog)

## Introduction
Medhub is a progressive web application (PWA) built with Next.js and Supabase, designed to assist patients receiving biologic medicines. The app provides personalized content, reminders, and themes based on the specific medication prescribed to each patient.

### Key Features
- Personalized user experience based on prescribed medication
- Secure authentication with one-time authorization codes
- QR code onboarding for streamlined signup
- Push notifications and reminders for appointments and tests
- Customizable user settings
- Mobile-optimized interface
- Offline support and installability as a PWA

## Getting Started

### Prerequisites
- Node.js (v14 or later)
- npm or yarn
- Supabase account

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/medhub.git
   cd medhub
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   Create a `.env.local` file in the root directory and add:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

## Architecture Overview
Medhub uses a serverless architecture with Next.js for the frontend and Supabase for the backend:

- **Frontend**: Next.js (React framework)
- **Backend**: Supabase (PostgreSQL database, authentication, and serverless functions)
- **State Management**: React Context API and local state
- **Styling**: Tailwind CSS
- **PWA Features**: next-pwa

## User Authentication

### One-Time Authorization Code (OTP)
Medhub uses Supabase's built-in authentication system to implement OTP via email:

```javascript
const { error } = await supabase.auth.signInWithOtp({ email });
```

### QR Code Onboarding
QR codes are generated for each clinic, encoding a unique URL:

```
https://medhub.com/onboard?clinicId=CLINIC_ID&medicationId=MED_ID
```

When scanned, this URL leads to a pre-filled onboarding form.

## Personalization

### Dynamic Themes
Themes are stored in the `medications` table in Supabase and applied based on the user's prescribed medication:

```javascript
const fetchTheme = async (medicationId) => {
  const { data, error } = await supabase
    .from('medications')
    .select('theme')
    .eq('id', medicationId)
    .single();
  
  if (data) setTheme(data.theme);
};
```

### Customized Content
Content is fetched and filtered based on the user's medication and treatment plan:

```javascript
const fetchContent = async (userId) => {
  const { data, error } = await supabase
    .from('user_content')
    .select('*')
    .eq('userId', userId);
  
  // Filter and display content
};
```

## Notifications and Reminders

### Push Notifications
Web Push API is used for push notifications. Service workers handle the receipt and display of notifications:

```javascript
// In service worker (sw.js)
self.addEventListener('push', function(event) {
  const data = event.data.json();
  self.registration.showNotification(data.title, {
    body: data.body,
    icon: '/icons/icon-192x192.png'
  });
});
```

### Reminder Scheduling
Reminders are stored in Supabase and synced with the device's local notifications:

```javascript
const scheduleReminder = async (reminder) => {
  const { data, error } = await supabase
    .from('reminders')
    .insert(reminder);
  
  if (data) {
    // Schedule local notification
  }
};
```

## User Settings
Users can customize their experience through a settings page:

```jsx
function SettingsPage() {
  const [settings, setSettings] = useState({});

  const updateSettings = async (newSettings) => {
    const { data, error } = await supabase
      .from('user_settings')
      .upsert(newSettings);
    
    if (data) setSettings(data);
  };

  // Render settings form
}
```

## Mobile Optimization
Medhub is built with a mobile-first approach:

- Responsive design using Tailwind CSS
- Touch-friendly UI components
- Optimized assets for faster loading on mobile networks

## Progressive Web App Features

### Offline Support
Service workers cache essential resources for offline use:

```javascript
// In next.config.js
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
});

module.exports = withPWA({
  // other Next.js config
});
```

### Installability
The app can be installed on devices for a native-like experience:

```html
<!-- In _document.js -->
<link rel="manifest" href="/manifest.json" />
```

## Security and Compliance

### Data Encryption
All data is encrypted at rest and in transit:

- HTTPS for all communications
- Supabase handles database encryption

### Access Control
Row Level Security (RLS) policies in Supabase ensure users can only access their own data:

```sql
CREATE POLICY "Users can only access their own data"
ON public.user_data
FOR ALL USING (auth.uid() = user_id);
```

## Integration with Automated Form System
An API endpoint handles form submissions from the automated system:

```javascript
// pages/api/form-submission.js
export default async function handler(req, res) {
  const { userId, formData } = req.body;
  // Process form data and update user record
  res.status(200).json({ message: 'Form processed successfully' });
}
```

## QR Code Implementation
QR codes are generated server-side and displayed to clinics:

```javascript
import QRCode from 'qrcode';

const generateQRCode = async (clinicId, medicationId) => {
  const url = `https://medhub.com/onboard?clinicId=${clinicId}&medicationId=${medicationId}`;
  return await QRCode.toDataURL(url);
};
```

## Supabase Integration

### Database Schema
Key tables in the Supabase database:

- `users`: User profiles
- `medications`: Medication details and themes
- `reminders`: User reminders
- `user_content`: Personalized content for users

### Real-time Features
Supabase's real-time subscriptions are used for live updates:

```javascript
const reminders = supabase
  .from('reminders')
  .on('INSERT', handleNewReminder)
  .subscribe();
```

## Next.js Optimization

### Server-Side Rendering (SSR)
SSR is used for dynamic pages to improve initial load time and SEO:

```javascript
export async function getServerSideProps(context) {
  // Fetch data
  return {
    props: { /* data */ },
  };
}
```

### Static Generation
Static generation is used for content that doesn't change often:

```javascript
export async function getStaticProps() {
  // Fetch data
  return {
    props: { /* data */ },
    revalidate: 3600, // Revalidate every hour
  };
}
```

## User Experience and Design

### Accessibility
The app follows WCAG guidelines:

- Proper heading structure
- ARIA labels for interactive elements
- Keyboard navigation support

### Error Handling
Error boundaries catch and display user-friendly error messages:

```jsx
class ErrorBoundary extends React.Component {
  // Implementation
}
```

## Testing and Deployment

### Automated Testing
Jest and React Testing Library are used for unit and integration tests:

```javascript
test('User can log in', async () => {
  // Test implementation
});
```

### Continuous Integration/Deployment
GitHub Actions is used for CI/CD:

```yaml
# .github/workflows/ci.yml
name: CI
on: [push]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Install dependencies
        run: npm ci
      - name: Run tests
        run: npm test
```

## Monitoring and Analytics

### Error Tracking
Sentry is integrated for real-time error tracking:

```javascript
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: "YOUR_SENTRY_DSN",
});
```

### Usage Analytics
A privacy-compliant analytics solution is implemented to track user engagement:

```javascript
import { trackEvent } from './analytics';

function handleClick() {
  trackEvent('button_clicked', { buttonName: 'submit' });
}
```

## Troubleshooting
Common issues and their solutions:

1. **Issue**: App not loading
   **Solution**: Check your internet connection and clear browser cache

2. **Issue**: Push notifications not working
   **Solution**: Ensure notifications are enabled in browser settings

## API Reference
Key API endpoints:

- `GET /api/user`: Fetch user data
- `POST /api/reminder`: Create a new reminder
- `PUT /api/settings`: Update user settings

## Changelog
- v1.0.0 (2023-09-15): Initial release
- v1.1.0 (2023-10-01): Added calendar integration
- v1.2.0 (2023-11-15): Improved offline support

