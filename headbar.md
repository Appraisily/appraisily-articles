# Appraisily Shared Header Implementation Guide

This guide will walk you through the process of implementing the shared Header component from the main Appraisily website into other Appraisily subdomains (like Screener, Articles, Directory, etc.).

## Overview

The Appraisily shared components package contains reusable UI elements to ensure consistent branding and user experience across all Appraisily websites. This guide focuses specifically on implementing the Header component.

## Prerequisites

- Basic knowledge of React and npm
- Access to your project's codebase
- Node.js and npm installed on your development machine

## Step 1: Install the Shared Components Package

You have two options for installing the shared components package:

### Option A: Install Directly from GitHub

```bash
# Navigate to your project
cd your-project-directory

# Install the package directly from GitHub
npm install github:Andres/main_page/appraisily-shared-components (it is in https://github.com/Appraisily/main_page)
```

### Option B: If the Package is Published to GitHub Packages

```bash
# Create or edit .npmrc in your project root
echo "@appraisily:registry=https://npm.pkg.github.com" >> .npmrc

# Authenticate with GitHub (you'll need a personal access token with read:packages scope)
npm login --scope=@appraisily --registry=https://npm.pkg.github.com

# Install the package
npm install @appraisily/shared-components
```

## Step 2: Add Required Dependencies

The shared components have peer dependencies that need to be installed if your project doesn't already have them:

```bash
npm install react-router-dom lucide-react
```

## Step 3: Configure Your Project

### Add CSS Support

If you're using a build tool like Webpack, ensure it's configured to handle CSS imports:

```js
// webpack.config.js example
module.exports = {
  // ...other config
  module: {
    rules: [
      // ...other rules
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader', 'postcss-loader'],
      },
    ],
  },
};
```

For Vite projects, no additional configuration is needed.

### Set Up Tailwind CSS (if using)

The components use Tailwind CSS. Make sure your Tailwind configuration includes:

```js
// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
    './node_modules/@appraisily/shared-components/**/*.{js,jsx,ts,tsx}', // Include the shared components
  ],
  theme: {
    extend: {
      // Your theme extensions
    },
  },
  plugins: [],
};
```

## Step 4: Implement the Header in Your App

### Basic Implementation

Update your main App component or layout:

```jsx
import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { Header } from 'appraisily-shared-components'; // or '@appraisily/shared-components'
import 'appraisily-shared-components/dist/styles.css'; // Import the styles

function App() {
  // Your authentication logic
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);
  const [user, setUser] = React.useState(null);
  
  const handleLogin = () => {
    // Your login logic
    // Example: redirect to login page
    window.location.href = '/login';
  };
  
  const handleLogout = () => {
    // Your logout logic
    setIsAuthenticated(false);
    setUser(null);
  };
  
  return (
    <Router>
      <div className="app">
        <Header 
          currentSubdomain="your-subdomain" // 'screener', 'articles', etc.
          isAuthenticated={isAuthenticated}
          user={user}
          onLogin={handleLogin}
          onLogout={handleLogout}
        />
        
        {/* The rest of your application */}
        <main>
          {/* Your content here */}
        </main>
      </div>
    </Router>
  );
}

export default App;
```

### Advanced Implementation with Auth Integration

If you have an existing authentication system:

```jsx
import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { Header } from 'appraisily-shared-components';
import 'appraisily-shared-components/dist/styles.css';
import { useAuth } from './your-auth-context'; // Your auth context

function App() {
  const { user, isAuthenticated, login, logout } = useAuth();
  
  return (
    <Router>
      <div className="app">
        <Header 
          currentSubdomain="your-subdomain"
          user={user}
          isAuthenticated={isAuthenticated}
          onLogin={login}
          onLogout={logout}
        />
        
        {/* The rest of your application */}
      </div>
    </Router>
  );
}

export default App;
```

## Step 5: Customizing the Header

You can customize the Header component by passing additional props:

### Custom Navigation Links

```jsx
<Header 
  currentSubdomain="your-subdomain"
  isAuthenticated={isAuthenticated}
  onLogin={handleLogin}
  onLogout={handleLogout}
  customLinks={[
    { name: 'Custom Page', href: '/custom' },
    { name: 'External Link', href: 'https://example.com', external: true },
  ]}
/>
```

### Custom Navigation Sections

```jsx
<Header 
  currentSubdomain="your-subdomain"
  isAuthenticated={isAuthenticated}
  onLogin={handleLogin}
  onLogout={handleLogout}
  navigationItems={{
    // Custom About section
    about: [
      { name: 'Our Story', href: '/story', description: 'Learn about our journey' },
      { name: 'Team', href: '/team', description: 'Meet our experts' },
    ],
    // Keep other sections default
    // services: [...default items...],
    // expertise: [...default items...],
    // knowledge: [...default items...],
  }}
/>
```

## Step 6: Testing Your Implementation

After implementation, test the header thoroughly:

1. **Visual inspection:** Check that the header looks consistent with the main site
2. **Responsive behavior:** Test on mobile, tablet, and desktop viewports
3. **Navigation:** Verify all dropdown menus work correctly
4. **Authentication:** Test login/logout functionality
5. **Links:** Ensure all links go to the correct destinations

## Troubleshooting

### Common Issues

1. **Missing styles:**
   - Ensure you've imported the CSS with `import 'appraisily-shared-components/dist/styles.css';`
   - Check that your bundler is configured to handle CSS imports

2. **React Router errors:**
   - The Header uses React Router's `Link` component
   - Make sure your app is wrapped in a Router component
   - Check for version compatibility issues between your React Router and the one used in the shared components

3. **Authentication integration:**
   - If login/logout buttons don't work, check that your `onLogin` and `onLogout` handlers are properly implemented

4. **Package not found:**
   - Verify the package is correctly installed (check `node_modules`)
   - Check your import paths

## Example Implementation

Here's a complete example of implementing the Header in a Vite + React + TypeScript project:

```tsx
// src/App.tsx
import React, { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Header } from 'appraisily-shared-components';
import 'appraisily-shared-components/dist/styles.css';

// Your pages
import HomePage from './pages/Home';
import AboutPage from './pages/About';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  
  const handleLogin = () => {
    // In a real app, this would redirect to a login page or open a login modal
    console.log('Login clicked');
    
    // For demo purposes
    setIsAuthenticated(true);
    setUser({
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com'
    });
  };
  
  const handleLogout = () => {
    console.log('Logout clicked');
    setIsAuthenticated(false);
    setUser(null);
  };
  
  return (
    <BrowserRouter>
      <div className="app">
        <Header 
          currentSubdomain="screener"
          user={user}
          isAuthenticated={isAuthenticated}
          onLogin={handleLogin}
          onLogout={handleLogout}
        />
        
        <main className="container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/about" element={<AboutPage />} />
            {/* Add your other routes */}
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
```

## Conclusion

By following this guide, you should be able to successfully integrate the shared Appraisily Header component into your subdomain project. This approach ensures consistent branding and user experience across all Appraisily properties while allowing for customization where needed.

For additional help, refer to the full documentation in the `appraisily-shared-components` repository or contact the development team. 