import type { CSSProperties } from "react";

const disciplines = [
  {
    number: "01",
    title: "Photography",
    copy: "Learn to see the world differently, capture moments and tell stories through photographs.",
    art: "https://images.unsplash.com/photo-1739296385343-ff091bca6203?auto=format&fit=crop&fm=webp&q=92&w=2600",
    credit: "Photography / field work · Unsplash",
    className: "craft-card--wide"
  },
  {
    number: "02",
    title: "Videography",
    copy: "Bring ideas to life with motion, sound, camera work and visual storytelling.",
    art: "https://images.unsplash.com/photo-1705107959309-ca7d26fbeb08?auto=format&fit=crop&fm=webp&q=92&w=2200",
    credit: "Cinema camera / production · Unsplash",
    className: ""
  },
  {
    number: "03",
    title: "Filmmaking & Editing",
    copy: "Create, experiment and inspire through filmmaking, digital art and content creation.",
    art: "https://images.unsplash.com/photo-1727451139462-cd34008cd50b?auto=format&fit=crop&fm=webp&q=92&w=2200",
    credit: "Studio / post-production · Unsplash",
    className: ""
  }
];

export function CreativeDisciplines() {
  return (
    <section className="section craft-section" aria-labelledby="craft-title">
      <div className="shell">
        <div className="section-kicker-row" data-reveal>
          <div>
            <div className="eyebrow">The VAC disciplines</div>
            <h2 id="craft-title">
              Built for people who see the world in <em>frames.</em>
            </h2>
          </div>
          <p className="section-copy compact-copy">
            A community for creative minds to learn, create and experiment with visual stories,
            from photography and filmmaking to content creation and digital art.
          </p>
        </div>

        <div className="craft-grid">
          {disciplines.map((item, index) => (
            <article
              className={"craft-card " + item.className}
              key={item.title}
              data-reveal
              style={{ "--reveal-delay": index * 70 + "ms" } as CSSProperties}
            >
              <div className="craft-art">
                <img
                  src={item.art}
                  alt=""
                  loading="lazy"
                  decoding="async"
                />
              </div>
              <span className="craft-gradient" aria-hidden="true" />
              <div className="craft-number">{item.number}</div>
              <div className="craft-copy">
                <div>
                  <small>{item.credit}</small>
                  <h3>{item.title}</h3>
                  <p>{item.copy}</p>
                </div>
                <span className="craft-arrow" aria-hidden="true">↗</span>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
