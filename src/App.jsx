import React, { useState, useEffect, useRef } from "react";
import Webcam from "react-webcam";
import axios from "axios";

export default function App() {
  const API_BASE_URL = "https://chromatic-force-452710-t3.du.r.appspot.com"; // 백엔드 URL

  const [trackingData, setTrackingData] = useState({
    totalMovement: "로딩 중...",
    eatingDuration: "정보 없음",
    drinkingDuration: "정보 없음",
  });

  const [standardData] = useState({
    standardDistance: "20m", // 기준 이동 거리 (하드코딩)
    standardEatingTime: "15분", // 기준 밥 먹는 시간 (하드코딩)
    standardDrinkingTime: "4분", // 기준 물 마시는 시간 (하드코딩)
  });

  const [showRecommendation, setShowRecommendation] = useState(false);
  const [movementPath, setMovementPath] = useState([]);
  const canvasRef = useRef(null);

  // 📌 백엔드에서 이동 데이터 가져오기
  useEffect(() => {
    async function fetchTrackingData() {
      try {
        const dailyMovementRes = await axios.get(`${API_BASE_URL}/daily_movement`);
        const recentMovementsRes = await axios.get(`${API_BASE_URL}/recent_movements`);

        setTrackingData({
          totalMovement: `${dailyMovementRes.data.total_movement}m`,
          eatingDuration: recentMovementsRes.data.eating_duration
            ? `${recentMovementsRes.data.eating_duration}분`
            : "정보 없음",
          drinkingDuration: recentMovementsRes.data.drinking_duration
            ? `${recentMovementsRes.data.drinking_duration}분`
            : "정보 없음",
        });
      } catch (error) {
        console.error("🚨 데이터 가져오기 실패:", error);
        setTrackingData({
          totalMovement: "데이터 로드 실패",
          eatingDuration: "정보 없음",
          drinkingDuration: "정보 없음",
        });
      }
    }

    fetchTrackingData();
  }, []);

  // 📌 CAM 클릭 시 이동 경로 저장
  const handleCamClick = (event) => {
    const rect = event.target.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    setMovementPath((prev) => [...prev, { x, y }]);

    // 캔버스에 이동 경로 그리기
    drawMovementPath([...movementPath, { x, y }]);
  };

  // 📌 이동 경로 그리기
  const drawMovementPath = (points) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (points.length < 2) return;

    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);

    for (let i = 1; i < points.length; i++) {
      ctx.lineTo(points[i].x, points[i].y);
    }

    ctx.strokeStyle = "red";
    ctx.lineWidth = 2;
    ctx.stroke();
  };

  return (
    <div style={{ display: "flex", padding: "20px", border: "2px solid black" }}>
      {/* 📌 웹캠 및 이동 패턴 표시 */}
      <div style={{ position: "relative", width: "400px", height: "300px", border: "2px solid black" }}>
        <Webcam
          width="400px"
          height="300px"
          screenshotFormat="image/jpeg"
          onClick={handleCamClick}
        />
        <canvas
          ref={canvasRef}
          width="400px"
          height="300px"
          style={{ position: "absolute", top: "0", left: "0", pointerEvents: "none" }}
        />
      </div>

      {/* 📌 데이터 정보 표시 */}
      <div style={{ marginLeft: "20px" }}>
        <h3>🐹 사용자 이동 데이터</h3>
        <p>📌 오늘 누적 이동 거리: {trackingData.totalMovement}</p>
        <p>🍚 밥 먹은 시간: {trackingData.eatingDuration}</p>
        <p>💧 물 마신 시간: {trackingData.drinkingDuration}</p>

        <p>🛠 기준 이동 거리: {standardData.standardDistance}</p>
        <p>🕒 기준 밥 먹는 시간: {standardData.standardEatingTime}</p>
        <p>🕒 기준 물 마시는 시간: {standardData.standardDrinkingTime}</p>

        <p>
          📢 추천 정보: <button onClick={() => setShowRecommendation(true)}>보기</button>
        </p>

        {/* 📌 추천 정보 표시 */}
        {showRecommendation && (
          <div style={{ border: "1px solid black", padding: "10px", marginTop: "10px", backgroundColor: "#f9f9f9" }}>
            <strong>⚠️ 오늘 활동 분석</strong>
            <p>운동량이 부족하거나 과도할 수 있습니다. 햄스터의 건강상태를 확인해주세요.</p>
          </div>
        )}
      </div>
    </div>
  );
}
