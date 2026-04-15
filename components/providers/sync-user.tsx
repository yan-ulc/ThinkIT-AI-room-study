"use client";

import { useConvexAuth } from "convex/react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useEffect, useState } from "react";

export function SyncUser() {
  const { isAuthenticated } = useConvexAuth();
  const storeUser = useMutation(api.users.storeUser);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (isAuthenticated && !done) {
      storeUser().then(() => setDone(true)).catch(console.error);
    }
  }, [isAuthenticated, storeUser, done]);

  return null;
}