#!/usr/bin/env python3
"""
QR Code Generator for ZATCA-compliant invoices
Generates QR codes with ZATCA-required data and outputs base64-encoded images
"""

import qrcode
import base64
import sys
import json
from io import BytesIO
from PIL import Image

def generate_qr_code(data, size=150):
    """
    Generate QR code from data and return as base64-encoded PNG
    
    Args:
        data (str): The data to encode in the QR code
        size (int): Size of the QR code image (default: 150x150)
    
    Returns:
        str: Base64-encoded PNG image
    """
    try:
        # Create QR code instance
        qr = qrcode.QRCode(
            version=1,  # Controls the size of the QR code
            error_correction=qrcode.constants.ERROR_CORRECT_L,
            box_size=10,
            border=4,
        )
        
        # Add data to QR code
        qr.add_data(data)
        qr.make(fit=True)
        
        # Create QR code image
        img = qr.make_image(fill_color="black", back_color="white")
        
        # Resize image to specified size
        img = img.resize((size, size), Image.Resampling.LANCZOS)
        
        # Convert to base64
        buffer = BytesIO()
        img.save(buffer, format='PNG')
        buffer.seek(0)
        
        # Encode as base64
        img_base64 = base64.b64encode(buffer.getvalue()).decode('utf-8')
        
        return img_base64
        
    except Exception as e:
        print(f"Error generating QR code: {e}", file=sys.stderr)
        return None

def main():
    """Main function to handle command line arguments"""
    if len(sys.argv) < 2:
        print("Usage: python generate_qr.py <data> [size]", file=sys.stderr)
        sys.exit(1)
    
    data = sys.argv[1]
    size = int(sys.argv[2]) if len(sys.argv) > 2 else 150
    
    # Generate QR code
    qr_base64 = generate_qr_code(data, size)
    
    if qr_base64:
        # Output as JSON for easy parsing
        result = {
            "success": True,
            "qr_code": qr_base64,
            "format": "PNG",
            "encoding": "base64",
            "size": f"{size}x{size}"
        }
        print(json.dumps(result))
    else:
        result = {
            "success": False,
            "error": "Failed to generate QR code"
        }
        print(json.dumps(result))
        sys.exit(1)

if __name__ == "__main__":
    main()