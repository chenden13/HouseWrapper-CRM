const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
console.log('--- Starting CRM Setup ---');
const crmDir = 'C:\\car-shop-projects\\car-shop-crm';
const pageFile = path.join(crmDir, 'src', 'components', 'AccessorySettlementPage.tsx');
const appFile = path.join(crmDir, 'src', 'App.tsx');
fs.mkdirSync(path.dirname(pageFile), { recursive: true });
