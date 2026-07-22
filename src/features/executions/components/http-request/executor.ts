import type { NodeExecutor } from "@/features/executions/types";
import { NonRetriableError } from "inngest";
import ky , {type Options as KyOptions} from "ky"

type HttpRequestData =  {
    endpoint?:string;
    method?:"GET"|"POST"|"PUT"|"DELETE";
    body?:string;
}

export const HttpRequestExecutor:NodeExecutor<HttpRequestData> = async( {nodeId,context,step,data})=>{

    if (!data.endpoint){
        throw new NonRetriableError("HTTP Request node: No endpoint configured ")
    }
    


    const result = await step.run("http-request",async()=>{
        const method = data.method || "GET";
        const endpoint = data.endpoint!;

        const options: KyOptions = {method}

        if (["POST","PUT","PATCH"].includes(method)){
                options.body = data.body
        }
        const response = await ky(endpoint,options)
        const contentType = response.headers.get("content-type")

        const responseData = contentType?.includes("application/json")? await response.json():await response.text()

        return {
            ...context,
            httpResponse:{
                status:response.status,
                statusText:response.statusText,
                data:responseData

            }
        }

    })



    return result;
}
