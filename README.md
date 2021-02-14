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

프로젝트를 생성 후 몇 차례 단계를 거치면 Firebase Console 웹 화면이 표시됩니다. 상단 프로젝트 개요의 설정아이콘을 눌러 프로젝트 설정에 이동한 후, 아래 이미지 단계에 따라 작업을 수행하세요.

![app 플랫폼 생성1](/docs/img/appconfig1.png)

![app 플랫폼 생성2](/docs/img/appconfig2.png)

![app 플랫폼 생성3](/docs/img/appconfig3.png)

이 단계까지 완료하면 firebaseConfig 가 생성된 것을 볼 수 있습니다. 이상태에서 firebaseConfig 변수값을 복사하시거나, 콘솔로 이동 후 프로젝트 설정화면 하단에 생성된 웹 앱 플랫폼정보에서 복사하시면 됩니다.

![app 플랫폼 생성4](/docs/img/appconfig4.png)

## 3. 프로젝트 src 폴더 내 firebaseConfig.ts 파일 추가

프로젝트 src 폴더 내 firebaseConfig.ts를 넣고 전 단계에서 생성한 firebaseConfig 변수를 export 할 수 있도록 모듈화시켜 코딩하세요.

<pre><code>
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
export const firebaseConfig = {
  apiKey: "{프로젝트 apiKey}",
  authDomain: "{프로젝트 authDomain}",
  projectId: "{프로젝트 projectId}",
  storageBucket: "{프로젝트 storageBucket}",
  messagingSenderId: "{프로젝트 messagingSenderId}",
  appId: "{프로젝트 appId}",
  measurementId: "{프로젝트 measurementId}"
};

</code></pre>

## 4. .firebaserc 파일 생성
프로젝트 root 경로에 .firebaserc 파일을 생성하세요.

<pre><code>
{
  "projects": {
    "default": "{프로젝트명}"
  }
}
</code></pre>

## 5. firebase Storage에 파일업로드
Firebase Console 웹 화면에서 재생하고 싶은 음악 파일을 storage에 업로드 합니다. 사용하시는 브라우저의 audio 태그에서 지원할 수 있는 파일을 올리시기 바랍니다. 대게 mp3, mp4는 문제없이 동작할 것입니다.

## 6. firebase Authentication 에서 로그인 제공업체 "Google" 선택
Firebase Console 웹 화면의 Authentication 란에 사용할 로그인 제공업체를 선택합니다. 이 프로젝트는 Google을 기준으로 개발하였기 때문에 Google을 사용설정해야 합니다.

![로그인 공급업체 설정](/docs/img/setauth.png)

# QnA

Q. 앱스토어에 클라우드 기반의 음악재생 앱이 있는데 왜 굳이 개발했나요?
A. 믿음이 안가서요. 신뢰할 수 있는 기업이 만든게 아니라면 다운로드 받지 않습니다.

