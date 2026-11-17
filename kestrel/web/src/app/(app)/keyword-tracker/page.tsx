"use client";
import { Suspense } from "react";
import { KeywordTrackerPage } from "@/components/keywords/keyword-tracker";

export default function Page() {
  return <Suspense><KeywordTrackerPage /></Suspense>;
}
