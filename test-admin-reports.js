import axios from 'axios';

const testAdminReports = async () => {
    try {
        // Login as admin
        const loginRes = await axios.post('http://localhost:3000/api/v1/auth/login', {
            email: 'admin@unitlink.com',
            password: 'password123' // Adjust if password is different
        });
        
        const token = loginRes.data.token;
        console.log('Logged in as admin, token acquired');
        
        // Get reports
        const reportsRes = await axios.get('http://localhost:3000/api/v1/reports/', {
            headers: { Authorization: `Bearer ${token}` }
        });
        
        console.log('Admin saw reports:', reportsRes.data.results);
        reportsRes.data.data.forEach((r: any) => {
            console.log(`- ${r.staffName}: ${r.reportType} (${r.status})`);
        });
        
    } catch (err: any) {
        console.error('Error:', err.response?.data || err.message);
    }
};

testAdminReports();
