import dotenv from 'dotenv';
import fetch from 'node-fetch';

// Load environment variables
dotenv.config();

const CLIENT_ID = process.env.REDDIT_CLIENT_ID;
const CLIENT_SECRET = process.env.REDDIT_CLIENT_SECRET;
const USER_AGENT = process.env.REDDIT_USER_AGENT;

async function getAccessToken() {
  const basic = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64');
  
  const response = await fetch('https://www.reddit.com/api/v1/access_token', {
    method: 'POST',
    body: 'grant_type=client_credentials',
    headers: {
      'Authorization': `Basic ${basic}`,
      'Content-Type': 'application/x-www-form-urlencoded',
      'User-Agent': USER_AGENT
    }
  });

  const data = await response.json();
  return data.access_token;
}

async function getHotPosts() {
  try {
    // Get access token
    const accessToken = await getAccessToken();
    
    // Fetch hot posts
    const response = await fetch(
      'https://oauth.reddit.com/r/wallstreetbets/hot?limit=25',
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'User-Agent': USER_AGENT
        }
      }
    );

    const data = await response.json();
    
    // Format and display each post
    data.data.children.forEach((post, index) => {
      const postData = post.data;
      console.log('\n-------------------');
      console.log(`${index + 1}. ${postData.title}`);
      console.log(`Score: ${postData.score}`);
      console.log(`Comments: ${postData.num_comments}`);
      console.log(`Author: u/${postData.author}`);
      console.log(`Posted: ${new Date(postData.created_utc * 1000).toLocaleString()}`);
      console.log(`URL: ${postData.url}`);
      if (postData.selftext) {
        console.log(`\nText: ${postData.selftext.substring(0, 300)}${postData.selftext.length > 300 ? '...' : ''}`);
      }
    });

  } catch (error) {
    console.error('Error:', error.message);
    if (error.response) {
      const errorData = await error.response.text();
      console.error('API Error:', errorData);
    }
  }
}

// Run the function
getHotPosts();
