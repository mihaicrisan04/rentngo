import { useEffect, useRef } from "react";
import { useUser } from "@clerk/nextjs";
import { useMutation } from "convex/react";
import { api } from "../convex/_generated/api";

export function useEnsureUser() {
  const { user, isLoaded } = useUser();
  const ensureUserMutation = useMutation(api.users.ensureUser);
  const hasCalledRef = useRef(false);

  useEffect(() => {
    // Only proceed if Clerk has loaded and user is authenticated
    if (!isLoaded || !user || hasCalledRef.current) {
      return;
    }

    // Mark that we've called this to prevent duplicate calls
    hasCalledRef.current = true;

    // Call the mutation to ensure user exists in Convex
    ensureUserMutation({})
      .then(() => {
        console.log("User ensured in Convex database");
      })
      .catch((error) => {
        console.error("Failed to ensure user in Convex:", error);
        // Reset the flag so we can retry on next render
        hasCalledRef.current = false;
      });
  }, [isLoaded, user, ensureUserMutation]);

  return {
    isUserEnsured: hasCalledRef.current,
    user,
    isLoaded,
  };
} 