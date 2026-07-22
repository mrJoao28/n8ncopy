import type { NodeProps } from "@xyflow/react";
import { CreditCardIcon } from "lucide-react";
import { memo, useState } from "react";
import { useStripeTriggerStatus } from "@/hooks/use-stripe-trigger-status";
import { BaseTriggerNode } from "../base-trigger-node";
import { StripeTriggerDialog } from "./dialog";
 
export const StripeTriggerNode = memo((props: NodeProps) => {
  const [dialogOpen, setDialogOpen] = useState(false);
 
  const nodeStatus = useStripeTriggerStatus(props.id);
 
  const handleOpenSettings = () => setDialogOpen(true);
 
  return (
    <>
      <StripeTriggerDialog
        nodeId={props.id}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
      <BaseTriggerNode
        {...props}
        icon={CreditCardIcon}
        name="Stripe Trigger"
        description="On Stripe event"
        onSettings={handleOpenSettings}
        onDoubleClick={handleOpenSettings}
        status={nodeStatus}
      />
    </>
  );
});
 
StripeTriggerNode.displayName = "StripeTriggerNode";