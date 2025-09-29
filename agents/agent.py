from agno.agent.agent import Agent
from agno.models.google import Gemini
from agno.os.interfaces.agui import AGUI
from agno.os import AgentOS
from dotenv import load_dotenv

# Load environment variables from a .env file
load_dotenv()

chat_agent = Agent(name="Health Care Assistant", 
              model=Gemini(id="gemini-2.0-flash"), 
              instructions="An AI agent to assist with health care related queries.",
            )

agent_os = AgentOS(agents=[chat_agent], interfaces=[AGUI(agent=chat_agent)])
app = agent_os.get_app()

if __name__ == "__main__":
    agent_os.serve(app="agent:app", reload=True)

    