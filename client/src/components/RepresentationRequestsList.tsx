import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  ArrowLeft, 
  Calendar, 
  Percent, 
  MapPin,
  Eye,
  MessageSquare,
  FileText
} from "lucide-react";

interface RepresentationRequest {
  id: number;
  galleryId?: number;
  artistId?: number;
  status: "pending" | "approved" | "declined" | "withdrawn";
  exclusivity: string;
  proposedStartDate: string;
  proposedEndDate?: string;
  commissionRate: number;
  terms: string;
  message: string;
  artistResponse?: string;
  respondedAt?: string;
  createdAt: string;
  // Gallery info (for artists)
  galleryName?: string;
  galleryImage?: string;
  galleryLocation?: string;
  // Artist info (for galleries)
  artistName?: string;
  artistImage?: string;
}

interface RepresentationRequestsListProps {
  userType: "artist" | "gallery";
}

export function RepresentationRequestsList({ userType }: RepresentationRequestsListProps) {
  const [selectedRequest, setSelectedRequest] = useState<RepresentationRequest | null>(null);
  const [responseText, setResponseText] = useState("");
  const [counterTerms, setCounterTerms] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const endpoint = userType === "artist" 
    ? "/api/representation-requests/artist/received"
    : "/api/representation-requests/gallery/sent";

  const { data: requests = [], isLoading } = useQuery({
    queryKey: [endpoint],
    queryFn: () => apiRequest(endpoint),
  });

  const respondMutation = useMutation({
    mutationFn: async ({ id, status, artistResponse, artistCounterTerms }: {
      id: number;
      status: "approved" | "declined";
      artistResponse: string;
      artistCounterTerms?: string;
    }) => {
      return await apiRequest(`/api/representation-requests/${id}/respond`, {
        method: "PATCH",
        body: JSON.stringify({ status, artistResponse, artistCounterTerms }),
      });
    },
    onSuccess: () => {
      toast({
        title: "Response Sent",
        description: "Your response has been sent to the gallery.",
      });
      setSelectedRequest(null);
      setResponseText("");
      setCounterTerms("");
      queryClient.invalidateQueries({ queryKey: [endpoint] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to send response.",
        variant: "destructive",
      });
    },
  });

  const withdrawMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest(`/api/representation-requests/${id}/withdraw`, {
        method: "PATCH",
      });
    },
    onSuccess: () => {
      toast({
        title: "Request Withdrawn",
        description: "Your representation request has been withdrawn.",
      });
      queryClient.invalidateQueries({ queryKey: [endpoint] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to withdraw request.",
        variant: "destructive",
      });
    },
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case "approved":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "declined":
        return <XCircle className="h-4 w-4 text-red-600" />;
      case "withdrawn":
        return <ArrowLeft className="h-4 w-4 text-gray-600" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "approved":
        return "bg-green-100 text-green-800 border-green-200";
      case "declined":
        return "bg-red-100 text-red-800 border-red-200";
      case "withdrawn":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const categorizedRequests = {
    pending: requests.filter((r: RepresentationRequest) => r.status === "pending"),
    responded: requests.filter((r: RepresentationRequest) => ["approved", "declined", "withdrawn"].includes(r.status)),
  };

  const RequestCard = ({ request }: { request: RepresentationRequest }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h4 className="font-semibold text-brand-charcoal">
              {userType === "artist" ? request.galleryName : request.artistName}
            </h4>
            {userType === "artist" && request.galleryLocation && (
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {request.galleryLocation}
              </p>
            )}
          </div>
          <Badge className={`${getStatusColor(request.status)} flex items-center gap-1`}>
            {getStatusIcon(request.status)}
            {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
          </Badge>
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm text-muted-foreground mb-3">
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            Start: {new Date(request.proposedStartDate).toLocaleDateString()}
          </div>
          <div className="flex items-center gap-1">
            <Percent className="h-3 w-3" />
            Commission: {request.commissionRate}%
          </div>
        </div>

        <div className="flex items-center gap-2 mb-3">
          <Badge variant="outline" className={
            request.exclusivity === "exclusive" 
              ? "bg-red-50 text-red-700 border-red-200"
              : request.exclusivity === "regional"
              ? "bg-purple-50 text-purple-700 border-purple-200"
              : "bg-blue-50 text-blue-700 border-blue-200"
          }>
            {request.exclusivity.charAt(0).toUpperCase() + request.exclusivity.slice(1)}
          </Badge>
          <span className="text-xs text-muted-foreground">
            Sent {new Date(request.createdAt).toLocaleDateString()}
          </span>
        </div>

        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
          {request.message}
        </p>

        <div className="flex gap-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="flex items-center gap-1">
                <Eye className="h-3 w-3" />
                View Details
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  Representation Request from {userType === "artist" ? request.galleryName : request.artistName}
                </DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Representation Type</label>
                    <Badge className={`mt-1 ${
                      request.exclusivity === "exclusive" 
                        ? "bg-red-100 text-red-800"
                        : "bg-blue-100 text-blue-800"
                    }`}>
                      {request.exclusivity}
                    </Badge>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Commission Rate</label>
                    <p className="mt-1">{request.commissionRate}%</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Start Date</label>
                    <p className="mt-1">{new Date(request.proposedStartDate).toLocaleDateString()}</p>
                  </div>
                  {request.proposedEndDate && (
                    <div>
                      <label className="text-sm font-medium">End Date</label>
                      <p className="mt-1">{new Date(request.proposedEndDate).toLocaleDateString()}</p>
                    </div>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium flex items-center gap-1">
                    <FileText className="h-3 w-3" />
                    Terms & Conditions
                  </label>
                  <p className="mt-1 text-sm bg-gray-50 p-3 rounded border">{request.terms}</p>
                </div>

                <div>
                  <label className="text-sm font-medium flex items-center gap-1">
                    <MessageSquare className="h-3 w-3" />
                    Personal Message
                  </label>
                  <p className="mt-1 text-sm bg-gray-50 p-3 rounded border">{request.message}</p>
                </div>

                {request.artistResponse && (
                  <div>
                    <label className="text-sm font-medium">Artist Response</label>
                    <p className="mt-1 text-sm bg-green-50 p-3 rounded border">{request.artistResponse}</p>
                    {request.respondedAt && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Responded on {new Date(request.respondedAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                )}

                {userType === "artist" && request.status === "pending" && (
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium">Your Response</label>
                      <Textarea
                        placeholder="Write your response to the gallery..."
                        value={responseText}
                        onChange={(e) => setResponseText(e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Counter Terms (Optional)</label>
                      <Textarea
                        placeholder="Propose any changes to the terms..."
                        value={counterTerms}
                        onChange={(e) => setCounterTerms(e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => respondMutation.mutate({
                          id: request.id,
                          status: "approved",
                          artistResponse: responseText,
                          artistCounterTerms: counterTerms || undefined,
                        })}
                        disabled={!responseText || respondMutation.isPending}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        Accept Request
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={() => respondMutation.mutate({
                          id: request.id,
                          status: "declined",
                          artistResponse: responseText,
                        })}
                        disabled={!responseText || respondMutation.isPending}
                      >
                        Decline Request
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>

          {userType === "gallery" && request.status === "pending" && (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => withdrawMutation.mutate(request.id)}
              disabled={withdrawMutation.isPending}
            >
              Withdraw
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-full"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="pending" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="pending" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Pending ({categorizedRequests.pending.length})
          </TabsTrigger>
          <TabsTrigger value="responded" className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            Responded ({categorizedRequests.responded.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          {categorizedRequests.pending.length > 0 ? (
            categorizedRequests.pending.map((request) => (
              <RequestCard key={request.id} request={request} />
            ))
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-brand-charcoal mb-2">
                  No Pending Requests
                </h3>
                <p className="text-muted-foreground">
                  {userType === "artist" 
                    ? "You don't have any pending representation requests from galleries."
                    : "You haven't sent any pending representation requests to artists."
                  }
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="responded" className="space-y-4">
          {categorizedRequests.responded.length > 0 ? (
            categorizedRequests.responded.map((request) => (
              <RequestCard key={request.id} request={request} />
            ))
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <CheckCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-brand-charcoal mb-2">
                  No Responded Requests
                </h3>
                <p className="text-muted-foreground">
                  No requests have been responded to yet.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}