import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Calendar, 
  DollarSign, 
  Package, 
  User, 
  MessageSquare,
  Clock,
  FileText,
  ArrowLeft,
  Send
} from "lucide-react";
import { format } from "date-fns";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import type { CommissionRequest, CommissionBid } from "@shared/schema/commissions";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export function CommissionDetail() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";
  const { id } = useParams();
  const { toast } = useToast();
  
  const [bidAmount, setBidAmount] = useState("");
  const [timeline, setTimeline] = useState("");
  const [proposal, setProposal] = useState("");

  const { data: request, isLoading } = useQuery<CommissionRequest & { bids?: CommissionBid[] }>({
    queryKey: [`/api/commissions/${id}`],
  });

  const { data: user } = useQuery({
    queryKey: ["/api/user"],
  });

  const submitBidMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest(`/api/commissions/${id}/bids`, {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      toast({
        title: t("commissions.bidSubmitted"),
        description: t("commissions.bidSubmittedDescription"),
      });
      queryClient.invalidateQueries({ queryKey: [`/api/commissions/${id}`] });
      setBidAmount("");
      setTimeline("");
      setProposal("");
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: t("common.error"),
        description: t("common.errorTryAgain"),
      });
    },
  });

  const statusColors = {
    open: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    closed: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
    in_progress: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    completed: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
    cancelled: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  };

  const formatCurrency = (amount: string | null, currency: string | null) => {
    if (!amount) return "";
    const num = parseFloat(amount);
    return new Intl.NumberFormat(isRTL ? "ar-SA" : "en-US", {
      style: "currency",
      currency: currency || "SAR",
    }).format(num);
  };

  const handleSubmitBid = () => {
    if (!bidAmount || !timeline || !proposal) {
      toast({
        variant: "destructive",
        title: t("common.error"),
        description: t("commissions.fillAllFields"),
      });
      return;
    }

    submitBidMutation.mutate({
      proposedPrice: bidAmount,
      currency: request?.budgetCurrency || "SAR",
      estimatedDays: parseInt(timeline),
      proposalTextEn: proposal,
      proposalTextAr: proposal,
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <Skeleton className="h-8 w-64 mb-4" />
          <Card className="p-6">
            <Skeleton className="h-6 w-3/4 mb-4" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-2/3" />
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  if (!request) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <Card className="p-12 text-center">
            <h3 className="text-xl font-semibold mb-2">
              {t("commissions.requestNotFound")}
            </h3>
            <Link href="/commissions">
              <Button variant="outline" className="mt-4">
                <ArrowLeft className="h-4 w-4 mr-2" />
                {t("common.back")}
              </Button>
            </Link>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  const isArtist = user?.role === "artist";
  const isOwner = user?.id === request.collectorId;
  const canBid = isArtist && !isOwner && request.status === "open";

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
        <Link href="/commissions">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t("common.back")}
          </Button>
        </Link>
        
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              {isRTL ? request.titleAr : request.titleEn}
            </h1>
            <div className="flex items-center gap-4">
              <Badge className={statusColors[request.status || "open"]}>
                {t(`commissions.status.${request.status || "open"}`)}
              </Badge>
              {request.featured && (
                <Badge variant="secondary">{t("commissions.featured")}</Badge>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">{t("commissions.description")}</h2>
            <p className="text-muted-foreground whitespace-pre-wrap">
              {isRTL ? request.descriptionAr : request.descriptionEn}
            </p>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">{t("commissions.details")}</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {request.category && (
                <div className="flex items-center gap-3">
                  <Package className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">{t("commissions.category")}</p>
                    <p className="font-medium">{t(`categories.${request.category}`)}</p>
                  </div>
                </div>
              )}

              {request.medium && (
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">{t("commissions.medium")}</p>
                    <p className="font-medium">{request.medium}</p>
                  </div>
                </div>
              )}

              {request.style && (
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">{t("commissions.style")}</p>
                    <p className="font-medium">{request.style}</p>
                  </div>
                </div>
              )}

              {request.dimensions && (
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">{t("commissions.dimensions")}</p>
                    <p className="font-medium">{request.dimensions}</p>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-3">
                <DollarSign className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">{t("commissions.budget")}</p>
                  <p className="font-medium">
                    {formatCurrency(request.budgetMin, request.budgetCurrency)} - 
                    {formatCurrency(request.budgetMax, request.budgetCurrency)}
                  </p>
                </div>
              </div>

              {request.deadline && (
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">{t("commissions.deadline")}</p>
                    <p className="font-medium">{format(new Date(request.deadline), "MMM d, yyyy")}</p>
                  </div>
                </div>
              )}
            </div>
          </Card>

          <Tabs defaultValue="bids" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="bids">{t("commissions.bids")}</TabsTrigger>
              <TabsTrigger value="messages">{t("commissions.messages")}</TabsTrigger>
            </TabsList>
            
            <TabsContent value="bids" className="mt-6">
              {request.bids && request.bids.length > 0 ? (
                <div className="space-y-4">
                  {request.bids.map((bid) => (
                    <Card key={bid.id} className="p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-3">
                          <User className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <p className="font-medium">{t("commissions.artistBid")}</p>
                            <p className="text-sm text-muted-foreground">
                              {format(new Date(bid.createdAt!), "MMM d, yyyy")}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">
                            {formatCurrency(bid.proposedPrice, bid.currency)}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {bid.estimatedDays} {t("commissions.days")}
                          </p>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {isRTL ? bid.proposalTextAr : bid.proposalTextEn}
                      </p>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="p-8 text-center">
                  <User className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                  <p className="text-muted-foreground">{t("commissions.noBidsYet")}</p>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="messages" className="mt-6">
              <Card className="p-8 text-center">
                <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground">{t("commissions.noMessagesYet")}</p>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <div className="space-y-6">
          {canBid && (
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">{t("commissions.submitBid")}</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    {t("commissions.bidAmount")} ({request.budgetCurrency || "SAR"})
                  </label>
                  <Input
                    type="number"
                    value={bidAmount}
                    onChange={(e) => setBidAmount(e.target.value)}
                    placeholder={t("commissions.enterBidAmount")}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">
                    {t("commissions.timeline")} ({t("commissions.days")})
                  </label>
                  <Input
                    type="number"
                    value={timeline}
                    onChange={(e) => setTimeline(e.target.value)}
                    placeholder={t("commissions.enterTimeline")}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">
                    {t("commissions.proposal")}
                  </label>
                  <Textarea
                    value={proposal}
                    onChange={(e) => setProposal(e.target.value)}
                    placeholder={t("commissions.enterProposal")}
                    rows={4}
                  />
                </div>

                <Button 
                  onClick={handleSubmitBid}
                  disabled={submitBidMutation.isPending}
                  className="w-full"
                >
                  <Send className="h-4 w-4 mr-2" />
                  {submitBidMutation.isPending ? t("common.loading") : t("commissions.submitBid")}
                </Button>
              </div>
            </Card>
          )}

          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">{t("commissions.requestedBy")}</h3>
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                <User className="h-6 w-6 text-muted-foreground" />
              </div>
              <div>
                <p className="font-medium">{t("commissions.collector")}</p>
                <p className="text-sm text-muted-foreground">
                  {t("commissions.memberSince", { 
                    date: format(new Date(request.createdAt!), "MMM yyyy") 
                  })}
                </p>
              </div>
            </div>
          </Card>

          {request.referenceImages && request.referenceImages.length > 0 && (
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">{t("commissions.referenceImages")}</h3>
              <div className="grid grid-cols-2 gap-2">
                {request.referenceImages.map((image, index) => (
                  <img
                    key={index}
                    src={image}
                    alt={`Reference ${index + 1}`}
                    className="w-full h-24 object-cover rounded"
                  />
                ))}
              </div>
            </Card>
          )}
        </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
