"use client";

import { CheckIcon, CopyIcon } from "lucide-react";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

interface Props {
  nodeId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const GoogleFormTriggerDialog = ({
  nodeId,
  open,
  onOpenChange,
}: Props) => {
  const params = useParams<{ workflowId: string }>();
  const [origin, setOrigin] = useState("");
  const [copied, setCopied] = useState<"url" | "script" | null>(null);

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  const webhookUrl = origin
    ? `${origin}/api/webhooks/google-form/${params.workflowId}/${nodeId}`
    : "";

  const appsScript = `function onFormSubmitTrigger(e) {
  var webhookUrl = "${webhookUrl || "PASTE_THE_WEBHOOK_URL_HERE"}";

  var responses = e.response.getItemResponses().reduce(function (acc, item) {
    acc[item.getItem().getTitle()] = item.getResponse();
    return acc;
  }, {});

  UrlFetchApp.fetch(webhookUrl, {
    method: "post",
    contentType: "application/json",
    payload: JSON.stringify({
      formId: e.source.getId(),
      timestamp: e.response.getTimestamp(),
      responses: responses,
    }),
  });
}

// Run this function once from the Apps Script editor toolbar to
// authorize the script and install the submit trigger.
function createSubmitTrigger() {
  ScriptApp.newTrigger("onFormSubmitTrigger")
    .forForm(FormApp.getActiveForm())
    .onFormSubmit()
    .create();
}`;

  const handleCopy = async (value: string, key: "url" | "script") => {
    await navigator.clipboard.writeText(value);
    setCopied(key);
    setTimeout(() => setCopied(null), 1500);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Google Form Trigger</DialogTitle>
          <DialogDescription>
            Starts the flow whenever a response is submitted to a Google Form.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-2">
          <div className="flex flex-col gap-1.5">
            <Label>1. Webhook URL</Label>
            <div className="flex gap-2">
              <code className="flex-1 truncate rounded-md border bg-muted px-2 py-1.5 text-xs">
                {webhookUrl}
              </code>
              <Button
                type="button"
                size="icon"
                variant="outline"
                disabled={!webhookUrl}
                onClick={() => handleCopy(webhookUrl, "url")}
              >
                {copied === "url" ? (
                  <CheckIcon className="size-4" />
                ) : (
                  <CopyIcon className="size-4" />
                )}
              </Button>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>2. Google Form setup</Label>
            <ol className="list-decimal space-y-1 pl-4 text-sm text-muted-foreground">
              <li>Open (or create) your Google Form.</li>
              <li>
                Click the kebab menu (⋮) → <strong>Apps Script</strong> (in the
                form editor toolbar).
              </li>
              <li>Paste the script below, replacing the existing content.</li>
              <li>
                Run <code>createSubmitTrigger</code> once from the toolbar to
                authorize it and install the trigger.
              </li>
            </ol>
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <Label>3. App Script</Label>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => handleCopy(appsScript, "script")}
              >
                {copied === "script" ? (
                  <>
                    <CheckIcon className="mr-1 size-3.5" /> Copied
                  </>
                ) : (
                  <>
                    <CopyIcon className="mr-1 size-3.5" /> Copy script
                  </>
                )}
              </Button>
            </div>
            <pre className="max-h-56 overflow-auto rounded-md border bg-muted p-3 text-xs">
              <code>{appsScript}</code>
            </pre>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};