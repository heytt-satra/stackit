import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { ChevronUp, ChevronDown, ArrowLeft } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";

export default function QuestionDetailPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [answerContent, setAnswerContent] = useState("");
  const [, setLocation] = useLocation();
  const params = useParams();
  const questionId = Number(params.id);
  const [userVotes, setUserVotes] = useState<{ [key: string]: number }>({});

  const { data: question, isLoading: questionLoading } = useQuery({
    queryKey: ["/api/questions", questionId],
    enabled: !!questionId,
  });

  const { data: answers = [], refetch: refetchAnswers } = useQuery({
    queryKey: ["/api/questions", questionId, "answers"],
    enabled: !!questionId,
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
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to post answer. Please try again.",
        variant: "destructive",
      });
    },
  });

  const voteQuestionMutation = useMutation({
    mutationFn: async (voteType: number) => {
      console.log("Client: Attempting to vote on question", { questionId, voteType, userId: user?.id });
      
      const response = await apiRequest(`/api/questions/${questionId}/vote`, {
        method: "POST",
        body: JSON.stringify({ 
          voteType,
          userId: user?.id,
        }),
      });
      
      console.log("Client: Vote response received");
      return response.json();
    },
    onSuccess: (_, voteType) => {
      // Update local vote state
      setUserVotes(prev => ({
        ...prev,
        [`question-${questionId}`]: voteType
      }));
      queryClient.invalidateQueries({ queryKey: ["/api/questions", questionId] });
      toast({
        title: "Vote recorded",
        description: voteType === 1 ? "Upvoted question!" : "Downvoted question!",
      });
    },
    onError: (error) => {
      console.error("Client: Vote error:", error);
      toast({
        title: "Error",
        description: "Failed to vote. Please try again.",
        variant: "destructive",
      });
    },
  });

  const voteAnswerMutation = useMutation({
    mutationFn: async ({ answerId, voteType }: { answerId: number; voteType: number }) => {
      console.log("Client: Attempting to vote on answer", { answerId, voteType, userId: user?.id });
      
      const response = await apiRequest(`/api/answers/${answerId}/vote`, {
        method: "POST",
        body: JSON.stringify({ 
          voteType,
          userId: user?.id,
        }),
      });
      
      console.log("Client: Answer vote response received");
      return response.json();
    },
    onSuccess: (_, { answerId, voteType }) => {
      // Update local vote state
      setUserVotes(prev => ({
        ...prev,
        [`answer-${answerId}`]: voteType
      }));
      refetchAnswers();
      toast({
        title: "Vote recorded",
        description: voteType === 1 ? "Upvoted answer!" : "Downvoted answer!",
      });
    },
    onError: (error) => {
      console.error("Client: Answer vote error:", error);
      toast({
        title: "Error",
        description: "Failed to vote. Please try again.",
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

  const handleVoteQuestion = (voteType: number) => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to vote.",
        variant: "destructive",
      });
      return;
    }
    voteQuestionMutation.mutate(voteType);
  };

  const handleVoteAnswer = (answerId: number, voteType: number) => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to vote.",
        variant: "destructive",
      });
      return;
    }
    voteAnswerMutation.mutate({ answerId, voteType });
  };

  const getVoteButtonClass = (itemId: string, voteType: number) => {
    const userVote = userVotes[itemId];
    const isVoted = userVote === voteType;
    const baseClass = "w-10 h-10 p-0 border";
    
    if (isVoted) {
      return `${baseClass} ${voteType === 1 ? 'bg-orange-500 text-white border-orange-500' : 'bg-blue-500 text-white border-blue-500'}`;
    }
    return `${baseClass} reddit-border hover:reddit-hover`;
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

  if (questionLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading question...</div>
      </div>
    );
  }

  if (!question) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Question not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen reddit-bg">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Button variant="ghost" size="sm" onClick={() => setLocation("/")} className="mb-4 flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" /> Back
        </Button>
        <div className="reddit-card border reddit-border rounded-lg p-6 mb-6">
          <div className="flex items-center gap-2 mb-2">
            <h1 className="text-2xl font-bold reddit-text flex-1">{question.title}</h1>
            {question.tags?.map((tag: string, index: number) => (
              <Badge key={index} variant="outline" className="reddit-bg border reddit-border text-xs">
                {tag}
              </Badge>
            ))}
          </div>
          <div className="flex items-center text-xs reddit-text-dim mb-4">
            <Avatar className="h-6 w-6 mr-2">
              <AvatarImage src={question.author?.profileImageUrl} />
              <AvatarFallback className={`text-white text-xs font-semibold ${getAvatarGradient(question.author)}`}>{getUserInitials(question.author)}</AvatarFallback>
            </Avatar>
            <span>u/{getUserDisplayName(question.author)}</span>
          </div>
          <div className="reddit-text mb-4" dangerouslySetInnerHTML={{ __html: question.content }} />
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => handleVoteQuestion(1)}
              disabled={voteQuestionMutation.isLoading}
              className={getVoteButtonClass(`question-${questionId}`, 1)}
            >
              <ChevronUp className="h-4 w-4" />
            </Button>
            <span className="text-lg font-semibold reddit-text">{question.voteCount || 0}</span>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => handleVoteQuestion(-1)}
              disabled={voteQuestionMutation.isLoading}
              className={getVoteButtonClass(`question-${questionId}`, -1)}
            >
              <ChevronDown className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="reddit-card border reddit-border rounded-lg p-6 mb-6">
          <h2 className="text-lg font-bold reddit-text mb-4">Answers</h2>
          {answers.length === 0 ? (
            <div className="reddit-text-muted">No answers yet. Be the first to answer!</div>
          ) : (
            answers.map((answer: any) => (
              <div key={answer.id} className="mb-6 border-b reddit-border pb-4">
                <div className="flex items-center text-xs reddit-text-dim mb-2">
                  <Avatar className="h-6 w-6 mr-2">
                    <AvatarImage src={answer.author?.profileImageUrl} />
                    <AvatarFallback className={`text-white text-xs font-semibold ${getAvatarGradient(answer.author)}`}>{getUserInitials(answer.author)}</AvatarFallback>
                  </Avatar>
                  <span>u/{getUserDisplayName(answer.author)}</span>
                </div>
                <div className="reddit-text mb-2" dangerouslySetInnerHTML={{ __html: answer.content }} />
                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleVoteAnswer(answer.id, 1)}
                    disabled={voteAnswerMutation.isLoading}
                    className={getVoteButtonClass(`answer-${answer.id}`, 1)}
                  >
                    <ChevronUp className="h-4 w-4" />
                  </Button>
                  <span className="text-lg font-semibold reddit-text">{answer.voteCount || 0}</span>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleVoteAnswer(answer.id, -1)}
                    disabled={voteAnswerMutation.isLoading}
                    className={getVoteButtonClass(`answer-${answer.id}`, -1)}
                  >
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
        <div className="reddit-card border reddit-border rounded-lg p-6">
          <h2 className="text-lg font-bold reddit-text mb-4">Your Answer</h2>
          <Textarea
            value={answerContent}
            onChange={e => setAnswerContent(e.target.value)}
            placeholder="Write your answer here..."
            className="mb-4 reddit-card border reddit-border reddit-text"
            rows={5}
          />
          <Button onClick={handleSubmitAnswer} disabled={createAnswerMutation.isLoading}>
            {createAnswerMutation.isLoading ? "Posting..." : "Post Answer"}
          </Button>
        </div>
      </div>
    </div>
  );
} 