# music-web-player
Firebase 기반 음악재생 WebApp

2020년 11~12월 즈음 안드로이드에서 아이폰으로 갈아타고 평소 즐겨듣는 음악 파일을 재생할 수 없어 개발하게 된 웹앱 서비스입니다. 
firebase의 Authentication, Storage, Hosting 3가지 서비스를 이용했습니다.

# 1. 구현 컨셉
Storage에 저장된 파일을 받아 indexed DB에 Blob 형식으로 저장시킨 뒤, 저장된 Blob 객체를 audio 태그에 적용시켜 음악을 재생하는 원리입니다. 브라우저의 인터넷 사용기록을 삭제하거나, 브라우저의 개발툴에서 직접 indexedDB를 지우지 않는 한 음악파일은 캐시에 유지되므로 초기 로딩 이후에는 트래픽을 사용하지 않습니다.

# 2. 실행 방법
소스코드를 다운로드 받았다고 해서 바로 시연이 가능한 것은 아닙니다. firebase에서 프로젝트를 생성한 후 아래 스크린샷 순서대로 앱 플랫폼 Config정보를 생성해주세요.

## 1. firebase tools 설치
firebase 서비스를 이용하려면 firebase tool이 설치되어 있어야 합니다. 아래 명령어로 설치하세요.

```npm install -g firebase-tools```

## 2. firebaseConfig 생성

![app 플랫폼 생성1](/docs/img/appconfig1.png)

![app 플랫폼 생성2](/docs/img/appconfig2.png)

![app 플랫폼 생성3](/docs/img/appconfig3.png)

이 단계까지 오시면 firebaseConfig 가 생성된 것을 볼 수 있습니다.

# QnA

Q. 앱스토어에 클라우드 기반의 음악재생 앱이 있는데 왜 굳이 개발했나요?
A. 믿음이 안가서요. 신뢰할 수 있는 기업이 만든게 아니라면 다운로드 받지 않습니다.

