import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ClerkProvider, SignIn, SignUp } from "@clerk/clerk-react";
import { useAuth } from "@/hooks/useAuth";
import { UserSync } from "@/components/UserSync";
import Home from "@/pages/home";
import Landing from "@/pages/landing";
import NotFound from "@/pages/not-found";
import QuestionDetailPage from "@/pages/question-detail";
import ProfilePage from "@/pages/profile";

const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!clerkPubKey) {
  throw new Error("Missing Publishable Key");
}

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <>
      {isAuthenticated && <UserSync />}
      <Switch>
        {!isAuthenticated ? (
          <>
            <Route path="/" component={Landing} />
            <Route path="/sign-in" component={SignIn} />
            <Route path="/sign-up" component={SignUp} />
          </>
        ) : (
          <>
            <Route path="/" component={Home} />
            <Route path="/questions/:id" component={QuestionDetailPage} />
            <Route path="/profile" component={ProfilePage} />
          </>
        )}
        <Route component={NotFound} />
      </Switch>
    </>
  );
}

function App() {
  return (
    <ClerkProvider publishableKey={clerkPubKey}>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </QueryClientProvider>
    </ClerkProvider>
  );
}

export default App;
