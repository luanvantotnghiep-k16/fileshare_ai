import fetch from "node-fetch";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001";

async function register(email, password, firstName, lastName) {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email,
      password,
      confirmPassword: password,
      firstName,
      lastName
    })
  });
  return res.json();
}

async function login(email, password) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  });
  return res.json();
}

async function uploadFile(token, fileName, recipientEmail, password, expirationDate) {
  const formData = new FormData();
  formData.append("file", new Blob(["dummy content"], { type: "text/plain" }), fileName);
  formData.append("recipientEmail", recipientEmail);
  formData.append("password", password);
  formData.append("expirationDate", expirationDate);
  const res = await fetch(`${API_BASE}/file/upload`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData
  });
  return res.json();
}

async function getReceivedFiles(token) {
  const res = await fetch(`${API_BASE}/file/list/receive`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.json();
}

(async () => {
  // Register Account A
  const emailA = `testA_${Date.now()}@mail.com`;
  const emailB = `testB_${Date.now()}@mail.com`;
  const password = "Test1234!";
  await register(emailA, password, "Alice", "A");
  await register(emailB, password, "Bob", "B");

  // Login Account A
  const loginA = await login(emailA, password);
  const tokenA = loginA.token;

  // Upload file from A to B
  const uploadRes = await uploadFile(tokenA, "testfile.txt", emailB, password, "2099-12-31");
  console.log("Upload result:", uploadRes);

  // Login Account B
  const loginB = await login(emailB, password);
  const tokenB = loginB.token;

  // Get received files for B
  const received = await getReceivedFiles(tokenB);
  console.log("Received files for B:", received);
})();
