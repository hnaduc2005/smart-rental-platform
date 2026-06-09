type PagePlaceholderProps = {
  title: string;
};

export function PagePlaceholder({ title }: PagePlaceholderProps) {
  return (
    <main>
      {/* TODO: Replace this placeholder with the feature-specific screen. */}
      <h1>{title}</h1>
    </main>
  );
}
