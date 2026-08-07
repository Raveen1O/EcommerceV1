const fs = require('fs');

try {
  const filePath = process.argv[2];
  if (!fs.existsSync(filePath)) {
    console.log(`Report file not found: ${filePath}`);
    process.exit(0);
  }
  
  const rawData = fs.readFileSync(filePath, 'utf8');
  let data;
  try {
    data = JSON.parse(rawData);
  } catch (e) {
    console.log(`Failed to parse Snyk report: ${e.message}`);
    console.log(`Raw output was: ${rawData.substring(0, 200)}...`);
    process.exit(1);
  }

  // Handle potential error messages from Snyk (e.g. auth failed)
  if (data.error) {
    console.error(`Snyk API Error: ${data.error}`);
    process.exit(1);
  }
  if (data.ok === false && !data.vulnerabilities) {
    console.error(`Snyk Test Failed. Raw Data: ${JSON.stringify(data)}`);
    process.exit(1);
  }

  const results = Array.isArray(data) ? data : [data];
  
  let critical = 0, high = 0, medium = 0, low = 0;
  
  results.forEach(res => {
    // SCA vulnerabilities
    if (res.vulnerabilities && Array.isArray(res.vulnerabilities)) {
      res.vulnerabilities.forEach(v => {
        const sev = (v.severity || '').toLowerCase();
        if (sev === 'critical') critical++;
        else if (sev === 'high') high++;
        else if (sev === 'medium') medium++;
        else if (sev === 'low') low++;
      });
    }
    
    // SAST (SARIF format) vulnerabilities
    if (res.runs && Array.isArray(res.runs)) {
      res.runs.forEach(run => {
        if (run.results && Array.isArray(run.results)) {
          run.results.forEach(result => {
            const level = (result.level || '').toLowerCase();
            // Map SARIF levels to severity
            if (level === 'error') high++;
            else if (level === 'warning') medium++;
            else if (level === 'note') low++;
            else low++;
          });
        }
      });
    }
  });

  const score = 100 - (critical * 10);
  
  console.log(`\n=== Security Scan Summary ===`);
  console.log(`Critical Vulnerabilities: ${critical}`);
  console.log(`High Vulnerabilities:     ${high}`);
  console.log(`Medium Vulnerabilities:   ${medium}`);
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
