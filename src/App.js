import React, { useEffect, useState } from "react";

// Defensive MetaMask stub
//
// Reason: the runtime that loads this component may also load other scripts
// or injected extensions that attempt to call window.ethereum / MetaMask.
// In some environments that results in an uncaught "Failed to connect to MetaMask"
// error (or other noisy failures). This small, safe stub prevents those
// calls from throwing unhandled exceptions while leaving real MetaMask
// behavior intact when a real provider exists.

const setupMetaMaskStub = () => {
  if (typeof window === "undefined") return;

  try {
    // If no provider exists, create a no-op stub that returns sensible fallbacks
    if (!window.ethereum) {
      window.ethereum = {
        isMetaMask: false,
        // emulate request API used by many libraries
        request: async (args) => {
          console.warn("[meta-stub] window.ethereum.request called but no MetaMask:", args);
          // If code asks for accounts, return an empty array (no accounts connected)
          if (args && args.method === "eth_requestAccounts") return [];
          // return null for other calls - libraries should handle gracefully
          return null;
        },
        // simple no-op event handlers so listeners won't crash
        on: () => {},
        removeListener: () => {},
      };

      // Helpful debug message in console
      console.info("[meta-stub] Installed safe window.ethereum stub (no MetaMask detected).");
    } else if (window.ethereum.request) {
      // If a real provider exists, wrap its request method to catch unexpected errors
      const originalRequest = window.ethereum.request.bind(window.ethereum);
      window.ethereum.request = async (args) => {
        try {
          return await originalRequest(args);
        } catch (err) {
          // avoid throwing raw errors to the top-level: log and return fallback
          console.warn("[meta-stub] Caught error from ethereum.request:", err);
          if (args && args.method === "eth_requestAccounts") return [];
          return null;
        }
      };
    }
  } catch (err) {
    // If anything goes wrong while installing the stub, fail silently and log
    console.warn("[meta-stub] Failed to setup MetaMask stub:", err);
  }
};

// Run the stub setup as early as possible in the module (browser only)
if (typeof window !== "undefined") setupMetaMaskStub();

