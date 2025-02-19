from langchain_anthropic import ChatAnthropic
import asyncio
from browser_use import Agent

async def main():
    agent = Agent(
        task="Visit https://www.reddit.com/r/wallstreetbets/comments/1isyn0e/rklb_106k_662k_started_buying_2_years_ago_took/ and retrieve most useful content",
        llm=ChatAnthropic(model_name='claude-3-5-sonnet-20240620', timeout=25, stop=None)
    )
    result = await agent.run()
    print(result)

if __name__ == '__main__':
    asyncio.run(main())
