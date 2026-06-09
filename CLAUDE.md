@AGENTS.md

# NightTicker 프로젝트

야간/주말/휴일 주식 참고가격 조회 서비스. Hyperliquid Market Prices 기준.

## 기술 스택
- Next.js 16 (App Router)
- next-intl (i18n: EN/KO)
- Tailwind CSS + shadcn/ui
- Hyperliquid WebSocket API (실시간 시세)

## 주요 구조
- `/stock/[slug]` - 개별 종목 페이지 (SEO용 slug 기반 URL)
- `lib/markets/stocks.ts` - 종목 데이터 (symbol, name, slug 등)
- `lib/context/FavoritesContext.tsx` - 즐겨찾기 상태 관리
- `lib/hooks/useHyperliquidTicker.ts` - WebSocket 실시간 시세

## 최근 작업 (2024-06)
- URL 구조 변경: `/markets/[symbol]` → `/stock/[slug]` (SEO 최적화)
- 종목이름/티커 표시 순서 변경 (이름 먼저)
- OG 이미지 동적 생성
- JSON-LD 구조화 데이터
- FavoritesContext로 즐겨찾기 상태 공유
- 언어 전환 수정 (NEXT_LOCALE 쿠키)

## 참고
- Hyperliquid API 심볼은 `xyz:` 프리픽스 사용 (예: `xyz:AAPL`)
- 코드에서는 프리픽스 제거해서 사용
