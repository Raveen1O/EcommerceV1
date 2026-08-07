const fs = require('fs');
const path = require('path');

const dir = 'c:/Users/ravee/Desktop/Ecommerce/EcommerceV1/frontend/src/components';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.js'));

const oldFooterRegex = /<div className="footer-col">\s*<h4>SUPPORT<\/h4>\s*<a href="#">Contact Us<\/a>\s*<a href="#">Shipping &(?:amp;)? Returns<\/a>\s*<a href="#">Store Locator<\/a>\s*<\/div>\s*<div className="footer-col"[^>]*>\s*<h4>LEGAL<\/h4>\s*<a href="#">Privacy Policy<\/a>\s*<a href="#">Terms of Service<\/a>\s*<\/div>/g;

const newFooter = `<div className="footer-col">
              <h4>EXPLORE</h4>
              <a href="#">Collections</a>
              <a href="#">New Arrivals</a>
              <a href="/store-locator">Store Locator</a>
           </div>
           <div className="footer-col">
              <h4>ASSISTANCE</h4>
              <a href="/shipping-returns">Shipping &amp; Returns</a>
              <a href="/privacy-policy">Privacy Policy</a>
              <a href="/terms-of-service">Terms of Service</a>
           </div>`;

files.forEach(f => {
  const filepath = path.join(dir, f);
  const content = fs.readFileSync(filepath, 'utf8');
  if (oldFooterRegex.test(content)) {
    const updated = content.replace(oldFooterRegex, newFooter);
    fs.writeFileSync(filepath, updated, 'utf8');
    console.log('Updated', f);
  }
});
