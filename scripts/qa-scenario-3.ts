import axios from 'axios';

const API_URL = 'http://localhost:3000';

async function runTests() {
    console.log('🚀 Starting Scenario 3: Error Handling Test...\n');

    try {
        console.log('🧪 [Scenario 3] Bad Gateway Test (Simulated Network Error)');
        // This request should fail because we modified the code to throw ECONNABORTED
        // Use a pair that is NOT cached to force API call
        const randomFrom = 'BRL';
        const randomTo = 'CNY';

        await axios.get(`${API_URL}/convert`, {
            params: { from: randomFrom, to: 'JPY', amount: '10' }
        });

        console.error('❌ Failed: Request succeeded but should have failed with 502.');
        process.exit(1);

    } catch (error: any) {
        if (error.response) {
            console.log(`   ✅ Received Status: ${error.response.status}`);
            console.log(`   Data:`, error.response.data);

            if (error.response.status === 502 && error.response.data.error.code === 'ERR_EXTERNAL_API_UNAVAILABLE') {
                console.log('✅ Scenario 3 Passed: Correct 502 and Error Code returned.\n');
            } else {
                console.error('❌ Failed: Unexpected status or error code.');
                process.exit(1);
            }
        } else {
            console.error('❌ Failed: Network error connecting to localhost (App crashed?).', error.message);
            process.exit(1);
        }
    }
}

runTests();
