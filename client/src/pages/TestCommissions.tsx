import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { queryClient, apiRequest } from "@/lib/queryClient";

export default function TestCommissions() {
  const [newRequest, setNewRequest] = useState({
    title: "Abstract Coastal Artwork",
    description: "Looking for a large abstract painting with coastal themes. Blue and turquoise colors preferred.",
    minBudget: "5000",
    maxBudget: "15000",
    currency: "SAR",
    dimensions: "120 × 90 cm",
    medium: "Oil on canvas",
    style: "Abstract",
    preferredDeadline: "2025-02-28"
  });

  // Fetch commission requests
  const { data: requests, isLoading, error } = useQuery({
    queryKey: ['/api/commission-requests'],
  });

  // Create commission request mutation
  const createMutation = useMutation({
    mutationFn: (data: typeof newRequest) => 
      apiRequest('/api/commission-requests', 'POST', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/commission-requests'] });
    }
  });

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Commission Requests Test Page</h1>

      {/* Create New Request Form */}
      <Card className="p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Create New Commission Request</h2>
        <div className="space-y-4">
          <Input
            placeholder="Title"
            value={newRequest.title}
            onChange={(e) => setNewRequest({...newRequest, title: e.target.value})}
          />
          <Textarea
            placeholder="Description"
            value={newRequest.description}
            onChange={(e) => setNewRequest({...newRequest, description: e.target.value})}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              placeholder="Min Budget"
              value={newRequest.minBudget}
              onChange={(e) => setNewRequest({...newRequest, minBudget: e.target.value})}
            />
            <Input
              placeholder="Max Budget"
              value={newRequest.maxBudget}
              onChange={(e) => setNewRequest({...newRequest, maxBudget: e.target.value})}
            />
          </div>
          <Input
            placeholder="Dimensions"
            value={newRequest.dimensions}
            onChange={(e) => setNewRequest({...newRequest, dimensions: e.target.value})}
          />
          <Input
            placeholder="Medium"
            value={newRequest.medium}
            onChange={(e) => setNewRequest({...newRequest, medium: e.target.value})}
          />
          <Input
            placeholder="Style"
            value={newRequest.style}
            onChange={(e) => setNewRequest({...newRequest, style: e.target.value})}
          />
          <Button 
            onClick={() => createMutation.mutate(newRequest)}
            disabled={createMutation.isPending}
          >
            {createMutation.isPending ? "Creating..." : "Create Request"}
          </Button>
        </div>
      </Card>

      {/* Display Existing Requests */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Existing Commission Requests</h2>
        
        {isLoading && <p>Loading requests...</p>}
        {error && <p className="text-red-500">Error: {(error as any).message}</p>}
        
        {requests && Array.isArray(requests) && (
          <div className="space-y-4">
            {requests.length === 0 ? (
              <p>No commission requests found.</p>
            ) : (
              requests.map((request: any) => (
                <Card key={request.id} className="p-4">
                  <h3 className="font-semibold">{request.title}</h3>
                  <p className="text-sm text-gray-600">{request.description}</p>
                  <div className="mt-2 text-sm">
                    <span className="font-medium">Budget:</span> {request.minBudget} - {request.maxBudget} {request.currency}
                  </div>
                  <div className="text-sm">
                    <span className="font-medium">Medium:</span> {request.medium || 'Not specified'}
                  </div>
                  <div className="text-sm">
                    <span className="font-medium">Status:</span> {request.status}
                  </div>
                </Card>
              ))
            )}
          </div>
        )}
      </Card>
    </div>
  );
}