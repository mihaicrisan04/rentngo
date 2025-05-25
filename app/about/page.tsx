import React from 'react';
import Image from 'next/image';
import { Header } from '@/components/ui/header';
import { Footer } from '@/components/ui/footer';

const AboutPage = () => {
  return (
    <div className="relative flex flex-col min-h-screen">
      <Header logo={<Image src="/logo.png" alt="Rent'n Go Logo" width={150} height={50} />} />

      <main className="p-8 flex flex-col gap-8 flex-grow">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-6 text-center">About Us</h1>
          <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-md">
            <p className="text-lg mb-4">
              Welcome to RentNGo! We are passionate about providing the best car rental experience.
            </p>
            <p className="mb-2">
              Our mission is to offer a wide selection of vehicles, competitive prices, and excellent customer service to make your journey smooth and enjoyable.
            </p>
            <p>
              Founded in 2024, RentNGo has been serving customers with dedication and a commitment to quality. We believe in transparency and strive to meet all your transportation needs.
            </p>
          </div>
        </div>
      </main>

      <Footer
        logo={<Image src="/logo.png" alt="Rent'n Go Logo" width={150} height={50} />}
        brandName=""
      />
    </div>
  );
};

export default AboutPage;
