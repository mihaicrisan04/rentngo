import React from 'react';
import Image from 'next/image'; // Import Next.js Image component
import { Header } from '@/components/ui/header'; // Assuming path to header
import { Footer } from '@/components/ui/footer';   // Assuming path to footer

const ContactPage = () => {
  return (
    <div className="relative flex flex-col min-h-screen"> {/* Main wrapper like in other pages */}
      <Header logo={<Image src="/logo.png" alt="Rent'n Go Logo" width={150} height={50} />} />

      <main className="p-8 flex flex-col gap-8 flex-grow"> {/* Added flex-grow to push footer down */}
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-6 text-center">Contact Us</h1>
          <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-md">
            <p className="text-lg mb-4">
              Have questions or want to get in touch? We'd love to hear from you!
            </p>
            <p className="mb-2">
              You can reach us through the following channels:
            </p>
            <ul className="list-disc list-inside mb-6">
              <li><strong>Email:</strong> support@rentngo.com</li>
              <li><strong>Phone:</strong> (123) 456-7890</li>
              <li><strong>Address:</strong> 123 Main Street, Anytown, USA</li>
            </ul>
            <p>
              Alternatively, you can fill out the contact form on our website (if available) 
              or connect with us on social media.
            </p>
          </div>
        </div>
      </main>

      <Footer
        logo={<Image src="/logo.png" alt="Rent'n Go Logo" width={150} height={50} />}
        brandName="" // Assuming empty brandName like in app/page.tsx
      />
    </div>
  );
};

export default ContactPage; 