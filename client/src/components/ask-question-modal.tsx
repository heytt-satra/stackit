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
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { X, Upload, Image, Video, FileText } from "lucide-react";

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
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const validFiles = files.filter(file => {
      const isValidType = file.type.startsWith('image/') || file.type.startsWith('video/');
      const isValidSize = file.size <= 10 * 1024 * 1024; // 10MB limit
      return isValidType && isValidSize;
    });
    
    if (validFiles.length !== files.length) {
      toast({
        title: "Warning",
        description: "Some files were skipped. Only images and videos under 10MB are allowed.",
        variant: "destructive",
      });
    }
    
    setUploadedFiles(prev => [...prev, ...validFiles].slice(0, 5)); // Max 5 files
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) return <Image className="h-4 w-4" />;
    if (file.type.startsWith('video/')) return <Video className="h-4 w-4" />;
    return <FileText className="h-4 w-4" />;
  };
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
    mutationFn: async (data: AskQuestionFormData & { content: string; tags: string[] }) => {
      return await apiRequest("/api/questions", {
        method: "POST",
        body: JSON.stringify({
          title: data.title,
          content: data.content,
          tags: data.tags,
        }),
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

          {/* Media Upload Section */}
          <div>
            <Label className="text-sm font-medium reddit-text">
              Media (Optional)
            </Label>
            <div className="mt-2">
              <div className="border-2 border-dashed reddit-border rounded-lg p-6 text-center hover:reddit-hover transition-colors">
                <input
                  type="file"
                  accept="image/*,video/*"
                  multiple
                  onChange={handleFileUpload}
                  className="hidden"
                  id="file-upload"
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  <Upload className="h-8 w-8 reddit-text-muted mx-auto mb-2" />
                  <p className="reddit-text text-sm">
                    Drag & drop images or videos here, or click to browse
                  </p>
                  <p className="reddit-text-muted text-xs mt-1">
                    Max 5 files, 10MB each. Images and videos only.
                  </p>
                </label>
              </div>

              {/* Uploaded Files Preview */}
              {uploadedFiles.length > 0 && (
                <div className="mt-3 space-y-2">
                  {uploadedFiles.map((file, index) => (
                    <div key={index} className="flex items-center justify-between reddit-card rounded-lg p-3 border reddit-border">
                      <div className="flex items-center space-x-3">
                        {getFileIcon(file)}
                        <div>
                          <p className="reddit-text text-sm font-medium">{file.name}</p>
                          <p className="reddit-text-muted text-xs">
                            {(file.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFile(index)}
                        className="reddit-text-muted hover:reddit-text p-1"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
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
