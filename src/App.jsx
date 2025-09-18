import React, { useState, useEffect, useRef } from "react";
import axios from "axios";

export default function App() {
  const [movementData, setMovementData] = useState({
    totalDistance: "0m",
    prevDistance: "0m",
    totalDiet: "0",
    totalSleep: "0",
    totalWater: "0",
    prevDiet: "0",
    prevSleep: "0",
    prevWater: "0"
  });
  const [recentMovements, setRecentMovements] = useState([]);
  const [gptAdvice, setGptAdvice] = useState("데이터를 분석하고 있습니다...");
  const canvasRef = useRef(null);

<<<<<<< HEAD
  const backendURL = "https://macro-coil-459205-d6.du.r.appspot.com/"; // 백엔드 서버 주소
  const streamURL = "https://192.168.137.189:5005/video_feed"; // 라즈베리파이 실시간 영상 주소
=======
  const backendURL = "https://macro-coil-459205-d6.du.r.appspot.com/";
  const streamURL = "https://192.168.137.189:5005/video_feed";
>>>>>>> 03f4aa8b42a8dcebf5182aeced1abdf3cd98d170

  const extractDistance = (distanceStr) => {
    const num = parseFloat(String(distanceStr).replace(/[^0-9.]/g, ""));
    return isNaN(num) ? 0 : num;
  };

  // GPT 조언 가져오기 함수
  const fetchGptAdvice = async () => {
    try {
      const response = await axios.get(`${backendURL}get_gpt_advice`);
      setGptAdvice(response.data.advice);
    } catch (error) {
      console.error("GPT 조언 가져오기 실패:", error);
      setGptAdvice("조언을 가져오는 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
    }
  };

  const fetchData = async (isfirst) => {
    try {
      const [tracking, recent, diet, water, sleep] = await Promise.all([
        axios.get(`${backendURL}get_tracking_info`),
        axios.get(`${backendURL}recent_movements` + "?isfirst=" + isfirst),
        axios.get(`${backendURL}get_diet_info`),
        axios.get(`${backendURL}get_water_info`),
        axios.get(`${backendURL}get_sleep_info`),
      ]);
      
      setMovementData({
        totalDistance: tracking.data.total_movement_today,
        prevDistance: tracking.data.avg_movement_past_7days,
        totalDiet: diet.data.total_diet,
        prevDiet: diet.data.prev_avg_diet,
        totalWater: water.data.total_water,
        prevWater: water.data.prev_avg_water,
        totalSleep: sleep.data.total_sleep,
        prevSleep: sleep.data.prev_avg_sleep,
      });

<<<<<<< HEAD
      if (isfirst == 1) { // 처음 마운트 시 10개의 좌표 데이터가 최신순으로 배열에 저장
        setRecentMovements(recent.data.recent_movements);
      } else { // 새로운 좌표를 받으면 배열의 앞에 데이터를 추가하고 가장 오래된 데이터를 제거
=======
      if (isfirst == 1) {
        // 처음에는 전체 배열을 설정
        setRecentMovements(recent.data.recent_movements);
      } else {
        // 함수형 업데이트를 사용해서 현재 상태를 정확히 참조
>>>>>>> 03f4aa8b42a8dcebf5182aeced1abdf3cd98d170
        setRecentMovements(prevMovements => {
          const newMovement = recent.data.recent_movements[0];
          prevMovements.unshift(newMovement)
          prevMovements.pop()
<<<<<<< HEAD
          const updatedMovements = [...prevMovements];
=======
          // 새로운 움직임을 배열 끝에 추가하고, 배열이 너무 길어지면 앞에서 제거
          const updatedMovements = [...prevMovements];
          // 예를 들어 최대 10개까지만 유지하고 싶다면:
          // return updatedMovements.length > 10 ? updatedMovements.slice(1) : updatedMovements;
>>>>>>> 03f4aa8b42a8dcebf5182aeced1abdf3cd98d170
          return updatedMovements;
        });
      }
    } catch (error) {
      console.error("API 호출 실패:", error);
    }
  };

<<<<<<< HEAD
  // 4초에 한 번 데이터를 받아오고 gpt 조언은 마운트 시 한 번만 받아옴
=======
>>>>>>> 03f4aa8b42a8dcebf5182aeced1abdf3cd98d170
  useEffect(() => {
    fetchData(1);
    fetchGptAdvice();
    
    const interval = setInterval(() => {
<<<<<<< HEAD
      fetchData(0); 
=======
      fetchData(0);
>>>>>>> 03f4aa8b42a8dcebf5182aeced1abdf3cd98d170
    }, 4000);
    
    return () => clearInterval(interval);
  }, []); // 빈 의존성 배열

<<<<<<< HEAD
  // 영상 위 원 표시
  // 최신 좌표일수록 작고 진한 빨갛게 표시
  // 오래된 좌표일수록 크고 연한 녹색으로 표시
=======
>>>>>>> 03f4aa8b42a8dcebf5182aeced1abdf3cd98d170
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || recentMovements.length === 0) return;

    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const N = recentMovements.length;
    recentMovements.forEach((point, index) => {
      const ratio = index / (N - 1);

      const radius = 20 + 40 * ratio;
      const opacity = 1.0 - 0.5 * ratio;
      const r = Math.round(255 * (1 - ratio));
      const g = Math.round(255 * ratio);
      const color = `rgba(${r}, ${g}, 0, ${opacity})`;

      ctx.beginPath();
      ctx.arc(parseFloat(point.x), parseFloat(point.y), radius, 0, 2 * Math.PI);
      ctx.fillStyle = color;
      ctx.fill();

      ctx.beginPath();
      ctx.arc(parseFloat(point.x), parseFloat(point.y), 2, 0, 2 * Math.PI);
      ctx.fillStyle = "#ff4500";
      ctx.fill();
    });
  }, [recentMovements]);

