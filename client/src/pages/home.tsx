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
    <div className="min-h-screen dark-bg">
      <Navbar onSearch={handleSearch} onAskQuestion={() => setIsAskModalOpen(true)} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
          <div>
            <h2 className="text-3xl font-bold dark-text">All Questions</h2>
            <p className="dark-text-secondary mt-1">
              {questions.length} questions
            </p>
          </div>
          
          {/* Mobile Ask Button */}
          <Button 
            onClick={() => setIsAskModalOpen(true)}
            className="md:hidden mt-4 bg-accent-blue hover:bg-blue-600"
          >
            Ask Question
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-full sm:w-48 dark-surface border dark-border">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="dark-surface border dark-border">
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="unanswered">Unanswered</SelectItem>
              <SelectItem value="most-voted">Most Voted</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Question List */}
        <div className="space-y-4">
          {questionsLoading ? (
            <div className="text-center py-8">
              <div className="text-lg dark-text-secondary">Loading questions...</div>
            </div>
          ) : questions.length === 0 ? (
            <div className="text-center py-16">
              <h3 className="text-xl font-semibold dark-text mb-2">No questions found</h3>
              <p className="dark-text-secondary mb-4">
                {searchQuery ? "Try adjusting your search terms" : "Be the first to ask a question!"}
              </p>
              <Button 
                onClick={() => setIsAskModalOpen(true)}
                className="bg-accent-blue hover:bg-blue-600"
              >
                Ask the first question
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
          <div className="flex justify-center items-center space-x-2 pt-8">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="border dark-border hover:dark-surface"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <span className="px-4 py-2 dark-text">
              Page {currentPage}
            </span>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => p + 1)}
              disabled={questions.length < 20}
              className="border dark-border hover:dark-surface"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </main>

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
