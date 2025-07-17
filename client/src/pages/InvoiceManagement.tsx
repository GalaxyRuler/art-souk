import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';

export default function InvoiceManagement() {
  console.log('🔧 InvoiceManagement component is rendering');
  console.log('🔧 Component location:', window.location.pathname);
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Invoice Management - DEBUG MODE</CardTitle>
          </CardHeader>
          <CardContent>
            <p>✅ This is a simplified version of the Invoice Management page for debugging.</p>
            <p>✅ If you can see this, the route is working and the component is rendering correctly.</p>
            <p>✅ The complex functionality has been temporarily simplified to resolve routing issues.</p>
            <p>🔍 Current path: {window.location.pathname}</p>
            <p>⚡ Component successfully loaded and rendered</p>
          </CardContent>
        </Card>
      </div>
      <Footer />
    </div>
  );
}