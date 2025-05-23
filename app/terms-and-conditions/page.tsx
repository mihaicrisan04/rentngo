import { Header } from "@/components/ui/header";
import { Footer } from "@/components/ui/footer";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function TermsAndConditionsPage() {
  return (
    <div className="relative flex flex-col min-h-screen">
      <Header logo={<Image src="/logo.png" alt="Rent'n Go Logo" width={150} height={50} />} />

      <main className="flex-grow p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-3xl font-bold text-center">Terms and Conditions</CardTitle>
              <p className="text-center text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>
            </CardHeader>
            <CardContent className="prose max-w-none">
              <div className="space-y-6">
                <section>
                  <h2 className="text-xl font-semibold mb-3">1. Agreement to Terms</h2>
                  <p>
                    By accessing and using Rent'n Go car rental services, you accept and agree to be bound by the terms and provision of this agreement.
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-semibold mb-3">2. Driver Requirements</h2>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Must be at least 21 years old</li>
                    <li>Must hold a valid driver's license for at least 1 year</li>
                    <li>Must provide a valid credit card for security deposit</li>
                    <li>International drivers must have an International Driving Permit (IDP)</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-xl font-semibold mb-3">3. Rental Terms</h2>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Vehicle must be returned on time and in the same condition</li>
                    <li>Fuel policy: Full-to-full (return with full tank)</li>
                    <li>Smoking is prohibited in all vehicles</li>
                    <li>Pets are not allowed unless specifically arranged</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-xl font-semibold mb-3">4. Payment and Fees</h2>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Payment is due at the time of booking or pickup</li>
                    <li>Security deposit will be held on your credit card</li>
                    <li>Late return fees may apply</li>
                    <li>Additional fees for damages, cleaning, or violations</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-xl font-semibold mb-3">5. Insurance and Liability</h2>
                  <p>
                    Basic insurance coverage is included. Additional coverage options are available for purchase. 
                    The renter is responsible for any damages not covered by insurance.
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-semibold mb-3">6. Cancellation Policy</h2>
                  <p>
                    Reservations can be cancelled free of charge up to 24 hours before the pickup time. 
                    Cancellations within 24 hours may incur fees.
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-semibold mb-3">7. Contact Information</h2>
                  <p>
                    For questions about these terms, please contact us at info@rentngo.com or visit our office in Cluj-Napoca.
                  </p>
                </section>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer
        logo={<Image src="/logo.png" alt="Rent'n Go Logo" width={150} height={50} />}
        brandName=""
      />
    </div>
  );
} 