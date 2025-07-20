import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Calendar, HandHeart, Percent, FileText, MessageSquare } from "lucide-react";

const representationRequestSchema = z.object({
  artistId: z.number(),
  exclusivity: z.enum(["exclusive", "non-exclusive", "regional"]),
  proposedStartDate: z.string().min(1, "Start date is required"),
  proposedEndDate: z.string().optional(),
  commissionRate: z.string().min(1, "Commission rate is required"),
  terms: z.string().min(10, "Terms must be at least 10 characters"),
  termsAr: z.string().optional(),
  message: z.string().min(10, "Message must be at least 10 characters"),
  messageAr: z.string().optional(),
});

type RepresentationRequestFormValues = z.infer<typeof representationRequestSchema>;

interface RepresentationRequestModalProps {
  artistId: number;
  artistName: string;
  children: React.ReactNode;
}

export function RepresentationRequestModal({ 
  artistId, 
  artistName, 
  children 
}: RepresentationRequestModalProps) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<RepresentationRequestFormValues>({
    resolver: zodResolver(representationRequestSchema),
    defaultValues: {
      artistId,
      exclusivity: "non-exclusive",
      proposedStartDate: "",
      proposedEndDate: "",
      commissionRate: "25",
      terms: "",
      termsAr: "",
      message: "",
      messageAr: "",
    },
  });

  const sendRequestMutation = useMutation({
    mutationFn: async (data: RepresentationRequestFormValues) => {
      return await apiRequest("/api/representation-requests/send", {
        method: "POST",
        body: JSON.stringify({
          ...data,
          commissionRate: parseFloat(data.commissionRate),
        }),
      });
    },
    onSuccess: () => {
      toast({
        title: "Request Sent Successfully",
        description: `Your representation request has been sent to ${artistName}.`,
      });
      setOpen(false);
      form.reset();
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ["/api/representation-requests"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error Sending Request",
        description: error.message || "Failed to send representation request.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: RepresentationRequestFormValues) => {
    sendRequestMutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <HandHeart className="h-5 w-5 text-brand-purple" />
            Send Representation Request to {artistName}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Information */}
            <Card className="border-brand-purple/20">
              <CardContent className="p-4 space-y-4">
                <h3 className="font-semibold text-brand-charcoal flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Representation Terms
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="exclusivity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Representation Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select representation type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="exclusive">Exclusive</SelectItem>
                            <SelectItem value="non-exclusive">Non-Exclusive</SelectItem>
                            <SelectItem value="regional">Regional Exclusive</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="commissionRate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-1">
                          <Percent className="h-3 w-3" />
                          Commission Rate (%)
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="0"
                            max="50"
                            step="0.1"
                            placeholder="25"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="proposedStartDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Proposed Start Date
                        </FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="proposedEndDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>End Date (Optional)</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Terms and Conditions */}
            <Card className="border-brand-gold/20">
              <CardContent className="p-4 space-y-4">
                <h3 className="font-semibold text-brand-charcoal">Proposed Terms</h3>
                
                <FormField
                  control={form.control}
                  name="terms"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Terms & Conditions (English)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Describe your gallery's terms, services, and what you offer to the artist..."
                          className="min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="termsAr"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>الشروط والأحكام (العربية)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="اكتب شروط معرضك وخدماتك وما تقدمه للفنان..."
                          className="min-h-[100px] text-right"
                          dir="rtl"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Personal Message */}
            <Card className="border-brand-purple/20">
              <CardContent className="p-4 space-y-4">
                <h3 className="font-semibold text-brand-charcoal flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Personal Message
                </h3>
                
                <FormField
                  control={form.control}
                  name="message"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Message to Artist (English)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Write a personal message explaining why you want to represent this artist..."
                          className="min-h-[80px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="messageAr"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>رسالة شخصية للفنان (العربية)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="اكتب رسالة شخصية توضح سبب رغبتك في تمثيل هذا الفنان..."
                          className="min-h-[80px] text-right"
                          dir="rtl"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Exclusivity Information */}
            <div className="bg-gradient-to-r from-brand-gold/10 to-brand-purple/10 p-4 rounded-lg">
              <h4 className="font-medium text-brand-charcoal mb-2">Representation Types:</h4>
              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Exclusive</Badge>
                  <span>Gallery has exclusive rights to represent the artist</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Non-Exclusive</Badge>
                  <span>Artist can work with multiple galleries</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">Regional</Badge>
                  <span>Exclusive representation in specific geographic region</span>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={sendRequestMutation.isPending}
                className="flex-1 bg-gradient-to-r from-brand-purple to-brand-gold text-white"
              >
                {sendRequestMutation.isPending ? "Sending..." : "Send Request"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}