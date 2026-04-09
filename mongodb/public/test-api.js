// Test file to verify API connectivity
const API_BASE_URL = 'http://localhost:5000/api/users';

// Test GET
fetch(API_BASE_URL)
  .then(res => res.json())
  .then(data => console.log('GET Users:', data))
  .catch(err => console.error('GET Error:', err));

// Test POST
const testUser = {
  name: 'John Doe',
  email: 'john@example.com',
  age: 25,
  hobbies: 'Reading',
  bio: 'Test user'
};

fetch(API_BASE_URL, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(testUser)
})
  .then(res => {
    console.log('POST Status:', res.status);
    return res.json();
  })
  .then(data => console.log('POST Response:', data))
  .catch(err => console.error('POST Error:', err));
