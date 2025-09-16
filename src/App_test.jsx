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
  const [videoFrames, setVideoFrames] = useState([]); // 영상 프레임 버퍼
  const [currentFrameIndex, setCurrentFrameIndex] = useState(0);
  const canvasRef = useRef(null);
  const videoCanvasRef = useRef(null); // 영상을 그릴 캔버스
  const hiddenVideoRef = useRef(null); // 숨겨진 비디오 엘리먼트
  
  const backendURL = "https://macro-coil-459205-d6.du.r.appspot.com/";
  const streamURL = "http://192.168.137.189:5005/video_feed";
  
  // 딜레이 설정 (밀리초 단위)
  const VIDEO_DELAY = 3000; // 영상 딜레이
  const FRAME_RATE = 30; // FPS
  const MAX_FRAMES = Math.floor((VIDEO_DELAY / 1000) * FRAME_RATE); // 버퍼에 저장할 최대 프레임 수

  const extractDistance = (distanceStr) => {
    const num = parseFloat(String(distanceStr).replace(/[^0-9.]/g, ""));
    return isNaN(num) ? 0 : num;
  };

  // 영상 프레임 캡처 및 버퍼링
  useEffect(() => {
    const captureFrames = () => {
      const video = hiddenVideoRef.current;
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!video || video.readyState < 2) return;
      
      canvas.width = 640;
      canvas.height = 480;
      ctx.drawImage(video, 0, 0, 640, 480);
      
      const frameData = canvas.toDataURL('image/jpeg', 0.8);
      const timestamp = Date.now();
      
      setVideoFrames(prev => {
        const newFrames = [...prev, { data: frameData, timestamp }];
        // 최대 프레임 수를 초과하면 오래된 프레임 제거
        return newFrames.length > MAX_FRAMES ? newFrames.slice(-MAX_FRAMES) : newFrames;
      });
    };

    const interval = setInterval(captureFrames, 1000 / FRAME_RATE);
    return () => clearInterval(interval);
  }, []);

  // 딜레이된 프레임 표시
  useEffect(() => {
    if (videoFrames.length === 0) return;
    
    const displayDelayedFrame = () => {
      const now = Date.now();
      // VIDEO_DELAY만큼 이전의 프레임을 찾아서 표시
      const targetTime = now - VIDEO_DELAY;
      
      let targetFrame = videoFrames[0];
      for (let i = videoFrames.length - 1; i >= 0; i--) {
        if (videoFrames[i].timestamp <= targetTime) {
          targetFrame = videoFrames[i];
          break;
        }
      }
      
      const canvas = videoCanvasRef.current;
      if (canvas && targetFrame) {
        const ctx = canvas.getContext('2d');
        const img = new Image();
        img.onload = () => {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0, 640, 480);
        };
        img.src = targetFrame.data;
      }
    };

    const interval = setInterval(displayDelayedFrame, 1000 / FRAME_RATE);
    return () => clearInterval(interval);
  }, [videoFrames]);

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
          prevSleep: (sleep.data.prev_avg_sleep / 3600).toFixed(1),
        });

        const sorted = recent.data.recent_movements
          .map((item) => ({
            ...item,
            createdAt: new Date(item.timestamp),
          }))
          .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

        setRecentMovements(sorted);
      } catch (error) {
        console.error("API 호출 실패:", error);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const drawFixedRatioCircles = () => {
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
    };

    drawFixedRatioCircles();
  }, [recentMovements]);

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

  const recommendationText =
    `오늘 하루는 standard(${standardDistance.toFixed(
      2
    )}m)와 비교해 tracking(${currentDistance.toFixed(2)}m) 양이 ` +
    (currentDistance < standardDistance
      ? "적으므로 운동을 추천합니다."
      : "많으므로 휴식을 추천합니다.");

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
        {/* 캠 */}
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
            {/* 숨겨진 실시간 비디오 (프레임 캡처용) */}
            <img 
              ref={hiddenVideoRef}
              src={streamURL} 
              alt="Hidden Live Stream" 
              width={640} 
              height={480}
              style={{ 
                position: "absolute",
                left: "-9999px",
                top: "-9999px"
              }}
              crossOrigin="anonymous"
            />
            
            {/* 딜레이된 비디오를 표시할 캔버스 */}
            <canvas
              ref={videoCanvasRef}
              width={640}
              height={480}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
              }}
            />
            
            {/* 움직임 트래킹 오버레이 */}
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
          
          {/* 딜레이 상태 표시 */}
          <div style={{ 
            marginTop: "10px", 
            fontSize: "12px", 
            color: "#666",
            textAlign: "center"
          }}>
            Video delay: {VIDEO_DELAY/1000}초 | Buffered frames: {videoFrames.length}
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

          {/* 추천 문구 박스 */}
          <div
            style={{
              width: "600px",
              marginTop: "10px",
              border: "2px solid #f6e05e",
              background: "#fffbea",
              borderRadius: "10px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
              padding: "14px 16px",
              fontSize: "18px",
              fontWeight: "bold",
              color: "#333",
              textAlign: "center",
            }}
          >
            {recommendationText}
          </div>
        </div>
      </div>
    </div>
  );
}