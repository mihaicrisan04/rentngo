Thanks. I’ll create a structured development plan for a B2C car rental platform operating in Cluj-Napoca, Romania, using the specified tech stack (Next.js, Convex, Clerk, Stripe, Resend, and a UI component library). This will include system architecture, features, data model, timeline, DevOps setup, and success metrics.

I’ll notify you once it’s ready to review.


# Car Rental Web App: Development Plan

## 1. High-Level Overview

### 1.1 Purpose and Business Goals

The goal is to build a user-friendly B2C car rental platform for Cluj-Napoca.  This includes easy vehicle search and booking, competitive pricing, and seamless payments. Key business objectives are to maximize conversion and customer satisfaction, optimize fleet utilization, and comply with EU regulations (e.g. GDPR). The service will use Romanian Leu (RON) for transactions, support multiple languages (Romanian/English), and target local and visiting customers.

### 1.2 Key User Personas

* **Renters (Customers)** – Individuals or tourists in Cluj who browse, book, and pay for car rentals. They need simple search/filter, account management, and clear pricing.
* **Admin / Fleet Manager** – Company staff who manage vehicle inventory, set availability and pricing, view analytics, and handle customer support. They need a dashboard for adding/editing cars, viewing bookings, and generating reports.
* **Support Agents** – (Optional) Customer service representatives who assist with booking issues, modifications, and refunds. They need access to booking/payment records and communication tools.

## 2. Architecture & Data Model

### 2.1 System Architecture & Data Flow

```
          [Clerk (Auth)] 
               ^            
               |            
[User (Browser)]---> [Next.js Frontend (React + shadcn/ui)]
               |           \
               v            v
         [Convex (Serverless DB + Functions)]   [Stripe (Payments)]
               |
               v
      [Resend (Transactional Email API)]
```

* **Front-End (Next.js + shadcn/ui)**: React-based UI hosted on Vercel, using pre-built components (shadcn/ui).
* **Auth (Clerk)**: Handles user signup/login, MFA, social login, and session management. Clerk integrates natively with Next.js.
* **Backend & Data (Convex)**: Serverless functions and database for business logic and persistent data. Convex is a reactive database (“open source, reactive database”) that automatically updates queries when underlying data changes.
* **Payments (Stripe)**: Processes one-off rentals (and optional subscriptions) in RON, using Stripe Checkout and APIs. Webhooks notify Convex of payment events.
* **Emails (Resend)**: Sends transactional emails (confirmation, reminders, receipts) via a simple email API. Convex functions trigger emails on events.

### 2.2 Core Data Entities

| Entity          | Key Fields                                                                                        | Description                                                                                                                                                          |
| --------------- | ------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **User**        | `id`, `email`, `name`, `role` (renter/admin), `phone`, `preferences`                              | Registered customers and admin accounts. Clerk manages auth; Convex stores profile data.                                                                             |
| **Vehicle**     | `id`, `make`, `model`, `type`, `photoURLs`, `location`, `features`, `pricePerDay`, `availability` | Fleet inventory. Each vehicle has attributes (type: SUV/sedan, seats, etc.), location (city/area), photos, and rate. Availability is derived from existing bookings. |
| **Reservation** | `id`, `userId`, `vehicleId`, `startDate`, `endDate`, `status`, `totalPrice`, `promoCode`          | Booking records. Links a user to a vehicle and time range, with status (booked/cancelled), pricing and applied discounts.                                            |
| **Payment**     | `id`, `reservationId`, `stripePaymentId`, `amount`, `currency`, `status`, `paymentMethod`         | Records payment transactions. Linked to a reservation, stores Stripe IDs, amount (RON), and status (paid/refunded).                                                  |
| **Promotion**   | `code`, `type` (percent/fixed), `value`, `expiryDate`, `usageCount`, `active`                     | Discount codes or special offers. Used to compute reduced pricing at checkout.                                                                                       |
| **EmailLog**    | `id`, `type` (confirmation, reminder, receipt), `userId`, `reservationId`, `sentAt`, `status`     | (Optional) Tracks emails sent via Resend for audit and retries.                                                                                                      |

### 2.3 Common Workflows

