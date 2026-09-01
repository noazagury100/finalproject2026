const { TwitterApi } = require('twitter-api-v2');

const client = new TwitterApi({
    appKey: process.env.TWITTER_API_KEY || 'MOCK_API_KEY',
    appSecret: process.env.TWITTER_API_SECRET || 'MOCK_API_SECRET',
    accessToken: process.env.TWITTER_ACCESS_TOKEN || 'MOCK_ACCESS_TOKEN',
    accessSecret: process.env.TWITTER_ACCESS_SECRET || 'MOCK_ACCESS_SECRET',
});

exports.sharePostToTwitter = async (postText) => {
    try {
        if (!process.env.TWITTER_API_KEY) {
            console.log(`[Twitter API Mock] Successfully tweeted: "${postText}"`);
            return { success: true, mock: true, message: 'Tweet simulated successfully' };
        }

        const rwClient = client.readWrite;
        const response = await rwClient.v2.tweet(postText);
        console.log('✅ Tweeted successfully to Twitter API:', response.data);
        return { success: true, data: response.data };
    } catch (error) {
        console.error('❌ Twitter API Error:', error.message);
        return { success: false, error: error.message };
    }
};