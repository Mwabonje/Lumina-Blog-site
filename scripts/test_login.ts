import { createClient } from '@insforge/sdk';

const insforgeUrl = 'https://gn9nuyhp.us-west.insforge.app';
const insforgeKey = 'ik_81d379bb6924e4821faeae92696bb105';

const insforge = createClient({
    baseUrl: insforgeUrl,
    anonKey: insforgeKey,
});

async function testLogin() {
    const email = 'ringa.michael@gmail.com';
    const password = 'kanzuru//0705';

    console.log(`Testing login for: ${email}`);
    try {
        const { data, error } = await insforge.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            console.error("Login failed:", error.message);
        } else {
            console.log("Login successful! User ID:", data.user.id);
            console.log("Testing database access...");
            const { data: posts, error: dbError } = await insforge.database
                .from('posts')
                .select('count', { count: 'exact', head: true });

            if (dbError) {
                console.error("Database access failed:", dbError.message);
            } else {
                console.log("Database access successful!");
            }
        }
    } catch (err) {
        console.error("Error:", err);
    }
}

testLogin();
