import { cn } from "@/lib/utils";
import {
  TestimonialCard,
  TestimonialAuthor,
} from "@/components/ui/testimonial-card";

// Default testimonials data
const DEFAULT_TESTIMONIALS = [
  {
    author: {
      name: "Ana Popescu",
      handle: "@anapopescu",
      avatar:
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face",
    },
    text: "Procesul de închiriere a fost incredibil de fluid și eficient. Sistemul de rezervare online a făcut foarte ușoară găsirea și rezervarea vehiculului perfect pentru vacanța în familie.",
  },
  {
    author: {
      name: "Mihai Ionescu",
      handle: "@mihaiionescu",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
    },
    text: "Am închiriat de la multe companii, dar aceasta se remarcă. Mașinile sunt mereu curate, bine întreținute, iar serviciul pentru clienți este excepțional. Voi folosi din nou cu siguranță!",
  },
  {
    author: {
      name: "Maria Georgescu",
      handle: "@mariageorgescu",
      avatar:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face",
    },
    text: "Perfect pentru călătoria mea de business. Mașina a fost exact ca în anunț, iar procesul de preluare și returnare a fost fără probleme.",
  },
  {
    author: {
      name: "Alexandru Stancu",
      handle: "@alexstancu",
      avatar:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
    },
    text: "Cea mai bună experiență de închiriere vreodată! 🚗✨",
  },
  {
    author: {
      name: "Elena Marinescu",
      handle: "@elenamarinescu",
      avatar:
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
    },
    text: "Explorarea Cluj-Napocii a fost uimitoare cu SUV-ul lor. GPS-ul era actualizat, mașina era impecabilă, iar consumul de combustibil a fost mai bun decât mă așteptam. Weekend-ul nostru a fost absolut perfect!",
  },
  {
    author: {
      name: "Radu Petrescu",
      handle: "@radupetrescu",
      avatar:
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
    },
    text: "Fără taxe ascunse, fără surprize. Doar prețuri corecte și mașini de încredere.",
  },
  {
    author: {
      name: "Ioana Constantinescu",
      handle: "@ioanaconstantinescu",
      avatar:
        "https://images.unsplash.com/photo-1544725176-7c40e5a71c5e?w=150&h=150&fit=crop&crop=face",
    },
    text: "Am rezervat la miezul nopții, am ridicat la 8 dimineața. Asta înseamnă eficiență! 💪",
  },
  {
    author: {
      name: "Cristian Andrei",
      handle: "@cristianandrei",
      avatar:
        "https://images.unsplash.com/photo-1559386484-97dfc0e15539?w=150&h=150&fit=crop&crop=face",
    },
    text: "Echipa de servicii pentru clienți a depășit toate așteptările când a trebuit să prelungesc închirierea în ultima clipă. Au făcut ca o situație stresantă să devină complet ușoară.",
  },
  {
    author: {
      name: "Andreea Munteanu",
      handle: "@andreeamunteanu",
      avatar:
        "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&h=150&fit=crop&crop=face",
    },
    text: "Mașină curată, preț corect, client fericit. Simplu.",
  },
  {
    author: {
      name: "Gabriel Răducu",
      handle: "@gabrielraducu",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
    },
    text: "GPS-ul meu s-a stricat, dar sistemul de navigație al mașinii mi-a salvat întâlnirea de business. Uneori sunt lucrurile mici care fac toată diferența!",
  },
  {
    author: {
      name: "Simona Vasile",
      handle: "@simonavasile",
      avatar:
        "https://images.unsplash.com/photo-1554151228-14d9def656e4?w=150&h=150&fit=crop&crop=face",
    },
    text: "10/10 aș închiria din nou! 🌟",
  },
  {
    author: {
      name: "Dan Teodorescu",
      handle: "@danteodorescu",
      avatar:
        "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=face",
    },
    text: "Vizitator străin aici - procesul de preluare a fost atât de fluid în ciuda cunoștințelor mele limitate de română. Personalul a fost răbdător și de ajutor. Mi-a făcut vacanța fără stress!",
  },
  {
    author: {
      name: "Carmen Diaconu",
      handle: "@carmendiaconu",
      avatar:
        "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=150&h=150&fit=crop&crop=face",
    },
    text: "Mașini de lux la prețuri economice. Ce să nu-mi placă?",
  },
  {
    author: {
      name: "Florin Matei",
      handle: "@florinmatei",
      avatar:
        "https://images.unsplash.com/photo-1542178243-bc20204b769f?w=150&h=150&fit=crop&face",
    },
    text: "Am închiriat pentru un drum de o săptămână prin România. Mașina a funcționat impecabil prin munți, orașe și câmpie. Întreținere și fiabilitate excelentă!",
  },
  {
    author: {
      name: "Bianca Nicolescu",
      handle: "@biancanicolescu",
      avatar:
        "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=150&h=150&fit=crop&crop=face",
    },
    text: "Mașini atât de curate că am crezut că sunt noi! 🧽✨",
  },
  {
    author: {
      name: "Lucian Dumitru",
      handle: "@luciandumitru",
      avatar:
        "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&h=150&fit=crop&crop=face",
    },
    text: "Am avut nevoie urgentă de o închiriere pentru muncă. M-au rezolvat în 30 de minute. Profesioniști, rapizi și exact ce aveam nevoie când aveam nevoie.",
  },
  {
    author: {
      name: "Diana Ciobanu",
      handle: "@dianaciobanu",
      avatar:
        "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&h=150&fit=crop&crop=face",
    },
    text: "Fără cozi, fără coșmaruri birocratice. Doar chei și pleacă!",
  },
  {
    author: {
      name: "Cristina Popa",
      handle: "@cristinapopa",
      avatar:
        "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&h=150&fit=crop&crop=face",
    },
    text: "Familie de cinci plus bagaje? Dubița lor a fost spațioasă, confortabilă și ne-a făcut aventura clujană de neuitat. Copiii încă vorbesc despre călătorie!",
  },
  {
    author: {
      name: "Oana Tudor",
      handle: "@oanatudor",
      avatar:
        "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150&h=150&fit=crop&crop=face",
    },
    text: "Cea mai bună decizie a vacanței mele. Libertatea de a explora! 🗺️",
  },
  {
    author: {
      name: "Adrian Moraru",
      handle: "@adrianmoraru",
      avatar:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
    },
    text: "Îi folosesc de ani de zile. Consistență în calitate și servicii pe care te poți baza. Fie că e o călătorie rapidă în oraș sau o călătorie lungă de business, livrează de fiecare dată.",
  },
];

