// Simple script to test the signup API endpoint
// Run with: node test-signup.js

async function testSignup() {
  console.log('🚀 Testing Signup API...');

  // Random email to avoid unique constraint errors on repeated runs
  const email = `test.user.${Date.now()}@example.com`;
  
  const payload = {
    name: "Test User",
    email: email,
    password: "SecurePassword123!",
    role: "ADMIN"
  };

  try {
    const response = await fetch('http://localhost:3000/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    
    console.log(`\nStatus: ${response.status} ${response.statusText}`);
    console.log('Response:', JSON.stringify(data, null, 2));
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.log('Ensure the Next.js server is running on http://localhost:3000');
  }
}

testSignup();