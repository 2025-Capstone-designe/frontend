import React, { useState, useEffect, useRef } from "react";
import Webcam from "react-webcam";
import axios from "axios";

export default function App() {
  const [movementData, setMovementData] = useState({
    totalDistance: "0m",
    prevDistance: "0m", // 주간 평균 이동 거리
    totalDiet: "0",
    totalSleep: "0",
    totalWater: "0",
    prevDiet: "0",
    prevSleep: "0",
    prevWater: "0"
  });

  const [recentMovements, setRecentMovements] = useState([]);
  const canvasRef = useRef(null);

  const backendURL = "https://macro-coil-459205-d6.du.r.appspot.com/";

  // 숫자만 추출해서 float 변환
  const extractDistance = (distanceStr) => {
    const num = parseFloat(String(distanceStr).replace(/[^0-9.]/g, ''));
    return isNaN(num) ? 0 : num;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [tracking, recent, diet, water, sleep] = await Promise.all([
          axios.get(`${backendURL}get_tracking_info`),
          axios.get(`${backendURL}recent_movements`),
          axios.get(`${backendURL}get_diet_info`),
          axios.get(`${backendURL}get_water_info`),
          axios.get(`${backendURL}get_sleep_info`),
        ]);

        setMovementData({
          totalDistance: tracking.data.total_movement_today.toFixed(2) + "m",
          prevDistance: tracking.data.avg_movement_past_7days.toFixed(2) + "m",
          totalDiet: diet.data.total_diet.toFixed(0),
          prevDiet: diet.data.prev_avg_diet.toFixed(0),
          totalWater: water.data.total_water.toFixed(0),
          prevWater: water.data.prev_avg_water.toFixed(0),
          totalSleep: (sleep.data.total_sleep / 3600).toFixed(1),
          prevSleep: (sleep.data.prev_avg_sleep / 3600).toFixed(1)
        });

        setRecentMovements(recent.data.recent_movements.map(item => ({
          ...item,
          createdAt: item.timestamp
        })));
      } catch (error) {
        console.error("API 호출 실패:", error);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    drawPath(recentMovements);
  }, [recentMovements]);

  const drawPath = (points) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const now = new Date();

    points.forEach((point) => {
      const ageMs = now - new Date(point.createdAt);
      const ageSec = ageMs / 1000;
      const ageRatio = Math.min(ageSec / 10, 1);

      const radius = 20 + 60 * ageRatio;
      const opacity = 0.2 + 0.8 * (1 - ageRatio);
      const r = Math.round(255 * (1 - ageRatio));
      const g = Math.round(255 * ageRatio);
      const color = `rgba(${r}, ${g}, 0, ${opacity})`;

      ctx.beginPath();
      ctx.arc(parseFloat(point.x), parseFloat(point.y), radius, 0, 2 * Math.PI);
      ctx.fillStyle = color;
      ctx.fill();

      ctx.beginPath();
      ctx.arc(parseFloat(point.x), parseFloat(point.y), 3, 0, 2 * Math.PI);
      ctx.fillStyle = "#ff4500";
      ctx.fill();
    });
  };

  // InfoCard 컴포넌트
  const InfoCard = ({ label, current, standard, emoji }) => {
    const percentage = Math.min((extractDistance(current) / extractDistance(standard)) * 100, 100);
    const standardLabel = "Standard";

    return (
      <div style={{ border: "2px solid #ccc", padding: "15px", borderRadius: "10px", backgroundColor: "#f9f9f9", width: "380px", marginBottom: "10px" }}>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <div>{emoji} {label}: {current}</div>
          <div>{standardLabel}: {standard}</div>
        </div>
        <div style={{ background: "#e0e0e0", height: "10px", borderRadius: "5px", overflow: "hidden", marginTop: "8px" }}>
          <div style={{ width: `${percentage}%`, background: percentage < 30 ? "#f44336" : percentage < 70 ? "#4caf50" : "#ff9800", height: "100%" }}></div>
        </div>
        <div style={{ fontSize: "12px", color: "#666", marginTop: "4px" }}>
          {percentage.toFixed(1)}% of standard ({standard})
        </div>
      </div>
    );
  };

  // 추천 문구
  const currentDistance = extractDistance(movementData.totalDistance);
  const standardDistance = extractDistance(movementData.prevDistance);

  const recommendationText =
    `오늘 하루는 standard(${standardDistance.toFixed(2)}m)와 비교해 tracking(${currentDistance.toFixed(2)}m) 양이 `
    + (currentDistance < standardDistance ? "적으므로 운동을 추천합니다." : "많으므로 휴식을 추천합니다.");

  return (
    <div style={{ display: "flex", padding: "20px", border: "2px solid black" }}>
      {/* 왼쪽: 캠+캔버스 */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
        <div style={{ position: "relative", width: "640px", height: "480px", border: "2px solid black" }}>
          <Webcam width={640} height={480} screenshotFormat="image/jpeg" />
          <canvas
            ref={canvasRef}
            width={640}
            height={480}
            style={{ position: "absolute", top: 0, left: 0, pointerEvents: "none" }}
          />
        </div>
      </div>

      {/* 오른쪽: InfoCard + 추천문구 */}
      <div style={{ marginLeft: "20px", display: "flex", flexDirection: "column", alignItems: "center" }}>
        {InfoCard({ label: "Tracking", current: movementData.totalDistance, standard: movementData.prevDistance, emoji: "📍" })}
        {InfoCard({ label: "Eating", current: movementData.totalDiet + "분", standard: movementData.prevDiet + "분", emoji: "🍽️" })}
        {InfoCard({ label: "Drinking", current: movementData.totalWater + "분", standard: movementData.prevWater + "분", emoji: "🥤" })}
        {InfoCard({ label: "Sleeping", current: movementData.totalSleep + "시간", standard: movementData.prevSleep + "시간", emoji: "🛏️" })}

        {/* 추천 문구 */}
        <div style={{ marginTop: "3px", fontSize: "15px", fontWeight: "bold", color: "#333", width: "380px", textAlign: "center" }}>
          {recommendationText}
        </div>
      </div>
    </div>
  );
}
