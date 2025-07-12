import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { RichTextEditor } from "@/components/rich-text-editor";
import { useToast } from "@/hooks/use-toast";
import { X, Upload, ArrowLeft } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";

const askQuestionSchema = z.object({
  title: z.string().min(10, "Title must be at least 10 characters").max(300, "Title must be less than 300 characters"),
});

type AskQuestionFormData = z.infer<typeof askQuestionSchema>;

interface AskQuestionModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function AskQuestionModal({ open, onClose, onSuccess }: AskQuestionModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [content, setContent] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

  const form = useForm<AskQuestionFormData>({
    resolver: zodResolver(askQuestionSchema),
  });

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setUploadedFiles(prev => [...prev, ...files]);
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) return '🖼️';
    if (file.type.includes('pdf')) return '📄';
    if (file.type.includes('text')) return '📝';
    if (file.type.includes('code') || file.name.endsWith('.js') || file.name.endsWith('.ts') || file.name.endsWith('.py')) return '💻';
    return '📎';
  };

  const { data: availableTags = [] } = useQuery({
    queryKey: ["/api/tags"],
    enabled: open,
  });

  const createQuestionMutation = useMutation({
    mutationFn: async (data: AskQuestionFormData & { content: string; tags: string[] }) => {
      const requestBody = {
        title: data.title,
        content: data.content,
        tags: data.tags,
        authorId: user?.id,
      };
      
      return await apiRequest("/api/questions", {
        method: "POST",
        body: JSON.stringify(requestBody),
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Your post has been created!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/questions"] });
      handleClose();
      onSuccess();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create post. Please try again.",
        variant: "destructive",
      });
      console.error("Error creating question:", error);
    },
  });

  const handleClose = () => {
    form.reset();
    setContent("");
    setSelectedTags([]);
    setTagInput("");
    setUploadedFiles([]);
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
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to create a post.",
        variant: "destructive",
      });
      return;
    }

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
        description: "Please provide content for your post.",
        variant: "destructive",
      });
      return;
    }

    // Include content and tags in the submission
    const submissionData = {
      ...data,
      content: content.trim(),
      tags: selectedTags
    };

    createQuestionMutation.mutate(submissionData);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto reddit-surface border reddit-border">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="flex items-center gap-2 text-reddit-text-muted hover:text-reddit-text"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <DialogTitle className="text-2xl font-bold reddit-text">Create a post</DialogTitle>
            <div className="w-10"></div> {/* Spacer for centering */}
          </div>
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

          {/* File Upload */}
          <div>
            <Label className="text-sm font-medium reddit-text">
              Attachments (Optional)
            </Label>
            <div className="mt-2">
              <input
                type="file"
                multiple
                onChange={handleFileUpload}
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="inline-flex items-center gap-2 px-4 py-2 border border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                <Upload className="h-4 w-4" />
                <span className="text-sm">Choose files</span>
              </label>
              
              {uploadedFiles.length > 0 && (
                <div className="mt-2 space-y-2">
                  {uploadedFiles.map((file, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded">
                      <span>{getFileIcon(file)}</span>
                      <span className="text-sm flex-1">{file.name}</span>
                      <button
                        type="button"
                        onClick={() => removeFile(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
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
              className="bg-orange-500 hover:bg-orange-600 text-white"
              disabled={createQuestionMutation.isPending}
            >
              {createQuestionMutation.isPending ? "Posting..." : "Post"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
