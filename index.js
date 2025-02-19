import dotenv from 'dotenv';
import fetch from 'node-fetch';
import axios from 'axios';

// Load environment variables
dotenv.config();

const CLIENT_ID = process.env.REDDIT_CLIENT_ID;
const CLIENT_SECRET = process.env.REDDIT_CLIENT_SECRET;
const USER_AGENT = process.env.REDDIT_USER_AGENT;
const PERPLEXITY_API_KEY = process.env.PERPLEXITY_API_KEY;

const SUBREDDITS = ['wallstreetbets', 'stocks', 'finance', 'investing'];

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
    `https://oauth.reddit.com/r/${subreddit}/hot?limit=1`,
    {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'User-Agent': USER_AGENT
      }
    }
  );

  const data = await response.json();
  // Only return the first post
  const firstPost = data.data.children[0];
  return [{
    title: firstPost.data.title,
    permalink: firstPost.data.permalink,
    subreddit: firstPost.data.subreddit
  }];
}

async function getPostContent(post, accessToken) {
  // Fetch post content and comments using Reddit API
  const response = await fetch(
    `https://oauth.reddit.com${post.permalink}`,
    {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'User-Agent': USER_AGENT
      }
    }
  );
  
  const data = await response.json();
  
  // Extract post content
  const postData = data[0].data.children[0].data;
  
  // Extract top comments, filtering out non-comment entries
  const comments = data[1].data.children
    .filter(c => c.kind === 't1')
    .slice(0, 3)
    .map(c => c.data);
    
  return {
    title: postData.title,
    content: postData.selftext || '[No post content]',
    url: `https://reddit.com${post.permalink}`,
    comments: comments.map(c => ({
      author: c.author,
      text: c.body,
      score: c.score
    }))
  };
}

async function analyzeWithPerplexity(content) {
  const commentsText = content.comments
    .map(c => `Comment by u/${c.author} (Score: ${c.score}):
${c.text}`)
    .join('\n\n');

  const prompt = `Below is the content of a Reddit post and its top comments. Please analyze only this provided content:

TITLE: ${content.title}
CONTENT: ${content.content}

TOP COMMENTS:
${commentsText}

Based on ONLY the content provided above, please:
1. Summarize the main points and claims from the post
2. Analyze the key insights from the provided comments
3. Fact-check any significant claims using reliable sources

Note: Focus solely on analyzing the content provided above, not on searching for or referencing other sources.`;

  try {
    const response = await axios.post(
      'https://api.perplexity.ai/chat/completions',
      {
        model: 'sonar-pro',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.1,
        max_tokens: 2048
      },
      {
        headers: {
          'Authorization': `Bearer ${PERPLEXITY_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return response.data.choices[0].message.content;
  } catch (error) {
    console.error(`Error analyzing with Perplexity: ${error.message}`);
    return null;
  }
}

async function main() {
  try {
    const accessToken = await getAccessToken();
    
    // Only get one post from each subreddit
    for (const subreddit of SUBREDDITS) {
      console.log(`\n=== Analyzing top post from r/${subreddit} ===\n`);
      
      const posts = await getHotPosts(subreddit, accessToken);
      const post = posts[0]; // Get only the first post
      
      console.log(`Fetching content for: ${post.title}`);
      const content = await getPostContent(post, accessToken);
      
      console.log('Post content retrieved. Analyzing with Perplexity...\n');
      const analysis = await analyzeWithPerplexity(content);
      
      if (analysis) {
        console.log('Perplexity Analysis:');
        console.log(analysis);
        console.log('\n-------------------\n');
      }
    }

  } catch (error) {
    console.error('Error:', error.message);
    if (error.response) {
      const errorData = await error.response.text();
      console.error('API Error:', errorData);
    }
  }
}

// Run the script
main();
