import type { NodeProps } from "@xyflow/react";
import { FormInputIcon } from "lucide-react";
import { memo, useState } from "react";
import { useGoogleFormTriggerStatus } from "@/hooks/use-google-form-trigger-status";
import { BaseTriggerNode } from "../base-trigger-node";
import { GoogleFormTriggerDialog } from "./dialog";

export const GoogleFormTriggerNode = memo((props: NodeProps) => {
  const [dialogOpen, setDialogOpen] = useState(false);

  const nodeStatus = useGoogleFormTriggerStatus(props.id);

  const handleOpenSettings = () => setDialogOpen(true);

  return (
    <>
      <GoogleFormTriggerDialog
        nodeId={props.id}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
      <BaseTriggerNode
        {...props}
        icon={FormInputIcon}
        name="Google Form Trigger"
        description="On form submission"
        onSettings={handleOpenSettings}
        onDoubleClick={handleOpenSettings}
        status={nodeStatus}
      />
    </>
  );
});

GoogleFormTriggerNode.displayName = "GoogleFormTriggerNode";