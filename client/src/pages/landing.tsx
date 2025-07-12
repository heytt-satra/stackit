import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare, Users, Search, Award } from "lucide-react";

export default function Landing() {
  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  return (
    <div className="min-h-screen reddit-bg">
      {/* Navigation */}
      <header className="reddit-surface border-b reddit-border sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex justify-between items-center h-12">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">S</span>
              </div>
              <h1 className="text-xl font-bold reddit-text">StackIt</h1>
            </div>
            
            <Button onClick={handleLogin} className="bg-orange-500 hover:bg-orange-600 text-white">
              Log In
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-4xl mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-4xl sm:text-5xl font-bold reddit-text mb-6">
            Welcome to <span className="text-orange-500">StackIt</span>
          </h1>
          <p className="text-lg reddit-text-muted mb-8 max-w-2xl mx-auto">
            The front page of developer knowledge. Share your questions, discover solutions, 
            and connect with a community of passionate programmers.
          </p>
          
          <div className="space-y-4 sm:space-y-0 sm:space-x-4 sm:flex sm:justify-center">
            <Button onClick={handleLogin} size="lg" className="bg-orange-500 hover:bg-orange-600 text-white">
              Join the Community
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="reddit-card border reddit-border">
            <CardHeader className="text-center">
              <MessageSquare className="h-10 w-10 text-orange-500 mx-auto mb-3" />
              <CardTitle className="reddit-text">Create Posts</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="reddit-text-muted text-center text-sm">
                Share your questions, code snippets, and knowledge with the community using our rich text editor.
              </p>
            </CardContent>
          </Card>

          <Card className="reddit-card border reddit-border">
            <CardHeader className="text-center">
              <Users className="h-10 w-10 text-orange-500 mx-auto mb-3" />
              <CardTitle className="reddit-text">Community Driven</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="reddit-text-muted text-center text-sm">
                Connect with developers worldwide. Get help, share knowledge, and grow together.
              </p>
            </CardContent>
          </Card>

          <Card className="reddit-card border reddit-border">
            <CardHeader className="text-center">
              <Search className="h-10 w-10 text-orange-500 mx-auto mb-3" />
              <CardTitle className="reddit-text">Discover Content</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="reddit-text-muted text-center text-sm">
                Browse by topics, search for specific problems, and discover trending discussions.
              </p>
            </CardContent>
          </Card>

          <Card className="reddit-card border reddit-border">
            <CardHeader className="text-center">
              <Award className="h-10 w-10 text-orange-500 mx-auto mb-3" />
              <CardTitle className="reddit-text">Voting System</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="reddit-text-muted text-center text-sm">
                Upvote helpful content and get recognition for your valuable contributions to the community.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Call to Action */}
        <div className="mt-16 text-center">
          <h2 className="text-2xl font-bold reddit-text mb-4">
            Ready to join the conversation?
          </h2>
          <p className="reddit-text-muted mb-8">
            Become part of the developer community today.
          </p>
          <Button onClick={handleLogin} size="lg" className="bg-orange-500 hover:bg-orange-600 text-white">
            Get Started
          </Button>
        </div>
      </main>
    </div>
  );
}
