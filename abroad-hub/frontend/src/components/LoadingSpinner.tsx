import { Loader } from "lucide-react";

export function LoadingSpinner({ message }: { message: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center space-x-2">
      <span>{message}</span>
      <Loader className="animate-spin h-8 w-8 text-gray-600" />
    </div>
  );
}
