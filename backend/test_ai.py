import asyncio 
import httpx 
async def test(): 
    async with httpx.AsyncClient() as client: 
        r = await client.post('http://127.0.0.1:8001/api/ai/orda/chat', json={'message': 'test', 'preferences': {}}) 
        print(r.status_code, r.text) 
asyncio.run(test()) 
