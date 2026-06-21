"use client";

import { useState, useRef, useCallback, useEffect, useMemo } from "react";
import Image from "next/image";

interface Photo {
  id: string;
  src: string;
  caption: string;
}

const sideSlots: {
  side: "left" | "right";
  topAnchor: number;
  rotate: string;
  verticalOffset: string;
}[] = [
  { side: "left", topAnchor: 0, rotate: "-4deg", verticalOffset: "8vh" },
  { side: "right", topAnchor: 0, rotate: "3deg", verticalOffset: "28vh" },
  { side: "left", topAnchor: 1, rotate: "2deg", verticalOffset: "10vh" },
  { side: "right", topAnchor: 1, rotate: "-3deg", verticalOffset: "32vh" },
  { side: "left", topAnchor: 2, rotate: "-2deg", verticalOffset: "6vh" },
  { side: "right", topAnchor: 2, rotate: "5deg", verticalOffset: "26vh" },
  { side: "left", topAnchor: 3, rotate: "3deg", verticalOffset: "12vh" },
  { side: "right", topAnchor: 3, rotate: "-4deg", verticalOffset: "34vh" },
];

const memories = [
  {
    title: "Tu fuerza",
    text: "Siempre fuerte, siempre firme. Nos enseñaste que con esfuerzo y dedicacion todo se puede lograr.",
  },
  {
    title: "Tu amor",
    text: "Cada abrazo, cada palabra de aliento. Tu amor incondicional es el regalo mas grande que nos has dado.",
  },
  {
    title: "Tu ejemplo",
    text: "Con las cosas que haces, nos enseñas como ser mejor día a día.",
  },
  {
    title: "Tu alegria",
    text: "Las risas compartidas, los momentos que guardamos en el corazón para siempre.",
  },
  {
    title: "Tu sabiduria",
    text: "Tus consejos son tesoros que llevamos siempre. Gracias por enseñarnos a ver lo bueno en cada dia.",
  },
];

const loveQuotes = [
  "Gracias por cada abrazo que nos reconfortó.",
  "Estar a tu lado nos da una paz y tranquilidad inimaginable.",
  "En tus manos encontramos la fuerza para seguir. Siempre nos has dado la fuerza para seguir adelante.",
  "Gracias por tus sabios consejos que nos iluminaron en los momentos más oscuros.",
  "Cada lección tuya siempre nos acompaña y nos guía para ser mejores personas.",
  "Ser tu hijo es el mayor orgullo de mi vida.",
];

function Heart({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} style={style}>
      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
    </svg>
  );
}

function useSectionRefs(count: number) {
  const refs = useRef<(HTMLElement | null)[]>(Array(count).fill(null));
  const [activeSection, setActiveSection] = useState(-1);

  const setSectionElements = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => (el: HTMLElement | null) => {
        refs.current[i] = el;
      }),
    [count]
  );

  useEffect(() => {
    const observers: IntersectionObserver[] = [];
    refs.current.forEach((el, i) => {
      if (!el) return;
      const obs = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setActiveSection(i);
          }
        },
        { threshold: 0.3 }
      );
      obs.observe(el);
      observers.push(obs);
    });
    return () => observers.forEach((o) => o.disconnect());
  }, []);

  return { setSectionElements, activeSection };
}

