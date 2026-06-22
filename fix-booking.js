const fs = require('fs');
const filePath = 'd:\\Dev\\DATTCNPM\\smart-rental-platform\\apps\\web\\components\\tenant\\BookingModal.tsx';
let content = fs.readFileSync(filePath, 'utf8');

content = content.replace('getCurrentUser().then(user => {', 'const userPromise = getCurrentUser();\n      if (userPromise) {\n        userPromise.then(user => {');
content = content.replace('}).catch(err => console.error("Could not fetch user info for phone number", err));', '}).catch(err => console.error("Could not fetch user info for phone number", err));\n      }');

fs.writeFileSync(filePath, content, 'utf8');
console.log('Fixed BookingModal');
