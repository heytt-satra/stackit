import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare, Users, Search, Award } from "lucide-react";

export default function Landing() {
  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  return (
    <div className="min-h-screen dark-bg">
      {/* Navigation */}
      <header className="dark-secondary border-b dark-border sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex-shrink-0">
              <h1 className="text-2xl font-bold dark-text">StackIt</h1>
            </div>
            
            <Button onClick={handleLogin} className="bg-accent-blue hover:bg-blue-600">
              Login
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <h1 className="text-4xl sm:text-6xl font-bold dark-text mb-6">
            Welcome to <span className="accent-blue">StackIt</span>
          </h1>
          <p className="text-xl dark-text-secondary mb-8 max-w-3xl mx-auto">
            A minimal question-and-answer platform that supports collaborative learning 
            and structured knowledge sharing. Ask questions, share knowledge, and learn together.
          </p>
          
          <div className="space-y-4 sm:space-y-0 sm:space-x-4 sm:flex sm:justify-center">
            <Button onClick={handleLogin} size="lg" className="bg-accent-blue hover:bg-blue-600">
              Get Started
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="dark-secondary border dark-border">
            <CardHeader className="text-center">
              <MessageSquare className="h-12 w-12 accent-blue mx-auto mb-4" />
              <CardTitle className="dark-text">Ask Questions</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="dark-text-secondary text-center">
                Post your programming questions with rich text formatting and code examples.
              </p>
            </CardContent>
          </Card>

          <Card className="dark-secondary border dark-border">
            <CardHeader className="text-center">
              <Users className="h-12 w-12 accent-green mx-auto mb-4" />
              <CardTitle className="dark-text">Get Answers</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="dark-text-secondary text-center">
                Connect with experienced developers who can help solve your problems.
              </p>
            </CardContent>
          </Card>

          <Card className="dark-secondary border dark-border">
            <CardHeader className="text-center">
              <Search className="h-12 w-12 accent-purple mx-auto mb-4" />
              <CardTitle className="dark-text">Search & Filter</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="dark-text-secondary text-center">
                Find relevant questions and answers using our powerful search and filtering system.
              </p>
            </CardContent>
          </Card>

          <Card className="dark-secondary border dark-border">
            <CardHeader className="text-center">
              <Award className="h-12 w-12 accent-orange mx-auto mb-4" />
              <CardTitle className="dark-text">Vote & Recognition</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="dark-text-secondary text-center">
                Vote on the best answers and get recognition for your helpful contributions.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Call to Action */}
        <div className="mt-20 text-center">
          <h2 className="text-3xl font-bold dark-text mb-4">
            Ready to start learning?
          </h2>
          <p className="text-lg dark-text-secondary mb-8">
            Join our community of developers and start asking questions today.
          </p>
          <Button onClick={handleLogin} size="lg" className="bg-accent-blue hover:bg-blue-600">
            Join StackIt
          </Button>
        </div>
      </main>
    </div>
  );
}
