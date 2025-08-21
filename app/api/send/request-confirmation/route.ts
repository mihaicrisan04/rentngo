import RentalRequestEmail from '@/components/email-request-reservation';
import UserReservationEmail from '@/components/email-request-user';
import { Resend } from 'resend';
import type * as React from 'react';
import { NextResponse } from 'next/server';
import { ReservationEmailData } from '@/types/email';
import { calculateRentalDays } from '@/lib/vehicleUtils';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
    const { reservationId, reservationNumber, startDate, endDate, pickupTime, restitutionTime, pickupLocation, restitutionLocation, paymentMethod, totalPrice, vehicle, customerInfo, promoCode, additionalCharges, pricePerDayUsed, locale, isSCDWSelected, deductibleAmount, protectionCost } = await request.json();

    // Transform the API data into the email component's expected format
    // Calculate derived values using date+time aware logic
    const pickupDate = typeof startDate === 'number' ? new Date(startDate * 1000) : new Date(startDate);
    const restitutionDate = typeof endDate === 'number' ? new Date(endDate * 1000) : new Date(endDate);
    const hasValidDates = !isNaN(pickupDate.getTime()) && !isNaN(restitutionDate.getTime()) && restitutionDate >= pickupDate;
    const hasTimes = Boolean(pickupTime && restitutionTime);
    const numberOfDays = hasValidDates && hasTimes
      ? calculateRentalDays(pickupDate, restitutionDate, pickupTime, restitutionTime)
      : (hasValidDates ? Math.max(1, Math.ceil((restitutionDate.getTime() - pickupDate.getTime()) / (1000 * 60 * 60 * 24))) : 1);
    const additionalTotal = Array.isArray(additionalCharges)
      ? additionalCharges.reduce((sum: number, c: { amount: number }) => sum + (c?.amount || 0), 0)
      : 0;
    const rentalSubtotal = Math.max(0, (totalPrice || 0) - additionalTotal);
    const derivedPricePerDay = Math.max(0, Math.round(rentalSubtotal / numberOfDays));

    const emailData: ReservationEmailData = {
        reservationNumber: reservationNumber ?? 0,
        customerInfo: {
            name: customerInfo.name,
            email: customerInfo.email,
            phone: customerInfo.phone,
            message: customerInfo.message,
            flightNumber: customerInfo.flightNumber,
        },
        vehicleInfo: {
            make: vehicle.make,
            model: vehicle.model,
            year: vehicle.year,
            type: vehicle.type,
            seats: vehicle.seats,
            transmission: vehicle.transmission,
            fuelType: vehicle.fuelType,
            features: vehicle.features || [],
        },
        rentalDetails: {
            startDate: typeof startDate === 'number' ? new Date(startDate * 1000).toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' }) : startDate,
            endDate: typeof endDate === 'number' ? new Date(endDate * 1000).toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' }) : endDate,
            numberOfDays,
            pickupTime,
            restitutionTime,
            pickupLocation,
            restitutionLocation,
        },
        pricingDetails: {
            pricePerDay: typeof pricePerDayUsed === 'number' && pricePerDayUsed > 0 ? pricePerDayUsed : derivedPricePerDay,
            totalPrice,
            paymentMethod,
            promoCode,
            additionalCharges: additionalCharges || [],
            isSCDWSelected,
            deductibleAmount,
            protectionCost,
        },
        locale: (locale === 'ro' ? 'ro' : 'en'),
    };

    try {
        const adminEmail = process.env.ADMIN_EMAIL || 'office@rngo.ro';

        const [adminResult, userResult] = await Promise.all([
            resend.emails.send({
                from: 'Rent\'n Go <noreply@rngo.ro>',
                to: adminEmail,
                subject: `New reservation request #${reservationNumber ?? reservationId}`,
                react: RentalRequestEmail({ data: emailData }) as React.ReactElement,
                replyTo: customerInfo.email,
            }),
            resend.emails.send({
                from: 'Rent\'n Go <noreply@rngo.ro>',
                to: customerInfo.email,
                subject: `Request submitted #${reservationNumber ?? reservationId}`,
                react: UserReservationEmail({ data: emailData }) as React.ReactElement,
                replyTo: 'office@rngo.ro',
            })
        ]);

        if ((adminResult as any)?.error) {
            console.error('Admin email error:', (adminResult as any).error);
        }
        if ((userResult as any)?.error) {
            console.error('User email error:', (userResult as any).error);
        }

        return NextResponse.json({
            success: true,
            adminMessageId: (adminResult as any)?.data?.id,
            userMessageId: (userResult as any)?.data?.id,
        });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
    }
}

// Test curl command
/*
curl -X POST http://localhost:3000/api/send/request-confirmation \
-H "Content-Type: application/json" \
-d '{"reservationId": "1234567890", "startDate": 1717334400, "endDate": 1717420800, "pickupTime": "10:00", "restitutionTime": "18:00", "pickupLocation": "Airport Terminal 1", "restitutionLocation": "Downtown Office", "paymentMethod": "card_online", "status": "pending", "totalPrice": 285.50, "vehicle": {"make": "BMW", "model": "X3", "year": 2023, "type": "suv", "seats": 5, "transmission": "automatic", "fuelType": "petrol", "engineCapacity": 2.0, "engineType": "TwinPower Turbo", "pricePerDay": 75.00, "features": ["GPS Navigation", "Bluetooth", "Air Conditioning", "Leather Seats", "Backup Camera"], "imageUrl": "https://images.pexels.com/photos/170811/pexels-photo-170811.jpeg?cs=srgb&dl=pexels-mikebirdy-170811.jpg&fm=jpg"}, "customerInfo": {"name": "John Smith", "email": "crisanmihai2004@gmail.com", "phone": "+1 (555) 123-4567", "message": "Please have the car ready at the pickup location. Thank you!", "flightNumber": "AA 1234"}, "promoCode": "WELCOME10", "additionalCharges": [{"description": "Insurance Coverage", "amount": 45.00}]}'

*/
