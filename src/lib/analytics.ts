/**
 * 선형 회귀를 사용하여 미래 추세를 예측하는 유틸리티
 */

export interface DataPoint {
    x: number; // timestamp or index
    y: number; // value
}

export function predictTrend(data: DataPoint[], forecastPoints: number): DataPoint[] {
    if (data.length < 2) return [];

    // 선형 회귀 (y = mx + b)
    const n = data.length;
    let sumX = 0;
    let sumY = 0;
    let sumXY = 0;
    let sumXX = 0;

    for (const point of data) {
        sumX += point.x;
        sumY += point.y;
        sumXY += point.x * point.y;
        sumXX += point.x * point.x;
    }

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    const lastX = data[data.length - 1].x;
    const interval = data.length > 1 ? (data[1].x - data[0].x) : 1;

    const predictions: DataPoint[] = [];
    for (let i = 1; i <= forecastPoints; i++) {
        const nextX = lastX + (i * interval);
        const nextY = slope * nextX + intercept;
        predictions.push({ x: nextX, y: nextY });
    }

    return predictions;
}

/**
 * 건강 점수 계산 (0-100)
 * 임계값에 가까워질수록 점수가 낮아짐
 */
export function calculateHealthScore(current: number, threshold: number): number {
    if (current >= threshold) return 0;
    const score = ((threshold - current) / threshold) * 100;
    return Math.max(0, Math.min(100, Math.round(score)));
}

/**
 * 잔존 수명(RUL) 예측 (단순화된 모델)
 * 현재 추세가 계속될 경우 임계값에 도달하는 시점 계산
 */
export function estimateRUL(data: DataPoint[], threshold: number): number {
    if (data.length < 5) return 99; // 충분한 데이터가 없으면 기본값

    const n = data.length;
    let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;
    for (const p of data) {
        sumX += p.x; sumY += p.y; sumXY += p.x * p.y; sumXX += p.x * p.x;
    }
    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    if (slope <= 0) return 999; // 성능 저하가 없는 경우 (기울기가 0 이하)

    // threshold = slope * x + intercept  => x = (threshold - intercept) / slope
    const targetX = (threshold - intercept) / slope;
    const lastX = data[data.length - 1].x;

    // X가 시간 단위(ms)라고 가정할 때 일 단위로 변환 (여기서는 단순 인덱스 차이로 일단 처리)
    const diffInSteps = targetX - lastX;

    return Math.max(0, Math.round(diffInSteps / 10)); // 샘플링 스텝에 따른 가중치 조정
}
