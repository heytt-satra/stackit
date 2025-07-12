import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { ChevronUp, ChevronDown, Check, MessageSquare, Calendar, Eye } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";

interface QuestionDetailModalProps {
  questionId: number;
  open: boolean;
  onClose: () => void;
}

export function QuestionDetailModal({ questionId, open, onClose }: QuestionDetailModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [answerContent, setAnswerContent] = useState("");

  const { data: question, isLoading: questionLoading } = useQuery({
    queryKey: ["/api/questions", questionId],
    enabled: open && !!questionId,
  });

  const { data: answers = [], refetch: refetchAnswers } = useQuery({
    queryKey: ["/api/questions", questionId, "answers"],
    enabled: open && !!questionId,
  });

  const createAnswerMutation = useMutation({
    mutationFn: async (content: string) => {
      const response = await apiRequest(`/api/questions/${questionId}/answers`, {
        method: "POST",
        body: JSON.stringify({
          content,
          authorId: user?.id,
        }),
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Your answer has been posted!",
      });
      setAnswerContent("");
      refetchAnswers();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to post answer. Please try again.",
        variant: "destructive",
      });
    },
  });

  const voteQuestionMutation = useMutation({
    mutationFn: async (voteType: number) => {
      await apiRequest(`/api/questions/${questionId}/vote`, {
        method: "POST",
        body: JSON.stringify({ 
          voteType,
          userId: user?.id,
        }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/questions", questionId] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to vote. Please try again.",
        variant: "destructive",
      });
    },
  });

  const voteAnswerMutation = useMutation({
    mutationFn: async ({ answerId, voteType }: { answerId: number; voteType: number }) => {
      await apiRequest(`/api/answers/${answerId}/vote`, {
        method: "POST",
        body: JSON.stringify({ 
          voteType,
          userId: user?.id,
        }),
      });
    },
    onSuccess: () => {
      refetchAnswers();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to vote. Please try again.",
        variant: "destructive",
      });
    },
  });

  const acceptAnswerMutation = useMutation({
    mutationFn: async (answerId: number) => {
      await apiRequest(`/api/answers/${answerId}/accept`, {
        method: "POST",
      });
    },
    onSuccess: () => {
      refetchAnswers();
      toast({
        title: "Success",
        description: "Answer accepted!",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to accept answer. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmitAnswer = () => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to answer.",
        variant: "destructive",
      });
      return;
    }

    if (!answerContent.trim()) {
      toast({
        title: "Error",
        description: "Please provide an answer.",
        variant: "destructive",
      });
      return;
    }
    createAnswerMutation.mutate(answerContent);
  };

  const getUserInitials = (user: any) => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }
    if (user?.email) {
      return user.email.slice(0, 2).toUpperCase();
    }
    return "U";
  };

  const getUserDisplayName = (user: any) => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    if (user?.email) {
      return user.email.split('@')[0];
    }
    return "User";
  };

  const getAvatarGradient = (user: any) => {
    const gradients = [
      'avatar-gradient-1', 'avatar-gradient-2', 'avatar-gradient-3',
      'avatar-gradient-4', 'avatar-gradient-5', 'avatar-gradient-6',
      'avatar-gradient-7', 'avatar-gradient-8'
    ];
    const index = user?.id ? user.id.charCodeAt(0) % gradients.length : 0;
    return gradients[index];
  };

  const getBadgeColors = (name: string) => {
    const colors = [
      'bg-blue-600', 'bg-purple-600', 'bg-green-600', 'bg-orange-600',
      'bg-red-600', 'bg-yellow-600', 'bg-pink-600', 'bg-indigo-600'
    ];
    const index = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
    return colors[index];
  };

  if (questionLoading) {
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto dark-secondary border dark-border">
          <div className="flex items-center justify-center py-8">
            <div className="text-lg dark-text-secondary">Loading question...</div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!question) {
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto dark-secondary border dark-border">
          <div className="flex items-center justify-center py-8">
            <div className="text-lg dark-text-secondary">Question not found</div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto dark-secondary border dark-border">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold dark-text mb-2">
            {question.title}
          </DialogTitle>
          <div className="flex flex-wrap gap-2">
            {question.tags?.map((tag: string, index: number) => (
              <Badge 
                key={index} 
                variant="outline" 
                className="dark-bg accent-blue border dark-border text-xs"
              >
                {tag}
              </Badge>
            ))}
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Question Details */}
          <div className="flex items-start space-x-6">
            {/* Vote Controls */}
            <div className="flex flex-col items-center space-y-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => voteQuestionMutation.mutate(1)}
                className="w-10 h-10 p-0 border dark-border hover:dark-surface"
              >
                <ChevronUp className="h-4 w-4" />
              </Button>
              <span className="text-xl font-semibold dark-text">{question.voteCount || 0}</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => voteQuestionMutation.mutate(-1)}
                className="w-10 h-10 p-0 border dark-border hover:dark-surface"
              >
                <ChevronDown className="h-4 w-4" />
              </Button>
            </div>

            {/* Question Content */}
            <div className="flex-1">
              <div className="prose dark:prose-invert max-w-none">
                <div dangerouslySetInnerHTML={{ __html: question.content }} />
              </div>
              
              {/* Question Meta */}
              <div className="flex items-center space-x-4 mt-4 text-sm dark-text-muted">
                <div className="flex items-center space-x-1">
                  <Calendar className="h-4 w-4" />
                  <span>{new Date(question.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <MessageSquare className="h-4 w-4" />
                  <span>{answers.length} answers</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Eye className="h-4 w-4" />
                  <span>1.2k views</span>
                </div>
              </div>

              {/* Author Info */}
              <div className="flex items-center space-x-2 mt-4">
                <Avatar className="h-6 w-6">
                  <AvatarImage src={question.author?.profileImageUrl} />
                  <AvatarFallback className={`text-white text-xs font-semibold ${getAvatarGradient(question.author)}`}>
                    {getUserInitials(question.author)}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm dark-text-muted">
                  {getUserDisplayName(question.author)}
                </span>
              </div>
            </div>
          </div>

          {/* Answers Section */}
          <div className="border-t dark-border pt-6">
            <h3 className="text-lg font-semibold dark-text mb-4">
              {answers.length} Answer{answers.length !== 1 ? 's' : ''}
            </h3>
            
            <div className="space-y-4">
              {answers.map((answer: any) => (
                <div key={answer.id} className="flex items-start space-x-4 p-4 dark-surface rounded-lg border dark-border">
                  {/* Vote Controls */}
                  <div className="flex flex-col items-center space-y-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => voteAnswerMutation.mutate({ answerId: answer.id, voteType: 1 })}
                      className="w-8 h-8 p-0 border dark-border hover:dark-surface"
                    >
                      <ChevronUp className="h-3 w-3" />
                    </Button>
                    <span className="text-sm font-semibold dark-text">{answer.voteCount || 0}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => voteAnswerMutation.mutate({ answerId: answer.id, voteType: -1 })}
                      className="w-8 h-8 p-0 border dark-border hover:dark-surface"
                    >
                      <ChevronDown className="h-3 w-3" />
                    </Button>
                  </div>

                  {/* Answer Content */}
                  <div className="flex-1">
                    <div className="prose dark:prose-invert max-w-none">
                      <div dangerouslySetInnerHTML={{ __html: answer.content }} />
                    </div>
                    
                    {/* Answer Meta */}
                    <div className="flex items-center justify-between mt-4">
                      <div className="flex items-center space-x-4 text-sm dark-text-muted">
                        <div className="flex items-center space-x-2">
                          <Avatar className="h-5 w-5">
                            <AvatarImage src={answer.author?.profileImageUrl} />
                            <AvatarFallback className={`text-white text-xs font-semibold ${getAvatarGradient(answer.author)}`}>
                              {getUserInitials(answer.author)}
                            </AvatarFallback>
                          </Avatar>
                          <span>{getUserDisplayName(answer.author)}</span>
                        </div>
                        <span>{new Date(answer.createdAt).toLocaleDateString()}</span>
                      </div>
                      
                      {answer.isAccepted && (
                        <Badge className="bg-green-600 text-white">
                          <Check className="h-3 w-3 mr-1" />
                          Accepted
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Add Answer Section */}
          {user && (
            <div className="border-t dark-border pt-6">
              <h3 className="text-lg font-semibold dark-text mb-4">Your Answer</h3>
              <div className="space-y-4">
                <Textarea
                  placeholder="Write your answer here..."
                  value={answerContent}
                  onChange={(e) => setAnswerContent(e.target.value)}
                  className="min-h-[120px] dark-bg border dark-border dark-text placeholder:dark-text-muted"
                />
                <div className="flex justify-end">
                  <Button
                    onClick={handleSubmitAnswer}
                    className="bg-orange-500 hover:bg-orange-600 text-white"
                    disabled={createAnswerMutation.isPending || !answerContent.trim()}
                  >
                    {createAnswerMutation.isPending ? "Submitting..." : "Submit Answer"}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
