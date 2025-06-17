import { Resend } from 'resend';
import { NextResponse } from 'next/server';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
    try {
        const { to, subject, message, emailType, reservationData } = await request.json();

        // Validate required fields
        if (!to || !subject || !message) {
            return NextResponse.json(
                { error: 'Missing required fields: to, subject, message' }, 
                { status: 400 }
            );
        }

        // Create HTML email content
        const htmlContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>${subject}</title>
                <style>
                    body {
                        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                        line-height: 1.6;
                        color: #333;
                        max-width: 600px;
                        margin: 0 auto;
                        padding: 20px;
                        background-color: #f9f9f9;
                    }
                    .email-container {
                        background-color: #ffffff;
                        border-radius: 8px;
                        padding: 30px;
                        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
                    }
                    .header {
                        text-align: center;
                        margin-bottom: 30px;
                        border-bottom: 2px solid #e5e7eb;
                        padding-bottom: 20px;
                    }
                    .logo {
                        font-size: 24px;
                        font-weight: bold;
                        color: #1f2937;
                        margin-bottom: 10px;
                    }
                    .email-type {
                        display: inline-block;
                        padding: 6px 12px;
                        border-radius: 20px;
                        font-size: 12px;
                        font-weight: 600;
                        text-transform: uppercase;
                        letter-spacing: 0.5px;
                    }
                    .confirmation { background-color: #d1fae5; color: #065f46; }
                    .modification { background-color: #fef3c7; color: #92400e; }
                    .cancellation { background-color: #fee2e2; color: #991b1b; }
                    .reminder { background-color: #dbeafe; color: #1e40af; }
                    .content {
                        margin: 20px 0;
                        white-space: pre-line;
                    }
                    .reservation-details {
                        background-color: #f8fafc;
                        border: 1px solid #e2e8f0;
                        border-radius: 6px;
                        padding: 20px;
                        margin: 20px 0;
                    }
                    .detail-row {
                        display: flex;
                        justify-content: space-between;
                        margin-bottom: 8px;
                        padding: 4px 0;
                    }
                    .detail-label {
                        font-weight: 600;
                        color: #4b5563;
                    }
                    .detail-value {
                        color: #1f2937;
                    }
                    .footer {
                        margin-top: 30px;
                        padding-top: 20px;
                        border-top: 1px solid #e5e7eb;
                        text-align: center;
                        color: #6b7280;
                        font-size: 14px;
                    }
                    .contact-info {
                        margin-top: 15px;
                        font-size: 13px;
                    }
                </style>
            </head>
            <body>
                <div class="email-container">
                    <div class="header">
                        <div class="logo">Rent'n Go</div>
                        <span class="email-type ${emailType}">${emailType} Email</span>
                    </div>
                    
                    <div class="content">
                        ${message.replace(/\n/g, '<br>')}
                    </div>
                    
                    ${reservationData ? `
                    <div class="reservation-details">
                        <h3 style="margin-top: 0; color: #1f2937;">Reservation Summary</h3>
                        <div class="detail-row">
                            <span class="detail-label">Reservation ID:</span>
                            <span class="detail-value">#${reservationData.id}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Vehicle:</span>
                            <span class="detail-value">${reservationData.vehicle}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Dates:</span>
                            <span class="detail-value">${reservationData.dates}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Pickup:</span>
                            <span class="detail-value">${reservationData.pickup}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Return:</span>
                            <span class="detail-value">${reservationData.return}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Total Price:</span>
                            <span class="detail-value">€${reservationData.totalPrice}</span>
                        </div>
                    </div>
                    ` : ''}
                    
                    <div class="footer">
                        <p>Thank you for choosing Rent'n Go!</p>
                        <div class="contact-info">
                            <p>Questions? Contact us at office@rngo.ro or visit our website</p>
                            <p>Rent'n Go - Your trusted car rental partner</p>
                        </div>
                    </div>
                </div>
            </body>
            </html>
        `;

        const { data, error } = await resend.emails.send({
            from: 'Rent\'n Go <noreply@rngo.ro>',
            to: to,
            subject: subject,
            html: htmlContent,
            replyTo: 'office@rngo.ro',
        });

        if (error) {
            console.error('Resend error:', error);
            return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
        }

        return NextResponse.json({ 
            success: true, 
            messageId: data?.id,
            message: 'Email sent successfully' 
        });

    } catch (error) {
        console.error('Email sending error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
} 