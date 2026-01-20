import type {
  AgentRunRequest,
  AgentRunResponse,
  RunStatus,
  RunStep,
} from "@/lib/types";

// Simulated delay helper
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Mock responses based on output format
const mockResponses: Record<string, Partial<AgentRunResponse>> = {
  plan: {
    title: "Strategic Action Plan",
    summary:
      "A comprehensive plan has been generated based on your goals and context. This plan outlines key phases, milestones, and actionable steps to achieve your objective efficiently.",
    sections: [
      {
        heading: "Phase 1: Foundation",
        content: [
          "Conduct initial research and gather requirements",
          "Define success metrics and KPIs",
          "Assemble core team and assign responsibilities",
          "Set up communication channels and workflows",
        ],
      },
      {
        heading: "Phase 2: Development",
        content: [
          "Create detailed project timeline with milestones",
          "Begin iterative development cycles",
          "Implement feedback loops for continuous improvement",
          "Document progress and learnings",
        ],
      },
      {
        heading: "Phase 3: Launch & Review",
        content: [
          "Prepare launch checklist and contingencies",
          "Execute soft launch with limited audience",
          "Gather feedback and iterate",
          "Full rollout with monitoring in place",
        ],
      },
    ],
  },
  checklist: {
    title: "Action Checklist",
    summary:
      "Your goal has been broken down into actionable items. Complete each task in order for best results.",
    sections: [
      {
        heading: "Preparation",
        content: [
          "Review all available resources and documentation",
          "Clear your schedule for focused work",
          "Set up your workspace and tools",
          "Notify relevant stakeholders",
        ],
      },
      {
        heading: "Execution",
        content: [
          "Complete the primary objective first",
          "Handle secondary tasks in priority order",
          "Document any blockers or issues",
          "Request help if stuck for more than 30 minutes",
        ],
      },
      {
        heading: "Follow-up",
        content: [
          "Review completed work for quality",
          "Update relevant documentation",
          "Share results with stakeholders",
          "Schedule next steps if needed",
        ],
      },
    ],
  },
  email: {
    title: "Email Draft",
    summary:
      "A professional email draft has been generated based on your context and tone preferences.",
    sections: [
      {
        heading: "Subject Line",
        content: ["Re: Follow-up on Our Recent Discussion"],
      },
      {
        heading: "Email Body",
        content: [
          "Dear [Recipient],",
          "I hope this message finds you well. Following up on our recent conversation, I wanted to provide you with a comprehensive update on the progress we've made.",
          "We have successfully completed the initial phases and are now moving forward with implementation. The team has been working diligently to ensure we meet our agreed-upon timelines.",
          "Please let me know if you have any questions or would like to schedule a call to discuss further.",
          "Best regards,",
          "[Your Name]",
        ],
      },
    ],
  },
  summary_actions: {
    title: "Summary & Action Items",
    summary:
      "Your input has been analyzed and distilled into a clear summary with specific action items.",
    sections: [
      {
        heading: "Executive Summary",
        content: [
          "The primary objective focuses on achieving measurable outcomes within the defined constraints.",
          "Key success factors have been identified and prioritized.",
          "Resource allocation has been optimized for maximum efficiency.",
        ],
      },
      {
        heading: "Immediate Actions",
        content: [
          "Schedule kickoff meeting with all stakeholders",
          "Finalize resource allocation and budget approval",
          "Create project timeline with key milestones",
        ],
      },
      {
        heading: "Next Steps",
        content: [
          "Review and approve proposed action items",
          "Assign owners to each action item",
          "Set up progress tracking and reporting",
        ],
      },
    ],
  },
};

// Generate unique ID
const generateId = () => Math.random().toString(36).substring(2, 15);

// Simulate agent run with progress updates
export async function simulateMockAgentRun(
  request: AgentRunRequest,
  onProgress: (status: RunStatus) => void,
  signal?: AbortSignal
): Promise<AgentRunResponse> {
  const steps: RunStep[] = [
    "validating",
    "calling",
    "generating",
    "finalizing",
    "complete",
  ];

  // Simulate each step with delays
  for (let i = 0; i < steps.length - 1; i++) {
    // Check if aborted
    if (signal?.aborted) {
      throw new Error("Agent run was cancelled");
    }

    onProgress({
      currentStep: steps[i],
      progress: ((i + 1) / steps.length) * 100,
    });
    await delay(800 + Math.random() * 400);
  }

  // Check if aborted before final step
  if (signal?.aborted) {
    throw new Error("Agent run was cancelled");
  }

  // Simulate occasional errors (10% chance)
  if (Math.random() < 0.1) {
    onProgress({
      currentStep: "error",
      progress: 0,
      error: {
        message: "Agent encountered an unexpected error. Please try again.",
        code: "AGENT_ERROR",
      },
    });
    throw new Error("Agent encountered an unexpected error. Please try again.");
  }

  const mockData = mockResponses[request.outputFormat] || mockResponses.plan;

  const response: AgentRunResponse = {
    runId: generateId(),
    status: "success",
    title: mockData.title!,
    summary: mockData.summary!,
    sections: mockData.sections!,
    warnings: request.constraints?.length
      ? ["Some constraints may affect the scope of recommendations"]
      : undefined,
    confidence: 0.85 + Math.random() * 0.1,
    createdAt: new Date().toISOString(),
  };

  onProgress({
    currentStep: "complete",
    progress: 100,
  });

  return response;
}
