import requests
import concurrent.futures

# Base URL for the API
url = "http://ec2-184-72-146-176.compute-1.amazonaws.com/api/auth/register"

# Function to generate user data
def generate_user_data(user_id):
    return {
        "username": f"user{user_id}",
        "email": f"user{user_id}@gmail.com",
        "password": f"UserUser{user_id}",
        "full_name": f"User{user_id}",
        "address": "Blablabla",
        "phone_number": "081234567890"
    }

# Function to send a POST request for a given user ID
def register_user(user_id):
    try:
        user_data = generate_user_data(user_id)
        requests.post(url, json=user_data)
        if user_id % 100 == 0:
            print(f"User {user_id}: Done")
        # print(f"User {user_id}: {response.status_code}")
    except Exception as e:
        pass
        # print(f"User {user_id}: {e}")

# Use ThreadPoolExecutor to send requests concurrently
with concurrent.futures.ThreadPoolExecutor(max_workers=10) as executor:
    executor.map(register_user, range(1, 2001))