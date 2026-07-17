"use client";

import { trpc } from "@/trpc/server";
import { useSuspenseQuery } from "@tanstack/react-query";

export const Client = () =>{
    const {data:users} = useSuspenseQuery(trpc.getUsers.queryOptions())
    return (
        <div>
            CLient component : {JSON.stringify(users)}
        </div>
    )
}