* **Search & Booking**: The user selects location, dates, and filters (car type, price) on the Next.js UI. The app queries Convex for available vehicles. After choosing a car, the user creates a reservation: Convex checks availability (no conflicting bookings) and calculates price (including dynamic pricing/promo).
* **Payment Flow**: On booking, the frontend requests a Stripe Checkout session (via a Convex function). The user completes payment (one-off or subscription). Stripe sends a webhook to Convex upon success or refund. Convex updates the reservation and payment records accordingly.
* **Email Notifications**: When a booking is confirmed, Convex triggers Resend to send a **booking confirmation** email. On payment success, a **receipt** email is sent. Automated **reminder** emails can be scheduled (e.g. one day before pickup and before return). If a booking is cancelled or modified, an appropriate email is sent. Resend’s API (an “email API for developers”) is used inside server functions.
* **Availability Updates**: Convex’s reactive queries ensure that when a new booking is created or cancelled, any UI listings automatically reflect updated availability. For example, if a vehicle is booked, its availability calendar is updated in real-time across clients.

## 3. Feature Breakdown & User Stories

### 3.1 Authentication & Profile Management

* **Sign-Up / Login** – *User story:* “As a customer, I want to register with email (or social login) and sign in securely.” We use **Clerk** for this.  It provides ready-made React components for Next.js, including email/password, social providers, and optional multi-factor authentication. Clerk handles password rules (NIST guidelines) and security (CSRF, XSS protection) out-of-the-box.
* **Account Verification / MFA** – New users receive a verification link or code. Optionally enable phone/email MFA for added security. Clerk supports these flows.
* **Profile Page** – *User story:* “As a user, I can view and update my profile (name, phone), change password, and view my booking history.” Profile data (beyond auth credentials) is stored in Convex linked to the Clerk user ID.
* **Admin Roles** – *User story:* “As an admin, I can log in and see admin-only pages.” Users have roles (e.g. admin, support) stored in the `User` entity. Clerk’s auth token is checked on protected API routes or pages.

### 3.2 Vehicle Catalog & Search

* **Vehicle Listing** – *User story:* “I can browse available cars with images, descriptions, and pricing.” Convex serves vehicle data; Next.js pages render cards/lists of vehicles. UI filters are built with the component library (shadcn/ui).
* **Search & Filters** – *User story:* “I can filter cars by location (e.g. Cluj city center or airport), rental date range, car type (economy, SUV), and price.” The frontend sends queries to Convex to retrieve matching vehicles. Convex query code (TypeScript) handles search criteria, leveraging indexes for performance.
* **Availability Calendar** – Display a calendar or date-picker that disables dates when a vehicle is already booked. Convex checks existing `Reservations` for overlaps. The UI can show a calendar view for each vehicle. Because Convex is reactive, if an availability changes (e.g. admin adds a reservation), the calendar updates immediately.
* **Vehicle Details** – *User story:* “I can view details (features, seats, fuel type) and photos of a car.” We store vehicle attributes (make, model, year, features) in Convex and display them on a detail page.

### 3.3 Booking & Availability Management

* **Booking Flow** – *User story:* “I can select a vehicle, pick start/end dates, and reserve it.” On form submission, a Convex mutation is called to create a `Reservation` record. Convex ensures no conflict (atomic transaction with ACID guarantees).
* **Availability Enforcement** – The system prevents double-booking a vehicle. Convex’s “serializable isolation” means concurrent bookings are properly checked.
* **Modify/Cancel** – *User story:* “I can view my bookings and cancel or modify them.” The UI lets users cancel (triggering a refund if within policy). Convex updates status and may free up dates. A cancellation email is sent.
* **Admin Calendar View** – *User story:* “As admin, I see a calendar of all rentals per vehicle or aggregated.” Provide a dashboard that displays bookings on a timeline or calendar, highlighting availability. This uses the same backend queries (Convex) with admin-only access.

### 3.4 Pricing & Discounts

* **Standard Pricing** – Each vehicle has a base daily rate (stored in RON). The system calculates total price = rate × days. Taxes or fees (e.g. insurance) can be added as fixed or percentage fees.
* **Promo Codes** – *User story:* “I can enter a promo code for a discount.” Convex checks a `Promotion` entity for validity (active, not expired, remaining uses). Applies percentage or fixed discount to the total. The UI shows discounted price.
* **Dynamic Pricing (Optional)** – For peak times or special events in Cluj, rates could adjust (e.g. higher price on weekends). This could be implemented via schedule tables or a simple rule engine in Convex.
* **Membership/Subscription (Optional)** – If offering loyalty or member plans, integrate Stripe Subscription objects. A subscription could give discounted rates or free days. (E.g. *User story:* “I pay a monthly fee and get 10% off every booking.”) Stripe handles recurring payments; Convex links the subscription ID to the user.
* **Coupons Management (Admin)** – Admin can create/edit promo codes through the dashboard. Each code has usage limits and expiry.

