export const calculateSafetyScore = ({
    battery,
    hour,
    areaRisk
}: {
    battery: number;
    hour: number;
    areaRisk: number;
}) => {
    let score = 100;

    // Area Risk (Already 0-100 in database, higher is more dangerous)
    // We multiply by 0.7 to make it the most significant factor (max 70 point penalty)
    score -= areaRisk * 0.7;

    // Night penalty (23:00 to 05:00 is high risk)
    if (hour >= 23 || hour <= 5) score -= 25;
    else if (hour >= 20) score -= 10;

    // Battery penalty
    if (battery < 15) score -= 35;
    else if (battery < 30) score -= 20;
    else if (battery < 50) score -= 10;

    return Math.max(0, Math.min(100, Math.round(score)));
};
