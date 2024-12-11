import React from "react";
import { Metadata } from "next";
import Example from "./1";

export const metadata: Metadata = {
  title: "Test",
};
export default function index() {
  return (
    <div>
      <Example />
    </div>
  );
}