export default function App() {
  // No wallet-related effects inside this component. Keeping it free of side-effects
  // reduces the chance of wallet-related errors originating here.
  useEffect(() => {
    // noop for now, but keeps React's hooks behavior explicit
    return () => {};
  }, []);

  // State for fullscreen image modal
  const [fullscreenImage, setFullscreenImage] = useState(null);

  const items = [
    { id: 1, caption: "porsche 991 poster", image: "images/porsche.png" },
    { id: 2, caption: "porsche 991 poster", image: "images/porsche 2.jpg" },

  ];

  const Placeholder = ({ item }) => (
    <div 
      className="relative w-full aspect-[3/4] bg-[#262224] rounded-xl overflow-hidden ring-1 ring-white/5 cursor-pointer"
      onClick={() => setFullscreenImage(item)}
    >
      <img
        src={item.image}
        alt={item.caption}
        className="h-full w-full object-cover"
        onError={(e) => {
          // Fallback to placeholder if image doesn't load
          e.target.src = `data:image/svg+xml;utf8,${encodeURIComponent(
            `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 600 800'><rect width='600' height='800' fill='%23262224'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' fill='white' fill-opacity='0.5' font-family='Inter, Helvetica Neue, Arial, sans-serif' font-size='28'>Image ${item.id}</text></svg>`
          )}`;
        }}
      />
      <div className="pointer-events-none absolute inset-0 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.06)]" />
      {/* Hover overlay to indicate clickability */}
      <div className="absolute inset-0 bg-black/0 hover:bg-black/20 transition-colors duration-200 flex items-center justify-center opacity-0 hover:opacity-100">
        <div className="text-white/80 text-sm font-medium bg-black/50 px-3 py-1 rounded-full">
          Click to view
        </div>
      </div>
    </div>
  );

  return (
    <main
      className="min-h-screen bg-[#1E1B1C] text-white"
      style={{ fontFamily: "Inter, Helvetica Neue, Arial, sans-serif" }}
    >
      {/* Oversized faint background text */}
      <div className="pointer-events-none fixed inset-0 flex items-start justify-center overflow-hidden" aria-hidden>
        <h1 className="text-white/5 text-[22vw] md:text-[18vw] font-extrabold leading-none select-none mt-10">
          UI/UX Design
        </h1>
      </div>

      {/* Page content wrapper */}
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <header className="pt-8 sm:pt-12">
          <div className="flex items-baseline justify-between">
            <div className="text-sm sm:text-base font-bold tracking-tight"></div>
          </div>

          <div className="mt-14 mb-4 flex items-center gap-6">
            <h2 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold leading-tight max-w-4xl">
              Srushti Yaligar 
            </h2>
            <div className="flex-shrink-0">
              <img
                src="images/profile/1743100045415.jpg"
                alt="Srushti Yaligar Profile"
                className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 rounded-full object-cover ring-2 ring-white/20 shadow-lg"
                onError={(e) => {
                  e.target.src = `data:image/svg+xml;utf8,${encodeURIComponent(
                    `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><circle cx='50' cy='50' r='50' fill='%23262224'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' fill='white' fill-opacity='0.5' font-family='Inter, Helvetica Neue, Arial, sans-serif' font-size='14'>Profile</text></svg>`
                  )}`;
                }}
              />
            </div>
          </div>
          <p className="text-gray-300 max-w-md text-base sm:text-lg leading-relaxed">I am a Computer Science and Design Student
            Blending logic with creativity — building solutions that work as beautifully as they look
          </p>
        </header>

        {/* My Work Section */}
        <section className="mt-20">
          <h3 className="text-xl sm:text-3xl lg:text-6xl font-bold">My Work</h3>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {items.map((item, idx) => {
              // Insert a full-width quote block after the 4th item (idx === 3)
              if (idx === 1) {
                return (
                  <React.Fragment key={`frag-${item.id}`}>
                    <article key={`item-${item.id}`} className="group">
                      <div className="transform transition duration-300 group-hover:scale-[1.015] group-hover:shadow-2xl group-hover:shadow-black/40">
                        <Placeholder item={item} />
                      </div>
                    </article>

                    {/* Quote spanning all columns */}
                    <div className="lg:col-span-3 md:col-span-2 col-span-1 p-8 sm:p-12 rounded-2xl bg-white/5 backdrop-blur-[1px] border border-white/10">
                      <p className="text-2xl sm:text-3xl lg:text-4xl font-semibold leading-snug tracking-tight">
                        I release most of my Designs in a way that catches the colors gracefully
                      </p>
                    </div>
                  </React.Fragment>
                );
              }
              return (
                <article key={`item-${item.id}`} className="group">
                  <div className="transform transition duration-300 group-hover:scale-[1.015] group-hover:shadow-2xl group-hover:shadow-black/40">
                    <Placeholder item={item} />
                  </div>
                </article>
              );
            })}
          </div>

          {/* Cat in a Box Section */}
          <div className="mt-16">
            <h4 className="text-2xl sm:text-3xl lg:text-5xl font-bold mb-6">Cat in a Box</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {["1.png", "2.png", "3.png", "4.png", "5.png"].map((img, idx) => (
                <article key={`cat-${idx}`} className="group">
                  <div className="transform transition duration-300 group-hover:scale-[1.015] group-hover:shadow-2xl group-hover:shadow-black/40">
                    <div 
                      className="relative w-full aspect-[3/4] bg-[#262224] rounded-xl overflow-hidden ring-1 ring-white/5 cursor-pointer"
                      onClick={() => setFullscreenImage({ image: `images/Cat in a Box/${img}`, caption: `Cat in a Box - Design ${idx + 1}` })}
                    >
                      <img
                        src={`images/Cat in a Box/${img}`}
                        alt={`Cat in a Box ${idx + 1}`}
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          e.target.src = `data:image/svg+xml;utf8,${encodeURIComponent(
                            `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 600 800'><rect width='600' height='800' fill='%23262224'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' fill='white' fill-opacity='0.5' font-family='Inter, Helvetica Neue, Arial, sans-serif' font-size='28'>Cat in a Box</text></svg>`
                          )}`;
                        }}
                      />
                      <div className="pointer-events-none absolute inset-0 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.06)]" />
                      <div className="absolute inset-0 bg-black/0 hover:bg-black/20 transition-colors duration-200 flex items-center justify-center opacity-0 hover:opacity-100">
                        <div className="text-white/80 text-sm font-medium bg-black/50 px-3 py-1 rounded-full">
                          Click to view
                        </div>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>

          {/* Chai Mahal Section */}
          <div className="mt-16">
            <h4 className="text-2xl sm:text-3xl lg:text-5xl font-bold mb-6">Chai Mahal</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {["w1.png", "w2.png", "w3.png", "w4.png", "w5.png", "w6.png", "w7.png"].map((img, idx) => (
                <article key={`chai-${idx}`} className="group">
                  <div className="transform transition duration-300 group-hover:scale-[1.015] group-hover:shadow-2xl group-hover:shadow-black/40">
                    <div 
                      className="relative w-full aspect-[3/4] bg-[#262224] rounded-xl overflow-hidden ring-1 ring-white/5 cursor-pointer"
                      onClick={() => setFullscreenImage({ image: `images/Chai Mahal/${img}`, caption: `Chai Mahal - Design ${idx + 1}` })}
                    >
                      <img
                        src={`images/Chai Mahal/${img}`}
                        alt={`Chai Mahal ${idx + 1}`}
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          e.target.src = `data:image/svg+xml;utf8,${encodeURIComponent(
                            `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 600 800'><rect width='600' height='800' fill='%23262224'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' fill='white' fill-opacity='0.5' font-family='Inter, Helvetica Neue, Arial, sans-serif' font-size='28'>Chai Mahal</text></svg>`
                          )}`;
                        }}
                      />
                      <div className="pointer-events-none absolute inset-0 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.06)]" />
                      <div className="absolute inset-0 bg-black/0 hover:bg-black/20 transition-colors duration-200 flex items-center justify-center opacity-0 hover:opacity-100">
                        <div className="text-white/80 text-sm font-medium bg-black/50 px-3 py-1 rounded-full">
                          Click to view
                        </div>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>

          {/* Harvest Connect Section */}
          <div className="mt-16">
            <h4 className="text-2xl sm:text-3xl lg:text-5xl font-bold mb-6">Harvest Connect</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                "Screenshot 2025-08-15 151613.png",
                "Screenshot 2025-08-15 151629.png",
                "Screenshot 2025-08-15 151703.png"
              ].map((img, idx) => (
                <article key={`harvest-${idx}`} className="group">
                  <div className="transform transition duration-300 group-hover:scale-[1.015] group-hover:shadow-2xl group-hover:shadow-black/40">
                    <div 
                      className="relative w-full aspect-[3/4] bg-[#262224] rounded-xl overflow-hidden ring-1 ring-white/5 cursor-pointer"
                      onClick={() => setFullscreenImage({ image: `images/Harvest Connect/${img}`, caption: `Harvest Connect - Screen ${idx + 1}` })}
                    >
                      <img
                        src={`images/Harvest Connect/${img}`}
                        alt={`Harvest Connect ${idx + 1}`}
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          e.target.src = `data:image/svg+xml;utf8,${encodeURIComponent(
                            `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 600 800'><rect width='600' height='800' fill='%23262224'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' fill='white' fill-opacity='0.5' font-family='Inter, Helvetica Neue, Arial, sans-serif' font-size='28'>Harvest Connect</text></svg>`
                          )}`;
                        }}
                      />
                      <div className="pointer-events-none absolute inset-0 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.06)]" />
                      <div className="absolute inset-0 bg-black/0 hover:bg-black/20 transition-colors duration-200 flex items-center justify-center opacity-0 hover:opacity-100">
                        <div className="text-white/80 text-sm font-medium bg-black/50 px-3 py-1 rounded-full">
                          Click to view
                        </div>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Skills / Statement */}
        <section className="mt-24">
          <div className="max-w-3xl">
            <p className="text-lg sm:text-3xl lg:text-5xl text-gray-200 leading-relaxed">
              With being <span className="font-bold text-white">proficient</span> to briefs on opposite sides of the spectrum
            </p>
          </div>
        </section>

        {/* Tools Section */}
        <section className="mt-24">
          <h3 className="text-2xl sm:text-3xl font-bold mb-6">Tools</h3>
          <div className="flex justify-center gap-8">
            {[
              "download  (2).png",
              "download (3).jpg"
            ].map((img, idx) => (
              <article key={`tools-${idx}`} className="group">
                <div className="transform transition duration-300 group-hover:scale-[1.05] group-hover:shadow-xl group-hover:shadow-black/40">
                  <div 
                    className="relative w-24 h-24 sm:w-32 sm:h-32 lg:w-36 lg:h-36 bg-[#262224] rounded-xl overflow-hidden ring-1 ring-white/5 cursor-pointer"
                    onClick={() => setFullscreenImage({ image: `images/tools/${img}`, caption: `tool ${idx + 1}` })}
                  >
                    <img
                      src={`images/tools/${img}`}
                      alt={`Tool ${idx + 1}`}
                      className="h-full w-full object-contain p-3"
                      onError={(e) => {
                        e.target.src = `data:image/svg+xml;utf8,${encodeURIComponent(
                          `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' fill='%23262224'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' fill='white' fill-opacity='0.5' font-family='Inter, Helvetica Neue, Arial, sans-serif' font-size='12'>Tool</text></svg>`
                        )}`;
                      }}
                    />
                    <div className="pointer-events-none absolute inset-0 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.06)]" />
                    <div className="absolute inset-0 bg-black/0 hover:bg-black/20 transition-colors duration-200 flex items-center justify-center opacity-0 hover:opacity-100">
                      <div className="text-white/80 text-xs font-medium bg-black/50 px-2 py-1 rounded-full">
                        Click to view
                      </div>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      
        {/* Work with Me */}
        <section className="mt-28 mb-24">
          <h3 className="text-4xl sm:text-5xl font-extrabold">Work with Me</h3>
          <div className="mt-4">
            <a href="mailto:srushtiyaligar23@gmail.com" className="text-white text-lg underline decoration-white/40 underline-offset-4 hover:decoration-white">
              srushtiyaligar23@gmail.com
            </a>
          </div>
        </section>

        {/* Footer */}
        <footer className="pb-16">
          <p className="text-sm text-gray-400">Love.Laugh.Live</p>
        </footer>
      </div>

      {/* Fullscreen Image Modal */}
      {fullscreenImage && (
        <div 
          className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setFullscreenImage(null)}
        >
          <div className="relative w-full h-full flex flex-col items-center justify-center">
            {/* Close button */}
            <button
              onClick={() => setFullscreenImage(null)}
              className="absolute top-4 right-4 text-white/80 hover:text-white text-2xl font-bold bg-black/50 hover:bg-black/70 rounded-full w-10 h-10 flex items-center justify-center transition-colors z-10"
              aria-label="Close fullscreen view"
            >
              ×
            </button>
            
            {/* Fullscreen image */}
            <img
              src={fullscreenImage.image}
              alt={fullscreenImage.caption}
              className="max-w-[90vw] max-h-[85vh] object-contain rounded-lg shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
            
            {/* Image caption */}
            <div className="mt-4 text-center">
              <p className="text-white text-lg font-medium">{fullscreenImage.caption}</p>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