### 3.5 Checkout & Stripe Integration

* **Checkout Process** – *User story:* “I review my booking summary and pay securely.” We use Stripe Checkout or Payment Intents. On confirming booking details, the frontend calls a Convex function to create a Stripe Checkout Session (one-time payment or subscription sign-up). The user is redirected to Stripe’s secure payment page.
* **Currency & Localization** – All prices shown are in RON (Romanian Leu). Stripe supports RON as a payment currency. Taxes can be configured if required. Payment page should be localized (Romanian language option).
* **Deposits & Refunds** – If a deposit is needed, we charge it via Stripe and hold it or charge full amount with refund capability. On cancellation, a refund is issued through Stripe’s API, and Convex updates the payment record.
* **Stripe Webhooks** – A Convex function listens for Stripe webhook events (payment success, refund issued, subscription events). This function updates `Payment` and `Reservation` statuses and triggers emails as needed.
* **One-off vs Subscription** – The app supports one-time rental charges and optionally recurring subscriptions (for loyalty plans). Stripe provides both subscription and one-time charge flows. The app must handle both in Convex logic.

### 3.6 Email Notifications (Resend)

* **Booking Confirmation** – *User story:* “After booking, I immediately receive a confirmation email with details.” Convex sends an email via Resend when a reservation is created/paid. The email includes dates, vehicle info, and a receipt.
* **Payment Receipt** – *User story:* “I get a receipt after payment.” When Stripe reports payment success, Convex triggers a receipt email. Resend’s API is used in a serverless function, as Resend is “an email API for developers”.
* **Reminders** – Automated reminders before pickup and return. For example, 24 hours before start, an email reminds the renter of pickup details. This can be implemented via scheduled Convex functions or background tasks.
* **Cancellation/Modification Alerts** – If a user cancels or changes a booking, send an email summarizing the change or refund info.
* **Delivery** – Use Resend to manage email deliverability (they claim to improve inbox rates). Template management and event webhooks (for bounces or opens) should be configured to track email performance.

### 3.7 Admin Dashboard (Fleet Management)

* **Vehicle Management** – *User story:* “As admin, I can add/edit vehicle records.” Provide forms to create vehicles with all attributes and upload images. Set status (active/inactive) and availability.
* **Bookings Management** – *User story:* “As admin, I can view all bookings and update statuses.” A dashboard lists reservations (with filters), showing user, vehicle, dates, and payment status. Admins can cancel or extend bookings manually if needed.
* **Analytics & Reporting** – Show KPIs such as total bookings, revenue, fleet utilization, average booking value, and conversion rates. Use charts (e.g. bookings per week). Tools like shadcn charts can render visualizations.
* **Support & Communication** – Provide a support interface: view a user’s rental history, resend emails, or contact user (maybe via email link).
* **Promotions Management** – Admin interface for creating promo codes, setting expiration and discount rules.
* **Access Control** – Only users with admin role can access these pages. Clerk tokens are validated on Convex mutations/queries for admin-only operations.

### 3.8 Optional Features

* **Loyalty Program** – *User story:* “I earn points for each rental and can redeem discounts.” Track points in the `User` entity or separate table. Points convert to coupons.
* **Reviews & Ratings** – *User story:* “After return, I can rate the car and leave a review.” Store reviews linked to vehicles and users. Admin can moderate (approve/delete) reviews.
* **Multi-language/Localization** – The site supports Romanian and English (and possibly Hungarian for Cluj region). All UI text and emails should be localizable. Use i18n libraries (Next.js built-in i18n or libraries) and translate key content.
* **Mobile App (Future)** – While not in initial scope, the system’s API-first design (Convex backend) makes it possible to later build a native mobile app using the same backend services.

## 4. Technical Requirements & Constraints

### 4.1 Technology Stack Usage

