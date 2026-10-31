const CornerGlow = () => (
  <div
    className="pointer-events-none absolute left-0 top-0 h-[500px] w-[600px]"
    style={{
      background: "radial-gradient(ellipse at 0% 0%, rgba(99,130,255,0.06) 0%, transparent 70%)",
    }}
  />
);

export default CornerGlow;
