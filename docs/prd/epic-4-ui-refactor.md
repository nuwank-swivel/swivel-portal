# Epic 4: UI Library Refactor

## Description

This epic covers the refactoring of the Swivel Portal application's user interface from Radix UI to the Mantine UI library. The goal is to modernize the UI, improve developer experience, and leverage the comprehensive component library of Mantine. This refactoring should not introduce any new functionality but should maintain or improve the existing user experience.

## Stories

### Story 4.1: Migrate Core Components and Pages to Mantine UI

- **Description:** Refactor the main application pages and core UI components to use Mantine UI. This includes layout, navigation, buttons, forms, and modals. The seat booking page's calendar should be replaced with Mantine's DatePicker.
- **Acceptance Criteria:**
  - All existing UI components are replaced with their Mantine UI equivalents.
  - The application's look and feel is updated to be consistent with the Mantine design system.
  - Existing functionality remains unchanged.
  - The seat booking page uses the Mantine `DatePicker` component for selecting dates.
  - Reusable components are extracted and used across the application.
  - All libraries are updated to their latest stable versions.
