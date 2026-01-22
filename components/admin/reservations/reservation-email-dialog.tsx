"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { Mail, Send } from "lucide-react";

const emailSchema = z.object({
  emailType: z.enum(["modification", "confirmation", "cancellation", "reminder"], {
    required_error: "Email type is required",
  }),
  subject: z.string().min(1, "Subject is required"),
  message: z.string().min(1, "Message is required"),
});

type EmailFormData = z.infer<typeof emailSchema>;

interface ReservationEmailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reservationId: Id<"reservations">;
  onSuccess?: () => void;
}

export function ReservationEmailDialog({
  open,
  onOpenChange,
  reservationId,
  onSuccess,
}: ReservationEmailDialogProps) {
  const reservation = useQuery(api.reservations.getReservationById, reservationId ? { reservationId } : "skip");
  const vehicle = useQuery(
    api.vehicles.getById, 
    reservation?.vehicleId ? { id: reservation.vehicleId } : "skip"
  );

  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<EmailFormData>({
    resolver: zodResolver(emailSchema),
    defaultValues: {
      emailType: "modification",
      subject: "",
      message: "",
    },
  });

  const generateEmailTemplate = (type: string) => {
    if (!reservation || !vehicle) return { subject: "", message: "" };

    const customerName = reservation.customerInfo.name;
    const vehicleName = `${vehicle.make} ${vehicle.model} (${vehicle.year})`;
    const startDate = new Date(reservation.startDate).toLocaleDateString();
    const endDate = new Date(reservation.endDate).toLocaleDateString();

    switch (type) {
      case "modification":
        return {
          subject: `Reservation Modification Required - ${vehicleName}`,
          message: `Dear ${customerName},

We have reviewed your reservation request for the ${vehicleName} from ${startDate} to ${endDate}.

We would like to suggest some modifications to better serve you:

[Please specify the modifications needed]

If you agree with these changes, please reply to confirm, and we will proceed with your reservation.

Best regards,
Rent'n Go Team

Reservation Details:
- Vehicle: ${vehicleName}
- Pickup: ${reservation.pickupLocation} at ${reservation.pickupTime}
- Return: ${reservation.restitutionLocation} at ${reservation.restitutionTime}
- Total Price: €${reservation.totalPrice}`
        };
      case "confirmation":
        return {
          subject: `Reservation Confirmed - ${vehicleName}`,
          message: `Dear ${customerName},

Your reservation has been confirmed!

Reservation Details:
- Vehicle: ${vehicleName}
- Dates: ${startDate} to ${endDate}
- Pickup: ${reservation.pickupLocation} at ${reservation.pickupTime}
- Return: ${reservation.restitutionLocation} at ${reservation.restitutionTime}
- Total Price: €${reservation.totalPrice}
- Payment Method: ${reservation.paymentMethod.replace(/_/g, ' ')}

We look forward to serving you!

Best regards,
Rent'n Go Team`
        };
      case "cancellation":
        return {
          subject: `Reservation Cancelled - ${vehicleName}`,
          message: `Dear ${customerName},

We regret to inform you that your reservation for the ${vehicleName} from ${startDate} to ${endDate} has been cancelled.

[Please specify the reason for cancellation]

If you have any questions or would like to make a new reservation, please don't hesitate to contact us.

Best regards,
Rent'n Go Team`
        };
      case "reminder":
        return {
          subject: `Reservation Reminder - ${vehicleName}`,
          message: `Dear ${customerName},

This is a friendly reminder about your upcoming reservation:

- Vehicle: ${vehicleName}
- Pickup: Tomorrow at ${reservation.pickupTime} from ${reservation.pickupLocation}
- Return: ${endDate} at ${reservation.restitutionTime} to ${reservation.restitutionLocation}

Please ensure you have all necessary documents ready for pickup.

Best regards,
Rent'n Go Team`
        };
      default:
        return { subject: "", message: "" };
    }
  };

  const handleEmailTypeChange = (value: string) => {
    const template = generateEmailTemplate(value);
    form.setValue("subject", template.subject);
    form.setValue("message", template.message);
  };

  const onSubmit = async (values: EmailFormData) => {
    if (!reservation || !vehicle) return;

    setIsSubmitting(true);

    try {
      // Prepare reservation data for the email template
      const reservationData = {
        id: reservationId,
        vehicle: `${vehicle.make} ${vehicle.model} (${vehicle.year})`,
        dates: `${new Date(reservation.startDate).toLocaleDateString()} - ${new Date(reservation.endDate).toLocaleDateString()}`,
        pickup: `${reservation.pickupLocation} at ${reservation.pickupTime}`,
        return: `${reservation.restitutionLocation} at ${reservation.restitutionTime}`,
        totalPrice: reservation.totalPrice.toFixed(2),
      };

      // Send email via our API route
      const response = await fetch('/api/send/reservation-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: reservation.customerInfo.email,
          subject: values.subject,
          message: values.message,
          emailType: values.emailType,
          reservationData: reservationData,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to send email');
      }

      toast.success("Email sent successfully", {
        description: `${values.emailType} email sent to ${reservation.customerInfo.email}`,
        duration: 5000,
        action: {
          label: "View Details",
          onClick: () => {
            console.log("Email details:", {
              messageId: result.messageId,
              emailType: values.emailType,
              recipient: reservation.customerInfo.email,
            });
          },
        },
      });
      
      onSuccess?.();
      onOpenChange(false);
    } catch (error) {
      console.error("Error sending email:", error);
      toast.error("Failed to send email", {
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        duration: 5000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!reservation) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Send Email to Customer
          </DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="max-h-[calc(80vh-150px)] pr-6">
          <div className="space-y-4">
            <div className="p-4 border rounded-lg bg-muted/30">
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <span>Customer Information</span>
                {reservation.status && (
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    reservation.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                    reservation.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    reservation.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {reservation.status}
                  </span>
                )}
              </h4>
              <div className="text-sm space-y-1">
                <p><strong>Name:</strong> {reservation.customerInfo.name}</p>
                <p><strong>Email:</strong> {reservation.customerInfo.email}</p>
                <p><strong>Phone:</strong> {reservation.customerInfo.phone}</p>
                {vehicle && (
                  <p><strong>Vehicle:</strong> {vehicle.make} {vehicle.model} ({vehicle.year})</p>
                )}
              </div>
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="emailType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Type</FormLabel>
                      <Select 
                        onValueChange={(value) => {
                          field.onChange(value);
                          handleEmailTypeChange(value);
                        }} 
                        value={field.value} 
                        disabled={isSubmitting}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select email type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="modification">Modification Request</SelectItem>
                          <SelectItem value="confirmation">Confirmation</SelectItem>
                          <SelectItem value="cancellation">Cancellation</SelectItem>
                          <SelectItem value="reminder">Reminder</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="subject"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Subject</FormLabel>
                      <FormControl>
                        <Input {...field} disabled={isSubmitting} placeholder="Enter email subject" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="message"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Message</FormLabel>
                      <FormControl>
                        <Textarea 
                          {...field} 
                          disabled={isSubmitting}
                          className="min-h-[200px]"
                          placeholder="Enter your message here... (reservation details will be automatically included)"
                        />
                      </FormControl>
                      <p className="text-xs text-muted-foreground mt-1">
                        A professional email template with reservation details will be automatically generated.
                      </p>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </form>
            </Form>
          </div>
        </ScrollArea>

        <DialogFooter className="pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            onClick={form.handleSubmit(onSubmit)}
            disabled={isSubmitting}
            className="gap-2"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Sending...
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                Send Email
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 