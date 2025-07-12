import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useClerk } from "@clerk/clerk-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Settings, User, Shield, LogOut, Edit, Calendar, Mail, MessageSquare, HelpCircle, ThumbsUp } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export default function ProfilePage() {
  const { user } = useAuth();
  const { signOut } = useClerk();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("profile");
  const [viewingContent, setViewingContent] = useState<"questions" | "answers" | null>(null);

  const handleLogout = () => {
    signOut();
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    });
  };

  // Fetch user statistics
  const { data: userStats } = useQuery({
    queryKey: ["/api/users", user?.id, "statistics"],
    queryFn: async () => {
      if (!user?.id) return null;
      const response = await apiRequest(`/api/users/${user.id}/statistics`);
      return response.json();
    },
    enabled: !!user?.id,
  });

  // Fetch user questions
  const { data: userQuestions = [] } = useQuery({
    queryKey: ["/api/users", user?.id, "questions"],
    queryFn: async () => {
      if (!user?.id) return [];
      const response = await apiRequest(`/api/users/${user.id}/questions`);
      return response.json();
    },
    enabled: !!user?.id && viewingContent === "questions",
  });

  // Fetch user answers
  const { data: userAnswers = [] } = useQuery({
    queryKey: ["/api/users", user?.id, "answers"],
    queryFn: async () => {
      if (!user?.id) return [];
      const response = await apiRequest(`/api/users/${user.id}/answers`);
      return response.json();
    },
    enabled: !!user?.id && viewingContent === "answers",
  });

  const getUserInitials = (user: any) => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }
    if (user?.email) {
      return user.email.slice(0, 2).toUpperCase();
    }
    return "U";
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleContentClick = (contentType: "questions" | "answers") => {
    setViewingContent(contentType);
  };

  const handleBackToProfile = () => {
    setViewingContent(null);
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading profile...</div>
      </div>
    );
  }

  // If viewing specific content, show that instead of profile
  if (viewingContent) {
    return (
      <div className="min-h-screen reddit-bg">
        <div className="max-w-4xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Button variant="ghost" size="sm" onClick={handleBackToProfile} className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" /> Back to Profile
            </Button>
            <h1 className="text-2xl font-bold reddit-text">
              {viewingContent === "questions" ? "My Questions" : "My Answers"}
            </h1>
          </div>

          {/* Content */}
          <div className="space-y-4">
            {viewingContent === "questions" && (
              <div className="space-y-4">
                {userQuestions.length === 0 ? (
                  <Card className="reddit-card border reddit-border">
                    <CardContent className="p-6 text-center">
                      <HelpCircle className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                      <h3 className="text-lg font-semibold reddit-text mb-2">No Questions Yet</h3>
                      <p className="reddit-text-muted">You haven't asked any questions yet.</p>
                      <Button 
                        onClick={() => setLocation("/")} 
                        className="mt-4"
                      >
                        Ask Your First Question
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  userQuestions.map((question: any) => (
                    <Card key={question.id} className="reddit-card border reddit-border hover:reddit-hover cursor-pointer" onClick={() => setLocation(`/question/${question.id}`)}>
                      <CardContent className="p-4">
                        <div className="flex items-start gap-4">
                          <div className="flex flex-col items-center gap-1 min-w-[60px]">
                            <div className="text-center">
                              <div className="text-lg font-semibold reddit-text">{question.voteCount}</div>
                              <div className="text-xs reddit-text-muted">votes</div>
                            </div>
                            <div className="text-center">
                              <div className="text-lg font-semibold reddit-text">{question.answerCount}</div>
                              <div className="text-xs reddit-text-muted">answers</div>
                            </div>
                          </div>
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold reddit-text mb-2">{question.title}</h3>
                            <div className="flex items-center gap-2 mb-2">
                              {question.tags.map((tag: string) => (
                                <Badge key={tag} variant="outline" className="reddit-bg border reddit-border text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                            <div className="text-sm reddit-text-muted">
                              Asked {formatDate(question.createdAt)}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            )}

            {viewingContent === "answers" && (
              <div className="space-y-4">
                {userAnswers.length === 0 ? (
                  <Card className="reddit-card border reddit-border">
                    <CardContent className="p-6 text-center">
                      <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                      <h3 className="text-lg font-semibold reddit-text mb-2">No Answers Yet</h3>
                      <p className="reddit-text-muted">You haven't answered any questions yet.</p>
                      <Button 
                        onClick={() => setLocation("/")} 
                        className="mt-4"
                      >
                        Browse Questions
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  userAnswers.map((answer: any) => (
                    <Card key={answer.id} className="reddit-card border reddit-border hover:reddit-hover cursor-pointer" onClick={() => setLocation(`/question/${answer.question.id}`)}>
                      <CardContent className="p-4">
                        <div className="flex items-start gap-4">
                          <div className="flex flex-col items-center gap-1 min-w-[60px]">
                            <div className="text-center">
                              <div className="text-lg font-semibold reddit-text">{answer.voteCount}</div>
                              <div className="text-xs reddit-text-muted">votes</div>
                            </div>
                          </div>
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold reddit-text mb-2">{answer.question.title}</h3>
                            <div className="reddit-text-muted mb-2 line-clamp-2" dangerouslySetInnerHTML={{ __html: answer.content }} />
                            <div className="text-sm reddit-text-muted">
                              Answered {formatDate(answer.createdAt)}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen reddit-bg">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="sm" onClick={() => setLocation("/")} className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" /> Back
          </Button>
          <h1 className="text-2xl font-bold reddit-text">Profile & Settings</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <Card className="reddit-card border reddit-border">
              <CardHeader className="text-center">
                <div className="flex justify-center mb-4">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={user.profileImageUrl} />
                    <AvatarFallback className={`text-white text-2xl font-semibold ${getAvatarGradient(user)}`}>
                      {getUserInitials(user)}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <CardTitle className="reddit-text text-xl">
                  {user.firstName && user.lastName 
                    ? `${user.firstName} ${user.lastName}` 
                    : user.email?.split('@')[0] || 'User'
                  }
                </CardTitle>
                <CardDescription className="reddit-text-muted">
                  {user.email}
                </CardDescription>
                <div className="flex justify-center mt-4">
                  <Badge variant="outline" className="reddit-bg border reddit-border">
                    <User className="h-3 w-3 mr-1" />
                    Member
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-2 reddit-text-muted">
                    <Calendar className="h-4 w-4" />
                    <span>Joined {formatDate(user.createdAt || new Date().toISOString())}</span>
                  </div>
                  <div className="flex items-center gap-2 reddit-text-muted">
                    <Mail className="h-4 w-4" />
                    <span>{user.email}</span>
                  </div>
                </div>

                {/* User Statistics */}
                <Separator className="my-4" />
                <div className="space-y-3">
                  <h4 className="font-semibold reddit-text text-sm">Activity</h4>
                  
                  <div 
                    className="flex items-center justify-between p-3 reddit-surface rounded-lg hover:reddit-hover cursor-pointer"
                    onClick={() => handleContentClick("questions")}
                  >
                    <div className="flex items-center gap-3">
                      <HelpCircle className="h-5 w-5 reddit-text-muted" />
                      <div>
                        <p className="font-medium reddit-text">Questions Asked</p>
                        <p className="text-sm reddit-text-muted">{userStats?.questionsAsked || 0} questions</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" className="reddit-text-muted">
                      View
                    </Button>
                  </div>

                  <div 
                    className="flex items-center justify-between p-3 reddit-surface rounded-lg hover:reddit-hover cursor-pointer"
                    onClick={() => handleContentClick("answers")}
                  >
                    <div className="flex items-center gap-3">
                      <MessageSquare className="h-5 w-5 reddit-text-muted" />
                      <div>
                        <p className="font-medium reddit-text">Answers Given</p>
                        <p className="text-sm reddit-text-muted">{userStats?.answersGiven || 0} answers</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" className="reddit-text-muted">
                      View
                    </Button>
                  </div>

                  <div className="flex items-center justify-between p-3 reddit-surface rounded-lg">
                    <div className="flex items-center gap-3">
                      <ThumbsUp className="h-5 w-5 reddit-text-muted" />
                      <div>
                        <p className="font-medium reddit-text">Votes Cast</p>
                        <p className="text-sm reddit-text-muted">{userStats?.votesCast || 0} votes</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Settings Tabs */}
          <div className="lg:col-span-2">
            <Card className="reddit-card border reddit-border">
              <CardHeader>
                <CardTitle className="reddit-text">Account Settings</CardTitle>
                <CardDescription className="reddit-text-muted">
                  Manage your account preferences and settings
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid w-full grid-cols-3 reddit-surface">
                    <TabsTrigger value="profile" className="reddit-text">Profile</TabsTrigger>
                    <TabsTrigger value="security" className="reddit-text">Security</TabsTrigger>
                    <TabsTrigger value="preferences" className="reddit-text">Preferences</TabsTrigger>
                  </TabsList>

                  <TabsContent value="profile" className="space-y-4 mt-6">
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-lg font-semibold reddit-text mb-2">Profile Information</h3>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between p-3 reddit-surface rounded-lg">
                            <div>
                              <p className="font-medium reddit-text">Display Name</p>
                              <p className="text-sm reddit-text-muted">
                                {user.firstName && user.lastName 
                                  ? `${user.firstName} ${user.lastName}` 
                                  : 'Not set'
                                }
                              </p>
                            </div>
                            <Button variant="outline" size="sm" className="reddit-border">
                              <Edit className="h-4 w-4 mr-1" />
                              Edit
                            </Button>
                          </div>
                          
                          <div className="flex items-center justify-between p-3 reddit-surface rounded-lg">
                            <div>
                              <p className="font-medium reddit-text">Email</p>
                              <p className="text-sm reddit-text-muted">{user.email}</p>
                            </div>
                            <Button variant="outline" size="sm" className="reddit-border">
                              <Edit className="h-4 w-4 mr-1" />
                              Edit
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="security" className="space-y-4 mt-6">
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-lg font-semibold reddit-text mb-2">Security Settings</h3>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between p-3 reddit-surface rounded-lg">
                            <div className="flex items-center gap-3">
                              <Shield className="h-5 w-5 reddit-text-muted" />
                              <div>
                                <p className="font-medium reddit-text">Password</p>
                                <p className="text-sm reddit-text-muted">Last changed recently</p>
                              </div>
                            </div>
                            <Button variant="outline" size="sm" className="reddit-border">
                              Change
                            </Button>
                          </div>
                          
                          <div className="flex items-center justify-between p-3 reddit-surface rounded-lg">
                            <div className="flex items-center gap-3">
                              <Settings className="h-5 w-5 reddit-text-muted" />
                              <div>
                                <p className="font-medium reddit-text">Two-Factor Authentication</p>
                                <p className="text-sm reddit-text-muted">Add an extra layer of security</p>
                              </div>
                            </div>
                            <Button variant="outline" size="sm" className="reddit-border">
                              Enable
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="preferences" className="space-y-4 mt-6">
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-lg font-semibold reddit-text mb-2">Preferences</h3>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between p-3 reddit-surface rounded-lg">
                            <div>
                              <p className="font-medium reddit-text">Email Notifications</p>
                              <p className="text-sm reddit-text-muted">Receive notifications about your posts</p>
                            </div>
                            <Button variant="outline" size="sm" className="reddit-border">
                              Configure
                            </Button>
                          </div>
                          
                          <div className="flex items-center justify-between p-3 reddit-surface rounded-lg">
                            <div>
                              <p className="font-medium reddit-text">Privacy Settings</p>
                              <p className="text-sm reddit-text-muted">Control who can see your profile</p>
                            </div>
                            <Button variant="outline" size="sm" className="reddit-border">
                              Manage
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            {/* Danger Zone */}
            <Card className="reddit-card border-red-500 mt-6">
              <CardHeader>
                <CardTitle className="text-red-500">Danger Zone</CardTitle>
                <CardDescription className="reddit-text-muted">
                  Irreversible and destructive actions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 reddit-surface rounded-lg border border-red-500/20">
                    <div>
                      <p className="font-medium text-red-500">Sign Out</p>
                      <p className="text-sm reddit-text-muted">Sign out of your account</p>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={handleLogout}
                      className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                    >
                      <LogOut className="h-4 w-4 mr-1" />
                      Sign Out
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
} 