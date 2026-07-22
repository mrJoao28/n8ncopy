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
 
export const StripeTriggerDialog = ({ nodeId, open, onOpenChange }: Props) => {
  const params = useParams<{ workflowId: string }>();
  const [origin, setOrigin] = useState("");
  const [copied, setCopied] = useState(false);
 
  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);
 
  const webhookUrl = origin
    ? `${origin}/api/webhooks/stripe/${params.workflowId}/${nodeId}`
    : "";
 
  const handleCopy = async () => {
    await navigator.clipboard.writeText(webhookUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
 
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Stripe Trigger</DialogTitle>
          <DialogDescription>
            Starts the flow whenever a Stripe event is sent to this webhook.
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
                onClick={handleCopy}
              >
                {copied ? (
                  <CheckIcon className="size-4" />
                ) : (
                  <CopyIcon className="size-4" />
                )}
              </Button>
            </div>
          </div>
 
          <div className="flex flex-col gap-1.5">
            <Label>2. Stripe Dashboard setup</Label>
            <ol className="list-decimal space-y-1 pl-4 text-sm text-muted-foreground">
              <li>
                Open the Stripe Dashboard →{" "}
                <strong>Developers &gt; Webhooks</strong>.
              </li>
              <li>
                Click <strong>Add endpoint</strong> and paste the webhook URL
                above.
              </li>
              <li>Select the events you want this flow to react to.</li>
              <li>
                Copy the endpoint&apos;s <strong>Signing secret</strong> and set
                it as <code>STRIPE_WEBHOOK_SECRET</code> in your environment.
              </li>
            </ol>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};