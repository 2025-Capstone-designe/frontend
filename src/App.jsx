import React, { useState, useEffect } from "react";
import axios from "axios";

export default function App() {
  const [dailyMovement, setDailyMovement] = useState("로딩 중...");
  const [recentMovements, setRecentMovements] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const API_BASE_URL = "https://chromatic-force-452710-t3.du.r.appspot.com";

        // 📌 오늘 총 이동 거리 가져오기
        const dailyMovementRes = await axios.get(`${API_BASE_URL}/daily_movement`);
        setDailyMovement(`${dailyMovementRes.data.total_movement}m`);

        // 📌 최근 이동 데이터 가져오기
        const recentMovementsRes = await axios.get(`${API_BASE_URL}/recent_movements`);
        setRecentMovements(recentMovementsRes.data.recent_movements);

      } catch (error) {
        console.error("🚨 데이터 가져오기 실패:", error);
        setDailyMovement("데이터 로드 실패");
        setRecentMovements([]);
      }
    };

    fetchData();
  }, []);

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <h2>🐹 사용자 이동 데이터</h2>

      {/* 📌 오늘 총 이동 거리 */}
      <div style={{ marginBottom: "20px", padding: "10px", border: "1px solid black", borderRadius: "5px" }}>
        <h3>오늘 총 이동 거리</h3>
        <p>{dailyMovement}</p>
      </div>

      {/* 📌 최근 이동 기록 */}
      <div style={{ padding: "10px", border: "1px solid black", borderRadius: "5px" }}>
        <h3>최근 이동 기록</h3>
        {recentMovements.length > 0 ? (
          <ul>
            {recentMovements.map((movement, index) => (
              <li key={index}>
                <strong>시간:</strong> {movement.time} | 
                <strong> X:</strong> {movement.x} | 
                <strong> Y:</strong> {movement.y}
              </li>
            ))}
          </ul>
        ) : (
          <p>최근 이동 기록이 없습니다.</p>
        )}
      </div>
    </div>
  );
}
