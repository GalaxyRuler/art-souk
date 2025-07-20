# Art Souk Development Tools Guide

## Overview
This guide provides comprehensive development tools and workflows for the Art Souk platform, designed to work within the current environment constraints.

## Custom Development Tools

### 1. QR Code Generation System
- **Location**: `server/qrGenerator.js`
- **Features**: 
  - Multiple QR service providers (QR Server, Google Charts, QuickChart)
  - ZATCA-compliant QR code generation
  - Automatic fallback between services
  - Base64 encoding for PDF integration

**Usage**:
```javascript
const { generateQRCode, generateZATCAQRCode } = require('./qrGenerator');

// Basic QR code
const qrBase64 = await generateQRCode('Your data here');

// ZATCA-compliant QR code
const zatcaQR = await generateZATCAQRCode({
  sellerName: 'Art Souk',
  vatNumber: '300000000000003',
  timestamp: new Date().toISOString(),
  totalAmount: '1000.00',
  vatAmount: '150.00',
  invoiceHash: 'abc123...'
});
```

### 2. Performance Monitoring System
- **Location**: `server/performanceMonitor.js`
- **Features**:
  - Request performance tracking
  - Memory usage monitoring
  - System health reporting
  - Slow endpoint detection

**Endpoints**:
- `/health/performance` - Performance metrics
- `/api/dev/report` - Comprehensive development report
- `/api/dev/benchmark/:endpoint` - Benchmark any endpoint

### 3. Development Tools Suite
- **Location**: `server/devTools.js`
- **Features**:
  - Database health checking
  - Codebase analysis
  - File watching
  - Quality checks
  - Automated reporting

## Quick Start Commands

### Test QR Code Generation
```bash
curl "http://localhost:3000/api/test/qr"
```

### Get Performance Report
```bash
curl "http://localhost:3000/health/performance"
```

### Generate Development Report
```bash
curl "http://localhost:3000/api/dev/report"
```

### Benchmark an Endpoint
```bash
curl "http://localhost:3000/api/dev/benchmark/health?iterations=10"
```

## Development Workflow

### 1. Start Development Session
1. Check system health: `curl localhost:3000/health/performance`
2. Generate development report: `curl localhost:3000/api/dev/report`
3. Review memory usage and performance metrics

### 2. Test QR Code System
1. Test basic QR generation: `curl localhost:3000/api/test/qr`
2. Test ZATCA invoice generation via Collector Dashboard
3. Verify QR code appears in PDF downloads

### 3. Monitor Performance
1. Use `/health/performance` to monitor request metrics
2. Watch for high memory usage alerts in logs
3. Use benchmark endpoints to test critical paths

### 4. Quality Assurance
1. Run quality checks via development report
2. Monitor database health
3. Check codebase statistics

## Workarounds for Package Installation Issues

Since external packages can't be installed due to workspace protocol conflicts, we've implemented:

1. **QR Code Generation**: Multiple HTTP-based QR services
2. **Performance Monitoring**: Built-in Node.js APIs
3. **Development Tools**: Custom file system and process utilities
4. **Testing**: HTTP-based endpoint testing
5. **Quality Checks**: Static analysis and health monitoring

## Key Features Without External Dependencies

### QR Code System
- ✅ ZATCA-compliant QR generation
- ✅ Multiple service providers for reliability
- ✅ Base64 encoding for PDF integration
- ✅ Error handling with fallbacks

### Performance Monitoring
- ✅ Request timing and memory tracking
- ✅ Slow endpoint detection
- ✅ System health reporting
- ✅ Automated alerts for high resource usage

### Development Tools
- ✅ Database connectivity testing
- ✅ Codebase analysis and statistics
- ✅ File change monitoring
- ✅ Automated quality reporting

## Integration Points

### PDF Invoice System
The QR code generator integrates with the ZATCA invoice system in `server/routes.ts`:
- ZATCA-compliant data encoding
- Automatic QR code embedding in PDFs
- Multiple service fallbacks for reliability

### Performance Monitoring
Integrated throughout the application:
- Request middleware for timing
- Memory monitoring on each request
- Automated garbage collection triggers
- Health endpoint monitoring

### Development Workflow
- Real-time performance tracking
- Automated quality checks
- Comprehensive reporting
- Benchmark testing for critical paths

## Troubleshooting

### QR Code Issues
1. Check `/api/test/qr` endpoint
2. Verify multiple QR services are accessible
3. Test ZATCA data formatting
4. Check PDF generation logs

### Performance Issues
1. Monitor `/health/performance` endpoint
2. Check memory usage patterns
3. Identify slow endpoints
4. Review request timing metrics

### Development Issues
1. Use `/api/dev/report` for comprehensive analysis
2. Check database connectivity
3. Monitor file system changes
4. Review quality check results

This comprehensive system provides professional development tools without requiring external package installations, working within the current environment constraints while maintaining high quality and reliability standards.
