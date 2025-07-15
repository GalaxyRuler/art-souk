/**
 * Simple QR Code Generator using HTTP APIs
 * This module provides QR code generation without requiring external npm packages
 */

const https = require('https');
const http = require('http');

/**
 * Generate QR code as base64 image using external APIs
 * @param {string} data - The data to encode in QR code
 * @param {number} size - Size of the QR code (default: 120)
 * @returns {Promise<string>} Base64 encoded PNG image
 */
async function generateQRCode(data, size = 120) {
  // Try multiple QR code services for reliability
  const services = [
    `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(data)}`,
    `https://chart.googleapis.com/chart?chs=${size}x${size}&cht=qr&chl=${encodeURIComponent(data)}`,
    `https://quickchart.io/qr?text=${encodeURIComponent(data)}&size=${size}`
  ];

  for (const url of services) {
    try {
      const response = await fetch(url);
      if (response.ok) {
        const buffer = await response.arrayBuffer();
        const base64 = Buffer.from(buffer).toString('base64');
        console.log(`✅ QR code generated successfully using: ${url.split('?')[0]}`);
        return base64;
      }
    } catch (error) {
      console.warn(`QR service failed: ${url.split('?')[0]}`, error.message);
    }
  }

  throw new Error('All QR code services failed');
}

/**
 * Generate QR code with ZATCA compliance data
 * @param {Object} invoiceData - Invoice data for ZATCA compliance
 * @returns {Promise<string>} Base64 encoded QR code image
 */
async function generateZATCAQRCode(invoiceData) {
  const {
    sellerName,
    vatNumber,
    timestamp,
    totalAmount,
    vatAmount,
    invoiceHash
  } = invoiceData;

  // Format ZATCA-compliant QR code data
  const qrData = [
    `1:${sellerName}`,
    `2:${vatNumber}`,
    `3:${timestamp}`,
    `4:${totalAmount}`,
    `5:${vatAmount}`,
    `6:${invoiceHash}`
  ].join('\n');

  return await generateQRCode(qrData, 120);
}

module.exports = {
  generateQRCode,
  generateZATCAQRCode
};