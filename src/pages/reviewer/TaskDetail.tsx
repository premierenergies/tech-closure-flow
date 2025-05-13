
import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { 
  getTasks, 
  getProjects, 
  getCustomers, 
  getResponses, 
  addReview, 
  updateTask, 
  updateResponse 
} from "@/lib/storage";
import { Task, Project, Response, Review } from "@/lib/data";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import ProjectDetails from "@/components/common/ProjectDetails";
import TaskDetails from "@/components/common/TaskDetails";
import ResponseDetails from "@/components/common/ResponseDetails";
import ReviewResponseModal from "@/components/modals/ReviewResponseModal";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { users } from "@/lib/data";

const ReviewerTaskDetail: React.FC = () => {
  const { taskId } = useParams<{ taskId: string }>();
  const [task, setTask] = useState<Task | null>(null);
  const [project, setProject] = useState<Project | null>(null);
  const [response, setResponse] = useState<Response | null>(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (taskId) {
      // Load task
      const allTasks = getTasks();
      const foundTask = allTasks.find(t => t.id === taskId) || null;
      setTask(foundTask);
      
      if (foundTask) {
        // Load project
        const allProjects = getProjects();
        const foundProject = allProjects.find(p => p.id === foundTask.projectId) || null;
        setProject(foundProject);
        
        // Load response
        const allResponses = getResponses();
        const foundResponse = allResponses.find(r => r.taskId === taskId && r.status === "review") || null;
        setResponse(foundResponse);
        
        if (!foundResponse) {
          toast({
            title: "No Response Found",
            description: "No response requiring review was found for this task.",
            variant: "destructive",
          });
          navigate("/reviewer/tasks");
        }
      } else {
        toast({
          title: "Task Not Found",
          description: "The task you're trying to access doesn't exist.",
          variant: "destructive",
        });
        navigate("/reviewer/tasks");
      }
    }
  }, [taskId, navigate, toast]);

  const handleSubmitReview = (newReview: Review, action: 'reject' | 'approve') => {
    if (!task || !response || !user) return;
    
    // Add review
    addReview(newReview);
    
    // Update task and response status
    let updatedTaskStatus: 'pending' | 'in-progress' | 'review' | 'final-review' | 'closed' | 'rejected';
    let updatedResponseStatus: 'review' | 'final-review' | 'rejected' | 'closed';
    
    if (action === 'approve') {
      updatedTaskStatus = 'final-review';
      updatedResponseStatus = 'final-review';
    } else {
      updatedTaskStatus = 'in-progress';
      updatedResponseStatus = 'rejected';
    }
    
    const updatedTask = { ...task, status: updatedTaskStatus };
    updateTask(updatedTask);
    setTask(updatedTask);
    
    const updatedResponse = { ...response, status: updatedResponseStatus };
    updateResponse(updatedResponse);
    setResponse(updatedResponse);
    
    toast({
      title: action === 'approve' ? "Sent for Final Approval" : "Sent Back to Assignee",
      description: action === 'approve' 
        ? "The task has been forwarded for final sign-off."
        : "The task has been sent back to the assignee for revision.",
    });
    
    // Redirect back to tasks list after short delay
    setTimeout(() => {
      navigate("/reviewer/tasks");
    }, 1500);
  };

  if (!task || !project || !response) {
    return (
      <Layout allowedRoles={["reviewer"]}>
        <div className="text-center py-20">
          <h1 className="text-2xl font-bold mb-4">Loading task details...</h1>
        </div>
      </Layout>
    );
  }

  return (
    <Layout allowedRoles={["reviewer"]}>
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Review Task</h1>
          <Link to="/reviewer/tasks">
            <Button variant="outline">Back to Tasks</Button>
          </Link>
        </div>
        
        <div className="bg-white shadow-lg rounded-lg p-6">
          <h2 className="text-2xl font-semibold mb-6">Project Information</h2>
          <ProjectDetails project={project} customers={getCustomers()} />
          
          <div className="border-t pt-8 mt-8">
            <h2 className="text-2xl font-semibold mb-6">Task Information</h2>
            <TaskDetails task={task} users={users} />
          </div>
          
          <div className="border-t pt-8 mt-8">
            <h2 className="text-2xl font-semibold mb-6">Assignee's Response</h2>
            <ResponseDetails response={response} />
          </div>
          
          <div className="border-t pt-8 mt-8 flex justify-center">
            <Button 
              onClick={() => setIsReviewModalOpen(true)}
              className="bg-reviewer hover:bg-amber-600"
            >
              Review Response
            </Button>
          </div>
        </div>
      </div>
      
      <ReviewResponseModal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        response={response}
        onSubmitReview={handleSubmitReview}
      />
    </Layout>
  );
};

export default ReviewerTaskDetail;
