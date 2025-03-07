import http from 'k6/http';
import { check, sleep, group } from 'k6';


// Configuration
const BASE_URL = {
  auth: 'http://localhost:8001',
  product: 'http://localhost:8002',
  order: 'http://localhost:8004',
  wishlist: 'http://localhost:8005'
};

// Traffic data
type TrafficData = { duration: string, rate: number };
const trafficData = JSON.parse(open('./traffic.json')) as TrafficData[];

// User configuration
const TOTAL_USERS = 10000;
const ACTIVE_USERS = 10;

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
    http_req_duration: ['p(95)<500']
  }
};


// Helper functions
const randomIntBetween = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const randomItem = (arr: any[]) => arr[Math.floor(Math.random() * arr.length)];

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
    const res = http.post(`${BASE_URL.auth}/api/login`, payload, {
      headers: { 'Content-Type': 'application/json' }
    });

    // Check if the request was successful
    if (!res || res.status !== 200) {
      // console.warn(`Login failed for user ${user.username}: Status ${res?.status}`);
      return null;
    }

    // Check if the token is present
    const token = res.json('token');
    if (!token) {
      // console.warn(`No token received for user ${user.username}`);
      return null;
    }

    return token;
  } catch (error) {
    // console.error(`Login request failed for user ${user.username}:`, error);
    return null;
  }
};

const getRandomProducts = (params) => {
  try {
    const productsRes = http.get(`${BASE_URL.product}/api/product`, params);
    if (!productsRes || productsRes.status !== 200) {
      // console.warn('Failed to retrieve products');
      return [];
    }

    const products = productsRes.json('products') as any[];
    if (!products || products.length === 0) {
      // console.warn('No products available');
      return [];
    }

    const numProducts = 1;
    return Array.from({ length: numProducts }, () => randomItem(products));
  } catch (error) {
    // console.error('Failed to fetch products:', error);
    return [];
  }
};

// Main scenarios
export default function () {
  const currentUser = getRandomUser();

  group('Ordering Flow', () => {
    // 1. Authenticate
    const authToken = login(currentUser);
    if (!authToken) {
      // console.warn('Skipping ordering flow due to failed login');
      return; // Exit the group if login fails
    }

    const params = {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`
      }
    };

    // 2. Get random products
    const selectedProducts = getRandomProducts(params);
    if (selectedProducts.length === 0) {
      // console.warn('Skipping ordering flow due to no products available');
      return; // Exit the group if no products are available
    }

    // 3. Cart operations
    type CartItem = { product: any, quantity: number };
    let cartItems: CartItem[] = [];
    for (const product of selectedProducts) {
      const quantity = randomIntBetween(1, 3);
      const payload = JSON.stringify({
        product_id: product.id,
        quantity: quantity
      });

      try {
        const res = http.post(`${BASE_URL.order}/api/cart`, payload, params);
        if (!res || res.status !== 201) {
          // console.warn(`Failed to add product ${product.id} to cart`);
          continue; // Skip to the next product if this one fails
        }
        cartItems.push({ product, quantity });
      } catch (error) {
        // console.error(`Failed to add product ${product.id} to cart:`, error);
      }
    }

    // 4. View cart
    try {
      const cart = http.get(`${BASE_URL.order}/api/cart`, params);
      if (!cart || cart.status !== 200) {
        // console.warn('Failed to view cart');
      }
    } catch (error) {
      // console.error('Failed to view cart:', error);
    }

    // 5. Place order
    try {
      const orderPayload = JSON.stringify({
        shipping_provider: 'GRAB_EXPRESS'
      });

      const orderRes = http.post(`${BASE_URL.order}/api/order`, orderPayload, params);
      if (!orderRes || orderRes.status !== 201) {
        // console.warn('Failed to place order');
        return; // Exit if order placement fails
      }

      // 6. Payment or cancellation
      if (Math.random() < 0.7) { // 70% payment, 30% cancellation
        const paymentPayload = JSON.stringify({
          payment_method: 'BANK_TRANSFER',
          payment_reference: `PAY-${Date.now()}`,
          amount: orderRes.json('order.total_amount')
        });

        const paymentRes = http.post(
          `${BASE_URL.order}/api/order/${orderRes.json('order.id')}/pay`,
          paymentPayload,
          params
        );
        if (!paymentRes || paymentRes.status !== 200) {
          // console.warn('Payment failed');
        }
      } else {
        const cancelRes = http.post(
          `${BASE_URL.order}/api/order/${orderRes.json('order.id')}/cancel`,
          null,
          params
        );
        if (!cancelRes || cancelRes.status !== 200) {
          // console.warn('Cancellation failed');
        }
      }
    } catch (error) {
      // console.error('Order placement failed:', error);
    }
  });

}
