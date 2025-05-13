
import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { getTasks, getProjects, getCustomers, getResponses, addResponse, updateTask } from "@/lib/storage";
import { Task, Project, Response } from "@/lib/data";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import ProjectDetails from "@/components/common/ProjectDetails";
import TaskDetails from "@/components/common/TaskDetails";
import ResponseDetails from "@/components/common/ResponseDetails";
import TaskResponseModal from "@/components/modals/TaskResponseModal";
import { useToast } from "@/components/ui/use-toast";
import { users } from "@/lib/data";

const AssigneeTaskDetail: React.FC = () => {
  const { taskId } = useParams<{ taskId: string }>();
  const [task, setTask] = useState<Task | null>(null);
  const [project, setProject] = useState<Project | null>(null);
  const [response, setResponse] = useState<Response | null>(null);
  const [isResponseModalOpen, setIsResponseModalOpen] = useState(false);
  
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (taskId && user) {
      // Load task
      const allTasks = getTasks();
      const foundTask = allTasks.find(t => t.id === taskId) || null;
      
      // Check if task exists and is assigned to current user
      if (foundTask && foundTask.assignees.includes(user.id)) {
        setTask(foundTask);
        
        // Load project
        const allProjects = getProjects();
        const foundProject = allProjects.find(p => p.id === foundTask.projectId) || null;
        setProject(foundProject);
        
        // Load response if exists
        const allResponses = getResponses();
        const foundResponse = allResponses.find(r => r.taskId === taskId) || null;
        setResponse(foundResponse);
      } else {
        // Task not found or not assigned to user, redirect to tasks list
        toast({
          title: "Access Denied",
          description: "The task you're trying to access doesn't exist or isn't assigned to you.",
          variant: "destructive",
        });
        navigate("/assignee/tasks");
      }
    }
  }, [taskId, user, navigate, toast]);

  const handleSubmitResponse = (newResponse: Response) => {
    if (!task) return;
    
    // Add response
    addResponse(newResponse);
    setResponse(newResponse);
    
    // Update task status
    const updatedTask = { ...task, status: "review" as const };
    updateTask(updatedTask);
    setTask(updatedTask);
    
    toast({
      title: "Response Submitted",
      description: "Your response has been submitted for review.",
    });
  };

  if (!task || !project || !user) {
    return (
      <Layout allowedRoles={["assignee"]}>
        <div className="text-center py-20">
          <h1 className="text-2xl font-bold mb-4">Loading task details...</h1>
        </div>
      </Layout>
    );
  }

  return (
    <Layout allowedRoles={["assignee"]}>
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Task Details</h1>
          <Link to="/assignee/tasks">
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
          
          {response ? (
            <div className="border-t pt-8 mt-8">
              <h2 className="text-2xl font-semibold mb-6">Your Response</h2>
              <ResponseDetails response={response} />
            </div>
          ) : (
            <div className="border-t pt-8 mt-8 flex justify-center">
              <Button 
                onClick={() => setIsResponseModalOpen(true)}
                className="bg-assignee hover:bg-violet-700"
              >
                Submit Response
              </Button>
            </div>
          )}
        </div>
      </div>
      
      <TaskResponseModal
        isOpen={isResponseModalOpen}
        onClose={() => setIsResponseModalOpen(false)}
        task={task}
        onSubmitResponse={handleSubmitResponse}
      />
    </Layout>
  );
};

export default AssigneeTaskDetail;
