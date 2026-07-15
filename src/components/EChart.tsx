import { useEffect, useRef } from 'react';
import * as echarts from 'echarts';

interface Props {
  option: echarts.EChartsOption;
  height?: number;
  ariaLabel: string;
}

export function EChart({ option, height = 360, ariaLabel }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const chart = useRef<echarts.ECharts | null>(null);

  useEffect(() => {
    if (!ref.current) return;
    chart.current = echarts.init(ref.current);
    const ro = new ResizeObserver(() => chart.current?.resize());
    ro.observe(ref.current);
    return () => {
      ro.disconnect();
      chart.current?.dispose();
      chart.current = null;
    };
  }, []);

  useEffect(() => {
    chart.current?.setOption(option, true);
  }, [option]);

  return <div ref={ref} role="img" aria-label={ariaLabel} style={{ width: '100%', height }} />;
}
