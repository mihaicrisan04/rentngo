### 1. High-Level Overview

[x] Define business goals and constraints with stakeholders
[x] Identify primary user personas (renters, admins)
[ ] Outline key user journey flows (search → booking → payment)
[ ] List core MVP features and requirements (inventory browsing, booking, payments, etc.)
[ ] Research Cluj car rental market and competitors (features, pricing, UX)
[ ] Document project scope and timeline constraints (in/out of scope)
[ ] Check regulatory requirements (age, insurance, GDPR compliance)

### 2. Architecture & Data Model

[x] Outline system architecture (Next.js frontend, Convex backend, Clerk auth, Stripe, Resend)
[x] Initialize Next.js project (create-app with TypeScript and app router)
[ ] Install Tailwind CSS and set up shadcn/ui component library
[x] Initialize Convex backend project (create project instance, link to repo)
[x] Define Convex schema for **Car*entity (fields: make, model, year, price, availability)
[ ] Define Convex schema for **Booking*entity (fields: carId, userId, startDate, endDate, status)
[ ] Define Convex schema for **User*profile (fields: name, email, driverLicense, isAdmin)
[ ] Plan user roles and permissions in data model (e.g. renter vs admin flag)
[ ] Document architecture and data model decisions in project README

### 3. Feature Breakdown

[x] Integrate Clerk authentication provider in app layout (wrap app with `<ClerkProvider>`)
[ ] Create navigation bar component with links to Home, Profile, Admin (using shadcn UI)
[ ] Add Clerk SignIn and SignOut buttons to the navigation bar
[ ] Create a reusable **VehicleCard*component (displaying image, name, price) using shadcn UI
[ ] Write a Convex query to fetch the list of available vehicles
[ ] Build the vehicles listing page (homepage) and display fetched VehicleCards
[ ] Add search and filter controls (brand, price range) on the vehicles list page
[ ] Create a vehicle details page (dynamic route `/vehicles/[id]`)
[ ] Write a Convex query to fetch a single vehicle by its ID
[ ] Display vehicle details (images, specs, price) and add a "Book Now" button
[ ] Develop a booking form with date range picker fields (start and end dates)
[ ] Write a Convex mutation to create a new booking record
[ ] Integrate Stripe checkout flow for booking payments (create checkout session)
[ ] Send booking confirmation email via Resend after successful payment
[ ] Create a user profile page (show account details and booking history)
[ ] Create an Admin dashboard page (visible only to admin users)
[ ] Add vehicle management UI (form to add/edit/delete vehicles) in the admin dashboard
[ ] Write Convex mutations for adding, updating, and deleting vehicles
[ ] Add bookings management UI (list all bookings) for the admin
[ ] Write a Convex query to fetch all bookings for the admin view

### 4. Technical Requirements

[x] Initialize a Git repository and make the initial commit of the project code
[x] Create a `.gitignore` configured for Node.js/Next.js artifacts (e.g. `node_modules`, `.next`)
[x] Add a `.env.example` file listing required environment variables (Clerk, Stripe, Resend keys)
[x] Install and configure ESLint (using Next.js recommended rules)
[x] Install and configure Prettier (integrate with ESLint for code formatting)
[x] Configure TypeScript (enable strict mode and sensible compiler options)
[x] Configure `.env.local` with development API keys for Clerk, Stripe, Resend (not committed)
[ ] Set up a CI workflow (e.g. GitHub Actions) to run lint and tests on each push
[ ] Add a testing framework (e.g. Jest with React Testing Library) and write a simple test
[ ] Document project setup steps (installing deps, setting env variables, running dev) in README


### 5. Milestones

[ ] Identify MVP milestone deliverables (core features for launch)
[ ] Plan Milestone 1 (browsing and search features) and list its scope
[ ] Plan Milestone 2 (booking and payment features) and list its scope
[ ] Plan Milestone 3 (user accounts and admin tools) and list its scope
[ ] Estimate timelines for each milestone (set target dates or sprint durations)
[ ] Review proposed milestones and deliverables with stakeholders
[ ] Finalize and document the milestone plan and schedule

### 6. DevOps

[ ] Set up a Vercel project and connect it to the GitHub repository for deployment
[ ] Configure environment variables in the hosting platform (Clerk, Stripe, Resend keys)
[ ] Enable automatic deployments on Vercel for main branch and preview builds
[ ] Implement a health-check API endpoint (e.g. `/api/health`) for uptime monitoring
[ ] Set up a staging environment (e.g. preview branch deployment) for testing before production
[ ] Document the deployment process and any rollback procedures in the README

### 7. Success Metrics

[ ] Define key performance metrics (KPIs) such as bookings per month, active users, and revenue targets
[ ] Define conversion funnel metrics (e.g. site visits → search → completed booking)
[ ] Set up Google Analytics (or similar) to track user engagement and page views
[ ] Add event tracking for booking funnel steps (search, booking start, booking completion)
[ ] Configure Stripe dashboard to monitor financial metrics (total revenue, average order value)
[ ] Document each metric’s definition, target values, and how success will be measured

