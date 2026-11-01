import type { Stock } from '@/lib/providers/types';
import { getProductInfo, productLabels } from '@/lib/markets/product-info';

/** Static reviewed content rendered on the server; no market or Redis requests. */
export function ProductInfo({ stock, locale }: { stock: Stock; locale: string }) {
  const product = getProductInfo(stock, locale);
  const labels = productLabels[product.locale];
  const fields = [
    [labels.country, product.country], [labels.type, product.productType],
    [labels.underlying, product.underlying], [labels.exchange, product.exchange],
    [labels.unit, product.quoteUnit],
  ];
  return (
    <section className="rounded-xl border p-4 sm:p-6 space-y-4" aria-labelledby="product-information-heading">
      <h2 id="product-information-heading" className="text-xl font-semibold">{product.heading}</h2>
      <p className="leading-relaxed text-muted-foreground">{product.locale === 'en' ? product.sourceDescription : product.overview}</p>
      <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {fields.map(([label, value]) => <div key={label}><dt className="text-xs text-muted-foreground mb-1">{label}</dt><dd className="text-sm font-medium break-words">{value}</dd></div>)}
      </dl>
      {product.notes.length > 0 && <ul className="list-disc pl-5 space-y-2 text-sm text-muted-foreground">{product.notes.map(note => <li key={note}>{note}</li>)}</ul>}
      {product.locale !== 'en' && <div className="space-y-2 border-t pt-4 text-sm text-muted-foreground"><h3 className="font-medium text-foreground">{labels.original}</h3><p className="leading-relaxed" lang="en">{product.sourceDescription}</p></div>}
      <p className="text-xs text-muted-foreground">{labels.note} <a className="underline underline-offset-2" href={product.sourceUrl} target="_blank" rel="noopener noreferrer">{labels.source}</a></p>
    </section>
  );
}