* **Next.js (React)** – Frontend framework with App Router for SSR/SSG. Use React components and hooks to build pages. Leverage [Next.js guides](https://nextjs.org/docs) for SEO-friendly routes. Shadcn/ui (built on Tailwind CSS) provides pre-designed, accessible components for forms, navigation, etc. Layout should be responsive (mobile-first design).
* **Convex** – Serverless backend: use Convex functions (TypeScript) for all business logic (creating reservations, pricing calculations, handling webhooks). Convex DB tables store entities. As a “reactive database” queries will auto-update subscribed clients when data changes, enabling live availability updates. Since Convex is ACID-compliant, we rely on it for transactional integrity (e.g. double-booking prevention).
* **Clerk** – Authentication and user management. Clerk’s Next.js integration provides React hooks and components out-of-the-box. We store the Clerk user ID in Convex to link to profiles. Clerk handles cookie-based sessions with SameSite flags for CSRF protection and uses strong password policies (NIST guidelines) and email verification.
* **Stripe** – Payment processing. Use Stripe’s JavaScript SDK and APIs. Create Checkout sessions from Convex functions. Stripe handles PCI compliance and local payment methods (cards, Apple Pay) in RON. For recurring payments (subscriptions) Stripe Billing is used. Important: Stripe supports RON currency and settlements for Romania. (Stripe docs list RON support.)
* **Resend** – Transactional emails. Use Resend’s Node.js SDK from Convex functions to send emails (HTML templates). Resend is built “for developers”, simplifying integration. Set up email domain (SPF/DKIM) for deliverability.
* **UI Components (shadcn/ui)** – A Tailwind-based, open-source component library (“beautifully-designed, accessible components”). We use shadcn’s cards, modals, forms, and charts to ensure a consistent look and accessibility (WCAG).
* **Others**: Tailwind CSS (utility styling), TanStack Query (for data fetching, if needed, with Convex), and optional mapping APIs (e.g. Google Maps) for location features.

### 4.2 Security, Session Handling, Responsive Design, Accessibility

* **Security**: Always use HTTPS. Clerk’s built-in protections cover XSS, CSRF (SameSite cookies), and session fixation by resetting tokens on login. Passwords are hashed with bcrypt. All Convex functions validate inputs and enforce user roles. Store minimal PII and comply with GDPR: user consent and data control.
* **Session Handling**: Clerk manages sessions (HttpOnly cookies) so that tokens aren’t exposed to JavaScript (mitigating XSS). API routes (Convex mutations) will check Clerk’s auth state (via a verifier) before proceeding.
* **Responsive Design**: The UI will be mobile-friendly. Use Tailwind CSS breakpoints. Test layouts on various screen sizes.
* **Accessibility**: Follow WCAG guidelines. Shadcn components are accessible by design. Include proper ARIA attributes, keyboard navigation, color contrast, and screen-reader labels especially for forms (dates, filters, etc.).
* **Privacy/GDPR**: Store data in EU region (Convex offers regional deployment or use Vercel EU). Collect only necessary user data. Provide privacy policy and cookie consent (as shown in \[19] example). Allow users to export/delete their data.

### 4.3 Testing Strategy

* **Unit Testing**: Use Jest or Vitest to test React components and Convex functions in isolation. For example, test pricing logic, date overlap checks, and UI component rendering.
* **Component Testing**: Test critical UI components (e.g. booking form, login form) with React Testing Library.
* **End-to-End (E2E) Testing**: Use Cypress or Playwright to simulate user flows (search + book + pay, login/logout, admin tasks). Next.js docs recommend Cypress/Playwright for E2E. For example, test that a user can complete a booking from landing page to Stripe payment.
* **Continuous Testing**: Integrate tests into CI (GitHub Actions) to run on each commit. Ensure branch protections require passing tests.

### 4.4 CI/CD and Deployment Environments

* **GitHub Actions CI**: On each push, run linting (ESLint, Prettier), unit tests, and build. Use `vercel build` in Actions to catch build errors early. For preview deployments, one can use Vercel’s integration or Actions (as a custom CI).
* **Vercel Deployment**: Deploy the Next.js app to Vercel. Vercel auto-detects Next.js and optimizes performance (SSR, image optimization). Use Preview Deployments for pull requests. Set main branch to deploy to production automatically.
* **Environment Variables**: Store secrets (Clerk API keys, Convex URL, Stripe secret key, Resend API key) in Vercel’s project settings or GitHub Secrets. Do NOT commit them to repo.
* **Versioning & Rollback**: Tag releases in Git. Vercel allows easy rollback to prior deployments if needed.

## 5. Milestones & Timeline

| Phase                        | Timeline   | Key Deliverables                                                                                                                                                                                                                                                          |
| ---------------------------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Phase 1: MVP**             | Week 1–6   | - \[ ] User auth (sign-up/login via Clerk) <br> - \[ ] Vehicle catalog & search filters <br> - \[ ] Booking flow (availability check, create reservation) <br> - \[ ] Payment integration (Stripe checkout) <br> - \[ ] Responsive UI and basic styling                   |
| **Phase 2: Admin & Email**   | Week 7–9   | - \[ ] Admin dashboard (add/edit vehicles, view bookings) <br> - \[ ] Reporting charts (bookings, revenue) <br> - \[ ] Email workflows (confirmation, receipts, reminders via Resend) <br> - \[ ] Promo code management <br> - \[ ] Localization (Romanian UI and emails) |
| **Phase 3: Polish & Launch** | Week 10–11 | - \[ ] Comprehensive testing (unit, E2E) <br> - \[ ] Performance tuning & security audit <br> - \[ ] Final UX polish (UI/UX tweaks, accessibility fixes) <br> - \[ ] Production deployment on Vercel <br> - \[ ] Monitoring & post-launch support setup                   |

* **Phase 1 (Weeks 1–6)** – Build core functionality: user registration/login, browse cars, search filters, basic booking and payment flow.
* **Phase 2 (Weeks 7–9)** – Develop admin features and email integration. Set up automated email triggers (using Resend) for booking events. Integrate feedback (language translations, coupon system).
* **Phase 3 (Weeks 10–11)** – Finalize everything: thorough testing (Jest/Cypress), fix bugs, optimize performance. Launch campaign. Monitor and prepare to iterate after launch.

## 6. DevOps & Deployment

### 6.1 Vercel Deployment

* Use **Vercel** for hosting the Next.js app. Its serverless platform natively supports Next.js SSR/SSG. Vercel provides quick deployments, CDN caching, and scalability.
* Configure custom domain (e.g. `rentacluj.com`) and SSL via Vercel.
* Preview Deployments on each PR give staging URLs. Production deploys on main branch merges.

### 6.2 Environment Variables & Secrets

* Store all secrets (Clerk API keys, Stripe keys, Resend API key, Convex project URL/keys) in Vercel’s **Environment Variables** settings or in GitHub Secrets for Actions.
* Do not expose secret keys to the client. Next.js will access secure vars via server-side code (only expose `NEXT_PUBLIC_...` variables that are safe for the browser, like a Resend public key if needed).
* Manage different environments (development, production) by configuring separate variables (Vercel supports multiple environments).

### 6.3 Monitoring and Error Tracking

* **Error Tracking**: Integrate a tool like Sentry or LogRocket. For example, use Sentry’s JavaScript SDK to capture frontend errors, and also capture server-side errors in Convex functions via Sentry’s Node SDK.
* **Performance Monitoring**: Use Vercel Analytics for traffic and real-time metrics. Consider Google Analytics or Plausible for user behavior on the site.
* **Uptime Monitoring**: Use external monitors (e.g. UptimeRobot) to alert if the site goes down. Vercel’s status pages and webhooks can notify on issues.
* **Logging**: Convex console logs and Vercel function logs will be used for debugging. Ensure that all errors are properly caught and reported (avoid leaking secrets).
* **Alerts**: Set up alerts for critical events (e.g. payment failures, checkout errors) via email or Slack.
* **Backups & Data**: Convex is managed, but ensure regular exports of DB (Convex allows data export) for disaster recovery.

## 7. Success Metrics

To measure success, track key performance indicators (KPIs):

* **Conversion Rate** – Percentage of site visitors who complete a booking. (E.g. # bookings ÷ # visits). A higher conversion indicates effective UX and marketing.
* **Average Booking Value (ABV)** – Average revenue per booking. (Total revenue ÷ number of bookings). Higher ABV means customers are renting longer or higher-end vehicles.
* **Fleet Utilization** – Percentage of time vehicles are rented vs available. (Days rented ÷ days available). Indicates how effectively the fleet is used.
* **Time-to-First-Booking** – Average time from a user’s first site visit to completing a first rental (shorter is better).
* **Email Metrics** – Transactional email delivery rate (>95%), open rate (target \~20–30%), and click-through (for links) to ensure communications are effective.
* **Uptime & Performance** – Achieve 99.9%+ uptime. Monitor page load times (aim for <2s).
* **User Satisfaction** – Collect feedback or NPS score post-launch.
* **Growth Metrics** – Monthly active users, number of new vs returning customers, and customer acquisition cost (CAC) vs revenue per customer.

Each metric should be monitored via analytics tools and dashboards. Regular reports (weekly/monthly) will track progress and guide marketing/fleet decisions. For example, if conversion is low, invest in UX improvements; if utilization is low for certain car types, adjust pricing or promotions.

**Sources:** Architecture and tech choices are informed by Convex documentation, Clerk/Next.js guidelines, and Resend/Stripe docs【12†】. GDPR compliance is mandatory for EU operations. Next.js testing approaches and Vercel CI/CD best practices are followed. Equipment rental KPIs (conversion rate, ABV) are industry-standard.
