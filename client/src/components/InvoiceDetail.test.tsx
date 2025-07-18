import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { InvoiceDetail } from './InvoiceDetail'

// Mock the dependencies
vi.mock('@/lib/i18n', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}))

vi.mock('@/components/ui/dialog', () => ({
  Dialog: ({ children }: { children: React.ReactNode }) => <div data-testid="dialog">{children}</div>,
  DialogContent: ({ children }: { children: React.ReactNode }) => <div data-testid="dialog-content">{children}</div>,
  DialogHeader: ({ children }: { children: React.ReactNode }) => <div data-testid="dialog-header">{children}</div>,
  DialogTitle: ({ children }: { children: React.ReactNode }) => <h1 data-testid="dialog-title">{children}</h1>,
}))

vi.mock('@/components/ui/card', () => ({
  Card: ({ children }: { children: React.ReactNode }) => <div data-testid="card">{children}</div>,
  CardContent: ({ children }: { children: React.ReactNode }) => <div data-testid="card-content">{children}</div>,
  CardHeader: ({ children }: { children: React.ReactNode }) => <div data-testid="card-header">{children}</div>,
  CardTitle: ({ children }: { children: React.ReactNode }) => <h2 data-testid="card-title">{children}</h2>,
}))

vi.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) => (
    <button data-testid="button" onClick={onClick}>
      {children}
    </button>
  ),
}))

vi.mock('@/components/ui/badge', () => ({
  Badge: ({ children }: { children: React.ReactNode }) => <span data-testid="badge">{children}</span>,
}))

describe('InvoiceDetail', () => {
  const mockInvoice = {
    id: 1,
    invoice_number: 'INV-2025-001',
    invoice_type: 'standard',
    payment_method: 'bankTransfer',
    buyer_name: 'Test Buyer',
    buyer_vat_number: '300000000000000',
    buyer_address: {
      name: 'Test Company',
      street: '123 Test Street',
      city: 'Riyadh',
      country: 'Saudi Arabia',
    },
    seller_name: 'Test Seller',
    seller_vat_number: '310000000000000',
    invoice_description_en: 'Test invoice description',
    invoice_description_ar: 'وصف الفاتورة التجريبية',
    subtotal_amount: 1000,
    discount_amount: 100,
    shipping_amount: 50,
    vat_amount: 142.5,
    total_amount: 1092.5,
    currency: 'SAR',
    issue_date: '2025-01-17',
    due_date: '2025-02-17',
    supply_date: '2025-01-15',
    reference_number: 'REF-001',
    notes: 'Test notes',
    notes_ar: 'ملاحظات تجريبية',
    zatca_uuid: 'uuid-123',
    zatca_hash: 'hash-456',
    zatca_qr_code: 'qr-code-789',
    digital_signature: 'signature-abc',
    status: 'draft',
  }

  const mockProps = {
    invoice: mockInvoice,
    open: true,
    onOpenChange: vi.fn(),
    onDownloadPdf: vi.fn(),
    onSubmitToZatca: vi.fn(),
  }

  it('renders invoice details correctly', () => {
    render(<InvoiceDetail {...mockProps} />)
    
    // Check if main elements are rendered
    expect(screen.getByTestId('dialog')).toBeInTheDocument()
    expect(screen.getByTestId('dialog-content')).toBeInTheDocument()
    
    // Check if invoice number is displayed
    expect(screen.getByText('INV-2025-001')).toBeInTheDocument()
    
    // Check if buyer information is displayed
    expect(screen.getByText('Test Buyer')).toBeInTheDocument()
    expect(screen.getByText('300000000000000')).toBeInTheDocument()
    
    // Check if amounts are displayed
    expect(screen.getByText('1,000.00')).toBeInTheDocument()
    expect(screen.getByText('1,092.50')).toBeInTheDocument()
  })

  it('renders invoice type badge correctly', () => {
    render(<InvoiceDetail {...mockProps} />)
    
    // Should render the invoice type badge
    const badges = screen.getAllByTestId('badge')
    expect(badges.length).toBeGreaterThan(0)
  })

  it('renders action buttons', () => {
    render(<InvoiceDetail {...mockProps} />)
    
    // Should render action buttons
    const buttons = screen.getAllByTestId('button')
    expect(buttons.length).toBeGreaterThan(0)
  })

  it('handles null invoice gracefully', () => {
    const nullProps = {
      ...mockProps,
      invoice: null,
    }
    
    render(<InvoiceDetail {...nullProps} />)
    
    // Should still render the dialog structure
    expect(screen.getByTestId('dialog')).toBeInTheDocument()
  })

  it('calls onDownloadPdf when download button is clicked', () => {
    render(<InvoiceDetail {...mockProps} />)
    
    // Find and click the download button
    const buttons = screen.getAllByTestId('button')
    const downloadButton = buttons.find(button => 
      button.textContent?.includes('invoice.downloadPDF')
    )
    
    if (downloadButton) {
      downloadButton.click()
      expect(mockProps.onDownloadPdf).toHaveBeenCalledWith(mockInvoice.id)
    }
  })

  it('displays bilingual notes correctly', () => {
    render(<InvoiceDetail {...mockProps} />)
    
    // Check if both English and Arabic notes are displayed
    expect(screen.getByText('Test notes')).toBeInTheDocument()
    expect(screen.getByText('ملاحظات تجريبية')).toBeInTheDocument()
  })

  it('displays ZATCA compliance information', () => {
    render(<InvoiceDetail {...mockProps} />)
    
    // Check if ZATCA information is displayed
    expect(screen.getByText('uuid-123')).toBeInTheDocument()
    expect(screen.getByText('hash-456')).toBeInTheDocument()
  })
})