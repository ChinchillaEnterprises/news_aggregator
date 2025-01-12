"""
FastAPI app for browser-use functionality.
"""

import asyncio
from typing import Optional

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from browser_use.browser.browser import Browser, BrowserConfig

app = FastAPI()

# Add CORS middleware to allow requests from the Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3003"],  # Frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class RenderRequest(BaseModel):
    url: str

class RenderResponse(BaseModel):
    content: str
    error: Optional[str] = None

@app.post("/render", response_model=RenderResponse)
async def render_page(request: RenderRequest):
    try:
        print(f"Received request to render URL: {request.url}")
        
        # Initialize browser with headless mode and security disabled
        config = BrowserConfig()
        config.headless = True
        config.disable_security = True
        config.new_context_config.wait_for_network_idle_page_load_time = 2.0  # Increase wait time
        config.new_context_config.maximum_wait_page_load_time = 10.0  # Increase max wait time
        
        print("Initializing browser...")
        browser = Browser(config)
        context = await browser.new_context()

        try:
            print(f"Navigating to {request.url}...")
            await context.navigate_to(request.url)
            
            print("Getting page HTML...")
            await context._wait_for_page_and_frames_load()  # Ensure page is fully loaded
            html = await context.get_page_html()
            print(f"HTML length: {len(html)}")
            
            print("Closing browser...")
            await browser.close()

            print("Returning response...")
            return RenderResponse(content=html)
        except Exception as e:
            await browser.close()
            raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
