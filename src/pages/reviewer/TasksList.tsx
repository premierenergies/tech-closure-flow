
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { 
  getTasks, 
  getProjects, 
  getCustomers, 
  getResponses 
} from "@/lib/storage";
import { Task, Project, Customer, Response } from "@/lib/data";
import Layout from "@/components/layout/Layout";
import { formatDate } from "@/lib/utils";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";

const ReviewerTasks: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [responses, setResponses] = useState<Response[]>([]);

  useEffect(() => {
    // Load all responses that need review
    const allResponses = getResponses();
    const pendingResponses = allResponses.filter(r => r.status === "review");
    setResponses(pendingResponses);
    
    if (pendingResponses.length > 0) {
      // Load tasks for these responses
      const allTasks = getTasks();
      const taskIds = pendingResponses.map(r => r.taskId);
      const filteredTasks = allTasks.filter(t => taskIds.includes(t.id));
      setTasks(filteredTasks);
      
      // Load projects and customers for reference
      setProjects(getProjects());
      setCustomers(getCustomers());
    }
  }, []);

  const getProjectTitle = (projectId: string): string => {
    const project = projects.find(p => p.id === projectId);
    return project ? project.title : "Unknown Project";
  };

  const getCustomerName = (projectId: string): string => {
    const project = projects.find(p => p.id === projectId);
    if (!project) return "Unknown Customer";
    
    const customer = customers.find(c => c.id === project.customerId);
    return customer ? customer.name : "Unknown Customer";
  };

  return (
    <Layout allowedRoles={["reviewer"]}>
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Tasks Pending Review</h1>
        </div>
        
        {tasks.length > 0 ? (
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Project</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Submitted On</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tasks.map((task) => {
                  const response = responses.find(r => r.taskId === task.id);
                  return (
                    <TableRow key={task.id}>
                      <TableCell className="font-medium">{task.title}</TableCell>
                      <TableCell>{getProjectTitle(task.projectId)}</TableCell>
                      <TableCell>{getCustomerName(task.projectId)}</TableCell>
                      <TableCell>
                        {response ? formatDate(response.respondedAt) : "N/A"}
                      </TableCell>
                      <TableCell>
                        <span className="inline-block bg-indigo-100 text-indigo-800 text-xs px-2 py-1 rounded">
                          Pending Review
                        </span>
                      </TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm" asChild>
                          <Link to={`/reviewer/task/${task.id}`}>
                            View
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="text-center py-20 bg-gray-50 rounded-lg">
            <h3 className="text-xl font-medium text-gray-600">No pending reviews</h3>
            <p className="text-gray-500 mt-2">There are no tasks waiting for your review</p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default ReviewerTasks;
