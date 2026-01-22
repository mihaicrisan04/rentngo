"use client";

import { useEnsureUser } from "@/hooks/use-ensure-user";

interface UserEnsurerProps {
  children: React.ReactNode;
}

/**
 * This component automatically ensures that authenticated users
 * have a corresponding record in the Convex database.
 * It should be placed high in the component tree, ideally in the layout.
 */
export function UserEnsurer({ children }: UserEnsurerProps) {
  useEnsureUser();
  
  return <>{children}</>;
} 