<<<<<<< HEAD

  // UI
=======
>>>>>>> 03f4aa8b42a8dcebf5182aeced1abdf3cd98d170
  const InfoCard = ({ label, current, standard, emoji }) => {
    const percentage = Math.min(
      (extractDistance(current) / extractDistance(standard)) * 100,
      100
    );
    return (
      <div
        style={{
          border: "2px solid #ccc",
          padding: "15px",
          borderRadius: "10px",
          backgroundColor: "#f9f9f9",
          width: "600px",
          marginBottom: "10px",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <div>
            {emoji} {label}: {current}
          </div>
          <div>Standard: {standard}</div>
        </div>
        <div
          style={{
            background: "#e0e0e0",
            height: "10px",
            borderRadius: "5px",
            overflow: "hidden",
            marginTop: "8px",
          }}
        >
          <div
            style={{
              width: `${percentage}%`,
              background:
                percentage < 30
                  ? "#f44336"
                  : percentage < 70
                  ? "#4caf50"
                  : "#ff9800",
              height: "100%",
            }}
          ></div>
        </div>
        <div style={{ fontSize: "12px", color: "#666", marginTop: "4px" }}>
          {percentage.toFixed(1)}% of standard ({standard})
        </div>
      </div>
    );
  };

  const currentDistance = extractDistance(movementData.totalDistance);
  const standardDistance = extractDistance(movementData.prevDistance);

  return (
    <div style={{ width: "100%" }}>
      {/* 상단 배너 */}
      <div
        style={{
          width: "100%",
          padding: "10px 16px",
          background: "#f7f3e9",
          color: "#4b3f34",
          borderBottom: "1px solid #e6dfd2",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: "12px",
        }}
      >
        <span style={{ fontSize: "32px" }}>🐹</span>
        <div
          style={{ display: "flex", flexDirection: "column", lineHeight: 1.1 }}
        >
          <span
            style={{
              fontSize: "35px",
              fontWeight: 700,
              letterSpacing: "2px",
            }}
          >
            H.A.M
          </span>
          <span style={{ fontSize: "12px", color: "#6b5e52" }}>
            Hamster Assistant Masters
          </span>
        </div>
      </div>

      {/* 메인 레이아웃 */}
      <div
        style={{
          display: "flex",
          padding: "20px",
          border: "2px solid black",
        }}
      >
        {/* 영상 */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            width: "640px",
            marginLeft: "40px",
          }}
        >
          <div
            style={{
              position: "relative",
              width: "640px",
              height: "480px",
              border: "2px solid black",
            }}
          >
            <img src={streamURL} alt="Live Stream" width={640} height={480} />
            <canvas
              ref={canvasRef}
              width={640}
              height={480}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                pointerEvents: "none",
              }}
            />
          </div>
        </div>

        {/* 오른쪽 UI 블록 */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {InfoCard({
            label: "Tracking",
            current: movementData.totalDistance,
            standard: movementData.prevDistance,
            emoji: "📍",
          })}
          {InfoCard({
            label: "Eating",
            current: movementData.totalDiet + "분",
            standard: movementData.prevDiet + "분",
            emoji: "🍽️",
          })}
          {InfoCard({
            label: "Drinking",
            current: movementData.totalWater + "분",
            standard: movementData.prevWater + "분",
            emoji: "🥤",
          })}
          {InfoCard({
            label: "Sleeping",
            current: movementData.totalSleep + "시간",
            standard: movementData.prevSleep + "시간",
            emoji: "🛏️",
          })}

          {/* GPT 조언 박스 */}
          <div
            style={{
              width: "600px",
              marginTop: "10px",
              border: "2px solid #f6e05e",
              background: "#fffbea",
              borderRadius: "10px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
              padding: "14px 16px",
              fontSize: "16px",
              fontWeight: "normal",
              color: "#333",
              textAlign: "left",
              minHeight: "60px",
              display: "flex",
              alignItems: "center",
            }}
          >
            <div style={{ width: "100%" }}>
              <div style={{ 
                fontSize: "14px", 
                color: "#666", 
                marginBottom: "8px",
                display: "flex",
                alignItems: "center",
                gap: "8px"
              }}>
                <span>🤖</span>
                <span style={{ fontWeight: "bold" }}>AI 건강 조언</span>
              </div>
              <div style={{ lineHeight: "1.4" }}>
                {gptAdvice}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}