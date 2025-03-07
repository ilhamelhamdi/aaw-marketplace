import requests
import random
import concurrent.futures

# Base URLs for the APIs
login_url = "http://localhost:8001/api/login"
product_url = "http://localhost:8002/api/product"

# Login credentials
login_data = {
    "username": "admin",
    "password": "Admin123"
}

# Function to login and retrieve the token
def get_token():
    response = requests.post(login_url, json=login_data)
    response.raise_for_status()
    return response.json()["token"]

# Function to generate product data
def generate_product_data(product_id):
    return {
        "name": f"Baju {product_id}",
        "description": f"Baju {product_id}",
        "price": random.randint(1, 1000) * 1000,
        "quantity_available": 147483647,
        "category_id": "d44c95d8-cb28-4ff3-a5f3-ea22f07bdacf"
    }

# Function to send a POST request for a given product ID with the token in the header
def register_product(product_id, token):
    try:
        product_data = generate_product_data(product_id)
        headers = {"Authorization": f"Bearer {token}"}
        response = requests.post(product_url, json=product_data, headers=headers)
        if product_id % 100 == 0:
            print(f"Product {product_id}: {response.status_code}")
            print(f"Product {product_id}: Done")
    except Exception as e:
        pass
    
# Main function to execute the script
def main():
    token = get_token()
    with concurrent.futures.ThreadPoolExecutor(max_workers=10) as executor:
        executor.map(register_product, range(1001, 10001), [token]*1000)

if __name__ == "__main__":
    main()