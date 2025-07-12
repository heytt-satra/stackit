import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useClerk } from "@clerk/clerk-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Search, ChevronDown } from "lucide-react";

interface NavbarProps {
  onSearch: (query: string) => void;
  onAskQuestion: () => void;
}

export function Navbar({ onSearch, onAskQuestion }: NavbarProps) {
  const { user } = useAuth();
  const { signOut } = useClerk();
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchQuery);
  };

  const handleLogout = () => {
    signOut();
  };

  const handleLogoClick = () => {
    setLocation("/"); // This is the main questions feed page
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

  return (
    <header className="reddit-surface border-b reddit-border sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center h-12">
          {/* Logo */}
          <div 
            className="flex items-center space-x-2 mr-6 cursor-pointer hover:opacity-80 transition-opacity"
            onClick={handleLogoClick}
          >
            <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">S</span>
            </div>
            <h1 className="text-xl font-bold reddit-text">StackIt</h1>
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-md">
            <form onSubmit={handleSearch} className="relative">
              <Input
                type="text"
                placeholder="Search StackIt"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full reddit-card border reddit-border pl-10 reddit-text placeholder:reddit-text-muted focus:ring-2 focus:ring-orange-500 text-sm h-9"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 reddit-text-muted" />
            </form>
          </div>

          {/* Right side actions */}
          <div className="flex items-center space-x-3 ml-6">
            {/* User Menu */}
            {user && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center space-x-2 p-1 h-8 cursor-pointer">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={user.profileImageUrl} />
                      <AvatarFallback className={`text-white text-xs font-semibold ${getAvatarGradient(user)}`}>
                        {getUserInitials(user)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="hidden sm:block reddit-text text-sm">
                      {getUserDisplayName(user)}
                    </span>
                    <ChevronDown className="h-3 w-3 reddit-text-muted" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="reddit-surface border reddit-border">
                  <DropdownMenuItem 
                    onClick={() => setLocation("/profile")} 
                    className="reddit-text hover:reddit-hover cursor-pointer"
                  >
                    Profile & Settings
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout} className="reddit-text hover:reddit-hover">
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
