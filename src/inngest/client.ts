import { Inngest } from "inngest";

export const inngest = new Inngest({ 
    id: "n8ncopy" ,
    middleware:[realTimeMiddleware()]

});
