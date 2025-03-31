# VyOS WebUI Frontend

A modern web interface for VyOS built with React and Material UI.

## Setup

1. Clone the repository
2. Navigate to the frontend directory
3. Install dependencies:
   ```bash
   npm install
   ```
4. Copy the environment template:
   ```bash
   cp .env.template .env
   ```
5. Edit the `.env` file to match your configuration
6. Start the development server:
   ```bash
   npm run start
   ```

## Environment Variables

The application uses various environment variables to configure its behavior:

- `PORT`: The port number the server will listen on (default: 3000)
- `HOST`: The host address to bind to (default: "0.0.0.0" - all interfaces)
- `ALLOWED_IPS`: Comma-separated list of allowed IP addresses or "*" for any
- `ALLOWED_SUBNETS`: Comma-separated list of allowed subnet ranges 
- `CORS_ORIGINS`: Allowed CORS origins ("*" for development)
- `JWT_SECRET`: Secret key for JWT token generation
- `SESSION_TIMEOUT_MINUTES`: Session timeout in minutes
- `API_ENDPOINT`: URL for the backend API

## Development

For development purposes, the default settings allow access from any IP address.
For production, it's recommended to restrict access to specific IP addresses or subnets.

## Building for Production

```bash
npm run build
```

This will create a production-ready build in the `dist` directory. 