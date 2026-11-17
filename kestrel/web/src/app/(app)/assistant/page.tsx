"use client";
import { Suspense } from "react";
import { Assistant } from "@/components/workspace/assistant";

export default function Page() {
  return <Suspense fallback={null}><Assistant /></Suspense>;
}
