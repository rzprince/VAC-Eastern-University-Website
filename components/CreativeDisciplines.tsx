import type { CSSProperties } from "react";

const disciplines = [
  {
    number: "01",
    title: "Photography",
    copy: "Light, timing and perspective — used to preserve the moments that define campus life.",
    art: "https://images.unsplash.com/photo-1739296385343-ff091bca6203?auto=format&fit=crop&fm=webp&q=88&w=1800",
    credit: "Photography visual · Unsplash",
    className: "craft-card--wide"
  },
  {
    number: "02",
    title: "Videography",
    copy: "Camera movement, sound and atmosphere shaped into stories that feel alive.",
    art: "https://images.unsplash.com/photo-1727451139462-cd34008cd50b?auto=format&fit=crop&fm=webp&q=86&w=1500",
    credit: "Film studio visual · Joshua Wann / Unsplash",
    className: ""
  },
  {
    number: "03",
    title: "Filmmaking & Editing",
    copy: "From the first shot to the final grade — direction, rhythm, edit and finish.",
    art: "https://images.unsplash.com/photo-1764557175375-9e2bea91530e?auto=format&fit=crop&fm=webp&q=86&w=1500",
    credit: "Post-production visual · Unsplash",
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
            A university creative club with the visual standard of a studio:
            photography, cinematography, editing and an archive that keeps the work alive.
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
