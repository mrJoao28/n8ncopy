"use client";

import type { Node, NodeProps } from "@xyflow/react";
import { useReactFlow } from "@xyflow/react";
import { useState } from "react";
import type { AiProviderConfig } from "@/config/ai-providers";
import { useNodeStatus } from "@/hooks/use-node-status";
import { BaseExecutionNode } from "../base-execution-node";
import { AiNodeDialog, type AiNodeFormValues } from "./dialog";

type AiNodeData = {
  model?: string;
  prompt?: string;
  credentialId?: string;
};

type AiNodeType = Node<AiNodeData>;

interface Props extends NodeProps<AiNodeType> {
  provider: AiProviderConfig;
}

export const AiNode = ({ provider, ...props }: Props) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { setNodes } = useReactFlow();

  const nodeStatus = useNodeStatus(props.id, "ai-node");

  const handleOpenSettings = () => setDialogOpen(true);

  const handleSubmit = (values: AiNodeFormValues) => {
    setNodes((nodes) =>
      nodes.map((node) =>
        node.id === props.id
          ? { ...node, data: { ...node.data, ...values } }
          : node,
      ),
    );
  };

  const nodeData = props.data;
  const description = nodeData?.prompt
    ? nodeData.prompt.slice(0, 60)
    : "Not configured";

  return (
    <>
      <AiNodeDialog
        provider={provider}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={handleSubmit}
        defaultValues={nodeData}
      />
      <BaseExecutionNode
        {...props}
        id={props.id}
        icon={provider.icon}
        name={provider.label}
        description={description}
        onSettings={handleOpenSettings}
        onDoubleClick={handleOpenSettings}
        status={nodeStatus}
      />
    </>
  );
};