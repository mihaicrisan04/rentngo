import { useState, useEffect } from "react";
import {
  transferStorage,
  type LocationData,
  type TransferSearchData,
} from "@/lib/transfer-storage";

export type TransferSearchDetails = TransferSearchData & {
  pickupLocation: LocationData;
  dropoffLocation: LocationData;
  pickupDate: Date;
  pickupTime: string;
};

export function hasTransferSearchDetails(
  data: TransferSearchData | null,
): data is TransferSearchDetails {
  return Boolean(
    data?.pickupLocation &&
    data?.dropoffLocation &&
    data?.pickupDate &&
    data?.pickupTime,
  );
}

interface UseTransferSearchReturn {
  searchData: TransferSearchData | null;
  isHydrated: boolean;
}

export function useTransferSearch(): UseTransferSearchReturn {
  const [searchData, setSearchData] = useState<TransferSearchData | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setSearchData(transferStorage.load());
    setIsHydrated(true);
  }, []);

  return { searchData, isHydrated };
}
