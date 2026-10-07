import Image from "next/image";

const disciplines = [
  {
    number: "01",
    title: "Photography",
    copy: "Observe the moment, control the light, preserve the frame.",
    art: "/generated/vac-cinematic-photo.webp",
    className: "craft-card--wide"
  },
  {
    number: "02",
    title: "Videography",
    copy: "Movement, sound and visual rhythm shaped into stories.",
    art: "/generated/vac-cinematic-camera.webp",
    className: ""
  },
  {
    number: "03",
    title: "Filmmaking & Editing",
    copy: "From the first shot to the final cut — craft the complete visual narrative.",
    art: "/generated/vac-cinematic-editing.webp",
    className: ""
  }
];

export function CreativeDisciplines() {
  return (
    <section className="section craft-section" aria-labelledby="craft-title">
      <div className="shell">
        <div className="section-kicker-row">
          <div>
            <div className="eyebrow">What we create</div>
            <h2 id="craft-title">A visual club built around <span>craft.</span></h2>
          </div>
          <p className="section-copy compact-copy">
            Photography-studio minimalism, cinematic motion and a living archive
            — built for creators at Eastern University.
          </p>
        </div>

        <div className="craft-grid">
          {disciplines.map((item) => (
            <article className={"craft-card " + item.className} key={item.title}>
              <div className="craft-art">
                <Image src={item.art} alt="" fill sizes="(max-width: 800px) 100vw, 50vw" />
              </div>
              <div className="craft-copy">
                <span>{item.number}</span>
                <div>
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
