import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { RichTextEditor } from "@/components/rich-text-editor";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { formatDistanceToNow } from "date-fns";
import { ChevronUp, ChevronDown, Check } from "lucide-react";

interface QuestionDetailModalProps {
  questionId: number;
  open: boolean;
  onClose: () => void;
}

export function QuestionDetailModal({ questionId, open, onClose }: QuestionDetailModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
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
      const response = await apiRequest("POST", `/api/questions/${questionId}/answers`, {
        content,
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
      if (isUnauthorizedError(error)) {
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
      toast({
        title: "Error",
        description: "Failed to post answer. Please try again.",
        variant: "destructive",
      });
    },
  });

  const voteQuestionMutation = useMutation({
    mutationFn: async (voteType: number) => {
      await apiRequest("POST", `/api/questions/${questionId}/vote`, { voteType });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/questions", questionId] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
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
      toast({
        title: "Error",
        description: "Failed to vote. Please try again.",
        variant: "destructive",
      });
    },
  });

  const voteAnswerMutation = useMutation({
    mutationFn: async ({ answerId, voteType }: { answerId: number; voteType: number }) => {
      await apiRequest("POST", `/api/answers/${answerId}/vote`, { voteType });
    },
    onSuccess: () => {
      refetchAnswers();
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
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
      toast({
        title: "Error",
        description: "Failed to vote. Please try again.",
        variant: "destructive",
      });
    },
  });

  const acceptAnswerMutation = useMutation({
    mutationFn: async (answerId: number) => {
      await apiRequest("POST", `/api/answers/${answerId}/accept`);
    },
    onSuccess: () => {
      refetchAnswers();
      toast({
        title: "Success",
        description: "Answer accepted!",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
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
      toast({
        title: "Error",
        description: "Failed to accept answer. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmitAnswer = () => {
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
              <div 
                className="prose prose-invert max-w-none dark-text"
                dangerouslySetInnerHTML={{ __html: question.content }}
              />

              {/* Question Meta */}
              <div className="flex items-center justify-between mt-6 pt-4 border-t dark-border">
                <div className="flex items-center space-x-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={question.author?.profileImageUrl} />
                    <AvatarFallback className={`text-white text-sm font-semibold ${getAvatarGradient(question.author)}`}>
                      {getUserInitials(question.author)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex items-center space-x-1">
                    <span className={`${getBadgeColors(getUserDisplayName(question.author))} text-white px-2 py-0.5 rounded text-xs font-medium`}>
                      {getUserDisplayName(question.author)}
                    </span>
                    <span className="dark-text-secondary text-sm">User Name</span>
                  </div>
                </div>
                <div className="dark-text-secondary text-sm">
                  asked {question.createdAt ? formatDistanceToNow(new Date(question.createdAt), { addSuffix: true }) : ''}
                </div>
              </div>
            </div>
          </div>

          {/* Answers Section */}
          <div className="border-t dark-border pt-6">
            <h3 className="text-xl font-semibold dark-text mb-4">
              Answers <span className="accent-green">({answers.length})</span>
            </h3>

            {/* Answer List */}
            <div className="space-y-6">
              {answers.map((answer: any) => (
                <div key={answer.id} className="flex items-start space-x-6 p-4 dark-surface rounded-lg">
                  {/* Vote Controls */}
                  <div className="flex flex-col items-center space-y-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => voteAnswerMutation.mutate({ answerId: answer.id, voteType: 1 })}
                      className="w-8 h-8 p-0 border dark-border hover:dark-border"
                    >
                      <ChevronUp className="h-3 w-3" />
                    </Button>
                    <span className={`text-lg font-semibold ${answer.voteCount > 0 ? 'accent-green' : 'dark-text'}`}>
                      {answer.voteCount || 0}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => voteAnswerMutation.mutate({ answerId: answer.id, voteType: -1 })}
                      className="w-8 h-8 p-0 border dark-border hover:dark-border"
                    >
                      <ChevronDown className="h-3 w-3" />
                    </Button>
                    {answer.isAccepted && (
                      <div className="w-8 h-8 flex items-center justify-center text-green-400">
                        <Check className="h-4 w-4" />
                      </div>
                    )}
                  </div>

                  {/* Answer Content */}
                  <div className="flex-1">
                    <div 
                      className="prose prose-invert max-w-none dark-text"
                      dangerouslySetInnerHTML={{ __html: answer.content }}
                    />

                    {/* Answer Meta */}
                    <div className="flex items-center justify-between mt-4 pt-4 border-t dark-border">
                      <div className="flex items-center space-x-2">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={answer.author?.profileImageUrl} />
                          <AvatarFallback className={`text-white text-xs font-semibold ${getAvatarGradient(answer.author)}`}>
                            {getUserInitials(answer.author)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex items-center space-x-1">
                          <span className={`${getBadgeColors(getUserDisplayName(answer.author))} text-white px-2 py-0.5 rounded text-xs font-medium`}>
                            {getUserDisplayName(answer.author)}
                          </span>
                          <span className="dark-text-secondary text-sm">User Name</span>
                        </div>
                      </div>
                      <div className="dark-text-secondary text-sm">
                        answered {answer.createdAt ? formatDistanceToNow(new Date(answer.createdAt), { addSuffix: true }) : ''}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Submit Answer Form */}
          <div className="border-t dark-border pt-6">
            <h3 className="text-lg font-semibold dark-text mb-4">Submit Your Answer</h3>
            
            <div className="space-y-4">
              <RichTextEditor
                content={answerContent}
                onChange={setAnswerContent}
                placeholder="Write your answer here. Include code examples and explanations..."
              />

              <div className="flex justify-end">
                <Button
                  onClick={handleSubmitAnswer}
                  disabled={createAnswerMutation.isPending || !answerContent.trim()}
                  className="bg-accent-blue hover:bg-blue-600"
                >
                  {createAnswerMutation.isPending ? "Submitting..." : "Submit Answer"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
