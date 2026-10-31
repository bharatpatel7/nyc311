interface LoadingBarProps {
  isVisible: boolean;
}

/**
 * Simple top-aligned animated progress bar for indicating background loading
 */
const LoadingBar = ({ isVisible }: LoadingBarProps) => {
  if (!isVisible) return null;
  return (
    <div className="absolute top-0 left-0 right-0 z-[1000] h-[2px] bg-blue-500/30 overflow-hidden">
      <div
        className="h-full bg-blue-500 animate-[slide_1s_ease-in-out_infinite]"
        style={{ width: "40%" }}
      />
    </div>
  );
};

export default LoadingBar;
