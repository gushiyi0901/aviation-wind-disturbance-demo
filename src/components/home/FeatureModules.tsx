type FeatureModulesProps = {
  compact?: boolean;
};

function FeatureModules({ compact = false }: FeatureModulesProps) {
  return (
    <section
      id="modules"
      className={`px-4 pb-14 sm:px-6 lg:px-8 lg:pb-16 ${
        compact ? 'pt-8 sm:pt-10 lg:pt-12' : 'pt-36 sm:pt-44 lg:pt-52'
      }`}
    >
      <div className="mx-auto max-w-[1680px]">
        <div className="value-band">
          <div className="section-kicker bg-white/70">亮点功能</div>
        </div>
      </div>
    </section>
  );
}

export default FeatureModules;
