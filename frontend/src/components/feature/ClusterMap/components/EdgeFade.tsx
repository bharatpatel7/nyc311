const EdgeFade = () => {
  return (
    <div className="pointer-events-none absolute inset-0">
      <div
        className="pointer-events-none absolute inset-0 rounded"
        style={{
          background: `
        linear-gradient(to bottom, rgba(11,15,25,0.95) 0%, transparent 18%),
        linear-gradient(to top,    rgba(11,15,25,0.95) 0%, transparent 18%),
        linear-gradient(to right,  rgba(11,15,25,0.95) 0%, transparent 14%),
        linear-gradient(to left,   rgba(11,15,25,0.95) 0%, transparent 14%)
      `,
        }}
      />
    </div>
  );
};

export default EdgeFade;
