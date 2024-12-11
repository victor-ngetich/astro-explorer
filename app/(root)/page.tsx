import React from "react";
import { Metadata } from "next";
import HomePage from "@/app/components/HomePage";

export const metadata: Metadata = {
  title: "Astronomical Objects",
};
export default function index() {
  return (
    <div>
      <HomePage />
    </div>
  );
}
