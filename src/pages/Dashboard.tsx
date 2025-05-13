
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import Layout from "@/components/layout/Layout";
import CustomerTile from "@/components/common/CustomerTile";
import CreateCustomerModal from "@/components/modals/CreateCustomerModal";
import ViewProjectsModal from "@/components/modals/ViewProjectsModal";
import CreateProjectModal from "@/components/modals/CreateProjectModal";
import { addCustomer, getCustomers, getProjects, addProject, getProjectById, updateProject } from "@/lib/storage";
import { Customer, Project } from "@/lib/data";
import { useToast } from "@/components/ui/use-toast";

const Dashboard: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isCreateCustomerModalOpen, setIsCreateCustomerModalOpen] = useState(false);
  const [isViewProjectsModalOpen, setIsViewProjectsModalOpen] = useState(false);
  const [isCreateProjectModalOpen, setIsCreateProjectModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const isSales = user?.role === "sales";
  const showCustomerActions = isSales || user?.role === "technical";
  
  useEffect(() => {
    // Load customers and projects from local storage
    const storedCustomers = getCustomers();
    const storedProjects = getProjects();
    setCustomers(storedCustomers);
    setProjects(storedProjects);
  }, []);

  const handleCreateCustomer = (newCustomer: Customer) => {
    addCustomer(newCustomer);
    setCustomers([...customers, newCustomer]);
    toast({
      title: "Customer Created",
      description: `${newCustomer.name} has been added successfully.`,
    });
  };

  const handleViewProjects = (customerId: string) => {
    const customer = customers.find(c => c.id === customerId);
    if (customer) {
      setSelectedCustomer(customer);
      setIsViewProjectsModalOpen(true);
    }
  };

  const handleCreateProject = (customerId: string) => {
    const customer = customers.find(c => c.id === customerId);
    if (customer) {
      setSelectedCustomer(customer);
      setIsCreateProjectModalOpen(true);
    }
  };

  const handleProjectCreated = (newProject: Project) => {
    addProject(newProject);
    setProjects([...projects, newProject]);
    toast({
      title: "Project Created",
      description: `${newProject.title} has been created successfully.`,
    });
  };

  const handleViewProject = (projectId: string) => {
    if (!projectId) return;
    
    // Redirect to project details page
    if (user?.role === 'sales') {
      navigate(`/project/${projectId}`);
    } else if (user?.role === 'technical') {
      navigate(`/technical/project/${projectId}`);
    }
  };

  // For sales role, need to add completed projects screen
  if (isSales) {
    return (
      <Layout>
        <div className="space-y-8">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold">Customers</h1>
            <Button 
              onClick={() => setIsCreateCustomerModalOpen(true)}
              className="bg-sales hover:bg-blue-700"
            >
              Create New Customer
            </Button>
          </div>
          
          {customers.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {customers.map(customer => (
                <CustomerTile
                  key={customer.id}
                  customer={customer}
                  onViewProjects={handleViewProjects}
                  onCreateProject={handleCreateProject}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-gray-50 rounded-lg">
              <h3 className="text-xl font-medium text-gray-600">No customers yet</h3>
              <p className="text-gray-500 mt-2">Create your first customer to get started</p>
              <Button 
                onClick={() => setIsCreateCustomerModalOpen(true)} 
                className="mt-4 bg-sales hover:bg-blue-700"
              >
                Create New Customer
              </Button>
            </div>
          )}
        </div>

        <CreateCustomerModal
          isOpen={isCreateCustomerModalOpen}
          onClose={() => setIsCreateCustomerModalOpen(false)}
          onCreateCustomer={handleCreateCustomer}
        />
        
        <ViewProjectsModal
          isOpen={isViewProjectsModalOpen}
          onClose={() => setIsViewProjectsModalOpen(false)}
          customer={selectedCustomer}
          projects={projects}
          onViewProject={handleViewProject}
        />
        
        <CreateProjectModal
          isOpen={isCreateProjectModalOpen}
          onClose={() => setIsCreateProjectModalOpen(false)}
          customer={selectedCustomer}
          onCreateProject={handleProjectCreated}
        />
      </Layout>
    );
  }
  
  // Technical role dashboard
  if (user?.role === 'technical') {
    return (
      <Layout>
        <div className="space-y-8">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold">Customers</h1>
          </div>
          
          {customers.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {customers.map(customer => (
                <CustomerTile
                  key={customer.id}
                  customer={customer}
                  onViewProjects={handleViewProjects}
                  onCreateProject={handleCreateProject}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-gray-50 rounded-lg">
              <h3 className="text-xl font-medium text-gray-600">No customers available</h3>
              <p className="text-gray-500 mt-2">No customers have been created yet</p>
            </div>
          )}
        </div>
        
        <ViewProjectsModal
          isOpen={isViewProjectsModalOpen}
          onClose={() => setIsViewProjectsModalOpen(false)}
          customer={selectedCustomer}
          projects={projects}
          onViewProject={handleViewProject}
        />
      </Layout>
    );
  }
  
  // Assignee, Reviewer, and Final roles all redirect to their task lists
  if (user?.role === 'assignee') {
    navigate('/assignee/tasks');
    return null;
  } else if (user?.role === 'reviewer') {
    navigate('/reviewer/tasks');
    return null;
  } else if (user?.role === 'final') {
    navigate('/final/tasks');
    return null;
  }
  
  // Fallback content for unknown roles
  return (
    <Layout>
      <div className="text-center py-20">
        <h1 className="text-3xl font-bold mb-4">Welcome, {user?.name}</h1>
        <p className="text-gray-600">
          Your role ({user?.role}) is not set up for this dashboard.
        </p>
      </div>
    </Layout>
  );
};

export default Dashboard;
