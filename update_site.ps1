# ─────────────────────────────────────────────────────
#  ★ 포트폴리오 원클릭 업데이트 (업데이트.bat이 이 파일을 실행합니다)
#  흐름: 변경 확인 → 커밋 메시지 입력 → add → commit → push
#  비개발자용 — 까만 창의 안내문을 따라가면 됩니다.
#  자세한 사용법은 "나중에 나 혼자 볼 설명서.md" 참고.
# ─────────────────────────────────────────────────────
param([string]$Message = "")

# 이 스크립트가 있는 폴더(프로젝트 루트)에서 실행
Set-Location -Path $PSScriptRoot

try { $Host.UI.RawUI.WindowTitle = "포트폴리오 사이트 업데이트" } catch { }

# 창이 바로 닫히지 않게 마지막에 Enter를 기다리는 함수
function Wait-BeforeClose {
    Write-Host ""
    try { Read-Host "창을 닫으려면 Enter 키를 누르세요" | Out-Null } catch { }
}

Write-Host ""
Write-Host "  =================================================="
Write-Host "    포트폴리오 사이트 업데이트"
Write-Host "  =================================================="
Write-Host ""

# ── 0. git이 설치되어 있는지 확인 ──
$git = Get-Command git -ErrorAction SilentlyContinue
if (-not $git) {
    Write-Host "  [문제 발생] 이 컴퓨터에서 git을 찾을 수 없어요." -ForegroundColor Red
    Write-Host "  git이 삭제됐거나 경로 설정이 바뀐 것 같아요."
    Write-Host "  https://git-scm.com/download/win 에서 설치한 뒤 다시 실행해 주세요."
    Wait-BeforeClose; exit 1
}

# ── 1. 바뀐 파일이 있는지 확인 ──
$changes = git status --porcelain
if (-not $changes) {
    Write-Host "  변경된 내용이 없어요. 올릴 게 없습니다." -ForegroundColor Yellow
    Write-Host "  파일을 수정한 뒤 저장(Ctrl+S)했는지 확인해 주세요."
    Wait-BeforeClose; exit 0
}

Write-Host "  이번에 바뀐 파일 목록:"
Write-Host "  --------------------------------------------------"
git status --short
Write-Host "  --------------------------------------------------"
Write-Host ""

# ── 2. 커밋 메시지 입력 — 엔터만 치면 날짜로 자동 생성 ──
$msg = $Message
if (-not $msg) {
    try { $msg = Read-Host "  어떤 걸 바꿨는지 한 줄로 적어주세요 (그냥 Enter = 날짜로 자동)" } catch { $msg = "" }
}
if (-not $msg) {
    $msg = (Get-Date -Format "yyyy-MM-dd HH:mm") + " 업데이트"
}

Write-Host ""
Write-Host "  저장 메모: `"$msg`""
Write-Host ""

# ── 3. 변경 파일 담기 (add) ──
git add -A
if ($LASTEXITCODE -ne 0) {
    Write-Host "  [문제 발생] 파일을 담는 단계(add)에서 실패했어요." -ForegroundColor Red
    Write-Host "  파일이 다른 프로그램에서 열려 잠겨 있을 수 있어요."
    Write-Host "  편집 중인 프로그램을 모두 닫고 이 스크립트를 다시 실행해 보세요."
    Wait-BeforeClose; exit 1
}

# ── 4. 변경 기록 남기기 (commit) ──
git commit -m $msg
if ($LASTEXITCODE -ne 0) {
    Write-Host "  [문제 발생] 기록을 남기는 단계(commit)에서 실패했어요." -ForegroundColor Red
    Write-Host "  위쪽에 'Please tell me who you are'라는 영어가 보인다면,"
    Write-Host "  컴퓨터를 바꾸거나 git을 재설치해서 이름 설정이 사라진 거예요."
    Write-Host "  '나중에 나 혼자 볼 설명서.md'의 오류 해결 부분을 참고해 주세요."
    Wait-BeforeClose; exit 1
}

Write-Host ""
Write-Host "  기록 완료. 이제 GitHub에 올립니다..."
Write-Host ""

# ── 5. GitHub에 올리기 (push) ──
git push
if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "  [문제 발생] GitHub에 올리는 단계(push)에서 실패했어요. 흔한 원인 3가지:" -ForegroundColor Red
    Write-Host ""
    Write-Host "   1. 인터넷 연결이 끊겨 있어요 - 와이파이를 확인하고 다시 실행해 주세요."
    Write-Host "      이미 기록은 남았으니, 인터넷이 되면 이 스크립트만 다시 실행하면 돼요."
    Write-Host "   2. GitHub 로그인이 풀렸어요 - 로그인 창이 뜨면 브라우저에서 로그인해 주세요."
    Write-Host "   3. 위 영어 메시지에 rejected가 보이면, GitHub 쪽에 더 새로운 내용이 있는 거예요."
    Write-Host "      '나중에 나 혼자 볼 설명서.md'의 오류 해결 부분을 따라해 주세요."
    Wait-BeforeClose; exit 1
}

Write-Host ""
Write-Host "  ==================================================" -ForegroundColor Green
Write-Host "    완료! GitHub에 잘 올라갔어요." -ForegroundColor Green
Write-Host "    실제 사이트에 반영되기까지 1~2분 정도 걸려요." -ForegroundColor Green
Write-Host "  ==================================================" -ForegroundColor Green

Wait-BeforeClose
exit 0
