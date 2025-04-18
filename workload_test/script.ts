import http from 'k6/http';
import { check, sleep, group } from 'k6';

// Configuration
const BASE_URL = 'http://ec2-184-72-146-176.compute-1.amazonaws.com'

// Traffic data
type TrafficData = { duration: string, rate: number };
const trafficData = JSON.parse(open('./traffic.json')) as TrafficData[];

// User configuration
const TOTAL_USERS = 1500;

const PRE_DEFINED_PRODUCT_ID = '6f4f8224-e1b8-49de-97f0-c6ab09b07cb9';
const PRE_DEFINED_PRODUCT_QUANTITY = 1;


export const options = {
  scenarios: {
    order_flow: {
      executor: 'ramping-arrival-rate',
      startRate: 0,
      timeUnit: '1s',
      preAllocatedVUs: 50,
      maxVUs: 1000,
      gracefulStop: '5s',
      stages: trafficData.map(({ duration, rate }) => ({
        target: rate,
        duration: duration
      }))
    }
  },
  thresholds: {
    http_req_failed: ['rate<0.01'],
    http_req_duration: ['p(95)<1000']
  }
};


// Helper functions
const randomIntBetween = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

const getRandomUser = () => {
  const userId = randomIntBetween(1, TOTAL_USERS);
  return {
    username: `user${userId}`,
    email: `user${userId}@gmail.com`,
    password: `UserUser${userId}`
  };
};

const login = (user) => {
  const payload = JSON.stringify({
    username: user.username,
    password: user.password
  });

  try {
    const res = http.post(`${BASE_URL}/api/auth/login`, payload, {
      headers: { 'Content-Type': 'application/json' }
    });

    if (res.status === 200) {
      return res.json('token');
    } else {
      console.warn(`Login failed for user ${user.username} (VU ${__VU}): Status ${res.status}`);
      return null;
    }
  } catch (error) {
    console.error(`Login request failed for user ${user.username} (VU ${__VU}):`, error);
    return null;
  }
};

export default function () {
  const currentUser = getRandomUser();

  group('Ordering Flow (Simplified)', () => {
    // 1. Authenticate with the VU-specific user
    const authToken = login(currentUser);
    if (!authToken) {
      console.warn(`Skipping ordering flow for user ${currentUser.username} (VU ${__VU}) due to failed login`);
      return;
    }

    const authHeaders = {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`
      }
    };

    // 2. Add the pre-defined product to the cart
    const addToCartPayload = JSON.stringify({
      product_id: PRE_DEFINED_PRODUCT_ID,
      quantity: PRE_DEFINED_PRODUCT_QUANTITY
    });

    try {
      const res = http.post(`${BASE_URL}/api/cart`, addToCartPayload, authHeaders);
      if (!res || res.status !== 201) {
        console.warn(`Failed to add product ${PRE_DEFINED_PRODUCT_ID} to cart for user ${currentUser.username} (VU ${__VU})`);
        return;
      }
    } catch (error) {
      console.error(`Failed to add product ${PRE_DEFINED_PRODUCT_ID} to cart for user ${currentUser.username} (VU ${__VU}):`, error);
      return;
    }

    // 3. Place order
    try {
      const orderPayload = JSON.stringify({
        shipping_provider: 'GRAB_EXPRESS'
      });

      const orderRes = http.post(`${BASE_URL}/api/order`, orderPayload, authHeaders);
      if (!orderRes || orderRes.status !== 201) {
        console.warn(`Failed to place order for user ${currentUser.username} (VU ${__VU})`);
        return; // Exit if order placement fails
      }
      check(orderRes, { 'Order placed successfully': (res) => res.status === 201 });
      console.log(`Order placed successfully for user ${currentUser.username} (VU ${__VU}), Order ID: ${orderRes.json('order.id')}`);

    } catch (error) {
      console.error(`Order placement failed for user ${currentUser.username} (VU ${__VU}):`, error);
    }
  });
}