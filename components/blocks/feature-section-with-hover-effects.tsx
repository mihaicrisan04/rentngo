import { cn } from "@/lib/utils";
import {
  IconAdjustmentsBolt,
  IconCloud,
  IconCurrencyDollar,
  IconEaseInOut,
  IconHeart,
  IconHelp,
  IconRouteAltLeft,
  IconTerminal2,
  IconCar,
  IconDeviceMobileMessage,
  IconCalendarStats,
  IconMapPin,
  IconHeadset,
  IconShieldCheck,
  IconAward,
} from "@tabler/icons-react";
import { useTranslations } from 'next-intl';

export function FeaturesSectionWithHoverEffects() {
  const t = useTranslations('features');
  
  const features = [
    {
      title: t('wideVehicleSelection.title'),
      description: t('wideVehicleSelection.description'),
      icon: <IconCar />,
    },
    {
      title: t('transparentPricing.title'),
      description: t('transparentPricing.description'),
      icon: <IconCurrencyDollar />,
    },
    {
      title: t('effortlessBooking.title'),
      description: t('effortlessBooking.description'),
      icon: <IconDeviceMobileMessage />,
    },
    {
      title: t('flexibleRental.title'),
      description: t('flexibleRental.description'),
      icon: <IconCalendarStats />,
    },
    {
      title: t('convenientLocations.title'),
      description: t('convenientLocations.description'),
      icon: <IconMapPin />,
    },
    {
      title: t('roadsideSupport.title'),
      description: t('roadsideSupport.description'),
      icon: <IconHeadset />,
    },
    {
      title: t('comprehensiveInsurance.title'),
      description: t('comprehensiveInsurance.description'),
      icon: <IconShieldCheck />,
    },
    {
      title: t('memberPerks.title'),
      description: t('memberPerks.description'),
      icon: <IconAward />,
    },
  ];
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4  relative z-10 py-10 w-full lg:max-w-5xl mx-auto lg:p-8 px-4">
      {features.map((feature, index) => (
        <Feature key={feature.title} {...feature} index={index} />
      ))}
    </div>
  );
}

const Feature = ({
  title,
  description,
  icon,
  index,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
  index: number;
}) => {
  return (
    <div
      className={cn(
        "flex flex-col lg:border-r md:border-r py-10 relative group/feature border-border",
        (index === 0 || index === 4) && "lg:border-l md:border-l border-border",
        index < 4 && "lg:border-b md:border-b border-border"
      )}
    >
      {index < 4 && (
        <div className="opacity-0 group-hover/feature:opacity-100 transition duration-200 absolute inset-0 h-full w-full bg-gradient-to-t from-muted/50 to-transparent pointer-events-none" />
      )}
      {index >= 4 && (
        <div className="opacity-0 group-hover/feature:opacity-100 transition duration-200 absolute inset-0 h-full w-full bg-gradient-to-b from-muted/50 to-transparent pointer-events-none" />
      )}
      <div className="mb-4 relative z-10 px-10 text-muted-foreground">
        {icon}
      </div>
      <div className="text-lg font-bold mb-2 relative z-10 px-10">
        <div className="absolute left-0 inset-y-0 h-6 group-hover/feature:h-8 w-1 rounded-tr-full rounded-br-full bg-border group-hover/feature:bg-primary transition-all duration-200 origin-center" />
        <span className="group-hover/feature:translate-x-2 transition duration-200 inline-block text-foreground">
          {title}
        </span>
      </div>
      <p className="text-sm text-foreground/70 max-w-xs relative z-10 px-10">
        {description}
      </p>
    </div>
  );
};
