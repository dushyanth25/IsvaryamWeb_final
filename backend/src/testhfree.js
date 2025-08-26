// jwt-test.js
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

// Load environment variables from .env
dotenv.config();

const secret = process.env.JWT_SECRET;

if (!secret) {
  console.error("❌ JWT_SECRET is missing from .env file!");
  process.exit(1);
}

// Step 1: Create a sample payload
const payload = {
  id: "64c3fa6ab2e8f8f92d8e0c1a",
  email: "test@example.com",
  isAdmin: false
};

// Step 2: Sign a token
const token = jwt.sign(payload, secret, { expiresIn: '1h' });
console.log("✅ Generated Token:\n", token);

// Step 3: Verify the token
try {
  const decoded = jwt.verify(token, secret);
  console.log("✅ Decoded Payload:\n", decoded);
} catch (err) {
  console.error("❌ Verification failed:", err.message);
}
