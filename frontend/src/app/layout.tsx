import type { Metadata } from "next";
import { CopilotKit } from "@copilotkit/react-core"; 
import "@copilotkit/react-ui/styles.css";

export const metadata: Metadata = {
  title: "Health Care Agent",
  description: "A Next.js app for a health care agent using CopilotKit, AG-UI and Agno.",
};

export default function RootLayout({ children }: {children: React.ReactNode}) {
  return (
    <html lang="en">
      <body>

        <CopilotKit 
          runtimeUrl="/api/copilotkit" 
          agent="agno_agent"
        >
          {children}
        </CopilotKit>
      </body>
    </html>
  );
}




