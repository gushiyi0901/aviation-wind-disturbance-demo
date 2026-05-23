function SafetyNotice() {
  return (
    <footer className="px-4 pb-10 pt-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1680px] rounded-[28px] border border-amber-300/70 bg-amber-50/90 px-5 py-5 shadow-sm sm:px-6">
        <p className="text-sm leading-7 text-slate-700 sm:text-[15px]">
          <span className="font-semibold text-slate-900">说明：</span>
          本页为科研演示 Demo，所示数据为模拟数据或脱敏样例，仅用于项目交流与可视化展示，不作为实际飞行安全决策依据。
        </p>
        <div className="mt-4 border-t border-amber-200/80 pt-4 text-left text-xs font-medium leading-6 text-slate-600 sm:text-sm">
          版本号 V1.0.0 | 最后更新：2026-05-23 | 版权所有：华东师范大学统计学院
        </div>
      </div>
    </footer>
  );
}

export default SafetyNotice;
