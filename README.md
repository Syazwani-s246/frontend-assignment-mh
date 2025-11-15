# User Management Module

A comprehensive user management application built with React, TypeScript, TailwindCSS, Shadcn UI, and TanStack React Query, featuring full CRUD operations, optimistic updates, and advanced state management.

## Live Demo

[https://frontend-assigment-mh.netlify.app/](#)

## Features Implemented

### Core Features

#### 1. **User Listing Page** (`/users`)
- Comprehensive table view with all user information
- Responsive card view for mobile devices
- Real-time search by name and email
- Multi-criteria filtering:
  - Filter by role (Admin/User/Guest)
  - Filter by creation date (Last 7/30/90 days)
  - Clear all filters functionality
- Advanced sorting:
  - Sort by name, email, or creation date
  - Ascending/descending toggle with visual indicators
- Expandable bio text with "Show more/less" functionality
- Individual user actions (Edit/Delete)

#### 2. **User Form Page** (`/users/new` and `/users/:id`)
- Create new users with comprehensive form validation
- Edit existing users with pre-filled data
- Real-time form validation using React Hook Form + Zod
- Required fields marked with visual indicators
- Field-level error messages with icons
- Avatar URL preview
- Character counter for bio field
- Visual active/inactive status toggle with animations
- Organized sections:
  - Personal Information
  - Profile Details
  - Account Settings

#### 3. **Advanced State Management**
- **React Query Integration:**
  - `useQuery` for data fetching with automatic caching
  - `useMutation` for all CRUD operations
  - Query invalidation for data synchronization
  - Comprehensive loading and error states

- **Optimistic UI Updates:**
  - Instant UI feedback for delete operations
  - Automatic rollback on API failures
  - Cache updates before server confirmation
  - Smooth transitions and loading indicators

#### 4. **Concurrent Mutation Handling**
- Race condition detection for simultaneous edits
- 404 error handling when editing deleted users
- Query cancellation to prevent cache overwrites

#### 5. **Delete Confirmation Dialog**
- Modal confirmation before deletion
- User name displayed in warning message
- Loading state during deletion

#### 6. **Theme Support**
- Dark/Light mode toggle in header
- Theme persistence using localStorage
- Smooth theme transitions
- Full compatibility across all components
- System preference detection

#### 7. **Toast Notifications**
- Success messages for create/update/delete operations
- Error messages with specific details
- Loading indicators for async operations
- Auto-dismiss with appropriate durations
- Non-intrusive placement

### 🎨 Additional Features

#### 8. **User Analytics Dashboard** (`/users/analytics`)
- Real-time data visualization using Recharts
- **Summary Statistics:**
  - Total users count
  - Active users count
  - Inactive users count
  - Active rate percentage
- **Charts:**
  - Bar Chart: Users by role distribution
  - Pie Chart: Active vs Inactive users
  - Line Chart: User registrations over time with cumulative trend
- **Key Insights:**
  - Most common role identification
  - Activity rate analysis
  - Growth tracking
- Dynamic data calculation from live user data

#### 9. **Responsive Design**
- Mobile-first approach
- Adaptive navigation with hamburger menu
- Responsive table with horizontal scrolling
- Card view optimized for mobile devices
- Touch-friendly interface elements
- Breakpoint-based layouts (sm/md/lg/xl)

#### 10. **Professional UI/UX**
- Consistent Shadcn UI component library
- Loading states with spinners
- Empty states with clear messaging
- Hover effects and transitions
- Visual feedback for all interactions
- Accessible form labels and ARIA attributes
- Color-coded status badges
- Icon integration with Lucide React

## Tech Stack

- **Framework:** React 18 with TypeScript
- **Styling:** TailwindCSS + Shadcn UI
- **State Management:** TanStack React Query (v5)
- **Form Handling:** React Hook Form + Zod validation
- **Routing:** React Router DOM
- **Charts:** Recharts
- **HTTP Client:** Axios
- **Notifications:** Sonner (Shadcn)
- **Icons:** Lucide React

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone [your-repo-url]
cd frontend-assignment-mh
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to:
```
http://localhost:5173
```

## API Configuration

The application connects to a Mock API:

**Base URL:** `https://68ff8c08e02b16d1753e6ed3.mockapi.io/maia/api/v1`

### Endpoints Used:
- `GET /user` - Fetch all users
- `GET /user/:id` - Fetch single user
- `POST /user` - Create new user
- `PUT /user/:id` - Update user
- `DELETE /user/:id` - Delete user

## Routes

- `/users` - User listing page (home)
- `/users/new` - Create new user
- `/users/:id` - Edit existing user
- `/users/analytics` - Analytics dashboard


## Testing the Application

### Test Scenarios:

1. **Create User:** Navigate to "New User" and fill in the form
2. **Edit User:** Click "Edit" on any user in the list
3. **Delete User:** Click "Delete" and confirm in the modal
4. **Search:** Type in the search box to filter by name/email
5. **Filter:** Use role and date filters to narrow results
6. **Sort:** Click column headers to sort data
7. **Theme Toggle:** Switch between light and dark modes
8. **Analytics:** View visualizations on the analytics page
9. **Mobile:** Test responsive design on different screen sizes

## Notes

- Theme preference persists across sessions
- All mutations include loading states
- Error handling covers network failures and validation errors
- The application handles concurrent operations gracefully
- Form data is normalized to match API expectations

## Acknowledgments

- Shadcn UI for the component library
- TanStack for React Query
- Recharts for data visualization
- MockAPI for the backend service

---

**Built for the Front-End Developer Assessment**