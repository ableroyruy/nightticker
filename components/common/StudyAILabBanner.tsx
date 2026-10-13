import Image from 'next/image';

const banners = {
  investing: {
    src: '/banners/studyailab-investing.png',
    alt: 'AI로 ETF 비교부터 포트폴리오 설계까지 — AI로 ETF부터 주식까지',
    caption: 'AI로 ETF부터 주식까지 · 자세히 보기 →',
    width: 720,
  },
  investingGuide: {
    src: '/banners/studyailab-stock-etf.png',
    alt: 'AI로 끝내는 주식 & ETF 실전 투자 — 실전투자대회 수상자의 AI 분석 비법 공개',
    caption: 'AI로 끝내는 주식 & ETF 실전 투자 · 자세히 보기 →',
    width: 640,
  },
} as const;

export function StudyAILabBanner({ variant }: { variant: keyof typeof banners }) {
  const banner = banners[variant];

  return (
    <aside aria-label="Study AI Lab 도서 소개" className="px-4 py-6">
      <a
        href="https://www.studyailab.com/"
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`${banner.caption} (새 탭에서 열기)`}
        className="group mx-auto block w-full"
        style={{ maxWidth: banner.width }}
      >
        <Image
          src={banner.src}
          alt={banner.alt}
          width={1365}
          height={768}
          sizes={`(max-width: ${banner.width + 32}px) calc(100vw - 32px), ${banner.width}px`}
          className="h-auto w-full rounded-xl border border-border transition-opacity group-hover:opacity-90"
        />
        <span className="mt-3 block text-center text-sm text-muted-foreground transition-colors group-hover:text-foreground">
          {banner.caption}
        </span>
      </a>
    </aside>
  );
}
