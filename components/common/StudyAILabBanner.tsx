import Image from 'next/image';

const banners = {
  investing: {
    src: '/banners/studyailab-investing.png',
    alt: 'AI로 ETF 비교부터 포트폴리오 설계까지 — AI로 ETF부터 주식까지',
    caption: 'AI로 ETF부터 주식까지 · 자세히 보기 →',
    width: 720,
  },
  noCode: {
    src: '/banners/studyailab-no-code.png',
    alt: 'AI로 코딩 없이 개발하기 — 아파트 찾기, 주식 챗봇, 쇼츠 제작',
    caption: 'AI로 코딩 없이 개발하기 · 자세히 보기 →',
    width: 640,
  },
  projects: {
    src: '/banners/studyailab-projects.png',
    alt: '비전공자도 완성하는 6가지 실전 프로젝트 — 프로처럼 AI로 코딩 없이 개발하기',
    caption: 'AI로 만드는 6가지 실전 프로젝트 · 자세히 보기 →',
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
