import {
  CopilotRuntime,
  ExperimentalEmptyAdapter,
  copilotRuntimeNextJSAppRouterEndpoint,
} from "@copilotkit/runtime";

import { AgnoAgent } from "@ag-ui/agno"
import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";

// 1. You can use any service adapter here for multi-agent support. We use
//    the empty adapter since we're only using one agent.
const serviceAdapter = new ExperimentalEmptyAdapter();

// 3. Build a Next.js API route that handles the CopilotKit runtime requests.
export const POST = async (req: NextRequest) => {
  try {
    // Get the user session
    const session = await auth.api.getSession({ headers: req.headers });
    const userId = session?.user?.id || "default-user-id";
    
    console.log("CopilotKit Request - User ID:", userId);
    
    // 2. Create the CopilotRuntime instance with user-specific context
    const runtime = new CopilotRuntime({
      agents: {
        // Our FastAPI endpoint URL with user context
        "agno_agent": new AgnoAgent({
          url: process.env.AGENT_BACKEND_URL || "http://localhost:8000/agui",
          // Pass user context as headers
          headers: {
            "X-User-Id": userId,
            "X-User-Name": session?.user?.name || "User"
          }
        }),
      }
    });

    const { handleRequest } = copilotRuntimeNextJSAppRouterEndpoint({
      runtime, 
      serviceAdapter,
      endpoint: "/api/copilotkit",
    });

    return handleRequest(req);
  } catch (error) {
    console.error('CopilotKit Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: errorMessage }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};