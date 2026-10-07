const items = [
  "Photography",
  "Videography",
  "Video Editing",
  "Content Creation",
  "Event Coverage",
  "Archive"
];

export function CreativeMarquee() {
  const repeated = [...items, ...items];

  return (
    <div className="vac-marquee" aria-label="VAC creative disciplines">
      <div className="vac-marquee-track" aria-hidden="true">
        {repeated.map((item, index) => (
          <span key={item + index}>{item}</span>
        ))}
      </div>
    </div>
  );
}
