# 📖 Frontend
상명대학교 캡스톤 프로젝트 H.A.M팀의 프론트엔드 소개 페이지입니다.
<img width="2879" height="1627" alt="구조" src="https://github.com/user-attachments/assets/dd6359f3-d686-415c-a1ea-737b875368bd" />
<img width="2000" height="771" alt="화면1" src="https://github.com/user-attachments/assets/ec192ab4-9d78-4242-affb-086e2b799e59" />

# 🚀기능
1. 라즈베리파이로부터 받은 실시간 영상 데이터 수신 및 표시
2. 백엔드 서버로부터 각종 데이터 수신 및 표시
   - Tracking: 오늘 움직인 거리
   - Eating: 오늘 식사 시간
   - Drinking: 오늘 수분 섭취 시간
   - Sleeping: 오늘 수면 시간
   - AI 건강 조언: 수집한 데이터를 활용해 GPT가 분석한 조언
   - 원 표시: 개체가 움직인 경로를 실시간 영상 위에 표시 (총 10개의 원 표시)
       - 최신 좌표일수록 작고 진하고 빨갛게 표시
       - 오래된 좌표일수록 크고 연하고 녹색으로 표시
   - Standard: 오늘 데이터와 비교하기 위한 전 날 개체의 데이터를 표시

# ⚙️사용법
src\App.jsx 파일의  backendURL과 streamURL을 실사용 환경에 맞게 수정할 필요가 있습니다.
현재 코드와 같이 streamURL으로 사설 ip 주소를 사용한다면 프론트엔드 페이지에 접속하는 기기와 영상을 송신하는 라즈베리파이가 같은 네트워크 내에 있어야 정상적으로 수신합니다.

## 로컬로 실행하는 방법
아래 명령어를 통해 git 내용을 복사
```
git clone https://github.com/2025-Capstone-designe/frontend.git
```
src\App.jsx 파일의 backendURL과 streamURL을 현재 환경에 맞게 수정
아래 명령어를 통해 로컬 주소로 프론트엔드를 실행
```
npm run dev
```

## 배포하는 방법
Netlify를 활용하여 github를 연동해 배포 가능 <br></br>
H.A.M 팀의 프론트엔드 배포 주소: https://ham-elaborate-granita-15882a.netlify.app/
