import RentalRequestEmail from '@/components/email-request-reservation';
import { Resend } from 'resend';
import type * as React from 'react';
import { NextResponse } from 'next/server';
import { ReservationEmailData } from '@/types/email';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
    const { reservationId, startDate, endDate, pickupTime, restitutionTime, pickupLocation, restitutionLocation, paymentMethod, totalPrice, vehicle, customerInfo, promoCode, additionalCharges } = await request.json();

    // Transform the API data into the email component's expected format
    const emailData: ReservationEmailData = {
        reservationId,
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
            numberOfDays: typeof startDate === 'number' && typeof endDate === 'number' ? Math.ceil((endDate - startDate) / 86400) : 1,
            pickupTime,
            restitutionTime,
            pickupLocation,
            restitutionLocation,
        },
        pricingDetails: {
            pricePerDay: vehicle.pricePerDay || Math.round(totalPrice / (typeof startDate === 'number' && typeof endDate === 'number' ? Math.ceil((endDate - startDate) / 86400) : 1)),
            totalPrice,
            paymentMethod,
            promoCode,
            additionalCharges: additionalCharges || [],
        },
    };

    try {
        const { data, error } = await resend.emails.send({
            from: 'Rent\'n Go <noreply@rngo.ro>',
            to: customerInfo.email,
            subject: 'Your reservation request has been received',
            react: RentalRequestEmail({ data: emailData }) as React.ReactElement,
            replyTo: 'office@rngo.ro',
        });

        if (error) {
            console.error(error);
            return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
        }

        return NextResponse.json(data);
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
