
import React, { useState, useEffect } from "react";
import { getProjects, getCustomers } from "@/lib/storage";
import { Project, Customer } from "@/lib/data";
import Layout from "@/components/layout/Layout";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatDate, getUserById, getCustomerById } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const CompletedProjects: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);

  useEffect(() => {
    // Load closed projects from storage
    const allProjects = getProjects();
    const completedProjects = allProjects.filter(project => project.status === "closed");
    setProjects(completedProjects);
    
    // Load customers for reference
    setCustomers(getCustomers());
  }, []);

  return (
    <Layout allowedRoles={["sales"]}>
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Completed Projects</h1>
          <Link to="/">
            <Button variant="outline">Back to Dashboard</Button>
          </Link>
        </div>
        
        {projects.length > 0 ? (
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Project</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Plant</TableHead>
                  <TableHead>Completed On</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {projects.map(project => {
                  const customer = getCustomerById(project.customerId, customers);
                  return (
                    <TableRow key={project.id}>
                      <TableCell className="font-medium">{project.title}</TableCell>
                      <TableCell>{customer?.name}</TableCell>
                      <TableCell>{project.product}</TableCell>
                      <TableCell>{project.plant}</TableCell>
                      <TableCell>{formatDate(project.createdAt)}</TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm" asChild>
                          <Link to={`/completed-project/${project.id}`}>
                            View Details
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
            <h3 className="text-xl font-medium text-gray-600">No completed projects</h3>
            <p className="text-gray-500 mt-2">Completed projects will appear here</p>
            <Link to="/">
              <Button className="mt-4">Back to Dashboard</Button>
            </Link>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default CompletedProjects;
