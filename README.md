# TUK PATH v2

한국공학대학교 학생 맞춤형 기회 추천 웹사이트 (비공식 학생 프로젝트).

## 무엇이 바뀌었나요?
- 웹사이트에 필요한 것은 `index.html`, `style.css`, `app.js`, `data/notices.json`뿐입니다.
- 방문자는 Python이나 별도 서버를 실행하지 않습니다.
- GitHub Actions는 약 6시간마다 Node.js 스크립트로 공개 게시판을 읽어 `data/notices.json`을 갱신합니다.
- 수집이 실패하면 실패 상태를 표시하고 이전 수집 결과를 유지합니다. **최신 모집 가능 여부를 보증하지 않습니다.**
- 개인 프로필과 관심 목록은 로컬 브라우저 저장소(localStorage)에 저장합니다.

## 인터넷에 무료 배포하고 자동 갱신 켜기
1. GitHub에서 새 **공개 저장소**를 만든 후, ZIP 내부의 `tuk-path-v2/` 폴더 **안에 있는 파일과 숨김 폴더 `.github`를 모두 저장소 루트**로 올립니다.
2. 기본 브랜치를 `main`으로 설정합니다.
3. GitHub 저장소의 **Settings → Pages → Build and deployment → GitHub Actions**를 선택하고 저장합니다.
4. **Actions** 탭에서 `Update notices and publish site` 워크플로를 선택하고 **Run workflow**로 최초 수집을 실행합니다.
5. 저장소 **Settings → Actions → General → Workflow permissions**에서 `Read and write permissions`을 허용해야 자동 업데이트가 JSON 파일을 커밋할 수 있습니다. 조직 정책으로 막혀 있다면 저장소 관리자의 도움이 필요합니다.
6. Pages 주소는 보통 `https://사용자명.github.io/저장소명/`입니다. GitHub Pages 배포가 완료되면 웹사이트가 열립니다.

**주의:** GitHub Actions의 예약 실행은 정확한 시각에 실행되지 않거나 지연될 수 있으며, 비활성 저장소에서는 중단될 수 있습니다. 수집 오류/게시판 구조 변경/robots.txt 등 학교 정책에 따라 업데이트가 막힐 수 있습니다. 배포 즉시 갱신 보장되는 서비스가 아니고, 학교의 공식 서비스도 아닙니다.

## 로컬 미리보기
- 파일을 더블클릭해도 화면은 열릴 수 있지만 일부 브라우저에서 `file://` 주소로 JSON을 읽는 요청이 차단됩니다.
- 이 경우 화면의 **상시 가이드**만 보입니다. 실제 공지 연결 확인은 GitHub Pages 배포 후 진행해 주세요.
- 개발 중이라면 VS Code Live Server 같은 정적 서버로 확인할 수 있습니다. **Python은 필요하지 않습니다.**

## 수집 방식 및 한계
- 수집 대상: `https://tukorea.ac.kr/tukorea/1097/subview.do`, `https://tukorea.ac.kr/tukorea/6622/subview.do`, `https://haksa.tukorea.ac.kr/haksa/2996/subview.do`.
- 실제 URL/게시판 구조는 변할 수 있어, 게시판별 파싱에 실패하면 `notices.json`의 `errors`와 UI 상태를 확인해야 합니다.
- 날짜는 기본적으로 **게시 날짜**이며 모집 마감일이 아닙니다.
- 학교 공지는 제목의 키워드로 **임시 분류**하므로 분류/학과별 지원 자격을 최종 보증하지 않습니다.
- 공개 공지 인덱스만 수집하며 로그인이 필요한 자료를 우회하지 않습니다. 운영 전에 사이트의 자동 접근/재배포 정책을 확인하세요.
- 글의 개별 링크가 `javascript:`인 경우 임의로 상세 주소를 조립하지 않고 게시판 링크로 연결합니다.
- 게시판 구조 변경으로 데이터가 비어도 허위 공지 사례를 생성하지 않습니다.

## 파일 구조
```text
index.html, style.css, app.js     사이트 UI
scripts/sync.mjs                 공개 공지 목록 수집(Node.js 표준 기능만 사용)
data/notices.json               정적 배포 데이터
.github/workflows/sync.yml      6시간 주기 자동 실행
.nojekyll                       GitHub Pages 설정
```

## 쉽게 올리는 방법
- 새 Public 저장소 이름: `tuk-path`
- Add file → Upload files에서 압축을 푼 `tuk-path-v2` 폴더 안의 파일 전체를 올리세요. `.github` 폴더가 포함되어야 합니다.
- Settings → Pages → Source: GitHub Actions
- Settings → Actions → General → Workflow permissions: Read and write permissions
- Actions → Update notices and publish site → Run workflow
- 몇 분 후 Settings → Pages에서 공개 주소 확인
