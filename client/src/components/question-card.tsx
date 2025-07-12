import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";
import { useLocation } from "wouter";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { ChevronUp, ChevronDown } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useState } from "react";

interface QuestionCardProps {
  question: any;
  onClick: () => void;
}

export function QuestionCard({ question, onClick }: QuestionCardProps) {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [userVotes, setUserVotes] = useState<{ [key: string]: number }>({});

  const voteQuestionMutation = useMutation({
    mutationFn: async (voteType: number) => {
      await apiRequest(`/api/questions/${question.id}/vote`, {
        method: "POST",
        body: JSON.stringify({ 
          voteType,
          userId: user?.id,
        }),
      });
    },
    onSuccess: (_, voteType) => {
      setUserVotes(prev => ({
        ...prev,
        [`question-${question.id}`]: voteType
      }));
      queryClient.invalidateQueries({ queryKey: ["/api/questions"] });
      toast({
        title: "Vote recorded",
        description: voteType === 1 ? "Upvoted!" : "Downvoted!",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to vote. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleVote = (voteType: number) => {
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

  const getVoteButtonClass = (voteType: number) => {
    const userVote = userVotes[`question-${question.id}`];
    const isVoted = userVote === voteType;
    const baseClass = "p-1 hover:bg-gray-600 rounded";
    
    if (isVoted) {
      return `${baseClass} ${voteType === 1 ? 'text-orange-500' : 'text-blue-500'}`;
    }
    return `${baseClass} text-gray-400`;
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

  const timeAgo = question.createdAt ? formatDistanceToNow(new Date(question.createdAt), { addSuffix: true }) : '';

  return (
    <article 
      className="reddit-card border reddit-border rounded-lg hover:reddit-hover transition-colors cursor-pointer"
      onClick={() => setLocation(`/questions/${question.id}`)}
    >
      <div className="flex">
        {/* Vote section */}
        <div className="w-10 flex flex-col items-center py-3 px-2">
          <button 
            className={getVoteButtonClass(1)}
            onClick={(e) => {
              e.stopPropagation();
              handleVote(1);
            }}
            disabled={voteQuestionMutation.isLoading}
          >
            <div className="w-5 h-5">
              ▲
            </div>
          </button>
          <span className="text-sm font-semibold reddit-text my-1">
            {question.voteCount || 0}
          </span>
          <button 
            className={getVoteButtonClass(-1)}
            onClick={(e) => {
              e.stopPropagation();
              handleVote(-1);
            }}
            disabled={voteQuestionMutation.isLoading}
          >
            <div className="w-5 h-5">
              ▼
            </div>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 p-3 pl-0">
          {/* Post metadata */}
          <div className="flex items-center text-xs reddit-text-dim mb-2">
            <span>r/StackIt</span>
            <span className="mx-1">•</span>
            <span>Posted by</span>
            <div className="flex items-center ml-1">
              <span className="reddit-text hover:underline">
                u/{getUserDisplayName(question.author)}
              </span>
            </div>
            <span className="ml-1">{timeAgo}</span>
          </div>

          {/* Title */}
          <h3 className="text-lg font-medium reddit-text mb-2 hover:underline">
            {question.title}
          </h3>
          
          {/* Content preview */}
          <p className="reddit-text-muted text-sm mb-3 line-clamp-2">
            {question.content?.replace(/<[^>]*>/g, '').substring(0, 150)}...
          </p>

          {/* Tags */}
          {question.tags?.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {question.tags.slice(0, 3).map((tag: string, index: number) => (
                <span 
                  key={index}
                  className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Action bar */}
          <div className="flex items-center gap-4 text-xs reddit-text-dim">
            <button className="flex items-center gap-1 hover:bg-gray-700 px-2 py-1 rounded">
              <span>💬</span>
              <span>{question.answerCount || 0} Comments</span>
            </button>
            <button className="flex items-center gap-1 hover:bg-gray-700 px-2 py-1 rounded">
              <span>📤</span>
              <span>Share</span>
            </button>
            <button className="flex items-center gap-1 hover:bg-gray-700 px-2 py-1 rounded">
              <span>💾</span>
              <span>Save</span>
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
