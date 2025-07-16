# Saudi National Address Implementation Guide

## Overview
This document outlines the implementation of the Saudi National Address system in the Art Souk shipping management platform, based on the official Saudi Arabia National Address guidelines.

## Saudi National Address Format

### Required Components
The Saudi National Address system requires the following mandatory fields:

1. **Building Number** - 4 unique numbers representing the building (e.g., "1234")
2. **Street Name** - Name of the street where the main entrance is located (e.g., "King Fahd Road")
3. **Secondary Number** - 4 numbers representing exact coordinates of the building location (e.g., "5678")
4. **District/Neighborhood** - Name of the district where the building is located (e.g., "Al-Olaya")
5. **Postal Code** - 5-digit number with geographical significance (e.g., "12345")
6. **City** - The city where the National Address is located (e.g., "Riyadh")

### Optional Components
- **Short Address Code** - 4 letters + 4 numbers format (e.g., "RRRD2929")
  - Format: XXXX#### where X = letters, # = numbers
  - Provides 1 square meter accuracy

## Implementation Details

### Database Schema Updates
The `shipping_profiles` table `address` JSONB field now supports:

```json
{
  "buildingNumber": "1234",
  "streetName": "King Fahd Road", 
  "secondaryNumber": "5678",
  "district": "Al-Olaya",
  "postalCode": "12345",
  "city": "Riyadh",
  "shortAddressCode": "RRRD2929",
  "country": "Saudi Arabia",
  "street": "Building 123, King Fahd Road",
  "state": "Riyadh Province"
}
```

### Form Validation
- Building Number: 4 digits exactly, pattern `[0-9]{4}`
- Street Name: Required text field
- Secondary Number: 4 digits exactly, pattern `[0-9]{4}`
- District: Required text field
- Postal Code: 5 digits exactly, pattern `[0-9]{5}`
- City: Required selection from Saudi cities
- Short Address Code: Optional, 8 characters, pattern `[A-Z]{4}[0-9]{4}`

### UI Components
- Comprehensive form with visual indicators for required fields
- Input validation with real-time feedback
- Clear formatting guidelines for users
- Professional blue-themed design highlighting compliance requirements

## Compliance Benefits
1. **Regulatory Compliance** - Meets Saudi government requirements
2. **Delivery Accuracy** - Precise location identification
3. **Government Services** - Required for official transactions
4. **International Shipping** - Recognized by global courier services
5. **Business Operations** - Mandatory for company registration

## Address Format Example
```
AHMED MOHAMMAD
Premium Art Studio
1234 King Fahd Road
5678 Al-Olaya District
12345 Riyadh
SAUDI ARABIA
```

## Short Address Example
```
RRRD2929
```

## Integration Points
- Shipping profile management forms
- Order delivery address validation
- Invoice generation compliance
- Carrier integration systems
- Customer communication

## Future Enhancements
- Integration with Gov.sa API for address verification
- Real-time postal code validation
- Google Maps integration for location confirmation
- Automated address suggestions based on partial input