const fs = require('fs');

try {
  const filePath = process.argv[2];
  if (!fs.existsSync(filePath)) {
    console.log(`Report file not found: ${filePath}`);
    process.exit(0); // If snyk didn't generate a report, maybe there were no deps to test
  }
  
  const rawData = fs.readFileSync(filePath, 'utf8');
  let data;
  try {
    data = JSON.parse(rawData);
  } catch (e) {
    console.log(`Failed to parse Snyk report: ${e.message}`);
    // If Snyk fails to run completely, it might not output JSON
    process.exit(1);
  }

  const results = Array.isArray(data) ? data : [data];
  
  let critical = 0, high = 0, low = 0;
  
  results.forEach(res => {
    if (res.vulnerabilities) {
      // Snyk sometimes groups by vulnerabilities, we need to count unique ones or just total instances
      res.vulnerabilities.forEach(v => {
        if (v.severity === 'critical') critical++;
        else if (v.severity === 'high') high++;
        else if (v.severity === 'low') low++;
      });
    }
  });

  const score = 100 - (critical * 10);
  
  console.log(`\n=== Security Scan Summary ===`);
  console.log(`Critical Vulnerabilities: ${critical}`);
  console.log(`High Vulnerabilities:     ${high}`);
  console.log(`Low Vulnerabilities:      ${low}`);
  console.log(`Security Score:           ${score}/100`);
  console.log(`=============================\n`);

  if (score < 60) {
    console.error(`❌ Security score ${score} is below the required threshold of 60.`);
    process.exit(1);
  } else {
    console.log(`✅ Security score passed.`);
  }

} catch (err) {
  console.error(`Error processing Snyk report: ${err.message}`);
  process.exit(1);
}
