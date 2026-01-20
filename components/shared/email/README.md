# Email System Architecture

This directory contains the modular email system for Rent'n Go, designed to be type-safe, maintainable, and extensible.

## Overview

The email system is built with the following principles:
- **Type Safety**: All components use proper TypeScript interfaces
- **Modularity**: Reusable components for different email sections
- **Consistency**: Standardized data structures across all email types
- **Maintainability**: Easy to modify and extend

## Directory Structure

```
components/email/
├── README.md                 # This documentation
├── EmailHeader.tsx           # Reusable header component
├── EmailFooter.tsx           # Reusable footer component
├── CustomerInfoSection.tsx   # Customer information display
├── RentalDetailsSection.tsx  # Rental date/location details
├── VehicleInfoSection.tsx    # Vehicle specification display
└── PricingSection.tsx        # Pricing breakdown display

types/
└── email.ts                  # TypeScript interfaces for email data

lib/
├── emailUtils.ts             # Utility functions for data transformation
└── emailFactory.ts           # Factory for creating different email types
```

## Key Components

### 1. Type Definitions (`types/email.ts`)

All email components use standardized interfaces:

- `CustomerInfo`: Customer contact and personal information
- `VehicleInfo`: Vehicle specifications and features
- `RentalDetails`: Pickup/return dates, times, and locations
- `PricingDetails`: Pricing breakdown and payment information
- `ReservationEmailData`: Complete email data structure

### 2. Modular Components

Each email section is a separate component:

- **EmailHeader**: Logo and title
- **EmailFooter**: Company information and legal text
- **CustomerInfoSection**: Customer details and reservation ID
- **RentalDetailsSection**: Pickup and return information
- **VehicleInfoSection**: Vehicle specifications
- **PricingSection**: Cost breakdown and payment method

### 3. Utility Functions (`lib/emailUtils.ts`)

- `transformReservationForEmail()`: Convert database data to email format
- `getPaymentMethodLabel()`: Human-readable payment method names
- `formatCurrency()`: Consistent currency formatting
- `calculatePricingBreakdown()`: Pricing calculations

### 4. Email Factory (`lib/emailFactory.ts`)

Provides static methods for creating different email types:

```typescript
// Create reservation request email
const emailData = EmailFactory.createReservationRequest(reservation, vehicle);

// Create confirmation email
const emailData = EmailFactory.createConfirmation(reservation, vehicle);
```

## Usage Example

### Creating a New Email Template

1. **Define the email component**:

```typescript
import { ReservationEmailData } from '@/types/email';
import { EmailHeader } from './email/EmailHeader';
import { EmailFooter } from './email/EmailFooter';
// ... other imports

interface MyEmailProps {
  data: ReservationEmailData;
}

const MyEmail: React.FC<MyEmailProps> = ({ data }) => {
  return (
    <Html>
      <Body>
        <Container>
          <EmailHeader title="My Email Title" />
          
          {/* Use modular components */}
          <CustomerInfoSection 
            customerInfo={data.customerInfo} 
            reservationId={data.reservationId} 
          />
          
          <EmailFooter />
        </Container>
      </Body>
    </Html>
  );
};
```

2. **Use the factory to create email data**:

```typescript
import { EmailFactory } from '@/lib/emailFactory';

// In your email sending function
const emailData = EmailFactory.createReservationRequest(reservation, vehicle);
const emailComponent = <MyEmail data={emailData} />;
```

### Adding New Email Types

1. **Update the EmailType union in `types/email.ts`**:

```typescript
export type EmailType = 
  | "reservation_request" 
  | "confirmation" 
  | "reminder" 
  | "cancellation" 
  | "receipt"
  | "new_email_type"; // Add your new type
```

2. **Add factory method in `lib/emailFactory.ts`**:

```typescript
static createNewEmailType(reservation: any, vehicle: any): ReservationEmailData {
  return this.createEmailData(reservation, vehicle, 'new_email_type');
}
```

3. **Add template mapping**:

```typescript
export const EMAIL_TEMPLATES = {
  // ... existing templates
  new_email_type: 'EmailNewType',
} as const;
```

## Benefits of This Architecture

### 1. **Type Safety**
- All props are properly typed
- Compile-time error checking
- Better IDE support and autocomplete

### 2. **Reusability**
- Components can be mixed and matched
- Consistent styling across all emails
- Easy to maintain and update

### 3. **Scalability**
- Easy to add new email types
- Modular components can be extended
- Clear separation of concerns

### 4. **Maintainability**
- Single source of truth for data structures
- Centralized utility functions
- Clear documentation and examples

## Migration from Old System

The old email component had these issues:
- No TypeScript types (implicit `any`)
- Monolithic structure (300+ lines)
- Poor reusability
- Hard to maintain and extend

The new system addresses all these issues while maintaining the same visual output.

## Future Enhancements

Consider these improvements:
- **Email Templates**: Create different visual themes
- **Internationalization**: Support multiple languages
- **A/B Testing**: Easy template switching
- **Email Analytics**: Track open rates and engagement
- **Dynamic Content**: Personalized recommendations 