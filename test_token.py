import requests
import json

response = requests.post(
    'http://localhost:8000/token',
    data={'username': 'test_user', 'password': 'test_password'},
    headers={'Content-Type': 'application/x-www-form-urlencoded'}
)

print("Status Code:", response.status_code)
print("Headers:", json.dumps(dict(response.headers), indent=2))
print("Raw Text:", response.text)
print("\nJSON:", json.dumps(response.json(), indent=2))
