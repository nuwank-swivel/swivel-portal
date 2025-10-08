# 3. Key Technical Decisions

## 3.1 Frontend Decisions

1. **React + TypeScript**:

   - Strong typing for better maintainability
   - Large ecosystem and developer familiarity
   - Excellent IDE support

2. **Vite over Create React App**:

   - Faster development server
   - Better build performance
   - Modern features out of the box

3. **ShadcnUI + Tailwind**:

   - High-quality, accessible components
   - Consistent design system
   - Easy customization
   - Small bundle size

4. **PWA Implementation**:
   - Service worker for offline capability
   - App manifest for installation
   - Cache strategies for performance

## 3.2 Backend Decisions

1. **AWS Lambda + TypeScript**:

   - **Serverless**: Reduces operational overhead and scales automatically.
   - **Cost-Effective**: Pay-per-execution model is ideal for variable workloads.
   - **TypeScript**: Provides strong typing, aligning with the frontend stack for consistency.
   - **Ecosystem**: Leverages the vast Node.js and npm ecosystem.

2. **Mongoose ODM**:

   - **Schema Validation**: Enforces data structure on top of flexible MongoDB.
   - **Developer Experience**: Simplifies interaction with the database.
   - **Middleware**: Allows for custom logic on operations (e.g., pre-save hooks).

3. **Azure AD Integration**:
   - Seamless Microsoft 365 integration
   - Enterprise-grade security
   - Token-based authentication
