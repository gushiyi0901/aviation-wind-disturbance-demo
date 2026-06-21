import { ArrowLeft, ExternalLink, LogOut } from 'lucide-react';
import BrandLogos from '../components/BrandLogos';
import fangPhoto from '../assets/方方教授照片.png';
import zhongPhoto from '../assets/钟琰副教授照片.png';
import yuPhoto from '../assets/郁淼淼副教授照片.png';
import patent1 from '../assets/专利1_一种运行风险量化方法、运行风险评价方法及装置.png';
import patent2 from '../assets/专利2_一种航空风险评价方法、装置及计算机设备.png';
import patent3 from '../assets/专利3_一种计及记录偏差的航空数据匹配方法.png';
import patent4 from '../assets/专利4_一种确定冲出跑道风险的飞行参数安全阈值的方法、设备.png';
import patent5 from '../assets/专利5_飞机着陆乱流指数的确定方法、装置、存储介质及设备.png';

type TeamPageProps = {
  onLogout: () => void;
};

const faculty = [
  {
    name: '方方',
    title: '教授',
    photo: fangPhoto,
    role: '现任负责人',
    introduction: '华东师范大学统计学院教授，博士生导师，民建华东师大委员会主委',
    details: [
      '上海市东方英才计划拔尖人才',
      '国家自然科学基金重点项目主持人',
      '上海市自然科学二等奖',
      '全国工业统计学教学研究会数字经济与区块链技术分会副理事长',
      'SCI 期刊 Journal of Nonparametric Statistics 副主编',
      '发表论文于 AOS/JOE/Biometrika/JBES 等统计学和计量经济学顶刊',
    ],
  },
  {
    name: '钟琰',
    title: '副教授',
    photo: zhongPhoto,
    details: [
      '美国德州农工大学统计学博士',
      '上海市海外领军人才（青年）',
      '主持一项国家自然科学基金青年项目',
      '研究方向：统计机器学习、统计计算、统计交叉学科应用',
      '发表论文于 Biometrics/Statistics and Computing/IEEE TAES 等统计学和航空航天领域顶级期刊',
    ],
  },
  {
    name: '郁淼淼',
    title: '副教授',
    photo: yuPhoto,
    details: [
      '上海市浦江人才计划',
      '上海市“超级博士后”',
      '中国优选法统筹法与经济数学研究会数据科学分会副秘书长',
      'The first place winner of the best presentation award in the Quality and Data Science Doctoral Forum',
      '研究方向：质量控制、在线监控',
      '发表论文于 JOE/AOAS/JQT/IISE Trans 等统计学和质量控制顶刊',
    ],
  },
];

const patents = [
  { title: '一种运行风险量化方法、运行风险评价方法及装置', image: patent1 },
  { title: '一种航空风险评价方法、装置及计算机设备', image: patent2 },
  { title: '一种计及记录偏差的航空数据匹配方法', image: patent3 },
  { title: '一种确定冲出跑道风险的飞行参数安全阈值的方法、设备', image: patent4 },
  { title: '飞机着陆乱流指数的确定方法、装置、存储介质及设备', image: patent5 },
];

const publications = [
  <>
    Zhong, Y., Liu, T., Fang, F., Ge, J., Xu, B., &amp; Zhao, X. (2024). Hard landing pattern recognition and
    precaution with QAR data by functional data analysis. <em>IEEE Transactions on Aerospace and Electronic Systems</em>,{' '}
    <em>60</em>(4), 5101-5113.
  </>,
  <>
    Zhong, Y., Lu, X., Zhao, X., Wang, Y., &amp; Fang, F. (2026). Landing Tail-Strike Risk Pattern Identification and
    Prediction Based on Functional QAR Data. <em>Aerospace</em>, <em>13</em>(6), 553.
  </>,
  <>
    Zhong, Y., Peng, X., Xiong, X., Fang, F., &amp; Zhao, X. (2026). Identification of Airspeed Safety Envelope for Long
    Landing. <em>Journal of Aerospace Information Systems</em>, accept.
  </>,
];

