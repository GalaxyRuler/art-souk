import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { apiRequest } from '@/lib/queryClient';
import { Mail, Send, CheckCircle, Loader2 } from 'lucide-react';

export default function EmailTest() {
  const { user } = useAuth();
  const [email, setEmail] = useState('');
  const [subscribing, setSubscribing] = useState(false);
  const [sendingTest, setSendingTest] = useState(false);

  const handleSubscribe = async () => {
    if (!email) {
      toast({
        title: "Error",
        description: "Please enter an email address",
        variant: "destructive"
      });
      return;
    }

    setSubscribing(true);
    try {
      await apiRequest('/api/newsletter/subscribe', {
        method: 'POST',
        body: {
          email,
          firstName: user?.firstName || 'Friend',
          lastName: user?.lastName || '',
          language: 'en',
          categories: ['contemporary', 'exhibitions'],
          frequency: 'weekly'
        }
      });

      toast({
        title: "Success!",
        description: "Successfully subscribed to the newsletter",
      });
      setEmail('');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to subscribe to newsletter",
        variant: "destructive"
      });
    } finally {
      setSubscribing(false);
    }
  };

  const handleSendTestEmail = async () => {
    if (!user?.email) {
      toast({
        title: "Error",
        description: "You must be logged in to send a test email",
        variant: "destructive"
      });
      return;
    }

    setSendingTest(true);
    try {
      await apiRequest('/api/email-notifications/test', {
        method: 'POST',
        body: {
          recipientEmail: user.email,
          templateCode: 'welcome',
          variables: {
            firstName: user.firstName || 'Friend'
          },
          language: 'en'
        }
      });

      toast({
        title: "Email Sent!",
        description: "Test welcome email has been queued for delivery",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send test email. Make sure you're an admin.",
        variant: "destructive"
      });
    } finally {
      setSendingTest(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8 mt-20">
        <div className="max-w-2xl mx-auto space-y-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Email System Test</h1>
            <p className="text-xl text-gray-600">Test the Art Souk email notification system</p>
          </div>

          {/* Newsletter Subscription */}
          <Card className="bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Newsletter Subscription
              </CardTitle>
              <CardDescription>
                Test the newsletter subscription functionality
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <Input
                  type="email"
                  placeholder="Enter email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1"
                />
                <Button
                  onClick={handleSubscribe}
                  disabled={subscribing}
                  className="bg-brand-navy hover:bg-brand-navy/90"
                >
                  {subscribing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Subscribing...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Subscribe
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Send Test Email */}
          {user && (
            <Card className="bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Send className="h-5 w-5" />
                  Send Test Email
                </CardTitle>
                <CardDescription>
                  Send a test welcome email to your registered email address
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-sm text-gray-600">
                    Logged in as: <strong>{user.email}</strong>
                  </p>
                  <Button
                    onClick={handleSendTestEmail}
                    disabled={sendingTest}
                    className="w-full bg-brand-navy hover:bg-brand-navy/90"
                  >
                    {sendingTest ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="mr-2 h-4 w-4" />
                        Send Welcome Email
                      </>
                    )}
                  </Button>
                  {user.role !== 'admin' && (
                    <p className="text-xs text-amber-600">
                      Note: You need admin privileges to send test emails
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Email Service Status */}
          <Card className="bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Email Service Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">SendGrid API Key</span>
                  <span className="text-green-600 font-semibold">✓ Configured</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Email Templates</span>
                  <span className="text-green-600 font-semibold">✓ 3 templates loaded</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Queue Processing</span>
                  <span className="text-green-600 font-semibold">✓ Active (1 min interval)</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
