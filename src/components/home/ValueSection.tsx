const valueCards = [
  {
    title: '单次进近',
    description: '围绕单个航班的进近过程，展示风扰指数、风向风速与风险状态在时间维度上的变化。',
  },
  {
    title: '机场画像',
    description: '汇总不同机场在多时间尺度下的风扰表现，用于横向比较与趋势识别。',
  },
  {
    title: '事件归因',
    description: '将风扰指标与运行事件关联呈现，支持识别重点机场与潜在影响因素。',
  },
];

function ValueSection() {
  return (
    <section id="value-section" className="px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
      <div className="mx-auto max-w-[1680px]">
        <div className="value-band">
          <div className="max-w-3xl">
            <div className="section-kicker bg-white/70">项目价值说明</div>
            <h2 className="mt-5 text-3xl font-bold leading-tight sm:text-4xl">风扰风险的多尺度表达</h2>
            <p className="mt-4 text-sm leading-7 text-muted-foreground sm:text-base">
              平台围绕单次进近、机场运行画像与事件关联分析三个层面，构建可比较、可解释的风扰风险表征。
            </p>
          </div>

          <div className="mt-8 grid gap-4 lg:grid-cols-3">
            {valueCards.map((card) => (
              <article key={card.title} className="surface-card bg-white/80">
                <div className="text-lg font-semibold text-foreground">{card.title}</div>
                <p className="mt-4 text-sm leading-7 text-muted-foreground">{card.description}</p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default ValueSection;
