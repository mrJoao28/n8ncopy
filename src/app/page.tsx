

import { cn } from "@/lib/utils";

const Page = ()=>{
  

  const some = true
  return (
    <div className={cn("text-red-500 font-extrabold" , some === true && "text-green-500")}>
      Hello WOrld
    </div>
  )
};

export default Page;
