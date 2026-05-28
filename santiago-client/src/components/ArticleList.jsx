import { Link } from 'react-router-dom';

const ArticleList = ({ articles }) => {
  return (
    <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
      {articles.map((article, ) => (
        <article
          key={article._id || article.name}
          className="group flex flex-col rounded-xl border border-neutral-800 bg-neutral-900 overflow-hidden hover:border-neutral-700 transition-colors duration-300"
        >
          {/* Thumbnail */}
          <div className="aspect-[4/3] overflow-hidden bg-neutral-800">
            {article.image ? (
              <img
                src={article.image}
                alt={article.title}
                className="h-full w-full object-cover opacity-70 group-hover:opacity-90 group-hover:scale-105 transition-all duration-500"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-neutral-800 to-neutral-900">
                <span className="font-mono text-xs uppercase tracking-widest text-neutral-600">No Image</span>
              </div>
            )}
          </div>

          <div className="flex flex-col flex-1 p-5">
            {/* Genre + Rating row */}
            <div className="flex items-center justify-between mb-2">
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-amber-400">
                {article.genre}
              </p>
              <span className="text-[11px] font-bold text-white tabular-nums">
                {article.rating}
                <span className="text-neutral-600 font-normal"> / 10</span>
              </span>
            </div>

            {/* Title */}
            <h3 className="text-[15px] font-semibold leading-snug text-white">
              {article.title}
              <span className="ml-1.5 text-[13px] font-normal text-neutral-600">{article.year}</span>
            </h3>

            {/* Director */}
            <p className="mt-1 text-xs text-neutral-600">
              dir. {article.director}
            </p>

            {/* Excerpt */}
            <p className="mt-3 grow text-xs leading-6 text-neutral-500">
              {(article.content?.[0] || article.preview || '').substring(0, 110)}…
            </p>

            {/* Rating bar */}
            <div className="mt-4 h-px w-full bg-neutral-800">
              <div
                className="h-px bg-amber-400/60 transition-all duration-700 group-hover:bg-amber-400"
                style={{ width: `${(article.rating / 10) * 100}%` }}
              />
            </div>

            {/* Link */}
            <Link
              to={`/articles/${article.name || article._id}`}
              className="mt-4 inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-500 hover:text-amber-400 transition-colors"
            >
              Read Review
              <span className="text-base leading-none">→</span>
            </Link>
          </div>
        </article>
      ))}
    </div>
  );
};

export default ArticleList;
