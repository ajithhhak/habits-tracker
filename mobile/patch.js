const fs = require('fs');

const dir1 = 'c:/habitflow/mobile/node_modules/expo-modules-autolinking';
const dir2 = 'c:/habitflow/mobile/node_modules/expo-modules-core';

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(function(file) {
        file = dir + '/' + file;
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) { 
            results = results.concat(walk(file));
        } else if (file.endsWith('.kt')) {
            results.push(file);
        }
    });
    return results;
}

const files = [...walk(dir1), ...walk(dir2)];

for (const file of files) {
    let content = fs.readFileSync(file, 'utf8');
    let changed = false;
    
    if (content.includes('org.gradle.internal.extensions.core.extra')) {
        content = content.replace(/import org\.gradle\.internal\.extensions\.core\.extra\r?\n/g, '');
        content = content.replace(/\bproject\.extra\.set\b/g, 'project.extensions.extraProperties.set');
        content = content.replace(/\bproject\.extra\.get\b/g, 'project.extensions.extraProperties.get');
        content = content.replace(/\bextra\.set\b/g, 'extensions.extraProperties.set');
        content = content.replace(/\bextra\.get\b/g, 'extensions.extraProperties.get');
        content = content.replace(/\bextra\.setIfNotExist\b/g, 'extensions.extraProperties.setIfNotExist');
        content = content.replace(/\bextra\.has\b/g, 'extensions.extraProperties.has');
        changed = true;
    }
    
    if (content.includes('org.gradle.internal.cc.base.logger')) {
        content = content.replace(/import org\.gradle\.internal\.cc\.base\.logger\r?\n/g, '');
        content = content.replace(/\blogger\.error\b/g, 'println');
        content = content.replace(/\blogger\.quiet\b/g, 'println');
        changed = true;
    }
    
    if (changed) {
        fs.writeFileSync(file, content);
        console.log('Patched ' + file);
    }
}
