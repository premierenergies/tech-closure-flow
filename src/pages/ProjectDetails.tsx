
import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { getProjects, getCustomers, getTasks } from "@/lib/storage";
import { Project, Customer, Task } from "@/lib/data";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { formatDate, getUserById } from "@/lib/utils";
import ProjectDetails from "@/components/common/ProjectDetails";

const ProjectDetailsPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [relatedTasks, setRelatedTasks] = useState<Task[]>([]);

  useEffect(() => {
    if (projectId) {
      // Load project from storage
      const allProjects = getProjects();
      const foundProject = allProjects.find(p => p.id === projectId) || null;
      setProject(foundProject);
      
      // Load customers for reference
      setCustomers(getCustomers());
      
      // Load related tasks
      const allTasks = getTasks();
      const projectTasks = allTasks.filter(task => task.projectId === projectId);
      setRelatedTasks(projectTasks);
    }
  }, [projectId]);

  if (!project) {
    return (
      <Layout allowedRoles={["sales"]}>
        <div className="text-center py-20">
          <h1 className="text-2xl font-bold mb-4">Project not found</h1>
          <Link to="/">
            <Button>Back to Dashboard</Button>
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout allowedRoles={["sales"]}>
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Project Details</h1>
          <div className="space-x-2">
            <Link to="/completed-projects">
              <Button variant="outline">View Completed Projects</Button>
            </Link>
            <Link to="/">
              <Button>Back to Dashboard</Button>
            </Link>
          </div>
        </div>
        
        <ProjectDetails project={project} customers={customers} />
        
        {relatedTasks.length > 0 && (
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Related Tasks</h2>
            <div className="space-y-4">
              {relatedTasks.map(task => {
                const createdBy = getUserById(task.createdBy);
                return (
                  <div key={task.id} className="p-4 border rounded-lg">
                    <h3 className="font-medium">{task.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                    <div className="flex justify-between items-center mt-2 text-xs text-gray-500">
                      <span>Created by {createdBy?.name} on {formatDate(task.createdAt)}</span>
                      <span className="inline-block bg-gray-100 text-gray-800 px-2 py-1 rounded">
                        Due: {formatDate(task.dueDate)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default ProjectDetailsPage;
