import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Button from '../../components/Button';
import staticArticles from '../../assets/article-content.js';
import { fetchArticleBySlug, fetchArticleById } from '../../services/ArticleService';

function getReadTime(content) {
  const words = content.join(' ').split(/\s+/).length;
  return Math.max(1, Math.round(words / 200));
}

function ArticlePage() {
  const { name } = useParams();

  const staticArticle = staticArticles.find((a) => a.name === name);
  const isObjectId = /^[0-9a-f]{24}$/i.test(name);

  const [dbArticle, setDbArticle] = useState(null);
  const [loading, setLoading] = useState(!staticArticle);

  useEffect(() => {
    if (staticArticle) return;
    const fetcher = isObjectId ? fetchArticleById(name) : fetchArticleBySlug(name);
    fetcher
      .then(({ data }) => setDbArticle(data))
      .catch(() => setDbArticle(null))
      .finally(() => setLoading(false));
  }, [name, staticArticle, isObjectId]);

  const article = staticArticle ?? dbArticle;

  if (loading) {
    return (
      <div className="flex w-full flex-col">
        <section className="border-b border-neutral-800 bg-neutral-950 px-6 py-14 lg:px-12">
          <div className="mx-auto max-w-3xl">
            <p className="text-neutral-500 text-sm">Loading…</p>
          </div>
        </section>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="flex w-full flex-col">
        <section className="border-b border-neutral-800 bg-neutral-950 px-6 py-14 lg:px-12">
          <div className="mx-auto max-w-3xl">
            <h1 className="text-3xl font-bold text-white">Review not found</h1>
            <div className="mt-6"><Button to="/articles">Back to Reviews</Button></div>
          </div>
        </section>
      </div>
    );
  }

  const content = article.content ?? (article.preview ? [article.preview] : []);
  const readTime = getReadTime(content.length ? content : ['']);

  return (
    <div className="flex w-full flex-col">

      {/* HEADER */}
      <section className="border-b border-neutral-800 bg-neutral-950 px-6 py-12 lg:px-12">
        <div className="mx-auto max-w-7xl">
          <div className="mb-7">
            <Button to="/articles">← Back to Reviews</Button>
          </div>

          <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.3em] text-amber-400">
            {article.genre}
          </p>
          <h1 className="max-w-3xl text-3xl font-bold leading-tight tracking-tight text-white sm:text-5xl">
            {article.title}
          </h1>

          {/* Metadata bar */}
          <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-neutral-800 pt-6">
            <div className="flex flex-col gap-0.5">
              <p className="text-[9px] font-semibold uppercase tracking-[0.25em] text-neutral-600">Director</p>
              <p className="text-sm text-neutral-300">{article.director}</p>
            </div>
            <div className="h-8 w-px bg-neutral-800" />
            <div className="flex flex-col gap-0.5">
              <p className="text-[9px] font-semibold uppercase tracking-[0.25em] text-neutral-600">Year</p>
              <p className="text-sm text-neutral-300">{article.year}</p>
            </div>
            <div className="h-8 w-px bg-neutral-800" />
            <div className="flex flex-col gap-0.5">
              <p className="text-[9px] font-semibold uppercase tracking-[0.25em] text-neutral-600">Read Time</p>
              <p className="text-sm text-neutral-300">{readTime} min</p>
            </div>
            <div className="h-8 w-px bg-neutral-800" />
            {/* Rating */}
            <div className="flex flex-col gap-0.5">
              <p className="text-[9px] font-semibold uppercase tracking-[0.25em] text-neutral-600">Rating</p>
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-bold text-amber-400 tabular-nums">{article.rating}</span>
                <span className="text-xs text-neutral-600">/ 10</span>
              </div>
            </div>
            {/* Rating bar */}
            <div className="ml-auto hidden sm:flex flex-col gap-1.5 min-w-[140px]">
              <div className="h-1 w-full rounded-full bg-neutral-800">
                <div
                  className="h-1 rounded-full bg-amber-400"
                  style={{ width: `${(article.rating / 10) * 100}%` }}
                />
              </div>
              <p className="text-[9px] font-semibold uppercase tracking-widest text-neutral-600">Score</p>
            </div>
          </div>
        </div>
      </section>

      {/* HERO IMAGE */}
      {article.image && (
        <section className="border-b border-neutral-800 bg-neutral-900 px-6 py-10 lg:px-12">
          <div className="mx-auto max-w-7xl">
            <div className="overflow-hidden rounded-2xl border border-neutral-800">
              <img
                src={article.image}
                alt={article.title}
                className="w-full h-[420px] object-cover opacity-75"
              />
            </div>
          </div>
        </section>
      )}

      {/* CONTENT */}
      <section className="border-b border-neutral-800 bg-neutral-950 px-6 py-14 lg:px-12">
        <div className="mx-auto max-w-7xl grid gap-12 lg:grid-cols-3">

          {/* Main text */}
          <div className="lg:col-span-2">
            <h2 className="mb-8 text-[10px] font-semibold uppercase tracking-[0.3em] text-neutral-600">Full Review</h2>
            <div className="space-y-7">
              {content.length > 0 ? content.map((paragraph, index) => (
                <p key={index} className="text-[15px] leading-8 text-neutral-400 first-letter:text-3xl first-letter:font-bold first-letter:text-white first-letter:float-left first-letter:mr-2 first-letter:leading-none">
                  {paragraph}
                </p>
              )) : (
                <p className="text-sm text-neutral-600">No review content available yet.</p>
              )}
            </div>
            <div className="mt-10 pt-6 border-t border-neutral-800">
              <Button to="/articles">← Back to Reviews</Button>
            </div>
          </div>

          {/* Sidebar */}
          <aside className="flex flex-col gap-5">
            {/* Score card */}
            <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-6">
              <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-neutral-600 mb-4">CineVault Score</p>
              <div className="flex items-end gap-2 mb-3">
                <span className="text-5xl font-bold text-amber-400 tabular-nums leading-none">{article.rating}</span>
                <span className="text-neutral-600 mb-1">/ 10</span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-neutral-800">
                <div
                  className="h-1.5 rounded-full bg-amber-400"
                  style={{ width: `${(article.rating / 10) * 100}%` }}
                />
              </div>
              <p className="mt-3 text-xs text-neutral-600 leading-5">
                {article.rating === 10
                  ? "A perfect film. Essential viewing."
                  : article.rating >= 9
                  ? "A masterpiece. Highly recommended."
                  : "Outstanding. Well worth your time."}
              </p>
            </div>

            {/* About card */}
            <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-6">
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-neutral-600 mb-3">About this Review</p>
              <p className="text-sm leading-7 text-neutral-500">
                Part of the CineVault editorial series — in-depth critical examinations of the films that have shaped world cinema across every era and genre.
              </p>
            </div>

            {/* CTA */}
            <div className="rounded-xl border border-amber-400/15 bg-neutral-900 p-6">
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-amber-400 mb-2">More Reviews</p>
              <p className="text-sm leading-6 text-neutral-400 mb-5">Explore the full CineVault review library.</p>
              <Button to="/articles" variant="primary">Browse All</Button>
            </div>
          </aside>

        </div>
      </section>

    </div>
  );
}

export default ArticlePage;
