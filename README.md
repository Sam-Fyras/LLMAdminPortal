# Fyras LLM Admin Portal

A React TypeScript application for managing the Fyras LLM Gateway. This admin portal allows tenant administrators to configure rules, manage token usage, and control user roles.

## Features

- **Authentication**: Azure AD authentication using MSAL
- **Dashboard**: Visualize token usage and model distribution
- **Rule Management**: Create and manage token limit, model restriction, and rate limit rules
- **User Role Management**: Define roles with token limits and model access controls

## Architecture

The application is built with:

- **React 18+** with TypeScript
- **Material UI** for the component library
- **Redux Toolkit** for state management
- **React Router** for navigation
- **MSAL** for Azure AD authentication
- **Axios** for API communication
- **Recharts** for data visualization

## Project Structure

```
src/
├── api/                    # API service layer
│   ├── axios.ts            # Base axios configuration
│   ├── rules.ts            # Rules management API
│   ├── tokens.ts           # Token usage API
│   └── users.ts            # User management API
├── components/             # Reusable UI components
│   ├── common/             # Common UI elements
│   ├── dashboard/          # Dashboard components
│   ├── rules/              # Rule management components
│   └── users/              # User management components
├── context/                # React context providers
│   └── AuthContext.tsx     # Authentication context
├── hooks/                  # Custom React hooks
├── pages/                  # Main application pages
├── redux/                  # Redux store and slices
├── types/                  # TypeScript type definitions
├── utils/                  # Utility functions
└── App.tsx                 # Main application component
```

## Getting Started

### Prerequisites

- Node.js 16+
- npm or yarn
- Access to Azure AD tenant for authentication

### Installation

1. Clone the repository:
```bash
git clone https://github.com/fyras/llm-admin-portal.git
cd llm-admin-portal
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
   - Copy `.env.development` to `.env.local`
   - Update the values with your Azure AD client ID and tenant ID

4. Start the development server:
```bash
npm start
```

The application will be available at http://localhost:3000.

## Configuration

### Environment Variables

- `REACT_APP_API_BASE_URL`: URL of the Fyras LLM Gateway API
- `REACT_APP_AZURE_CLIENT_ID`: Azure AD client ID
- `REACT_APP_AZURE_TENANT_ID`: Azure AD tenant ID

### Authentication

The application uses Azure AD for authentication. You need to register an application in your Azure AD tenant and configure the following:

1. Register a new application in Azure AD
2. Set the redirect URI to `http://localhost:3000` for development
3. Grant API permissions to the Fyras LLM Gateway API
4. Update the `.env.local` file with your client ID and tenant ID

## Deployment

### Building for Production

```bash
npm run build
```

This will create a production-ready build in the `build` directory.

### Deployment Options

- **Azure Static Web Apps**: Deploy directly from GitHub
- **Azure App Service**: Deploy as a Node.js web app
- **Docker**: Use the provided Dockerfile to build and deploy as a container

## Development

### Available Scripts

- `npm start`: Start the development server
- `npm test`: Run tests
- `npm run build`: Build for production
- `npm run eject`: Eject from Create React App

### Adding New Features

1. **New API Endpoints**: Add to the appropriate file in the `api` directory
2. **New Components**: Create in the `components` directory
3. **New Pages**: Add to the `pages` directory and update routes in `App.tsx`

## License

© 2025 Fyras Solutions Inc. All rights reserved.
