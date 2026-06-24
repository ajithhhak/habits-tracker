const fs = require('fs');
const path = require('path');

function walk(d) {
  let r = [];
  fs.readdirSync(d).forEach(f => {
    f = path.join(d, f);
    const s = fs.statSync(f);
    if (s && s.isDirectory()) {
      r = r.concat(walk(f));
    } else {
      if (f.endsWith('.tsx')) r.push(f);
    }
  });
  return r;
}

const files = walk('./src/app');
files.forEach(f => {
  let c = fs.readFileSync(f, 'utf8');
  if (c.includes('import { Text } from "@/components/CustomText"')) return;
  
  c = c.replace(/import\s+{([^}]*)\bText\b([^}]*)}\s+from\s+['"]react-native['"];/g, (m, p1, p2) => {
    let n = (p1 + p2).split(',').map(s => s.trim()).filter(Boolean).join(', ');
    if (n) {
      return `import { ${n} } from 'react-native';\nimport { Text } from '@/components/CustomText';`;
    } else {
      return `import { Text } from '@/components/CustomText';`;
    }
  });
  
  // also handle single quotes vs double quotes
  c = c.replace(/import { Text } from '@\/components\/CustomText';/g, 'import { Text } from "@/components/CustomText";');
  
  fs.writeFileSync(f, c);
});
console.log('Done replacing Text imports.');
