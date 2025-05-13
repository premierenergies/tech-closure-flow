
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { Task, Response } from "@/lib/data";
import { generateId } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";

interface TaskResponseModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task | null;
  onSubmitResponse: (response: Response) => void;
}

const TaskResponseModal: React.FC<TaskResponseModalProps> = ({
  isOpen,
  onClose,
  task,
  onSubmitResponse,
}) => {
  const [comments, setComments] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();

  const resetForm = () => {
    setComments("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!comments.trim() || !user || !task) return;
    
    setIsSubmitting(true);
    
    const newResponse: Response = {
      id: generateId(),
      taskId: task.id,
      projectId: task.projectId,
      comments: comments.trim(),
      respondedBy: user.id,
      respondedAt: new Date().toISOString(),
      status: "review", // Initial status is for review
    };

    onSubmitResponse(newResponse);
    resetForm();
    setIsSubmitting(false);
    onClose();
  };

  if (!task) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Submit Response for Task: {task.title}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="comments">Comments</Label>
              <Textarea
                id="comments"
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                placeholder="Enter your comments"
                rows={6}
                required
              />
            </div>
            
            {/* Mock file upload field */}
            <div className="space-y-2">
              <Label htmlFor="attachments">Attachments</Label>
              <Input id="attachments" type="file" multiple />
            </div>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting || !comments.trim()}
            >
              {isSubmitting ? "Submitting..." : "Submit for Review"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default TaskResponseModal;
