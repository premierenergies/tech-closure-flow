
import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { getTasks, getProjects, getCustomers, getResponses, getReviews, getFinals, users } from "@/lib/storage";
import { Task, Project, Response, Review, Final } from "@/lib/data";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import ProjectDetails from "@/components/common/ProjectDetails";
import TaskDetails from "@/components/common/TaskDetails";
import ResponseDetails from "@/components/common/ResponseDetails";
import ReviewDetails from "@/components/common/ReviewDetails";
import FinalDetails from "@/components/common/FinalDetails";

const TechnicalTaskDetails: React.FC = () => {
  const { taskId } = useParams<{ taskId: string }>();
  const [task, setTask] = useState<Task | null>(null);
  const [project, setProject] = useState<Project | null>(null);
  const [response, setResponse] = useState<Response | null>(null);
  const [review, setReview] = useState<Review | null>(null);
  const [final, setFinal] = useState<Final | null>(null);

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
        
        // Load response if exists
        const allResponses = getResponses();
        const foundResponse = allResponses.find(r => r.taskId === taskId) || null;
        setResponse(foundResponse);
        
        if (foundResponse) {
          // Load review if exists
          const allReviews = getReviews();
          const foundReview = allReviews.find(r => r.responseId === foundResponse.id) || null;
          setReview(foundReview);
          
          if (foundReview) {
            // Load final if exists
            const allFinals = getFinals();
            const foundFinal = allFinals.find(f => f.reviewId === foundReview.id) || null;
            setFinal(foundFinal);
          }
        }
      }
    }
  }, [taskId]);

  if (!task || !project) {
    return (
      <Layout allowedRoles={["technical"]}>
        <div className="text-center py-20">
          <h1 className="text-2xl font-bold mb-4">Task not found</h1>
          <Link to="/">
            <Button>Back to Dashboard</Button>
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout allowedRoles={["technical"]}>
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Task Journey</h1>
          <Link to={`/technical/project/${project.id}`}>
            <Button variant="outline">Back to Project</Button>
          </Link>
        </div>
        
        <div className="bg-white shadow-lg rounded-lg p-6">
          <h2 className="text-2xl font-semibold mb-6">Project Information</h2>
          <ProjectDetails project={project} customers={getCustomers()} />
          
          <div className="border-t pt-8 mt-8">
            <h2 className="text-2xl font-semibold mb-6">Task Information</h2>
            <TaskDetails task={task} users={users} />
          </div>
          
          {response && (
            <div className="border-t pt-8 mt-8">
              <h2 className="text-2xl font-semibold mb-6">Assignee's Response</h2>
              <ResponseDetails response={response} />
            </div>
          )}
          
          {review && (
            <div className="border-t pt-8 mt-8">
              <h2 className="text-2xl font-semibold mb-6">Reviewer's Assessment</h2>
              <ReviewDetails review={review} />
            </div>
          )}
          
          {final && (
            <div className="border-t pt-8 mt-8">
              <h2 className="text-2xl font-semibold mb-6">Final Approval</h2>
              <FinalDetails final={final} />
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default TechnicalTaskDetails;
