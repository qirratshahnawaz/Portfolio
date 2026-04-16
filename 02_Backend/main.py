from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse, Response, StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
import logging
from chatkit.server import StreamingResult

# Import the new ChatKit server
from server import PortfolioChatServer

# Set up logging
from logging_config import get_logger
logger = get_logger(__name__)

app = FastAPI(title="Portfolio AI Twin API")

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.middleware("http")
async def log_requests(request: Request, call_next):
    logger.info(f"Incoming: {request.method} {request.url.path}")
    response = await call_next(request)
    logger.info(f"Outgoing Status: {response.status_code}")
    return response

# Initialize the one-and-only ChatKit server
chatkit_server = PortfolioChatServer()

@app.get("/")
async def root():
    return {"message": "Portfolio AI Twin API is Online", "status": "running"}

@app.post("/chatkit")
@app.post("//chatkit")
@app.post("/api/chatkit")
@app.post("//api/chatkit")
async def chatkit_endpoint(request: Request) -> Response:
    """ Unified endpoint for ChatKit Handshake, Session, and Messages. """
    logger.info(f"ChatKit request received at path: {request.url.path}")
    try:
        payload = await request.body()
        # The 'context' can store user info or headers
        result = await chatkit_server.process(payload, {"request": request})

        if isinstance(result, StreamingResult):
            return StreamingResponse(result, media_type="text/event-stream")
        
        # Non-streaming responses (e.g., control messages or data updates)
        if hasattr(result, "json"):
            return Response(content=result.json, media_type="application/json")
            
        return JSONResponse(result)
    except Exception as e:
        logger.error(f"ChatKit Endpoint Error: {str(e)}")
        return JSONResponse({"error": "Failed to process ChatKit request"}, status_code=500)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)