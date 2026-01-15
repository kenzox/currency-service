import axios from 'axios';
import { exec } from 'child_process';
import util from 'util';

const execAsync = util.promisify(exec);
const API_URL = 'http://localhost:3000';
const REDIS_CONTAINER = 'currency-service-redis-1';

async function runTests() {
    console.log('🚀 Starting Currency Service QA Tests...\n');

    // --- SCENARIO 1: PRECISION ---
    try {
        console.log('🧪 [Scenario 1] Precision Test');
        const amount = '0.00000001';
        console.log(`   Sending request with amount: ${amount}`);

        const res = await axios.get(`${API_URL}/convert`, {
            params: { from: 'USD', to: 'EUR', amount }
        });

        const data = res.data.data;
        console.log('   Response Data:', JSON.stringify(data));

        if (typeof data.amount !== 'string' || typeof data.result !== 'string') {
            throw new Error('❌ Failed: Amount or Result is not a string.');
        }

        if (data.amount !== amount) {
            throw new Error(`❌ Failed: Amount mismatch. Expected ${amount}, got ${data.amount}`);
        }

        // Check for scientific notation or weird floating point
        if (data.result.includes('e-') || data.result.length < 5) {
            console.warn('   ⚠️ Warning: Result might be in scientific notation or too short, check manually: ' + data.result);
        }

        console.log('✅ Scenario 1 Passed: Precision maintained, types are string.\n');

    } catch (error: any) {
        console.error('❌ [Scenario 1] Failed:', error.message);
        if (error.response) console.error(error.response.data);
        process.exit(1);
    }

    // --- SCENARIO 2: HYBRID CACHE ---
    try {
        console.log('🧪 [Scenario 2] Hybrid Cache (Redis + In-Memory)');

        // A. Prime Cache
        console.log('   🔄 (A) Priming cache with Redis UP...');
        await axios.get(`${API_URL}/convert`, { params: { from: 'USD', to: 'GBP', amount: '10' } });
        console.log('   ✅ Cache primed.');

        // B. Stop Redis
        console.log(`   🛑 (B) Stopping Redis container (${REDIS_CONTAINER})...`);
        await execAsync(`docker stop ${REDIS_CONTAINER}`);
        console.log('   ✅ Redis stopped.');

        // Wait for potential connection timeout/logic
        await new Promise(r => setTimeout(r, 2000));

        // C. Request with Redis DOWN
        console.log('   🔄 (C) Sending request while Redis is DOWN...');
        const start = Date.now();
        const res = await axios.get(`${API_URL}/convert`, {
            params: { from: 'USD', to: 'GBP', amount: '10' }
        });
        const duration = Date.now() - start;

        console.log(`   ✅ Response received! Status: ${res.status}`);
        console.log(`   ⏱️ Duration: ${duration}ms (Should be fast if In-Memory)`);
        console.log(`   Data: ${res.data.data.result}`);

        if (res.status !== 200) {
            throw new Error(`❌ Failed: Status is ${res.status}, expected 200 from Fallback.`);
        }

        console.log('✅ Scenario 2 Passed: In-Memory Fallback worked.\n');

    } catch (error: any) {
        console.error('❌ [Scenario 2] Failed:', error.message);
        if (error.response) console.error(error.response.data);
        // Don't exit yet, need to restart redis
    } finally {
        console.log('   🔄 Restoring Redis...');
        await execAsync(`docker start ${REDIS_CONTAINER}`);
        console.log('   ✅ Redis restarted.');
    }
}

runTests();
