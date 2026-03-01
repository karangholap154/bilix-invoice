import { Suspense } from "react";
import PreviewContent from "./PreviewContent";

export default function Page() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">
      Loading preview...
    </div>}>
      <PreviewContent />
    </Suspense>
  );
}