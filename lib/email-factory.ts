import { ReservationEmailData, EmailType } from '@/types/email';
import { transformReservationForEmail } from './email-utils';
import { differenceInDays } from 'date-fns';
import { Vehicle } from '@/types/vehicle';
import { Reservation } from '@/types/reservation';
import { calculateVehiclePricingWithSeason, calculateRentalDays } from './vehicle-utils';

/**
 * Email Factory for creating different types of reservation emails
 * This provides a unified interface for generating emails across the application
 */
export class EmailFactory {
  /**
   * Create email data from raw reservation and vehicle data
   */
  static createEmailData(
    reservation: Reservation,
    vehicle: Vehicle,
    emailType: EmailType = 'reservation_request'
  ): ReservationEmailData {
    const pickupDate = new Date(reservation.startDate as any);
    const restitutionDate = new Date(reservation.endDate as any);
    const hasValidDates = !isNaN(pickupDate.getTime()) && !isNaN(restitutionDate.getTime()) && restitutionDate >= pickupDate;
    const hasTimes = Boolean(reservation.pickupTime && reservation.restitutionTime);

    const numberOfDays = hasValidDates && hasTimes
      ? calculateRentalDays(pickupDate, restitutionDate, reservation.pickupTime as any, reservation.restitutionTime as any)
      : 1;

    return transformReservationForEmail(reservation, vehicle, numberOfDays);
  }

  /**
   * Create reservation request email data
   */
  static createReservationRequest(reservation: any, vehicle: any): ReservationEmailData {
    return this.createEmailData(reservation, vehicle, 'reservation_request');
  }

  /**
   * Create confirmation email data
   */
  static createConfirmation(reservation: any, vehicle: any): ReservationEmailData {
    return this.createEmailData(reservation, vehicle, 'confirmation');
  }

  /**
   * Create reminder email data
   */
  static createReminder(reservation: any, vehicle: any): ReservationEmailData {
    return this.createEmailData(reservation, vehicle, 'reminder');
  }

  /**
   * Create cancellation email data
   */
  static createCancellation(reservation: any, vehicle: any): ReservationEmailData {
    return this.createEmailData(reservation, vehicle, 'cancellation');
  }

  /**
   * Create receipt email data
   */
  static createReceipt(reservation: any, vehicle: any): ReservationEmailData {
    return this.createEmailData(reservation, vehicle, 'receipt');
  }
}

/**
 * Email templates mapping for different email types
 * This makes it easy to extend with different email templates in the future
 */
export const EMAIL_TEMPLATES = {
  reservation_request: 'EmailRequestReservation',
  confirmation: 'EmailConfirmation', // To be created
  reminder: 'EmailReminder', // To be created
  cancellation: 'EmailCancellation', // To be created
  receipt: 'EmailReceipt', // To be created
} as const;

/**
 * Email subjects for different email types
 */
export const EMAIL_SUBJECTS = {
  reservation_request: (customerName: string) => `New Reservation Request from ${customerName}`,
  confirmation: (reservationId: string) => `Reservation Confirmed - ${reservationId}`,
  reminder: (reservationId: string) => `Rental Reminder - ${reservationId}`,
  cancellation: (reservationId: string) => `Reservation Cancelled - ${reservationId}`,
  receipt: (reservationId: string) => `Rental Receipt - ${reservationId}`,
} as const; 
