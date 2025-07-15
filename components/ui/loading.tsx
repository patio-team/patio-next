export function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center space-x-2">
      <div className="animate-jump-dot h-4 w-4 rounded-full bg-[#3FE3D2] opacity-50" />
      <div className="animate-jump-dot h-4 w-4 rounded-full bg-[#98DDAB] opacity-75 [animation-delay:0.2s]" />
      <div className="animate-jump-dot h-4 w-4 rounded-full bg-[#FFC952] [animation-delay:0.4s]" />
      <div className="animate-jump-dot h-4 w-4 rounded-full bg-[#FF7473] opacity-75 [animation-delay:0.6s]" />
      <div className="animate-jump-dot h-4 w-4 rounded-full bg-[#FE346E] opacity-50 [animation-delay:0.8s]" />
    </div>
  );
}
