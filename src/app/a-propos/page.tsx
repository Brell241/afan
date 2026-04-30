import type { Metadata } from 'next';
import Link from 'next/link';
import { Youtube, Music2, Heart, Shuffle, ArrowLeft } from 'lucide-react';

export const metadata: Metadata = {
  title: 'À propos — Afan | La Forêt Musicale',
  description: 'Afan est un sanctuaire numérique dédié à la préservation du patrimoine musical gabonais. Tout le contenu audio vient de YouTube.',
};

export default function AProposPage() {
  return (
    <div className="min-h-screen bg-[#121212] text-white">

      {/* NAV */}
      <nav className="fixed top-0 inset-x-0 z-50 bg-[#121212]/95 backdrop-blur-md border-b border-white/5">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="text-white font-black text-xl tracking-tight">afan</Link>
          <Link
            href="/"
            className="flex items-center gap-2 text-[#B3B3B3] hover:text-white text-sm transition-colors"
          >
            <ArrowLeft size={14} />
            Retour
          </Link>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-6 pt-32 pb-24">

        {/* TITRE */}
        <p className="text-[#1DB954] text-xs uppercase tracking-[0.25em] mb-4">À propos</p>
        <h1 className="text-5xl sm:text-7xl font-black leading-none tracking-tighter mb-8">
          Pourquoi<br />
          <span className="text-[#1DB954]">Afan</span>
        </h1>
        <p className="text-[#B3B3B3] text-lg leading-relaxed max-w-2xl mb-20">
          Afan veut dire <em>forêt</em> en Fang. C'est aussi le nom d'un projet né d'une conviction simple :
          la musique gabonaise mérite d'exister quelque part, proprement rangée, accessible à tous.
        </p>

        <div className="space-y-16">

          {/* BLOC 1 — LE CONCEPT */}
          <section className="border-t border-white/5 pt-12">
            <div className="flex items-start gap-6">
              <div className="w-10 h-10 rounded-full bg-[#1DB954]/10 flex items-center justify-center flex-shrink-0 mt-1">
                <Music2 size={18} className="text-[#1DB954]" />
              </div>
              <div>
                <h2 className="text-white font-bold text-xl mb-4">Le concept</h2>
                <p className="text-[#B3B3B3] leading-relaxed mb-4">
                  Afan est une encyclopédie musicale — un endroit où chaque artiste gabonais a sa propre fiche :
                  biographie, discographie complète, paroles, anecdotes, artistes liés.
                  Rien de plus, rien de moins.
                </p>
                <p className="text-[#B3B3B3] leading-relaxed">
                  L'idée est de créer un point de référence qui n'existait pas.
                  Pas un streaming, pas une boutique — juste une archive vivante,
                  construite collectivement, ouverte à tous.
                </p>
              </div>
            </div>
          </section>

          {/* BLOC 2 — YOUTUBE */}
          <section className="border-t border-white/5 pt-12">
            <div className="flex items-start gap-6">
              <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center flex-shrink-0 mt-1">
                <Youtube size={18} className="text-red-500" />
              </div>
              <div>
                <h2 className="text-white font-bold text-xl mb-4">Tout vient de YouTube</h2>
                <p className="text-[#B3B3B3] leading-relaxed mb-4">
                  Soyons honnêtes : Afan ne stocke aucun fichier audio.
                  Chaque titre que tu écoutes ici est une vidéo YouTube intégrée.
                  C'est la seule source disponible pour une grande partie de ce patrimoine —
                  des dizaines d'albums gabonais n'existent nulle part ailleurs sur internet.
                </p>
                <p className="text-[#B3B3B3] leading-relaxed mb-4">
                  Afan ne fait que mettre de l'ordre dans ce qui est déjà là :
                  retrouver les vidéos, les associer aux bons artistes et aux bons albums,
                  les rendre lisibles et navigables.
                </p>
                <div className="bg-white/[0.04] border border-white/[0.08] rounded-xl p-5">
                  <p className="text-[#B3B3B3] text-sm leading-relaxed">
                    <span className="text-white font-semibold">Note importante :</span>{' '}
                    si une vidéo YouTube disparaît ou est supprimée, le titre devient muet dans Afan.
                    C'est une limite réelle, qu'on assume. Le but est que les fiches restent,
                    même si l'audio fluctue.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* BLOC 3 — PERSONNEL */}
          <section className="border-t border-white/5 pt-12">
            <div className="flex items-start gap-6">
              <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center flex-shrink-0 mt-1">
                <Heart size={18} className="text-purple-400" />
              </div>
              <div>
                <h2 className="text-white font-bold text-xl mb-4">Une passion personnelle</h2>
                <p className="text-[#B3B3B3] leading-relaxed mb-4">
                  J'aime les chansons traditionnelles. Pas toujours en Français —
                  souvent en Fang, en Myènè, en Punu, en Nzebi, ou dans d'autres langues
                  que je ne comprends pas toujours.
                </p>
                <p className="text-[#B3B3B3] leading-relaxed mb-4">
                  Et pourtant, il y a quelque chose là-dedans.
                  Une émotion qui passe avant les mots. Un rythme, une voix, une mélodie
                  qui te dit quelque chose sur un endroit et une époque que tu n'as peut-être jamais connus.
                </p>
                <p className="text-[#B3B3B3] leading-relaxed">
                  C'est ça qui m'a poussé à faire Afan — ne pas laisser ça se perdre dans les profondeurs de YouTube
                  sans que personne ne sache vraiment que ça existe.
                </p>
              </div>
            </div>
          </section>

          {/* BLOC 4 — INVITATION */}
          <section className="border-t border-white/5 pt-12">
            <div className="flex items-start gap-6">
              <div className="w-10 h-10 rounded-full bg-[#1DB954]/10 flex items-center justify-center flex-shrink-0 mt-1">
                <Shuffle size={18} className="text-[#1DB954]" />
              </div>
              <div>
                <h2 className="text-white font-bold text-xl mb-4">Va écouter au hasard</h2>
                <p className="text-[#B3B3B3] leading-relaxed mb-4">
                  Le meilleur conseil que je puisse donner : ouvre YouTube,
                  cherche le nom d'un artiste gabonais, et laisse-toi surprendre.
                  Pas besoin de tout comprendre. Pas besoin d'avoir un contexte.
                  Lance une chanson au hasard et vois ce qui se passe.
                </p>
                <p className="text-[#B3B3B3] leading-relaxed mb-8">
                  Afan est là pour donner un peu de contexte à ce que tu trouves —
                  un nom, une date, un album, une histoire.
                  Mais la découverte, elle commence toujours par une écoute.
                </p>

                <div className="flex flex-col sm:flex-row gap-4">
                  <Link
                    href="/"
                    className="inline-flex items-center justify-center gap-2 bg-[#1DB954] hover:bg-[#1ed760] text-black font-bold text-sm px-6 py-3 rounded-full transition-colors"
                  >
                    Explorer les artistes
                  </Link>
                  <a
                    href="https://www.youtube.com/results?search_query=musique+traditionnelle+gabonaise"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 bg-white/[0.06] hover:bg-white/[0.1] text-white font-bold text-sm px-6 py-3 rounded-full border border-white/10 transition-colors"
                  >
                    <Youtube size={14} className="text-red-500" />
                    Chercher sur YouTube
                  </a>
                </div>
              </div>
            </div>
          </section>

        </div>
      </main>

      {/* FOOTER */}
      <footer className="border-t border-white/5 px-6 py-6 max-w-4xl mx-auto flex items-center justify-between">
        <span className="text-[#B3B3B3] text-xs font-bold">afan</span>
        <span className="text-[#535353] text-xs">open-source · Gabon · 2025</span>
      </footer>

    </div>
  );
}
