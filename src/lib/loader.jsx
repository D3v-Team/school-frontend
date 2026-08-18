import React from "react";

export default function Loader() {
  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="w-12 h-12 border-4 relative -top-16 border-blue-500 border-dotted rounded-full animate-spin"></div>
    </div>
  );
}
