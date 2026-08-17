import http from 'http';

const req = http.request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/leaves',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    }
}, (res) => {
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
        console.log("Response Status:", res.statusCode);
        console.log("Response Data:", data);
        process.exit(0);
    });
});

req.on('error', (err) => {
    console.error("HTTP error:", err.message);
    process.exit(1);
});

req.write(JSON.stringify({}));
req.end();
