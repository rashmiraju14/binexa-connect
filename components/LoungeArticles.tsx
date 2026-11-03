import { getPeptideArticleMetadata, peptideArticleUrl } from "@/lib/lounge/article-metadata";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", { month: "long", day: "numeric", year: "numeric", timeZone: "UTC" }).format(new Date(value));
}

export default async function LoungeArticles() {
  const { published, updated, checkedAt } = await getPeptideArticleMetadata();
  return (
    <article className="learning-card lounge-featured-article"><div className="learning-card-body">
      <div className="lounge-article-labels"><span className="lounge-article-featured">Featured article</span><span className="lounge-article-topic">Skin care · Expert perspective</span></div>
      <h3>Peptides and Skin Care: Benefits, Risks and What a Dermatologist Want You to Know</h3>
      <p>A NewYork-Presbyterian dermatologist discusses topical peptides, the evidence behind skin-care claims, and questions to ask before adding them to your routine.</p>
      <div className="postmeta">NewYork-Presbyterian · Health Matters · 5 min read</div>
      <p className="postmeta lounge-article-dates">Published <time dateTime={published}>{formatDate(published)}</time>
        {updated && updated.slice(0, 10) !== published.slice(0, 10) && <><br /><span className="lounge-article-updated">Updated <time dateTime={updated}>{formatDate(updated)}</time></span></>}
        {checkedAt && <><br />Last checked <time dateTime={checkedAt}>{formatDate(checkedAt)} at {new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit", timeZone: "UTC" }).format(new Date(checkedAt))} UTC</time></>}
      </p>
      <a className="textlink content-action lounge-article-read" href={peptideArticleUrl} target="_blank" rel="noopener noreferrer">Read the full article ↗</a>
    </div></article>
  );
}
