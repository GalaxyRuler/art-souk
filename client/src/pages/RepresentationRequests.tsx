import React from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { RepresentationRequestsList } from "@/components/RepresentationRequestsList";
import { HandHeart, Users, Clock, CheckCircle, ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function RepresentationRequests() {
  const { t } = useTranslation();
  const { user } = useAuth();

  // Determine if user is artist or gallery
  const isArtist = user?.roles?.includes('artist');
  const isGallery = user?.roles?.includes('gallery');
  const userType = isArtist ? 'artist' : isGallery ? 'gallery' : null;

  if (!userType) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <HandHeart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-brand-charcoal mb-2">
              Access Restricted
            </h2>
            <p className="text-muted-foreground mb-4">
              Only artists and galleries can access representation requests.
            </p>
            <Link href="/dashboard">
              <Button>Go to Dashboard</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/dashboard">
            <Button variant="ghost" className="mb-4 hover:bg-brand-light-gold">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
          
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-brand-purple/10 rounded-lg">
              <HandHeart className="h-6 w-6 text-brand-purple" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-brand-charcoal">
                Representation Requests
              </h1>
              <p className="text-muted-foreground">
                {isArtist 
                  ? "Manage representation requests from galleries interested in your work"
                  : "Track your representation requests sent to artists"
                }
              </p>
            </div>
          </div>

          {/* Role indicator */}
          <div className="flex items-center gap-2">
            <Badge variant="outline" className={
              isArtist 
                ? "bg-blue-50 text-blue-700 border-blue-200"
                : "bg-purple-50 text-purple-700 border-purple-200"
            }>
              <Users className="h-3 w-3 mr-1" />
              {isArtist ? "Artist" : "Gallery"} Dashboard
            </Badge>
          </div>
        </div>

        {/* Information Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card className="border-brand-purple/20">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <Clock className="h-5 w-5 text-yellow-600" />
                <h3 className="font-semibold text-brand-charcoal">
                  {isArtist ? "How It Works - Artists" : "How It Works - Galleries"}
                </h3>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {isArtist 
                  ? "Galleries can send you representation requests with their terms. Review each request carefully and respond with acceptance, declination, or counter-terms. Approved requests automatically create representation relationships."
                  : "Send representation requests to artists you're interested in working with. Include your terms, commission rates, and a personal message explaining why you want to represent their work."
                }
              </p>
            </CardContent>
          </Card>

          <Card className="border-brand-gold/20">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <h3 className="font-semibold text-brand-charcoal">Best Practices</h3>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {isArtist 
                  ? "Consider the gallery's reputation, exhibition program, collector network, and terms offered. Don't hesitate to negotiate terms or ask questions about their services and marketing support."
                  : "Be professional and specific about what you offer. Include details about your gallery's services, exhibition opportunities, collector network, and why you're interested in the artist's work."
                }
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Representation Requests List */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2">
              <HandHeart className="h-5 w-5 text-brand-purple" />
              {isArtist ? "Requests Received" : "Requests Sent"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <RepresentationRequestsList userType={userType} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}