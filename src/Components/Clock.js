import React, { useEffect, useState } from 'react';

export default function Clock({ maxTime, onFisish = undefined }) {
    const [value, setValue] = useState(0);
    const secondsToMMSS = (seconds) => {
        // Lấy số phút (tròn xuống)
        const minutes = Math.floor(seconds / 60);

        // Lấy số giây (lấy phần dư của phút)
        const remainingSeconds = seconds % 60;

        // Định dạng đầu ra là "mm:ss"
        const mm = String(minutes).padStart(2, '0');
        const ss = String(remainingSeconds).padStart(2, '0');

        return `${mm}:${ss}`;
    }
    useEffect(() => {
        const interval = setInterval(() => {
            if (value + 1 > maxTime) {
                clearInterval(interval);
                onFisish && onFisish();
                return;
            }
            else {
                setValue(value + 1);
            }
        }, 1000);
        return () => {
            clearInterval(interval);
        };
    }, [value]);

    return (
        <div style={{ color: 'white' }}>{secondsToMMSS(value)}</div>
    );
}
