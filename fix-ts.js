const fs = require('fs');
const filePath = 'd:\\Dev\\DATTCNPM\\smart-rental-platform\\apps\\web\\node_modules\\@smart-rental\\shared\\node_modules\\typescript\\lib\\lib.dom.d.ts';
let content = fs.readFileSync(filePath, 'utf8');

if (content.includes('import { toast } from "react-hot-toast";')) {
  content = content.replace('import { toast } from "react-hot-toast";\n', '');
}
if (content.includes('import { toast } from \'react-hot-toast\';')) {
  content = content.replace('import { toast } from \'react-hot-toast\';\n', '');
}
content = content.replace(/toast\.error\(/g, 'alert(');
content = content.replace(/toast\.success\(/g, 'alert(');
content = content.replace(/toast\(/g, 'alert(');

fs.writeFileSync(filePath, content, 'utf8');
console.log('Fixed lib.dom.d.ts');
