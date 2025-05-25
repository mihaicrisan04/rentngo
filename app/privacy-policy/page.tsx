import { Header } from "@/components/ui/header";
import { Footer } from "@/components/ui/footer";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function PrivacyPolicyPage() {
  return (
    <div className="relative flex flex-col min-h-screen">
      <Header logo={<Image src="/logo.png" alt="Rent'n Go Logo" width={150} height={50} />} />

      <main className="flex-grow p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-3xl font-bold text-center">Privacy Policy</CardTitle>
              <p className="text-center text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>
            </CardHeader>
            <CardContent className="prose max-w-none">
              <div className="space-y-6">
                <section>
                  <h2 className="text-xl font-semibold mb-3">1. Information We Collect</h2>
                  <p>
                    We collect information you provide directly to us, such as when you create an account, make a reservation, or contact us for support.
                  </p>
                  <ul className="list-disc pl-6 space-y-2 mt-3">
                    <li>Personal information (name, email, phone number)</li>
                    <li>Driver's license information</li>
                    <li>Payment information</li>
                    <li>Reservation and rental history</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-xl font-semibold mb-3">2. How We Use Your Information</h2>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>To provide and maintain our rental services</li>
                    <li>To process reservations and payments</li>
                    <li>To communicate with you about your reservations</li>
                    <li>To improve our services and customer experience</li>
                    <li>To comply with legal obligations</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-xl font-semibold mb-3">3. Information Sharing</h2>
                  <p>
                    We do not sell or rent your personal information to third parties. We may share your information only in the following circumstances:
                  </p>
                  <ul className="list-disc pl-6 space-y-2 mt-3">
                    <li>With service providers who assist us in operating our business</li>
                    <li>When required by law or to protect our rights</li>
                    <li>In connection with a business transfer or acquisition</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-xl font-semibold mb-3">4. Data Security</h2>
                  <p>
                    We implement appropriate security measures to protect your personal information against unauthorized access, 
                    alteration, disclosure, or destruction. However, no method of transmission over the internet is 100% secure.
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-semibold mb-3">5. Your Rights</h2>
                  <p>You have the right to:</p>
                  <ul className="list-disc pl-6 space-y-2 mt-3">
                    <li>Access and update your personal information</li>
                    <li>Request deletion of your personal information</li>
                    <li>Object to processing of your personal information</li>
                    <li>Request data portability</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-xl font-semibold mb-3">6. Cookies and Tracking</h2>
                  <p>
                    We use cookies and similar tracking technologies to enhance your experience on our website. 
                    You can control cookie settings through your browser preferences.
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-semibold mb-3">7. Changes to This Policy</h2>
                  <p>
                    We may update this privacy policy from time to time. We will notify you of any changes by posting 
                    the new privacy policy on this page and updating the "Last updated" date.
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-semibold mb-3">8. Contact Us</h2>
                  <p>
                    If you have any questions about this privacy policy, please contact us at:
                  </p>
                  <ul className="list-none pl-0 space-y-1 mt-3">
                    <li>Email: privacy@rentngo.com</li>
                    <li>Phone: +40 XXX XXX XXX</li>
                    <li>Address: Cluj-Napoca, Romania</li>
                  </ul>
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