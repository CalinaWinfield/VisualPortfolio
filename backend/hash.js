const bcrypt = require("bcrypt");

(async () => {
  const password = "TestPass123!";   // ← change this to whatever you want
  const hash = await bcrypt.hash(password, 10);
  console.log("Hash:", hash);
})();