interface TestimonialsSectionProps {
  title: string;
  description: string;
  testimonials?: Array<{
    author: TestimonialAuthor;
    text: string;
    href?: string;
  }>;
  className?: string;
}

export function TestimonialsSection({
  title,
  description,
  testimonials = DEFAULT_TESTIMONIALS,
  className,
}: TestimonialsSectionProps) {
  return (
    <section
      className={cn(
        "bg-transparent text-foreground",
        "py-12 sm:py-24 md:py-32",
        className,
      )}
    >
      <div className="w-full flex flex-col items-center gap-4 text-center sm:gap-16">
        <div className="flex flex-col items-center gap-4 px-4 sm:px-6 lg:px-8 sm:gap-8">
          <h2 className="max-w-[720px] text-2xl font-semibold leading-tight sm:text-4xl md:text-5xl md:leading-tight">
            {title}
          </h2>
          <p className="text-base max-w-[600px] font-medium text-muted-foreground sm:text-lg md:text-xl">
            {description}
          </p>
        </div>

        <div className="relative flex w-full flex-col items-center justify-center overflow-hidden">
          <div className="group flex overflow-hidden p-2 [--gap:0.5rem] sm:[--gap:1rem] [gap:var(--gap)] flex-row [--duration:60s]">
            <div className="flex shrink-0 [gap:var(--gap)] animate-marquee flex-row group-hover:[animation-play-state:paused]">
              {[...Array(2)].map((_, setIndex) =>
                testimonials.map((testimonial, i) => (
                  <TestimonialCard key={`${setIndex}-${i}`} {...testimonial} />
                )),
              )}
            </div>
          </div>

          <div className="pointer-events-none absolute inset-y-0 left-0 hidden w-1/3 bg-gradient-to-r from-background sm:block" />
          <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-1/3 bg-gradient-to-l from-background sm:block" />
        </div>
      </div>
    </section>
  );
}
