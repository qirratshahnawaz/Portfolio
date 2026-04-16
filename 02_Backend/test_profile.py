from tools import get_profile
import asyncio

async def test():
    profile = get_profile()
    print(profile)

if __name__ == "__main__":
    asyncio.run(test())
