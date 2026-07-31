import Handlebars from "handlebars";
import { NonRetriableError } from "inngest";
import ky, { type Options as KyOptions } from "ky";
import type { NodeExecutor } from "@/features/executions/types";
import { httpRequestChannel } from "@/inngest/channels";

Handlebars.registerHelper("json", (context) => {
  const jsonString = JSON.stringify(context, null, 2);
  return new Handlebars.SafeString(jsonString);
});

type HttpRequestData = {
  endpoint?: string;
  method?: "GET" | "POST" | "PUT" | "DELETE";
  body?: string;
};

const BODY_METHODS = new Set(["POST", "PUT"]);

export const HttpRequestExecutor: NodeExecutor<HttpRequestData> = async ({
  nodeId,
  context,
  step,
  data,
}) => {
  const channel = httpRequestChannel(nodeId);

  if (!data.endpoint?.trim()) {
    await step.realtime.publish("publish-error-no-endpoint", channel.status, {
      status: "error",
      message: "HTTP Request node: No endpoint configured",
    });
    throw new NonRetriableError("HTTP Request node: No endpoint configured");
  }

  await step.realtime.publish("publish-loading", channel.status, {
    status: "loading",
  });

  try {
    const result = await step.run("http-request", async () => {
      const method = data.method || "GET";
      const endpoint = Handlebars.compile(data.endpoint)(context).trim();

      if (!endpoint) {
        throw new NonRetriableError("HTTP Request node: Endpoint resolved to empty");
      }

      let url: URL;
      try {
        url = new URL(endpoint);
      } catch {
        throw new NonRetriableError(
          `HTTP Request node: Invalid URL: ${endpoint}`,
        );
      }

      const options: KyOptions = {
        method,
        retry: 0,
        timeout: 30_000,
      };

      if (BODY_METHODS.has(method)) {
        const resolved = Handlebars.compile(data.body || "{}")(context);

        try {
          // Validate JSON before sending it. ky will send exactly the string
          // supplied in `body`, avoiding an accidental double-encoding.
          JSON.parse(resolved);
        } catch {
          throw new NonRetriableError(
            "HTTP Request node: Request body must be valid JSON",
          );
        }

        options.headers = {
          "content-type": "application/json",
        };
        options.body = resolved;
      }

      const response = await ky(url, options);
      const contentType = response.headers.get("content-type") || "";

      const responseData = contentType.includes("application/json")
        ? await response.json<unknown>()
        : await response.text();

      return {
        ...context,
        httpResponse: {
          status: response.status,
          statusText: response.statusText,
          data: responseData,
        },
      };
    });

    await step.realtime.publish("publish-success", channel.status, {
      status: "success",
    });

    return result;
  } catch (error) {
    await step.realtime.publish("publish-error", channel.status, {
      status: "error",
      message:
        error instanceof Error ? error.message : "HTTP request failed",
    });
    throw error;
  }
};
