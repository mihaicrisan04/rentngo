"use client";

import * as React from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Car, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

// Default FAQ data for car rental
const DEFAULT_CAR_RENTAL_FAQS = [
  {
    question: "What documents do I need to rent a car?",
    answer: "You'll typically need a valid driver's license held for at least one year, a credit card in the main driver's name for the security deposit, and a form of photo ID (like a passport or national ID card). International renters might need an International Driving Permit (IDP).",
  },
  {
    question: "Is there a minimum age to rent a car?",
    answer: "Yes, the minimum age is generally 21 years. However, drivers between 21-24 may be subject to a young driver surcharge and may have restrictions on available vehicle categories.",
  },
  {
    question: "Can I add an additional driver?",
    answer: "Yes, additional drivers can usually be added for an extra daily fee. They must meet the same age and license requirements as the main driver and must be present at the rental counter with their documents.",
  },
  {
    question: "What is your fuel policy?",
    answer: "Our standard fuel policy is 'full-to-full.' You will receive the car with a full tank of fuel and you should return it full. If returned with less fuel, refueling charges will apply. Other pre-paid fuel options might be available.",
  },
  {
    question: "What happens if I return the car late?",
    answer: "We understand delays can happen. A short grace period is usually allowed, but late returns beyond that may incur additional charges, potentially a full extra day's rental. Please contact us if you anticipate being late.",
  },
  {
    question: "Is insurance included in the rental price?",
    answer: "Basic Collision Damage Waiver (CDW) and Theft Protection (TP) with an excess amount are typically included. We also offer optional insurance packages to reduce the excess or provide more comprehensive coverage.",
  },
];

interface FaqSectionProps extends React.HTMLAttributes<HTMLElement> {
  title: string;
  description?: string;
  items?: {
    question: string;
    answer: string;
  }[];
  ctaSection?: {
    title: string;
    description: string;
    buttonText: string;
    onBrowseCars?: () => void;
    href?: string;
  };
}

const FaqSection = React.forwardRef<HTMLElement, FaqSectionProps>(
  ({ className, title, description, items = DEFAULT_CAR_RENTAL_FAQS, ctaSection, ...props }, ref) => {
    return (
      <section
        ref={ref}
        className={cn(
          "py-16 px-4 w-full bg-gradient-to-b from-transparent to-transparent mx-auto lg:max-w-5xl",
          className
        )}
        {...props}
      >
        <div className="container">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-2xl mx-auto text-center mb-12"
          >
            <h2 className="text-3xl font-semibold mb-3 bg-gradient-to-r from-foreground via-foreground/80 to-foreground bg-clip-text text-transparent">
              {title}
            </h2>
            {description && (
              <p className="text-sm text-muted-foreground">{description}</p>
            )}
          </motion.div>

          {/* FAQ Items */}
          <div className="max-w-2xl mx-auto space-y-2">
            {items.map((item, index) => (
              <FaqItem
                key={index}
                question={item.question}
                answer={item.answer}
                index={index}
              />
            ))}
          </div>

          {/* Call to Action Section */}
          {ctaSection && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="max-w-lg mx-auto mt-12 md:mt-16 lg:mt-30 p-8 rounded-lg text-center bg-gradient-to-br from-primary/5 to-secondary/5 border border-primary/20"
            >
              <div className="inline-flex items-center justify-center w-12 h-12 bg-primary/10 rounded-full mb-4">
                <Car className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {ctaSection.title}
              </h3>
              <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
                {ctaSection.description}
              </p>
              {ctaSection.href ? (
                <Button
                  size="lg"
                  className="bg-primary hover:bg-primary/90 text-primary-foreground"
                  asChild
                >
                  <Link href={ctaSection.href}>
                    {ctaSection.buttonText}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              ) : (
                <Button
                  size="lg"
                  className="bg-primary hover:bg-primary/90 text-primary-foreground"
                  onClick={ctaSection.onBrowseCars}
                >
                  {ctaSection.buttonText}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              )}
            </motion.div>
          )}
        </div>
      </section>
    );
  }
);
FaqSection.displayName = "FaqSection";

// Internal FaqItem component
const FaqItem = React.forwardRef<
  HTMLDivElement,
  {
    question: string;
    answer: string;
    index: number;
  }
>((props, ref) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const { question, answer, index } = props;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: index * 0.1 }}
      className={cn(
        "group rounded-lg",
        "transition-all duration-200 ease-in-out",
        "border border-border/50",
        isOpen
          ? "bg-gradient-to-br from-background via-muted/50 to-background"
          : "hover:bg-muted/50"
      )}
    >
      <div
        role="button"
        tabIndex={0}
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setIsOpen(!isOpen);
          }
        }}
        className={cn(
          "w-full px-6 py-4 h-auto text-left cursor-pointer",
          "hover:bg-transparent transition-colors",
          "flex items-start justify-between gap-4",
          "focus:outline-none"
        )}
      >
        <div
          className={cn(
            "text-base font-medium transition-colors duration-200 text-left",
            "text-foreground/70 flex-1 min-w-0",
            "break-words hyphens-auto",
            isOpen && "text-foreground"
          )}
        >
          {question}
        </div>
        <motion.div
          animate={{
            rotate: isOpen ? 180 : 0,
            scale: isOpen ? 1.1 : 1,
          }}
          transition={{ duration: 0.2 }}
          className={cn(
            "p-0.5 rounded-full flex-shrink-0",
            "transition-colors duration-200",
            isOpen ? "text-primary" : "text-muted-foreground"
          )}
        >
          <ChevronDown className="h-4 w-4" />
        </motion.div>
      </div>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{
              height: "auto",
              opacity: 1,
              transition: { duration: 0.2, ease: "easeOut" },
            }}
            exit={{
              height: 0,
              opacity: 0,
              transition: { duration: 0.2, ease: "easeIn" },
            }}
          >
            <div className="px-6 pb-4 pt-2">
              <motion.p
                initial={{ y: -10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -10, opacity: 0 }}
                className="text-sm text-muted-foreground leading-relaxed break-words hyphens-auto"
              >
                {answer}
              </motion.p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
});
FaqItem.displayName = "FaqItem";

export { FaqSection };
