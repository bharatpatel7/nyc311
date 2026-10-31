const EdgeFade = () => {
  return (
    <div className="pointer-events-none absolute inset-0">
      <div
        className="pointer-events-none absolute inset-0 rounded"
        style={{
          background: `
        linear-gradient(to bottom, #f8f9fb 0%, transparent 18%),
        linear-gradient(to top,    #f8f9fb 0%, transparent 18%),
        linear-gradient(to right,  #f8f9fb 0%, transparent 14%),
        linear-gradient(to left,   #f8f9fb 0%, transparent 14%)
      `,
        }}
      />
    </div>
  );
};

export default EdgeFade;
