import type { CSSProperties } from "react";

/*
 * One visual home for VAC's seven creative disciplines.
 * Professionally photographed source images are served at high resolution
 * via the Unsplash image CDN. Update the art field to a club photograph
 * when VAC's own gallery assets are available.
 */
const disciplines = [
  {
    number: "01",
    title: "Photography",
    copy: "Learn to see the world differently, capture moments and tell stories through photographs.",
    art: "https://images.unsplash.com/photo-1739296385343-ff091bca6203?auto=format&fit=crop&fm=webp&q=88&w=2000",
    credit: "PHOTOGRAPHY / FIELD WORK",
    className: "craft-card--wide"
  },
  {
    number: "02",
    title: "Videography",
    copy: "Bring ideas to life with motion, sound, camera work and visual storytelling.",
    art: "https://images.unsplash.com/photo-1705107959309-ca7d26fbeb08?auto=format&fit=crop&fm=webp&q=88&w=1800",
    credit: "VIDEOGRAPHY / PRODUCTION",
    className: ""
  },
  {
    number: "03",
    title: "Filmmaking & Editing",
    copy: "Shape every scene, from the first shot and sound to the final cinematic cut.",
    art: "https://images.unsplash.com/photo-1727451139462-cd34008cd50b?auto=format&fit=crop&fm=webp&q=88&w=1800",
    credit: "CINEMA / POST PRODUCTION",
    className: ""
  },
  {
    number: "04",
    title: "Content Creation",
    copy: "Transform creative ideas into meaningful photographs, videos and digital experiences.",
    art: "https://images.unsplash.com/photo-1758553026412-bc1da0ebd366?auto=format&fit=crop&fm=webp&q=86&w=1800",
    credit: "CONTENT / CREATIVE STUDIO",
    className: ""
  },
  {
    number: "05",
    title: "Storytelling",
    copy: "Find the narrative behind each frame and give moments a voice worth remembering.",
    art: "https://images.unsplash.com/photo-1769159523569-bdf28e5f9441?auto=format&fit=crop&fm=webp&q=86&w=1800",
    credit: "STORYTELLING / CREATIVE PROCESS",
    className: ""
  },
  {
    number: "06",
    title: "Art Exhibitions",
    copy: "Bring original visions together through curated displays, installations and shared spaces.",
    art: "https://images.unsplash.com/photo-1744063427137-8de9a1a0b211?auto=format&fit=crop&fm=webp&q=86&w=1800",
    credit: "ART / GALLERY EXPERIENCE",
    className: ""
  },
  {
    number: "07",
    title: "Digital Art",
    copy: "Combine artistic imagination and modern tools to create bold digital visual work.",
    art: "https://images.unsplash.com/photo-1637664223067-51f466633c30?auto=format&fit=crop&fm=webp&q=86&w=1800",
    credit: "DIGITAL ART / ILLUSTRATION",
    className: "craft-card--end"
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
            From photography and filmmaking to art exhibitions and digital art,
            every creative mind has a place to make something extraordinary.
          </p>
        </div>

        <div className="craft-grid craft-grid--full">
          {disciplines.map((item, index) => (
            <article
              className={"craft-card " + item.className}
              key={item.title}
              data-reveal
              style={{ "--reveal-delay": index * 55 + "ms" } as CSSProperties}
            >
              <div className="craft-art">
                <img
                  src={item.art}
                  alt={item.title + " creative practice"}
                  loading="lazy"
                  decoding="async"
                  sizes="(max-width: 700px) 100vw, (max-width: 1100px) 50vw, 33vw"
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
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
