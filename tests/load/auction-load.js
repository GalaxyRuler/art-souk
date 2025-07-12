import http from 'k6/http';
import ws from 'k6/ws';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('errors');

export let options = {
  stages: [
    { duration: '2m', target: 100 }, // Ramp up to 100 users
    { duration: '5m', target: 500 }, // Stay at 500 users
    { duration: '2m', target: 1000 }, // Peak at 1000 users
    { duration: '5m', target: 1000 }, // Maintain peak
    { duration: '2m', target: 0 }, // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<100'], // 95% of requests under 100ms
    errors: ['rate<0.1'], // Error rate under 10%
    ws_connecting: ['p(95)<1000'], // WebSocket connection under 1s
  },
};

const BASE_URL = 'http://localhost:5000';

export default function () {
  // Test HTTP API endpoints
  testAPIEndpoints();
  
  // Test WebSocket connections for real-time bidding
  testWebSocketBidding();
  
  sleep(1);
}

function testAPIEndpoints() {
  const endpoints = [
    '/api/auctions/live',
    '/api/artworks/featured',
    '/api/artists/featured',
    '/api/collections/featured'
  ];

  endpoints.forEach(endpoint => {
    const response = http.get(`${BASE_URL}${endpoint}`);
    
    const success = check(response, {
      'status is 200': (r) => r.status === 200,
      'response time < 100ms': (r) => r.timings.duration < 100,
      'response has data': (r) => r.body.length > 0,
    });
    
    if (!success) {
      errorRate.add(1);
    }
  });
}

function testWebSocketBidding() {
  const url = 'ws://localhost:5000/socket.io/?EIO=4&transport=websocket';
  
  const res = ws.connect(url, function (socket) {
    socket.on('open', function open() {
      console.log('WebSocket connected');
      
      // Join auction room
      socket.send(JSON.stringify({
        type: 'join_auction',
        auctionId: 1
      }));
    });

    socket.on('message', function message(data) {
      try {
        const parsed = JSON.parse(data);
        console.log('Received:', parsed.type);
      } catch (e) {
        // Ignore parsing errors for Socket.io protocol messages
      }
    });

    socket.on('close', function close() {
      console.log('WebSocket disconnected');
    });

    // Simulate placing bids
    setTimeout(() => {
      const bidAmount = Math.floor(Math.random() * 10000) + 1000;
      socket.send(JSON.stringify({
        type: 'place_bid',
        auctionId: 1,
        userId: `user_${Math.random()}`,
        amount: bidAmount,
        timestamp: new Date().toISOString()
      }));
    }, 2000);

    // Keep connection open for 10 seconds
    setTimeout(() => {
      socket.close();
    }, 10000);
  });

  check(res, {
    'WebSocket connection successful': (r) => r && r.status === 200,
  });
}

export function handleSummary(data) {
  return {
    'load-test-results.json': JSON.stringify(data, null, 2),
    'load-test-summary.html': htmlReport(data),
  };
}

function htmlReport(data) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
        <title>Art Souk Load Test Results</title>
        <style>
            body { font-family: Arial, sans-serif; margin: 40px; }
            .metric { margin: 20px 0; padding: 15px; border: 1px solid #ddd; }
            .pass { background-color: #d4edda; }
            .fail { background-color: #f8d7da; }
        </style>
    </head>
    <body>
        <h1>Art Souk Load Test Results</h1>
        <div class="metric ${data.metrics.http_req_duration.values.p95 < 100 ? 'pass' : 'fail'}">
            <h3>Response Time (95th percentile)</h3>
            <p>${data.metrics.http_req_duration.values.p95}ms</p>
            <p>Threshold: < 100ms</p>
        </div>
        <div class="metric ${data.metrics.errors.values.rate < 0.1 ? 'pass' : 'fail'}">
            <h3>Error Rate</h3>
            <p>${(data.metrics.errors.values.rate * 100).toFixed(2)}%</p>
            <p>Threshold: < 10%</p>
        </div>
        <div class="metric">
            <h3>Total Requests</h3>
            <p>${data.metrics.http_reqs.values.count}</p>
        </div>
    </body>
    </html>
  `;
}