import { NodeProps } from "@xyflow/react";
import { memo } from "react";
import { BaseTriggerNode } from "../base-trigger-node";
import { MousePointerIcon } from "lucide-react";
import { handleClientScriptLoad } from "next/script";

export const ManualTriggerNode = memo((props:NodeProps)=>{
    return(
        <>
        <BaseTriggerNode {...props} icon={MousePointerIcon} name="When click 'Execute workflow" />
        </>
    )
})