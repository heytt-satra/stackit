import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";

interface QuestionCardProps {
  question: any;
  onClick: () => void;
}

export function QuestionCard({ question, onClick }: QuestionCardProps) {
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
      className="dark-surface border dark-border rounded-lg p-6 hover:border-gray-500 transition-colors cursor-pointer"
      onClick={onClick}
    >
      <div className="flex flex-col lg:flex-row lg:items-start space-y-4 lg:space-y-0 lg:space-x-6">
        {/* Question Stats */}
        <div className="flex lg:flex-col space-x-6 lg:space-x-0 lg:space-y-2 text-sm dark-text-secondary">
          <div className="text-center">
            <div className="text-lg font-semibold dark-text">{question.voteCount || 0}</div>
            <div>votes</div>
          </div>
          <div className="text-center">
            <div className={`text-lg font-semibold ${question.answerCount > 0 ? 'accent-green' : 'dark-text'}`}>
              {question.answerCount || 0}
            </div>
            <div>answers</div>
          </div>
        </div>

        {/* Question Content */}
        <div className="flex-1 min-w-0">
          <h3 className="text-xl font-semibold accent-blue hover:text-blue-400 mb-2">
            {question.title}
          </h3>
          
          <p className="dark-text-secondary mb-4 line-clamp-2">
            {question.content?.replace(/<[^>]*>/g, '').substring(0, 200)}...
          </p>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-4">
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

          {/* Question Meta */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
            <div className="flex items-center space-x-2">
              <Avatar className="h-6 w-6">
                <AvatarImage src={question.author?.profileImageUrl} />
                <AvatarFallback className={`text-white text-xs font-semibold ${getAvatarGradient(question.author)}`}>
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
              asked {timeAgo}
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
