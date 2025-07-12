import { useEffect } from "react";
import { useUser } from "@clerk/clerk-react";
import { apiRequest } from "@/lib/queryClient";

export function UserSync() {
  const { user, isLoaded } = useUser();

  useEffect(() => {
    if (isLoaded && user) {
      console.log("UserSync: Syncing user to database", { userId: user.id, email: user.emailAddresses[0]?.emailAddress });
      
      // Sync user data to our database
      const syncUser = async () => {
        try {
          const response = await apiRequest("/api/users", {
            method: "POST",
            body: JSON.stringify({
              id: user.id,
              email: user.emailAddresses[0]?.emailAddress,
              firstName: user.firstName,
              lastName: user.lastName,
              profileImageUrl: user.imageUrl,
            }),
          });
          
          console.log("UserSync: User synced successfully");
        } catch (error) {
          console.error("UserSync: Failed to sync user:", error);
        }
      };

      syncUser();
    }
  }, [user, isLoaded]);

  return null; // This component doesn't render anything
} 