
import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { getProjects, getCustomers, getTasks, addTask } from "@/lib/storage";
import { Project, Customer, Task } from "@/lib/data";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";
import ProjectDetails from "@/components/common/ProjectDetails";
import CreateTaskModal from "@/components/modals/CreateTaskModal";
import { useToast } from "@/components/ui/use-toast";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const TechnicalProjectDetails: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isCreateTaskModalOpen, setIsCreateTaskModalOpen] = useState(false);
  
  const { toast } = useToast();

  useEffect(() => {
    if (projectId) {
      // Load project from storage
      const allProjects = getProjects();
      const foundProject = allProjects.find(p => p.id === projectId) || null;
      setProject(foundProject);
      
      // Load customers for reference
      setCustomers(getCustomers());
      
      // Load tasks for this project
      const allTasks = getTasks();
      const projectTasks = allTasks.filter(task => task.projectId === projectId);
      setTasks(projectTasks);
    }
  }, [projectId]);

  const handleCreateTask = (newTask: Task) => {
    console.log("Creating task:", newTask);
    addTask(newTask);
    const updatedTasks = [...tasks, newTask];
    setTasks(updatedTasks);
    console.log("Tasks after creation:", updatedTasks);
    toast({
      title: "Task Created",
      description: `${newTask.title} has been created successfully.`,
    });
    setIsCreateTaskModalOpen(false);
  };

  if (!project) {
    return (
      <Layout allowedRoles={["technical"]}>
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
    <Layout allowedRoles={["technical"]}>
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Project Details</h1>
          <div className="space-x-2">
            <Button 
              onClick={() => setIsCreateTaskModalOpen(true)}
              className="bg-technical hover:bg-green-700"
            >
              Create Task
            </Button>
            <Link to="/">
              <Button variant="outline">Back to Dashboard</Button>
            </Link>
          </div>
        </div>
        
        <ProjectDetails project={project} customers={customers} />
        
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <h2 className="text-xl font-semibold p-6 border-b">Tasks</h2>
          
          {tasks.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Assignees</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tasks.map((task) => (
                  <TableRow key={task.id}>
                    <TableCell className="font-medium">{task.title}</TableCell>
                    <TableCell>{formatDate(task.dueDate)}</TableCell>
                    <TableCell>
                      {task.status === "pending" && (
                        <span className="inline-block bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded">
                          Pending
                        </span>
                      )}
                      {task.status === "in-progress" && (
                        <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                          In Progress
                        </span>
                      )}
                      {task.status === "review" && (
                        <span className="inline-block bg-indigo-100 text-indigo-800 text-xs px-2 py-1 rounded">
                          Under Review
                        </span>
                      )}
                      {task.status === "final-review" && (
                        <span className="inline-block bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded">
                          Final Review
                        </span>
                      )}
                      {task.status === "closed" && (
                        <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                          Closed
                        </span>
                      )}
                      {task.status === "rejected" && (
                        <span className="inline-block bg-red-100 text-red-800 text-xs px-2 py-1 rounded">
                          Rejected
                        </span>
                      )}
                    </TableCell>
                    <TableCell>{task.assignees.length} assignee(s)</TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm" asChild>
                        <Link to={`/technical/task/${task.id}`}>
                          View
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-10">
              <p className="text-gray-500">No tasks created for this project</p>
              <Button 
                onClick={() => setIsCreateTaskModalOpen(true)} 
                className="mt-4 bg-technical hover:bg-green-700"
              >
                Create Task
              </Button>
            </div>
          )}
        </div>
      </div>

      <CreateTaskModal
        isOpen={isCreateTaskModalOpen}
        onClose={() => setIsCreateTaskModalOpen(false)}
        project={project}
        onCreateTask={handleCreateTask}
      />
    </Layout>
  );
};

export default TechnicalProjectDetails;
