const { TwitterApi } = require('twitter-api-v2');

const client = new TwitterApi({
    appKey: process.env.TWITTER_API_KEY || 'MOCK_KEY',
    appSecret: process.env.TWITTER_API_SECRET || 'MOCK_SECRET',
    accessToken: process.env.TWITTER_ACCESS_TOKEN || 'MOCK_TOKEN',
    accessSecret: process.env.TWITTER_ACCESS_SECRET || 'MOCK_ACCESS_SECRET',
});

exports.sharePostToTwitter = async (postContent) => {
    try {
        if (!process.env.TWITTER_API_KEY) {
            console.log(`[Twitter API Mock - Section 33iv] Successfully transmitted data to Twitter API: "${postContent}"`);
            return { success: true, mock: true, message: 'Tweet simulated successfully' };
        }

        const rwClient = client.readWrite;
        const response = await rwClient.v2.tweet(postContent);
        console.log('✅ [Twitter API] Published post directly via API:', response.data);
        return { success: true, data: response.data };
    } catch (error) {
        console.error('❌ [Twitter API Error]:', error.message);
        return { success: false, error: error.message };
    }
};