function SafetyNotice() {
  return (
    <footer className="px-4 pb-10 pt-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1680px] rounded-[28px] border border-amber-300/70 bg-amber-50/90 px-5 py-5 shadow-sm sm:px-6">
        <p className="text-sm leading-7 text-slate-700 sm:text-[15px]">
          <span className="font-semibold text-slate-900">说明：</span>
          本页为科研演示 Demo，所示数据为模拟数据或脱敏样例，仅用于项目交流与可视化展示，不作为实际飞行安全决策依据。
        </p>
      </div>
    </footer>
  );
}

export default SafetyNotice;
