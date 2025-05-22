import { Footer } from "@/components/ui/footer";
import { Header } from "@/components/ui/header";
import Image from "next/image";

export default function TransfersPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header logo={<Image src="/logo.png" alt="Rent'n Go Logo" width={150} height={50} />} brandName="RentNGo" />

      <main className="flex-grow flex flex-col items-center justify-center">
        <h1 className="text-5xl font-bold text-center">Coming Soon</h1>
        <p className="text-xl text-muted-foreground text-center mt-4">
          Our transfers page is under construction. Stay tuned!
        </p>
      </main>
      <Footer
        logo={<Image src="/logo.png" alt="Rent'n Go Logo" width={150} height={50} />}
        brandName="" // Assuming empty brandName like in app/page.tsx
      />

    </div>
  );
} 