import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Button from '../../components/Button';
import ArticleList from '../../components/ArticleList';
import staticArticles from '../../assets/article-content.js';
import { fetchArticles } from '../../services/ArticleService';

const ArticleListPage = () => {
  const [dbArticles, setDbArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchArticles()
      .then(({ data }) => {
        const active = (data.articles || []).filter((a) => a.isActive);
        setDbArticles(active);
      })
      .catch(() => setDbArticles([]))
      .finally(() => setLoading(false));
  }, []);

  // Combine static articles + DB articles (DB articles shown after static ones)
  const allArticles = [
    ...staticArticles,
    ...dbArticles,
  ];

  const featured = allArticles[0];
  const rest = allArticles.slice(1);

  return (
    <div className="flex w-full flex-col">

      {/* PAGE HEADER */}
      <section className="border-b border-neutral-800 bg-neutral-950 px-6 py-14 lg:px-12">
        <div className="mx-auto max-w-7xl">
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.3em] text-amber-400">
            CineVault Reviews
          </p>
          <h1 className="max-w-xl text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl">
            Essential Films, Reviewed
          </h1>
          <p className="mt-4 max-w-lg text-base leading-7 text-neutral-500">
            In-depth critical reviews of cinema's most important films — from timeless classics to contemporary masterworks.
          </p>
          <div className="mt-7">
            <Button to="/">Back Home</Button>
          </div>
        </div>
      </section>

      {/* FEATURED REVIEW */}
      {featured && (
        <section className="border-b border-neutral-800 bg-neutral-950 px-6 pt-12 pb-6 lg:px-12">
          <div className="mx-auto max-w-7xl">
            <p className="mb-5 text-[10px] font-semibold uppercase tracking-[0.3em] text-neutral-600">Featured Review</p>

            <Link to={`/articles/${featured.name || featured.slug}`} className="group block">
              <article className="relative overflow-hidden rounded-2xl border border-neutral-800 group-hover:border-neutral-700 transition-colors duration-300 min-h-[420px] flex items-end">
                {featured.image ? (
                  <img
                    src={featured.image}
                    alt={featured.title}
                    className="absolute inset-0 h-full w-full object-cover opacity-50 group-hover:opacity-60 group-hover:scale-105 transition-all duration-700"
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-neutral-800 to-neutral-900" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/60 to-transparent" />

                <div className="relative z-10 w-full p-8 lg:p-10">
                  <div className="flex flex-wrap items-center gap-4 mb-4">
                    <span className="text-[10px] font-semibold uppercase tracking-[0.28em] text-amber-400">{featured.genre}</span>
                    <span className="text-neutral-600 text-xs">·</span>
                    <span className="text-xs text-neutral-500">dir. {featured.director}</span>
                    <span className="text-neutral-600 text-xs">·</span>
                    <span className="text-xs text-neutral-500">{featured.year}</span>
                    <span className="ml-auto text-sm font-bold text-amber-400 tabular-nums">
                      {featured.rating}<span className="text-neutral-600 font-normal text-xs"> / 10</span>
                    </span>
                  </div>

                  <h2 className="max-w-2xl text-3xl font-bold leading-tight text-white sm:text-4xl">
                    {featured.title}
                  </h2>

                  <p className="mt-4 max-w-xl text-sm leading-7 text-neutral-400">
                    {(featured.content?.[0] || featured.preview || '').substring(0, 200)}…
                  </p>

                  <div className="mt-6 inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-neutral-400 group-hover:text-amber-400 transition-colors">
                    Read Full Review <span className="text-base">→</span>
                  </div>
                </div>
              </article>
            </Link>
          </div>
        </section>
      )}

      {/* REST OF REVIEWS */}
      <section className="border-b border-neutral-800 bg-neutral-900 px-6 py-12 lg:px-12">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 flex items-baseline justify-between">
            <h2 className="text-lg font-semibold text-white">More Reviews</h2>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-neutral-600">
              {loading ? '…' : `${rest.length} Reviews`}
            </p>
          </div>
          {rest.length > 0 ? (
            <ArticleList articles={rest} />
          ) : (
            !loading && (
              <p className="text-sm text-neutral-600">No other reviews yet.</p>
            )
          )}
        </div>
      </section>

    </div>
  );
};

export default ArticleListPage;
