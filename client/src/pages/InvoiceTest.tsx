import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';

export default function InvoiceTest() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Invoice Test Page</CardTitle>
          </CardHeader>
          <CardContent>
            <p>This is a simple test page to debug the routing issue.</p>
            <p>If you can see this page, the routing is working correctly.</p>
          </CardContent>
        </Card>
      </div>
      <Footer />
    </div>
  );
}
