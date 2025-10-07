# 4. Security Architecture

## 4.1 Authentication Flow

1. User initiates login via Microsoft 365
2. MSAL.js handles OAuth 2.0 flow
3. Azure AD issues JWT token
4. Token stored securely in memory
5. Token included in Authorization header
6. Backend validates token with Azure AD

## 4.2 Security Measures

- HTTPS-only communication
- JWT token validation
- CORS configuration
- Content Security Policy
- Azure AD role-based access
- SQL parameters to prevent injection
- Regular security audits
