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

async function getHotPosts(subreddit, accessToken) {
  const response = await fetch(
    `https://oauth.reddit.com/r/${subreddit}/hot?limit=10`,
    {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'User-Agent': USER_AGENT
      }
    }
  );

  const data = await response.json();
  return data.data.children.map(post => ({
    title: post.data.title,
    permalink: post.data.permalink,
    subreddit: post.data.subreddit,
    score: post.data.score,
    num_comments: post.data.num_comments,
    author: post.data.author,
    created_utc: post.data.created_utc,
    upvote_ratio: post.data.upvote_ratio,
    url: `https://reddit.com${post.data.permalink}`,
    content: post.data.selftext || '[No post content]'
  }));
}

async function main() {
  try {
    const accessToken = await getAccessToken();
    const subreddit = 'wallstreetbets';
    
    console.log(`\nFetching top 10 hot posts from r/${subreddit}...\n`);
    
    const posts = await getHotPosts(subreddit, accessToken);
    
    posts.forEach((post, index) => {
      console.log(`\n=== ${index + 1}. ${post.title} ===`);
      console.log(`Score: ${post.score} | Comments: ${post.num_comments} | Author: u/${post.author}`);
      console.log(`Upvote Ratio: ${post.upvote_ratio} | URL: ${post.url}`);
      if (post.content !== '[No post content]') {
        console.log('\nContent:', post.content);
      }
      console.log('\n-------------------');
    });

  } catch (error) {
    console.error('Error:', error.message);
    if (error.response) {
      console.error('API Error:', await error.response.text());
    }
  }
}

// Export functions for use in other files
export { getAccessToken, getHotPosts };

// Run the script if called directly
if (process.argv[1] === new URL(import.meta.url).pathname) {
  main();
}
