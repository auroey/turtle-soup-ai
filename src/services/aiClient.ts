import type { AiRequest, AiResponse } from "../types/story";

const validAnswers = new Set(["是", "不是", "是也不是", "无关"]);
const labelByAnswer = {
  是: "yes",
  不是: "no",
  是也不是: "both",
  无关: "irrelevant",
} as const;

export async function askAi(request: AiRequest): Promise<AiResponse> {
  const apiUrl = import.meta.env.VITE_AI_API_URL as string | undefined;

  if (!apiUrl || apiUrl.includes("your-api.example.com")) {
    return mockAiResponse(request);
  }

  const response = await fetch(apiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    throw new Error(`AI API failed with ${response.status}`);
  }

  const data = (await response.json()) as Partial<AiResponse>;
  return normalizeAiResponse(data, request.hintEnabled);
}

function normalizeAiResponse(data: Partial<AiResponse>, hintEnabled: boolean): AiResponse {
  const answer = validAnswers.has(data.answer ?? "") ? data.answer! : "无关";
  const normalized: AiResponse = {
    answer,
    label: data.label ?? labelByAnswer[answer],
  };

  if (hintEnabled && data.hint) {
    normalized.hint = data.hint;
  }

  return normalized;
}

function mockAiResponse(request: AiRequest): Promise<AiResponse> {
  const result: AiResponse = {
    answer: "无关",
    label: labelByAnswer["无关"],
  };

  if (request.hintEnabled) {
    result.hint = "试着换个角度，把问题问得更具体一些。";
  }

  return new Promise<AiResponse>((resolve) => {
    window.setTimeout(() => resolve(result), 450);
  });
}
