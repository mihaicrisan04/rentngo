import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AlertCircle, User } from "lucide-react";
import { useUser, SignInButton } from "@clerk/nextjs";
import { cn } from "@/lib/utils";
import { formatFlightNumber } from "@/lib/flightValidation";
import { PersonalInfo, FormErrors } from "@/hooks/useReservationForm";

interface PersonalInfoCardProps {
  personalInfo: PersonalInfo;
  setPersonalInfo: React.Dispatch<React.SetStateAction<PersonalInfo>>;
  errors: FormErrors;
}

export function PersonalInfoCard({
  personalInfo,
  setPersonalInfo,
  errors
}: PersonalInfoCardProps) {
  const { user } = useUser();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <User className="h-5 w-5" />
          <span>Personal Information</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {!user && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800 mb-3">
                Sign in to auto-fill your information and make booking easier!
              </p>
              <SignInButton mode="modal">
                <Button variant="outline" size="sm" className="w-full">
                  Sign In / Sign Up
                </Button>
              </SignInButton>
            </div>
          )}
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="customer-name" className="pb-2">Full Name *</Label>
              <Input
                id="customer-name"
                type="text"
                placeholder="Enter your full name"
                value={personalInfo.name}
                onChange={(e) => setPersonalInfo(prev => ({ ...prev, name: e.target.value }))}
                className={cn(errors.personalInfo?.name && "border-red-500")}
              />
              {errors.personalInfo?.name && (
                <p className="text-sm text-red-500 mt-1 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.personalInfo.name}
                </p>
              )}
            </div>
            
            <div>
              <Label htmlFor="customer-email" className="pb-2">Email Address *</Label>
              <Input
                id="customer-email"
                type="email"
                placeholder="Enter your email address"
                value={personalInfo.email}
                onChange={(e) => setPersonalInfo(prev => ({ ...prev, email: e.target.value }))}
                className={cn(errors.personalInfo?.email && "border-red-500")}
              />
              {errors.personalInfo?.email && (
                <p className="text-sm text-red-500 mt-1 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.personalInfo.email}
                </p>
              )}
            </div>
            
            <div>
              <Label htmlFor="customer-phone" className="pb-2">Phone Number *</Label>
              <Input
                id="customer-phone"
                type="tel"
                placeholder="Enter your phone number"
                value={personalInfo.phone}
                onChange={(e) => setPersonalInfo(prev => ({ ...prev, phone: e.target.value }))}
                className={cn(errors.personalInfo?.phone && "border-red-500")}
              />
              {errors.personalInfo?.phone && (
                <p className="text-sm text-red-500 mt-1 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.personalInfo.phone}
                </p>
              )}
            </div>
            
            <div>
              <Label htmlFor="customer-flight" className="pb-2">Flight Number (Optional)</Label>
              <Input
                id="customer-flight"
                type="text"
                placeholder="e.g., AA 1234, LH 456, BA 2847"
                value={personalInfo.flightNumber}
                onChange={(e) => {
                  const formattedValue = formatFlightNumber(e.target.value);
                  setPersonalInfo(prev => ({ ...prev, flightNumber: formattedValue }));
                }}
                className={cn(errors.personalInfo?.flightNumber && "border-red-500")}
                maxLength={10}
              />
              {errors.personalInfo?.flightNumber && (
                <p className="text-sm text-red-500 mt-1 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.personalInfo.flightNumber}
                </p>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                Format: Two letter airline code + flight number (e.g., "AA 1234, LH 456, BA 2847")
              </p>
            </div>
            
            <div>
              <Label htmlFor="customer-message" className="pb-2">Additional Message (Optional)</Label>
              <Textarea
                id="customer-message"
                placeholder="Any special requests or additional information..."
                value={personalInfo.message}
                onChange={(e) => setPersonalInfo(prev => ({ ...prev, message: e.target.value }))}
                rows={3}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 