const values = [48, 58, 52, 74, 63, 82, 75];
const labels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export function ProgressChart() {
  return (
    <>
      <div className="chart" aria-label="Hit rate chart">
        {values.map((value, index) => (
          <span key={`${value}-${index}`} style={{ height: `${value}%` }} />
        ))}
      </div>
      <div className="chart-labels">
        {labels.map((label) => (
          <span key={label}>{label}</span>
        ))}
      </div>
    </>
  );
}
