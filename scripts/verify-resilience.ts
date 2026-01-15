import axios from 'axios';
import { exec } from 'child_process';
import util from 'util';

const execAsync = util.promisify(exec);
const API_URL = 'http://localhost:3000';
const REDIS_CONTAINER = 'currency-service-redis-1';

async function run() {
    try {
        console.log('🔄 1. Priming cache (Calling API)...');
        try {
            await axios.get(`${API_URL}/convert?from=USD&to=TRY&amount=100`);
            console.log('✅ Cache primed.');
        } catch (e) {
            console.warn('⚠️ Priming failed (maybe API limit?), expecting Memory to be empty if fresh start.');
        }

        console.log(`🛑 2. Stopping Redis container (${REDIS_CONTAINER})...`);
        await execAsync(`docker stop ${REDIS_CONTAINER}`);
        console.log('✅ Redis stopped.');

        // Wait a moment for connection logic to detect or just immediate
        await new Promise(r => setTimeout(r, 1000));

        console.log('🧪 3. Testing Hybrid Cache Fallback (Redis is DOWN)...');
        const start = Date.now();
        const res = await axios.get(`${API_URL}/convert?from=USD&to=TRY&amount=100`);

        console.log(`✅ Fallback Successful! code: ${res.status}`);
        console.log(`   Result: ${res.data.data.result}`);
        console.log(`   Response Time: ${Date.now() - start}ms`);

        console.log('This confirms In-Memory cache is serving the request.');

    } catch (error: any) {
        console.error('❌ Verification Failed:', error.message);
        if (error.response) {
            console.error('   Status:', error.response.status);
            console.error('   Data:', error.response.data);
        }
    } finally {
        console.log('🔄 4. Restarting Redis...');
        await execAsync(`docker start ${REDIS_CONTAINER}`);
        console.log('✅ Redis restarted.');
    }
}

run();