function SidePolaroid({
  photo,
  slot,
  index,
  visible,
  onClickAdd,
  onClickView,
  onDrop,
  onRemove,
  onCaptionChange,
}: {
  photo: Photo | null;
  slot: (typeof sideSlots)[0];
  index: number;
  visible: boolean;
  onClickAdd: (index: number) => void;
  onClickView: (photo: Photo) => void;
  onDrop: (e: React.DragEvent, index: number) => void;
  onRemove: (index: number) => void;
  onCaptionChange: (index: number, caption: string) => void;
}) {
  const [dragOver, setDragOver] = useState(false);
  const [editing, setEditing] = useState(false);

  return (
    <div
      className={`polaroid-side ${visible ? "visible" : ""} ${
        slot.side === "left" ? "side-left" : "side-right"
      }`}
      style={{ top: slot.verticalOffset }}
    >
      <div
        className="polaroid rounded-sm cursor-pointer w-52 xl:w-60"
        style={{ transform: `rotate(${slot.rotate})` }}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          onDrop(e, index);
        }}
        onClick={() => {
          if (photo) onClickView(photo);
          else onClickAdd(index);
        }}
      >
        <div className="photo-area">
          {photo ? (
            <>
              <Image
                src={photo.src}
                alt={photo.caption || "Recuerdo"}
                fill
                className="object-cover"
                unoptimized
              />
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove(index);
                }}
                className="absolute top-1 right-1 w-5 h-5 bg-brown-700/60 hover:bg-brown-700 text-warm-100 rounded-full flex items-center justify-center text-[10px] font-bold opacity-0 hover:opacity-100! transition-opacity z-10"
              >
                x
              </button>
            </>
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-1">
              <svg
                className="w-8 h-8 text-brown-300/50"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
              </svg>
              <span className="text-brown-300/50 text-[10px] italic">agregar foto</span>
            </div>
          )}

          {dragOver && (
            <div className="absolute inset-0 bg-amber-300/30 flex items-center justify-center z-10">
              <span className="text-brown-600 italic text-xs">soltar</span>
            </div>
          )}
        </div>

        <div className="caption-area">
          {photo ? (
            editing ? (
              <input
                type="text"
                value={photo.caption}
                onChange={(e) => onCaptionChange(index, e.target.value)}
                onBlur={() => setEditing(false)}
                onKeyDown={(e) => e.key === "Enter" && setEditing(false)}
                onClick={(e) => e.stopPropagation()}
                autoFocus
                placeholder="escribe algo..."
                className="w-full bg-transparent text-center italic text-brown-600 text-xs outline-none border-b border-brown-300/40 placeholder:text-brown-300/50"
              />
            ) : (
              <span
                onClick={(e) => {
                  e.stopPropagation();
                  setEditing(true);
                }}
                className="cursor-text hover:text-brown-500 transition-colors"
              >
                {photo.caption}
              </span>
            )
          ) : (
            <span className="text-brown-300/40">- - -</span>
          )}
        </div>
      </div>
    </div>
  );
}

