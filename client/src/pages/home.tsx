import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Navbar } from "@/components/navbar";
import { QuestionCard } from "@/components/question-card";
import { AskQuestionModal } from "@/components/ask-question-modal";
import { QuestionDetailModal } from "@/components/question-detail-modal";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function Home() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const [filter, setFilter] = useState("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const [isAskModalOpen, setIsAskModalOpen] = useState(false);
  const [selectedQuestionId, setSelectedQuestionId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  const { data: questions = [], isLoading: questionsLoading, refetch } = useQuery({
    queryKey: ["/api/questions", { page: currentPage, filter, search: searchQuery }],
    enabled: isAuthenticated,
    retry: false,
  });

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  const handleQuestionClick = (questionId: number) => {
    setSelectedQuestionId(questionId);
  };

  const handleQuestionCreated = () => {
    setIsAskModalOpen(false);
    refetch();
    toast({
      title: "Success",
      description: "Your question has been posted!",
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen dark-bg flex items-center justify-center">
        <div className="text-lg dark-text">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen reddit-bg">
      <Navbar onSearch={handleSearch} onAskQuestion={() => setIsAskModalOpen(true)} />
      
      {/* Reddit-style layout */}
      <div className="max-w-6xl mx-auto px-4 py-4">
        <div className="flex gap-4">
          {/* Main content */}
          <main className="flex-1 max-w-2xl">
            {/* Create Post Bar */}
            <div className="reddit-card rounded-lg border reddit-border p-3 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-orange-400 to-red-500 flex-shrink-0"></div>
                <button 
                  onClick={() => setIsAskModalOpen(true)}
                  className="flex-1 text-left reddit-surface rounded-lg px-4 py-2 reddit-text-muted hover:reddit-hover transition-colors"
                >
                  Create Post
                </button>
                <Button 
                  onClick={() => setIsAskModalOpen(true)}
                  className="bg-orange-500 hover:bg-orange-600 text-white px-6"
                >
                  Post
                </Button>
              </div>
            </div>

            {/* Sort Options */}
            <div className="flex items-center gap-2 mb-4">
              <Select value={filter} onValueChange={setFilter}>
                <SelectTrigger className="w-32 reddit-surface border reddit-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="reddit-surface border reddit-border">
                  <SelectItem value="newest">New</SelectItem>
                  <SelectItem value="unanswered">Hot</SelectItem>
                  <SelectItem value="most-voted">Top</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Question Feed */}
            <div className="space-y-2">
              {questionsLoading ? (
                <div className="text-center py-8">
                  <div className="text-lg reddit-text-muted">Loading posts...</div>
                </div>
              ) : questions.length === 0 ? (
                <div className="text-center py-16 reddit-card rounded-lg border reddit-border">
                  <h3 className="text-xl font-semibold reddit-text mb-2">No posts yet</h3>
                  <p className="reddit-text-muted mb-4">
                    {searchQuery ? "Try adjusting your search terms" : "Be the first to create a post!"}
                  </p>
                  <Button 
                    onClick={() => setIsAskModalOpen(true)}
                    className="bg-orange-500 hover:bg-orange-600 text-white"
                  >
                    Create Post
                  </Button>
                </div>
              ) : (
                questions.map((question: any) => (
                  <QuestionCard
                    key={question.id}
                    question={question}
                    onClick={() => handleQuestionClick(question.id)}
                  />
                ))
              )}
            </div>

            {/* Pagination */}
            {questions.length > 0 && (
              <div className="flex justify-center items-center space-x-2 pt-6">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="border reddit-border hover:reddit-hover"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                
                <span className="px-4 py-2 reddit-text">
                  Page {currentPage}
                </span>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => p + 1)}
                  disabled={questions.length < 20}
                  className="border reddit-border hover:reddit-hover"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </main>

          {/* Sidebar */}
          <aside className="w-80 hidden lg:block">
            <div className="reddit-card rounded-lg border reddit-border p-4 mb-4">
              <h3 className="font-semibold reddit-text mb-3">About Community</h3>
              <p className="reddit-text-muted text-sm mb-4">
                A place for developers to ask questions, share knowledge, and help each other grow.
              </p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="reddit-text-muted">Members</span>
                  <span className="reddit-text">1,234</span>
                </div>
                <div className="flex justify-between">
                  <span className="reddit-text-muted">Online</span>
                  <span className="reddit-text">56</span>
                </div>
              </div>
            </div>

            <div className="reddit-card rounded-lg border reddit-border p-4">
              <h3 className="font-semibold reddit-text mb-3">Popular Tags</h3>
              <div className="space-y-2">
                {['javascript', 'python', 'react', 'css', 'html'].map((tag) => (
                  <div key={tag} className="flex items-center justify-between">
                    <span className="reddit-text-muted text-sm">#{tag}</span>
                    <span className="reddit-text-dim text-xs">42 posts</span>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* Modals */}
      <AskQuestionModal 
        open={isAskModalOpen} 
        onClose={() => setIsAskModalOpen(false)}
        onSuccess={handleQuestionCreated}
      />
      
      {selectedQuestionId && (
        <QuestionDetailModal 
          questionId={selectedQuestionId}
          open={!!selectedQuestionId}
          onClose={() => setSelectedQuestionId(null)}
        />
      )}
    </div>
  );
}
