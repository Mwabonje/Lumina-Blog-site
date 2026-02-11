import { createClient } from '@insforge/sdk';

const insforgeUrl = 'https://gn9nuyhp.us-west.insforge.app';
const insforgeKey = 'ik_81d379bb6924e4821faeae92696bb105';

const insforge = createClient({
    baseUrl: insforgeUrl,
    anonKey: insforgeKey,
});

async function verify() {
    console.log("Attempting to verify user: ringa.michael@gmail.com");
    try {
        const { error } = await insforge.auth.verifyEmail({
            email: 'ringa.michael@gmail.com',
            otp: '375935'
        });

        if (error) {
            console.error("Verification failed:", error.message);
        } else {
            console.log("User successfully verified!");
        }
    } catch (err) {
        console.error("Error:", err);
    }
}

verify();