function MobilePhotoGrid({
  photos,
  onClickAdd,
  onClickView,
  onDrop,
  onRemove,
}: {
  photos: (Photo | null)[];
  onClickAdd: (index: number) => void;
  onClickView: (photo: Photo) => void;
  onDrop: (e: React.DragEvent, index: number) => void;
  onRemove: (index: number) => void;
}) {
  const rotations = ["-3deg", "2deg", "-1deg", "4deg", "-2deg", "3deg", "1deg", "-4deg"];

  return (
    <section className="xl:hidden py-16 px-4">
      <div className="text-center mb-10">
        <Heart className="w-8 h-8 text-brown-300 mx-auto mb-3" />
        <h2 className="text-3xl font-bold text-brown-600 mb-2">Nuestros Recuerdos</h2>
        <div className="rustic-divider w-20 mx-auto mb-4" />
        <p className="text-brown-400 text-base">Toca para agregar fotos.</p>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 justify-items-center max-w-3xl mx-auto">
        {photos.map((photo, i) => (
          <div
            key={i}
            className="polaroid rounded-sm cursor-pointer w-44 sm:w-52"
            style={{ transform: `rotate(${rotations[i]})` }}
            onClick={() => {
              if (photo) onClickView(photo);
              else onClickAdd(i);
            }}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              onDrop(e, i);
            }}
          >
            <div className="photo-area">
              {photo ? (
                <>
                  <Image src={photo.src} alt={photo.caption || ""} fill className="object-cover" unoptimized />
                  <button
                    onClick={(e) => { e.stopPropagation(); onRemove(i); }}
                    className="absolute top-1 right-1 w-5 h-5 bg-brown-700/60 text-warm-100 rounded-full flex items-center justify-center text-[10px] font-bold"
                  >
                    x
                  </button>
                </>
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-1">
                  <svg className="w-7 h-7 text-brown-300/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
                  </svg>
                </div>
              )}
            </div>
            <div className="caption-area">
              <span className="text-brown-300/50">{photo?.caption || "- - -"}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default function Home() {
  const [photos, setPhotos] = useState<(Photo | null)[]>(() =>
    Array.from({ length: 8 }, (_, i) => ({
      id: `photo-${i + 1}`,
      src: `/photo${i + 1}.jpeg`,
      caption: "",
    }))
  );
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const targetIndexRef = useRef(0);

  const sectionCount = 7;
  const { setSectionElements, activeSection } = useSectionRefs(sectionCount);
  const [setHeroElement, setMemoriesElement, setQuotesElement, setLetterElement, setDedicationElement, setGratitudeElement, setFooterElement] = setSectionElements;

  const handleFiles = useCallback((files: FileList | File[], targetIndex: number) => {
    Array.from(files)
      .filter((f) => f.type.startsWith("image/"))
      .forEach((file, fi) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          setPhotos((prev) => {
            const next = [...prev];
            const idx = targetIndex + fi;
            if (idx < 8) {
              next[idx] = { id: crypto.randomUUID(), src: e.target?.result as string, caption: "" };
            }
            return next;
          });
        };
        reader.readAsDataURL(file);
      });
  }, []);

  const onDrop = useCallback((e: React.DragEvent, index: number) => {
    if (e.dataTransfer.files.length > 0) handleFiles(e.dataTransfer.files, index);
  }, [handleFiles]);

  const onClickAdd = (index: number) => {
    targetIndexRef.current = index;
    fileInputRef.current?.click();
  };

  const onRemove = (index: number) => {
    setPhotos((prev) => { const n = [...prev]; n[index] = null; return n; });
  };

  const onCaptionChange = (index: number, caption: string) => {
    setPhotos((prev) => prev.map((p, i) => (i === index && p ? { ...p, caption } : p)));
  };

  return (
    <main className="relative bg-white min-h-screen">
      {/* Side polaroids — desktop only, 2 per section */}
      {sideSlots.map((slot, i) => (
        <SidePolaroid
          key={i}
          photo={photos[i]}
          slot={slot}
          index={i}
          visible={slot.topAnchor === activeSection}
          onClickAdd={onClickAdd}
          onClickView={setSelectedPhoto}
          onDrop={onDrop}
          onRemove={onRemove}
          onCaptionChange={onCaptionChange}
        />
      ))}

      {/* HERO */}
      <section
        ref={setHeroElement}
        className="relative min-h-screen flex items-center justify-center px-4 py-20"
      >
        <div className="text-center max-w-3xl mx-auto">
          <div className="animate-fade-in-up mb-8">
            <Heart className="w-14 h-14 text-brown-300 mx-auto animate-pulse-warm" />
          </div>

          <h1 className="text-5xl sm:text-7xl md:text-8xl font-bold mb-8 animate-fade-in-up-delayed tracking-tight">
            <span className="text-gradient-warm">Feliz Dia</span>
            <br />
            <span className="text-brown-600">Papito</span>
          </h1>

          <div className="animate-fade-in-up-delayed-2">
            <p className="text-xl sm:text-2xl text-brown-400 max-w-xl mx-auto leading-relaxed">
              Para el hombre que nos dio todo con mucho amor y paciencia.
            </p>
          </div>

          <div className="animate-fade-in-up-delayed-3 mt-10 flex justify-center gap-4">
            {[...Array(3)].map((_, i) => (
              <Heart key={i} className="w-4 h-4 text-brown-300 animate-pulse-warm" style={{ animationDelay: `${i * 0.5}s` }} />
            ))}
          </div>

          <div className="animate-fade-in-up-delayed-4 mt-14">
            <a
              href="#recuerdos"
              className="inline-flex items-center gap-2 text-brown-500 hover:text-brown-600 text-lg transition-colors border-b border-brown-300 pb-1 hover:border-brown-500"
            >
              Más de nuestro amor
              <svg className="w-4 h-4 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </a>
          </div>
        </div>
      </section>

      {/* MEMORIES */}
      <section
        id="recuerdos"
        ref={setMemoriesElement}
        className="py-24 px-4 max-w-3xl mx-auto"
      >
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold text-brown-600 mb-4">
            Lo que amamos de ti
          </h2>
          <div className="rustic-divider w-32 mx-auto mb-6" />
          <p className="text-brown-400 text-lg">
            Cada momento contigo es un regalo de Dios que siempre vamos a agradecer.
          </p>
        </div>

        <div className="space-y-8">
          {memories.map((memory, i) => (
            <div
              key={i}
              className="flex gap-6 items-start group"
            >
              <Heart className="w-6 h-6 text-brown-300 mt-1 shrink-0 group-hover:text-warm-500 transition-colors" />
              <div>
                <h3 className="text-xl font-bold text-brown-600 mb-1">{memory.title}</h3>
                <p className="text-brown-400 leading-relaxed">{memory.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="rustic-divider max-w-md mx-auto" />

      {/* LOVE QUOTES */}
      <section
        ref={setQuotesElement}
        className="py-24 px-4 max-w-3xl mx-auto"
      >
        <div className="text-center mb-16">
          <Heart className="w-8 h-8 text-brown-300 mx-auto mb-4" />
          <h2 className="text-4xl sm:text-5xl font-bold text-brown-600 mb-4">
            Palabras del corazon
          </h2>
          <div className="rustic-divider w-32 mx-auto" />
        </div>

        <div className="space-y-6">
          {loveQuotes.map((quote, i) => (
            <div
              key={i}
              className={`py-6 ${i < loveQuotes.length - 1 ? "border-b border-brown-100" : ""}`}
            >
              <p className="text-brown-500 text-lg sm:text-xl italic leading-relaxed text-center">
                &ldquo;{quote}&rdquo;
              </p>
            </div>
          ))}
        </div>
      </section>

      <div className="rustic-divider max-w-md mx-auto" />

      {/* MOBILE PHOTO GRID */}
      <MobilePhotoGrid
        photos={photos}
        onClickAdd={onClickAdd}
        onClickView={setSelectedPhoto}
        onDrop={onDrop}
        onRemove={onRemove}
      />

      {/* LETTER */}
      <section
        ref={setLetterElement}
        className="py-24 px-4 max-w-2xl mx-auto"
      >
        <div className="text-center">
          <Heart className="w-8 h-8 text-brown-300 mx-auto mb-6 animate-pulse-warm" />
          <h2 className="text-4xl sm:text-5xl font-bold text-brown-600 mb-10">
            Carta para ti, Papá
          </h2>
        </div>

        <div className="border border-brown-100 rounded-sm p-8 sm:p-12 bg-warm-50/30">
          <p className="text-brown-600 text-lg mb-6 italic">Querido Papá,</p>
          <p className="text-brown-500 leading-relaxed mb-6">
            Hoy quiero que sepas lo importante que eres para nosotros en nuestras vidas.
            Cada sacrificio, cada abrazo y besos, cada consejo que nos diste... todo
            ha formado parte de quienes somos hoy.
          </p>
          <p className="text-brown-500 leading-relaxed mb-6">
            Gracias por ser nuestro guía, consejero, en quien podemos confiar y nuestro ejemplo a seguir.
            Por las veces que me levantaste cuando nos sentiamos derrotados, por creer en nostros cuando
            nostros ya no podiamos, y por amarnos sin condiciones.
          </p>
          <p className="text-brown-500 leading-relaxed mb-8">
            No hay palabras suficientes para expresar cuanto te amamos. 
            Eres el mejor padre que alguien podría soñar.
          </p>
          <div className="text-right">
            <p className="text-brown-600 italic text-lg">Con nuestro amor</p>
            <p className="text-brown-600 italic text-lg">Fabrizzio y Zuhhey</p>
            <Heart className="w-5 h-5 text-warm-500 ml-auto mt-2" />
          </div>
        </div>
      </section>

      <div className="rustic-divider max-w-md mx-auto" />

      {/* DEDICATORIAS */}
      <section
        ref={setDedicationElement}
        className="py-24 px-4 max-w-4xl mx-auto"
      >
        <div className="text-center mb-16">
          <Heart className="w-8 h-8 text-brown-300 mx-auto mb-4" />
          <h2 className="text-4xl sm:text-5xl font-bold text-brown-600 mb-4">
            Dedicatoria
          </h2>
          <div className="rustic-divider w-32 mx-auto" />
        </div>

        <div className="space-y-16">
          {/* Fabrizzio */}
          <div className="border border-brown-100 rounded-sm p-8 sm:p-10 bg-warm-50/30">
            <div className="text-center mb-8">
              <Heart className="w-5 h-5 text-warm-500 mx-auto mb-2" />
              <h3 className="text-2xl font-bold text-brown-600">Fabrizzio</h3>
            </div>

            <p className="text-brown-500 leading-relaxed mb-4">
              Papito, te agredazco por enseñarme a ser un buen hijo, hermano y hombre.
              Siempre fuiste quien me enseño apoyo y creyo en mi, no sé quien sería sin ti.
              Me diste todo tu amor y me diste todo lo que pudiste y es algo que valoro y que atesorare para siemre.
              Muchas veces es díficil seguir y se siente muy pesado todo, pero tu eres mi apoyo, mi pilar,
              me ayudas a ser alguien mejor todos los días.
              Siempre te voy a extrañar y aunque estemos a la distancia, espero que mi amor te llegue. Te amo.
            </p>
            <p className="text-brown-500 leading-relaxed mb-4">
              Admiro tu dedicación, tu esfuerzo y el amor que le pones
              a todo lo que haces. Eres mi ejemplo a seguir.
            </p>
            <p className="text-brown-400 italic text-right mt-6">
              — Con amor, Fabrizzio
            </p>
          </div>

          {/* Zuhhey */}
          <div className="border border-brown-100 rounded-sm p-8 sm:p-10 bg-warm-50/30">
            <div className="text-center mb-8">
              <Heart className="w-5 h-5 text-warm-500 mx-auto mb-2" />
              <h3 className="text-2xl font-bold text-brown-600">Zuhhey</h3>
            </div>

            <p className="text-brown-500 leading-relaxed mb-4">
              Papito bello de mi corazón,te amo mucho quiero q en este dia la pases super bien.
              Que Dios te proteja y te bendiga siempre,te extraño mucho,
              eres el mejor papá del mundo mi orgullo,gracias por todas tus enseñanzas,
              por todo el amor q siempre me has dado,
              gracias a ti soy quien soy me enseñaste tu fortaleza y firmeza para ser una buena mamá,
              por eso y mucho mas siempre serás mi ejemplo a seguir y mi héroe.
            </p>
            <p className="text-brown-500 leading-relaxed mb-4">
              Cada abrazo tuyo me llena de paz y me recuerda
              lo afortunada que soy de tenerte como papá.
            </p>
            <p className="text-brown-400 italic text-right mt-6">
              — Con amor, Zuhhey
            </p>
          </div>
        </div>
      </section>

      <div className="rustic-divider max-w-md mx-auto" />

      {/* GRATITUDE */}
      <section
        ref={setGratitudeElement}
        className="py-24 px-4 max-w-2xl mx-auto text-center"
      >
        <h2 className="text-3xl sm:text-4xl font-bold text-brown-600 mb-6">
          Gracias por todo
        </h2>
        <div className="rustic-divider w-20 mx-auto mb-8" />
        <p className="text-brown-400 text-lg leading-relaxed mb-4">
          Por las noches más dificiles en las que nos acompañaste, por los sacrificios silenciosos,
          por el amor que nunca pediste que te devolvieramos.
        </p>
        <p className="text-brown-400 text-lg leading-relaxed">
          Todo lo bueno que somos, es gracias a ti.
        </p>
      </section>

      {/* FOOTER */}
      <footer
        ref={setFooterElement}
        className="py-16 px-4 border-t border-brown-100"
      >
        <div className="text-center">
          <Heart className="w-8 h-8 text-brown-300 mx-auto mb-4 animate-pulse-warm" />
          <h3 className="text-2xl font-bold text-brown-600 mb-2">
            Te queremos, Papá
          </h3>
          <p className="text-brown-300 text-sm">
            Hoy y siempre. Feliz Dia del Padre.
          </p>
        </div>
      </footer>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => {
          if (e.target.files) handleFiles(e.target.files, targetIndexRef.current);
          e.target.value = "";
        }}
      />

      {/* Lightbox */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setSelectedPhoto(null)}
        >
          <div
            className="polaroid w-[85vw] max-w-lg"
            style={{ transform: "rotate(-1deg)", padding: "14px 14px 56px 14px" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative w-full aspect-square">
              <Image
                src={selectedPhoto.src}
                alt={selectedPhoto.caption || "Recuerdo"}
                fill
                className="object-cover"
                unoptimized
              />
            </div>
            <div className="caption-area" style={{ fontSize: "1rem", bottom: "14px" }}>
              {selectedPhoto.caption || ""}
            </div>
            <button
              onClick={() => setSelectedPhoto(null)}
              className="absolute top-2 right-2 w-7 h-7 bg-brown-600/70 hover:bg-brown-700 text-warm-100 rounded-full flex items-center justify-center text-xs font-bold z-10"
            >
              x
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