function SectionHeading({ index, title }: { index: string; title: string }) {
  return (
    <div className="mb-7 flex items-baseline gap-4 border-b border-[#cfd8e3] pb-4">
      <span className="font-mono text-sm font-semibold text-[#a44537]">{index}</span>
      <h2 className="text-2xl font-bold text-[#142b47] sm:text-3xl">{title}</h2>
    </div>
  );
}

function TeamPage({ onLogout }: TeamPageProps) {
  return (
    <div className="min-h-screen bg-[#f5f7f9]/95 text-[#1f2d3d]">
      <header className="border-b border-[#dbe2e9] bg-white/95 px-4 py-4 backdrop-blur sm:px-6 lg:px-8">
        <nav className="mx-auto flex max-w-[1440px] flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <BrandLogos />
          <div className="flex flex-wrap items-center gap-2">
            <a href="/" className="action-secondary h-10 rounded-md px-4">
              <ArrowLeft size={16} />
              返回首页
            </a>
            <button type="button" onClick={onLogout} className="action-secondary h-10 rounded-md px-4">
              <LogOut size={16} />
              退出登录
            </button>
          </div>
        </nav>
      </header>

      <main>
        <section className="border-b border-[#dbe2e9] bg-white px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
          <div className="mx-auto grid max-w-[1440px] gap-10 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-end">
            <div>
              <p className="mb-4 text-sm font-semibold text-[#a44537]">华东师范大学统计学院</p>
              <h1 className="max-w-5xl text-4xl font-bold leading-tight text-[#142b47] sm:text-5xl lg:text-6xl">
                民航安全大数据分析团队
              </h1>
              <p className="mt-6 max-w-3xl text-lg leading-8 text-[#516273]">
                现有团队成员 12 人，包括教授 2 名、副教授 2 名、助理教授 1 名、研究生 7 名。
              </p>
            </div>

            <dl className="grid grid-cols-2 gap-x-7 gap-y-5 border-l-4 border-[#2f6f68] pl-6">
              <div>
                <dt className="text-sm text-[#607080]">团队成员</dt>
                <dd className="mt-1 text-3xl font-bold text-[#142b47]">12 人</dd>
              </div>
              <div>
                <dt className="text-sm text-[#607080]">教授</dt>
                <dd className="mt-1 text-3xl font-bold text-[#142b47]">2 名</dd>
              </div>
              <div>
                <dt className="text-sm text-[#607080]">副教授</dt>
                <dd className="mt-1 text-3xl font-bold text-[#142b47]">2 名</dd>
              </div>
              <div>
                <dt className="text-sm text-[#607080]">助理教授</dt>
                <dd className="mt-1 text-3xl font-bold text-[#142b47]">1 名</dd>
              </div>
              <div className="col-span-2">
                <dt className="text-sm text-[#607080]">研究生</dt>
                <dd className="mt-1 text-3xl font-bold text-[#142b47]">7 名</dd>
              </div>
            </dl>
          </div>
        </section>

        <section className="px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
          <div className="mx-auto max-w-[1440px]">
            <SectionHeading index="01" title="部分团队成员" />
            <div className="space-y-6">
              {faculty.map((member, memberIndex) => (
                <article
                  key={member.name}
                  className="grid overflow-hidden rounded-lg border border-[#d8e0e8] bg-white shadow-[0_10px_35px_rgba(20,43,71,0.06)] lg:grid-cols-[19rem_minmax(0,1fr)]"
                >
                  <div className="flex flex-col items-center justify-center bg-[#e9eef3] px-7 py-8 text-center">
                    <img
                      src={member.photo}
                      alt={`${member.name}${member.title}照片`}
                      className="aspect-square w-44 rounded-full border-4 border-white object-cover shadow-md"
                    />
                    <h3 className="mt-5 text-2xl font-bold text-[#142b47]">{member.name}</h3>
                    <p className="mt-1 font-semibold text-[#a44537]">{member.title}</p>
                    {member.role && <p className="mt-3 text-sm font-medium text-[#2f6f68]">{member.role}</p>}
                  </div>

                  <div className="px-6 py-8 sm:px-9">
                    {member.introduction && (
                      <p className="mb-6 border-l-4 border-[#a44537] pl-4 text-lg font-semibold leading-8 text-[#27384a]">
                        方方，{member.introduction}
                      </p>
                    )}
                    <ul className={`grid gap-x-10 gap-y-3 text-base leading-7 text-[#435466] ${memberIndex === 0 ? 'xl:grid-cols-2' : ''}`}>
                      {member.details.map((detail) => (
                        <li key={detail} className="flex gap-3">
                          <span className="mt-[0.7rem] h-1.5 w-1.5 shrink-0 rounded-full bg-[#2f6f68]" aria-hidden="true" />
                          <span>{detail}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="border-y border-[#dbe2e9] bg-white px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
          <div className="mx-auto max-w-[1440px]">
            <SectionHeading index="02" title="项目与成果" />
            <div className="grid gap-6 lg:grid-cols-2">
              <div className="rounded-lg border border-[#d8e0e8] p-7 sm:p-9">
                <p className="text-sm font-semibold text-[#2f6f68]">上海市重点项目立项（2022-2025）</p>
                <h3 className="mt-4 text-2xl font-bold leading-10 text-[#142b47]">
                  “大数据背景下航空安全管理中的关键数理问题研究”
                </h3>
              </div>
              <div className="rounded-lg border border-[#d8e0e8] p-7 sm:p-9">
                <p className="text-sm font-semibold text-[#2f6f68]">发明专利</p>
                <p className="mt-4 text-2xl font-bold leading-10 text-[#142b47]">申请中国发明专利 7 项（已授权 5 项）</p>
              </div>
            </div>
          </div>
        </section>

        <section className="px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
          <div className="mx-auto max-w-[1440px]">
            <SectionHeading index="03" title="已授权发明专利" />
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {patents.map((patent, index) => (
                <article key={patent.title} className="flex flex-col overflow-hidden rounded-lg border border-[#d8e0e8] bg-white">
                  <a
                    href={patent.image}
                    target="_blank"
                    rel="noreferrer"
                    className="group relative block aspect-[3/4] overflow-hidden bg-[#f2f4f6] p-4"
                    title="打开专利证书原图"
                  >
                    <img
                      src={patent.image}
                      alt={`${patent.title}发明专利证书`}
                      loading="lazy"
                      className="h-full w-full object-contain transition duration-200 group-hover:scale-[1.015]"
                    />
                    <span className="absolute right-3 top-3 inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#d8e0e8] bg-white/95 text-[#142b47] shadow-sm">
                      <ExternalLink size={16} aria-hidden="true" />
                      <span className="sr-only">打开原图</span>
                    </span>
                  </a>
                  <div className="flex flex-1 gap-4 border-t border-[#e2e7ec] p-5">
                    <span className="font-mono text-sm font-semibold text-[#a44537]">{String(index + 1).padStart(2, '0')}</span>
                    <h3 className="text-base font-bold leading-7 text-[#27384a]">{patent.title}</h3>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
          <div className="mx-auto max-w-[1440px]">
            <SectionHeading index="04" title="相关发表文章" />
            <ol className="divide-y divide-[#d8e0e8] border-y border-[#d8e0e8] bg-white px-5 sm:px-8">
              {publications.map((publication, index) => (
                <li key={index} className="grid gap-4 py-7 sm:grid-cols-[3rem_minmax(0,1fr)] sm:py-8">
                  <span className="font-mono text-sm font-semibold text-[#a44537]">[{index + 1}]</span>
                  <p className="break-words text-base leading-8 text-[#35475a] sm:text-lg">{publication}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>
      </main>
    </div>
  );
}

export default TeamPage;
