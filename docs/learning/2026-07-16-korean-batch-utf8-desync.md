# 한글이 든 UTF-8 .bat은 cmd가 파싱 자체를 못 한다

- 날짜: 2026-07-16
- 맥락: Portfolio 저장소에 비개발자용 원클릭 업데이트 스크립트(`업데이트.bat`) 제작 중. 커밋 메시지 입력·오류 안내를 전부 한국어로 넣어야 했다.
- 태그: batch, cmd, encoding, utf-8, powershell, chcp

## 문제

한국어 안내문이 든 `.bat`을 UTF-8(BOM 없음)로 저장하고 첫 줄에서 `chcp 65001`을 실행하는 표준 레시피를 썼는데, 실행하자 `'o' is not recognized...`, `'려요.' is not recognized...`처럼 명령이 아닌 한글 문장 조각들이 명령으로 실행되며 스크립트 전체가 붕괴했다. 에러 위치가 매번 문장 중간이라 특정 줄의 문법 오류로는 보이지 않았다.

## 시도한 것들 (실패 포함)

1. `chcp 65001 >nul`을 첫 줄에 둔 UTF-8 무BOM .bat → 위 증상. cmd는 배치 파일을 실행 중 계속 다시 읽는데, 코드페이지가 바뀌면 파서의 바이트 오프셋과 문자 경계가 어긋나(desync) 멀티바이트 한글이 있는 파일에서는 줄 경계 자체가 깨진다. "문법 오류"가 아니라 "파서 붕괴"라서 스크립트 내부를 고쳐서는 해결 불가능하다는 가설이 확정됨.
2. (검토 후 기각) .bat을 CP949로 저장 → 시스템이 "UTF-8 세계 언어 지원" 옵션을 켜면 다시 깨진다. 사용자 기기 설정에 의존하는 해법이라 배제.

## 통한 접근법

역할 분리: **.bat은 ASCII 전용 1줄 런처**, 실제 로직과 모든 한국어 문구는 **UTF-8 BOM이 붙은 .ps1**로 이동.

```bat
@echo off
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0update_site.ps1" %*
```

- .bat에 비ASCII가 0바이트라 어떤 코드페이지에서도 동일하게 파싱된다.
- Windows PowerShell 5.1은 BOM 없는 .ps1을 ANSI(CP949)로 읽으므로 **BOM이 필수**. Write 도구는 BOM 없이 쓰기 때문에 `[IO.File]::WriteAllText($p, $t, [Text.Encoding]::UTF8)`로 재저장해 BOM(EF BB BF)을 붙였다.
- 더블클릭 아닌 자동 테스트에서 `Read-Host`가 stdin 리다이렉트 시 예외를 던질 수 있어 try/catch로 감싸고, 파라미터(`-Message`)로 입력을 우회하는 경로를 뒀다.

## 일반화된 교훈

1. "batch 파일에서 명령이 아닌 문장 조각이 명령으로 실행되는" 증상이 보이면 문법이 아니라 **파일 인코딩 × chcp 조합**부터 확인하라. UTF-8 한글 .bat + chcp 65001은 구조적으로 불안정하다.
2. Windows에서 한국어 출력이 필요한 더블클릭 스크립트의 안전한 기본형은 **ASCII .bat 런처 + UTF-8 BOM .ps1** 조합이다. 시스템 코드페이지 설정과 무관하게 동작한다.
3. Windows PowerShell 5.1용 .ps1에 비ASCII 문자가 있으면 반드시 BOM을 확인하라. BOM 없는 UTF-8은 CP949로 오독되어 문자열이 조용히 깨진다.

## 재발 방지 (선택)

`update_site.ps1` 상단 주석과 `업데이트.bat` 내부 rem 주석에 "이 .bat은 ASCII 전용이어야 한다"는 제약을 명시해 두었다.
