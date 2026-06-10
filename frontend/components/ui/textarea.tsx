"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={cn("min-h-24 w-full rounded-md border border-border bg-white p-3 text-sm outline-none focus:ring-2 focus:ring-slate-300", props.className)} />;
}

