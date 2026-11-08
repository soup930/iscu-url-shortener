# URL Shortener — 1~7주차 누적 결과물

서울사이버대학교 클라우드 컴퓨팅 1~7주차 실습을 하나의 Next.js 프로젝트로 합친 결과물입니다.

## 구현 기능

- URL 입력값 검증과 반응형 입력 화면
- `POST /api/shorten`의 201/400/500 응답
- SHA-256 기반의 결정적 6자리 `shortCode`
- Neon Postgres에 URL 매핑 저장
- `GET /{shortCode}`의 307 Redirect와 404 처리
- Redirect 응답의 `Cache-Control: no-store`
- 클릭 수와 최근 클릭 시간 기록
- `/admin` 통계 화면과 `/api/stats`
- Basic Authentication 및 역할 기반 Authorization
- 자기 서비스 URL 단축 차단

## 1. 설치

```bash
npm install
```

## 2. Neon 데이터베이스 준비

Neon SQL Editor에서 [`schema.sql`](./schema.sql)을 실행합니다.

기존 4주차 테이블에 6주차 컬럼만 추가해야 한다면 다음 SQL을 사용합니다.

```sql
ALTER TABLE urls
ADD COLUMN IF NOT EXISTS click_count BIGINT NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_clicked_at TIMESTAMPTZ;
```

## 3. 환경변수

`.env.example`을 참고하여 `.env.local`을 생성합니다.

```env
DATABASE_URL=Neon의_Pooled_Connection_URL
ADMIN_PASSWORD=관리자_비밀번호
```

실제 비밀번호와 DB 접속 문자열은 Git에 커밋하지 않습니다. 관리자 사용자 이름은 `admin`입니다.

### 로컬 Production 환경

로컬에서 Production 빌드와 실행을 확인할 때는 `.env.prod`를 사용합니다.

```bash
npm run build:prod
npm run start:prod
```

`.env.prod`는 `.gitignore`에 포함되며 GitHub에 올리지 않습니다. Vercel Production은 로컬 파일을 읽는 대신 Vercel 프로젝트의 Production 환경변수에 등록된 `DATABASE_URL`과 `ADMIN_PASSWORD`를 주입받습니다.

## 4. 로컬 실행

```bash
npm run dev
```

- 서비스: `http://localhost:3000`
- 관리자 통계: `http://localhost:3000/admin`
- 통계 API: `http://localhost:3000/api/stats`

## 5. 테스트와 빌드

```bash
npm test
npm run build
```

공개 자동 점검은 저장소의 `assignment` 폴더에서 실행합니다.

```bash
python iscu_url_shortener_check.py --url http://localhost:3000 --allow-local
```

이 검사는 실제 DB가 연결된 실행 서버가 필요합니다.

## 6. Vercel 배포

1. 이 폴더를 GitHub 저장소에 push하고 Vercel 프로젝트로 연결합니다.
2. Vercel 환경변수에 `DATABASE_URL`과 `ADMIN_PASSWORD`를 등록합니다.
3. Production으로 재배포합니다.
4. Vercel Firewall에 다음 Rate Limit 규칙을 추가합니다.

```text
Request Path = /api/shorten
AND Request Method = POST
기준 = IP
Window = 60초
허용 횟수 = 10회
초과 응답 = 429 Too Many Requests
```

Rate Limit은 7주차 요구사항에 따라 애플리케이션 코드가 아닌 Vercel Firewall에서 설정합니다.

배포 후 점검:

```bash
python iscu_url_shortener_check.py --url https://YOUR-PROJECT.vercel.app
```

## API 요약

| 경로 | 동작 | 인증 |
| --- | --- | --- |
| `GET /` | URL 입력 화면 | 없음 |
| `POST /api/shorten` | 단축 URL 생성 | 없음 |
| `GET /{shortCode}` | 원본 URL로 307 이동 | 없음 |
| `GET /admin` | 관리자 통계 화면 | Basic Auth |
| `GET /api/stats` | 통계 JSON | Basic Auth |
