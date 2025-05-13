
import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { 
  getTasks, 
  getProjects, 
  getCustomers, 
  getResponses,
  getReviews,
  addFinal,
  updateTask,
  updateResponse,
  updateReview,
  updateProject
} from "@/lib/storage";
import { Task, Project, Response, Review, Final } from "@/lib/data";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import ProjectDetails from "@/components/common/ProjectDetails";
import TaskDetails from "@/components/common/TaskDetails";
import ResponseDetails from "@/components/common/ResponseDetails";
import ReviewDetails from "@/components/common/ReviewDetails";
import FinalReviewModal from "@/components/modals/FinalReviewModal";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { users } from "@/lib/data";

const FinalTaskDetail: React.FC = () => {
  const { taskId } = useParams<{ taskId: string }>();
  const [task, setTask] = useState<Task | null>(null);
  const [project, setProject] = useState<Project | null>(null);
  const [response, setResponse] = useState<Response | null>(null);
  const [review, setReview] = useState<Review | null>(null);
  const [isFinalModalOpen, setIsFinalModalOpen] = useState(false);
  
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
        const foundResponse = allResponses.find(r => r.taskId === taskId) || null;
        setResponse(foundResponse);
        
        if (foundResponse) {
          // Load review
          const allReviews = getReviews();
          const foundReview = allReviews.find(r => r.responseId === foundResponse.id && r.status === "final-review") || null;
          setReview(foundReview);
          
          if (!foundReview) {
            toast({
              title: "No Review Found",
              description: "No review requiring final approval was found for this task.",
              variant: "destructive",
            });
            navigate("/final/tasks");
          }
        } else {
          toast({
            title: "No Response Found",
            description: "No response was found for this task.",
            variant: "destructive",
          });
          navigate("/final/tasks");
        }
      } else {
        toast({
          title: "Task Not Found",
          description: "The task you're trying to access doesn't exist.",
          variant: "destructive",
        });
        navigate("/final/tasks");
      }
    }
  }, [taskId, navigate, toast]);

  const handleSubmitFinal = (newFinal: Final, action: 'reject' | 'approve') => {
    if (!task || !response || !review || !project || !user) return;
    
    // Add final approval
    addFinal(newFinal);
    
    // Update task, response, and review status
    let updatedTaskStatus: 'pending' | 'in-progress' | 'review' | 'final-review' | 'closed' | 'rejected';
    let updatedResponseStatus: 'review' | 'final-review' | 'rejected' | 'closed';
    let updatedReviewStatus: 'final-review' | 'rejected' | 'closed';
    
    if (action === 'approve') {
      updatedTaskStatus = 'closed';
      updatedResponseStatus = 'closed';
      updatedReviewStatus = 'closed';
      
      // If this is approved, also mark the project as closed
      const updatedProject = { ...project, status: 'closed' as const };
      updateProject(updatedProject);
    } else {
      updatedTaskStatus = 'review';
      updatedResponseStatus = 'review';
      updatedReviewStatus = 'rejected';
    }
    
    const updatedTask = { ...task, status: updatedTaskStatus };
    updateTask(updatedTask);
    
    const updatedResponse = { ...response, status: updatedResponseStatus };
    updateResponse(updatedResponse);
    
    const updatedReview = { ...review, status: updatedReviewStatus };
    updateReview(updatedReview);
    
    toast({
      title: action === 'approve' ? "Task Approved & Closed" : "Sent Back for Review",
      description: action === 'approve' 
        ? "The task has been approved and marked as closed."
        : "The task has been sent back to reviewers for further assessment.",
    });
    
    // Redirect back to tasks list after short delay
    setTimeout(() => {
      navigate("/final/tasks");
    }, 1500);
  };

  if (!task || !project || !response || !review) {
    return (
      <Layout allowedRoles={["final"]}>
        <div className="text-center py-20">
          <h1 className="text-2xl font-bold mb-4">Loading task details...</h1>
        </div>
      </Layout>
    );
  }

  return (
    <Layout allowedRoles={["final"]}>
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Final Approval</h1>
          <Link to="/final/tasks">
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
          
          <div className="border-t pt-8 mt-8">
            <h2 className="text-2xl font-semibold mb-6">Reviewer's Assessment</h2>
            <ReviewDetails review={review} />
          </div>
          
          <div className="border-t pt-8 mt-8 flex justify-center">
            <Button 
              onClick={() => setIsFinalModalOpen(true)}
              className="bg-final hover:bg-red-600"
            >
              Provide Final Approval
            </Button>
          </div>
        </div>
      </div>
      
      <FinalReviewModal
        isOpen={isFinalModalOpen}
        onClose={() => setIsFinalModalOpen(false)}
        review={review}
        onSubmitFinal={handleSubmitFinal}
      />
    </Layout>
  );
};

export default FinalTaskDetail;
