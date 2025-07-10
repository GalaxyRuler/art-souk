import React from "react";
import { useTranslation } from "react-i18next";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, DollarSign, Package, User, Plus } from "lucide-react";
import { Link } from "wouter";
import { format } from "date-fns";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { CommissionRequest } from "@shared/schema/commissions";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export function CommissionRequests() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";

  const { data: requests, isLoading } = useQuery<CommissionRequest[]>({
    queryKey: ["/api/commissions"],
  });

  const { data: user } = useQuery({
    queryKey: ["/api/user"],
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

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
            {t("commissions.requests.title")}
          </h1>
          <p className="text-muted-foreground mt-2">
            {t("commissions.requests.subtitle")}
          </p>
        </div>
        {user && (
          <Link href="/commissions/new">
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              {t("commissions.requests.postRequest")}
            </Button>
          </Link>
        )}
      </div>

      {isLoading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="p-6">
              <Skeleton className="h-6 w-3/4 mb-4" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-full mb-4" />
              <div className="flex justify-between">
                <Skeleton className="h-8 w-24" />
                <Skeleton className="h-8 w-20" />
              </div>
            </Card>
          ))}
        </div>
      ) : requests && requests.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {requests.map((request) => (
            <Link key={request.id} href={`/commissions/${request.id}`}>
              <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-semibold line-clamp-1">
                    {isRTL ? request.titleAr : request.titleEn}
                  </h3>
                  <Badge className={statusColors[request.status || "open"]}>
                    {t(`commissions.status.${request.status || "open"}`)}
                  </Badge>
                </div>

                <p className="text-muted-foreground line-clamp-2 mb-4">
                  {isRTL ? request.descriptionAr : request.descriptionEn}
                </p>

                <div className="space-y-2 text-sm">
                  {request.category && (
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4 text-muted-foreground" />
                      <span>{t(`categories.${request.category}`)}</span>
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <span>
                      {formatCurrency(request.budgetMin, request.budgetCurrency)} - 
                      {formatCurrency(request.budgetMax, request.budgetCurrency)}
                    </span>
                  </div>

                  {request.deadline && (
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>{format(new Date(request.deadline), "MMM d, yyyy")}</span>
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-4 border-t flex justify-between items-center">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <User className="h-4 w-4" />
                    <span>{t("commissions.requests.bidsCount", { count: 0 })}</span>
                  </div>
                  {request.featured && (
                    <Badge variant="secondary">{t("commissions.featured")}</Badge>
                  )}
                </div>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <Card className="p-12 text-center">
          <Package className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold mb-2">
            {t("commissions.requests.noRequests")}
          </h3>
          <p className="text-muted-foreground mb-6">
            {t("commissions.requests.noRequestsDescription")}
          </p>
          {user && (
            <Link href="/commissions/new">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                {t("commissions.requests.postFirstRequest")}
              </Button>
            </Link>
          )}
        </Card>
      )}
      </div>
      <Footer />
    </div>
  );
}