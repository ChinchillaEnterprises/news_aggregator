import puppeteer from 'puppeteer';
import { getAccessToken, getHotPosts } from './reddit.js';

async function scrapeRedditPost(url) {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  
  try {
    await page.goto(url, { waitUntil: 'networkidle0' });
    
    // Wait for the post content to load
    await page.waitForSelector('div[data-test-id="post-content"]', { timeout: 5000 });
    
    // Extract post content
    const content = await page.evaluate(() => {
      const postContent = document.querySelector('div[data-test-id="post-content"]');
      const comments = Array.from(document.querySelectorAll('div[data-testid="comment"]'))
        .slice(0, 5) // Get top 5 comments
        .map(comment => {
          const author = comment.querySelector('a[data-testid="comment_author"]')?.textContent || 'Unknown';
          const text = comment.querySelector('div[data-testid="comment-content"]')?.textContent || '';
          return `${author}: ${text}`;
        })
        .join('\n\n');
      
      return {
        title: document.querySelector('h1')?.textContent || '',
        content: postContent?.textContent || '',
        comments
      };
    });
    
    return content;
  } catch (error) {
    console.error(`Error scraping ${url}:`, error.message);
    return null;
  } finally {
    await browser.close();
  }
}

async function main() {
  try {
    // Get access token and fetch hot posts
    const accessToken = await getAccessToken();
    const posts = await getHotPosts('wallstreetbets', accessToken);
    
    // Sort posts by score and get top 3
    const top3Posts = posts
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);
    
    console.log('Scraping top 3 posts by score...\n');
    
    // Scrape each post
    for (const post of top3Posts) {
      console.log(`\n=== Processing post: ${post.title} ===`);
      console.log(`Score: ${post.score} | Comments: ${post.num_comments} | Author: u/${post.author}\n`);
      
      const scrapedContent = await scrapeRedditPost(post.url);
      
      if (scrapedContent) {
        console.log('Scraped Content:');
        console.log(scrapedContent.content || '[No content]');
        
        console.log('\nTop Comments:');
        console.log(scrapedContent.comments || '[No comments found]');
      } else {
        console.log('Failed to scrape content');
      }
      
      console.log('\n-------------------\n');
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

// Run the script
main();
