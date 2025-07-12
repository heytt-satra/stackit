import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { RichTextEditor } from "@/components/rich-text-editor";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { X } from "lucide-react";

const askQuestionSchema = z.object({
  title: z.string().min(10, "Title must be at least 10 characters"),
  content: z.string().min(20, "Description must be at least 20 characters"),
  tags: z.string().min(1, "At least one tag is required"),
});

type AskQuestionFormData = z.infer<typeof askQuestionSchema>;

interface AskQuestionModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function AskQuestionModal({ open, onClose, onSuccess }: AskQuestionModalProps) {
  const { toast } = useToast();
  const [content, setContent] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const form = useForm<AskQuestionFormData>({
    resolver: zodResolver(askQuestionSchema),
    defaultValues: {
      title: "",
      content: "",
      tags: "",
    },
  });

  const { data: availableTags = [] } = useQuery({
    queryKey: ["/api/tags"],
    enabled: open,
  });

  const createQuestionMutation = useMutation({
    mutationFn: async (data: AskQuestionFormData) => {
      const response = await apiRequest("POST", "/api/questions", {
        title: data.title,
        content: content,
        tags: selectedTags,
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Your question has been posted!",
      });
      handleClose();
      onSuccess();
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
        description: "Failed to create question. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleClose = () => {
    form.reset();
    setContent("");
    setSelectedTags([]);
    setTagInput("");
    onClose();
  };

  const handleAddTag = (tagName: string) => {
    const cleanTag = tagName.trim().toLowerCase();
    if (cleanTag && !selectedTags.includes(cleanTag) && selectedTags.length < 5) {
      setSelectedTags([...selectedTags, cleanTag]);
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setSelectedTags(selectedTags.filter(tag => tag !== tagToRemove));
  };

  const handleTagInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      if (tagInput.trim()) {
        handleAddTag(tagInput);
        setTagInput("");
      }
    }
  };

  const onSubmit = (data: AskQuestionFormData) => {
    if (selectedTags.length === 0) {
      toast({
        title: "Error",
        description: "Please add at least one tag.",
        variant: "destructive",
      });
      return;
    }
    
    if (!content.trim()) {
      toast({
        title: "Error",
        description: "Please provide a description for your question.",
        variant: "destructive",
      });
      return;
    }

    createQuestionMutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto reddit-surface border reddit-border">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold reddit-text">Create a post</DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Title Field */}
          <div>
            <Label htmlFor="title" className="text-sm font-medium reddit-text">
              Title <span className="text-red-400">*</span>
            </Label>
            <Input
              id="title"
              placeholder="An interesting title for your post"
              className="mt-2 reddit-card border reddit-border reddit-text placeholder:reddit-text-muted"
              {...form.register("title")}
            />
            {form.formState.errors.title && (
              <p className="text-red-400 text-sm mt-1">{form.formState.errors.title.message}</p>
            )}
          </div>

          {/* Description Field */}
          <div>
            <Label className="text-sm font-medium reddit-text">
              Text <span className="text-red-400">*</span>
            </Label>
            <div className="mt-2">
              <RichTextEditor
                content={content}
                onChange={setContent}
                placeholder="Provide details about your question. Include code examples if relevant..."
              />
            </div>
          </div>

          {/* Tags Field */}
          <div>
            <Label className="text-sm font-medium reddit-text">
              Tags <span className="text-red-400">*</span>
            </Label>
            <div className="mt-2">
              <Input
                placeholder="Add up to 5 tags (press Enter or comma to add)"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagInputKeyDown}
                className="reddit-card border reddit-border reddit-text placeholder:reddit-text-muted"
                disabled={selectedTags.length >= 5}
              />
              
              {/* Selected Tags */}
              {selectedTags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {selectedTags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="secondary"
                      className="reddit-card border reddit-border flex items-center gap-1"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="ml-1 hover:text-red-400"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
              
              {/* Popular Tags Suggestions */}
              {availableTags.length > 0 && selectedTags.length < 5 && (
                <div className="mt-2">
                  <p className="text-sm reddit-text-muted mb-2">Popular tags:</p>
                  <div className="flex flex-wrap gap-2">
                    {availableTags.slice(0, 10).map((tag: any) => (
                      <Button
                        key={tag.id}
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleAddTag(tag.name)}
                        className="text-xs border reddit-border hover:reddit-hover"
                        disabled={selectedTags.includes(tag.name)}
                      >
                        {tag.name}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
              
              <p className="text-sm reddit-text-muted mt-1">
                Separate tags with commas or press Enter. Maximum 5 tags.
              </p>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-4 pt-6 border-t reddit-border">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="border reddit-border hover:reddit-hover"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createQuestionMutation.isPending}
              className="bg-orange-500 hover:bg-orange-600 text-white"
            >
              {createQuestionMutation.isPending ? "Posting..." : "Post"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
