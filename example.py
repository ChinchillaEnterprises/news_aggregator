from langchain_anthropic import ChatAnthropic
import asyncio
from browser_use import Agent

async def main():
    agent = Agent(
        task="Go to https://www.aibase.com/ and scrape the 'hot video' section and return in json",
        llm=ChatAnthropic(model_name='claude-3-5-sonnet-20240620', timeout=25, stop=None)
    )
    result = await agent.run()
    print(result)

if __name__ == '__main__':
    asyncio.run(main())
