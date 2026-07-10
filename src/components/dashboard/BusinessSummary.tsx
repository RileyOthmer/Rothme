export function BusinessSummary({ text }: { text: string }) {
  return (
    <section className="rounded-xl border border-border bg-surface p-6 shadow-sm sm:p-7">
      <div className="eyebrow mb-3">Business summary</div>
      <p className="text-[15px] leading-relaxed text-foreground sm:text-base">{text}</p>
    </section>
  );
}
