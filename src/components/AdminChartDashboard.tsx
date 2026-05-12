import React from 'react';
import { motion } from 'framer-motion';
import { BarChart3, LayoutDashboard, FileUp, Table, Zap, ZapOff } from 'lucide-react';
import { cn } from '../lib/utils';
import { read, utils } from 'xlsx';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
} from 'chart.js';
import { Chart, Pie } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

export default function AdminChartDashboard() {
  const [showBars, setShowBars] = React.useState(true);
  const [isAutoUpdate, setIsAutoUpdate] = React.useState(true);
  const [salesData, setSalesData] = React.useState([12, 19, 3, 5, 2, 3]);
  const [labels, setLabels] = React.useState(['1월', '2월', '3월', '4월', '5월', '6월']);
  const [pieValues, setPieValues] = React.useState([300, 50, 100]);

  React.useEffect(() => {
    if (!isAutoUpdate) return;

    const interval = setInterval(() => {
      // Add new sales data point
      const newVal = Math.floor(Math.random() * 20) + 1;
      
      setSalesData(prev => {
        const next = [...prev, newVal];
        return next.length > 8 ? next.slice(1) : next;
      });

      setLabels(prev => {
        const lastMonth = parseInt(prev[prev.length - 1]);
        const nextMonth = (lastMonth % 12) + 1;
        const next = [...prev, `${nextMonth}월`];
        return next.length > 8 ? next.slice(1) : next;
      });

      // Update pie chart randomly too
      setPieValues(prev => prev.map(v => Math.max(10, v + Math.floor(Math.random() * 40) - 20)));
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoUpdate]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target?.result;
      const wb = read(bstr, { type: 'binary' });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      // Convert sheet to json array
      const data = utils.sheet_to_json(ws, { header: 1 }) as any[][];
      
      // Parse data: Filter empty rows and ignore header
      const filteredData = data.slice(1).filter(row => row.length >= 2 && row[0] !== undefined);
      
      if (filteredData.length > 0) {
        const newLabels = filteredData.map(row => String(row[0]));
        const newValues = filteredData.map(row => Number(row[1]) || 0);
        
        setLabels(newLabels);
        setSalesData(newValues);
        setIsAutoUpdate(false);
      }
    };
    reader.readAsBinaryString(file);
  };

  const cumulativeSales = salesData.reduce((acc: number[], curr, i) => {
    acc.push((acc[i - 1] || 0) + curr);
    return acc;
  }, []);

  const mixedData = {
    labels: labels,
    datasets: [
      {
        type: 'line' as const,
        label: '누적 합계',
        data: cumulativeSales,
        borderColor: 'rgb(255, 255, 255)',
        borderWidth: 2,
        fill: false,
        pointBackgroundColor: 'rgb(163, 230, 53)',
        tension: 0.4,
        yAxisID: 'y1',
      },
      ...(showBars ? [{
        type: 'bar' as const,
        label: '월별 판매',
        data: salesData,
        backgroundColor: 'rgba(163, 230, 53, 0.5)',
        borderColor: 'rgb(163, 230, 53)',
        borderWidth: 1,
        yAxisID: 'y',
      }] : []),
    ],
  };

  const pieData = {
    labels: ['기존 고객', '신규 고객', '기타'],
    datasets: [
      {
        data: pieValues,
        backgroundColor: [
          'rgba(163, 230, 53, 0.6)',
          'rgba(255, 255, 255, 0.1)',
          'rgba(163, 230, 53, 0.2)',
        ],
        borderColor: [
          'rgb(163, 230, 53)',
          'rgba(255, 255, 255, 0.3)',
          'rgba(163, 230, 53, 0.4)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: 'rgba(255, 255, 255, 0.7)',
          font: {
            family: 'Inter',
          }
        },
      },
    },
    scales: {
      y: {
        type: 'linear' as const,
        display: true,
        position: 'left' as const,
        grid: {
          color: 'rgba(255, 255, 255, 0.05)',
        },
        ticks: {
          color: 'rgba(255, 255, 255, 0.5)',
        },
        title: {
          display: true,
          text: '월별 판매량',
          color: 'rgba(163, 230, 53, 0.7)',
        }
      },
      y1: {
        type: 'linear' as const,
        display: true,
        position: 'right' as const,
        grid: {
          drawOnChartArea: false, // only want the grid lines for one axis
        },
        ticks: {
          color: 'rgba(255, 255, 255, 0.5)',
        },
        title: {
          display: true,
          text: '누적 합계',
          color: 'rgba(255, 255, 255, 0.7)',
        }
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: 'rgba(255, 255, 255, 0.5)',
        },
      },
    },
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="bg-lime/20 p-2 rounded-lg text-lime">
            <LayoutDashboard size={24} />
          </div>
          <h2 className="text-3xl serif italic text-white font-medium">2.차트대시보드</h2>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsAutoUpdate(!isAutoUpdate)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-2xl text-sm font-bold transition-all border",
              isAutoUpdate 
                ? "bg-lime/20 border-lime/30 text-lime" 
                : "bg-white/5 border-white/10 text-white/40"
            )}
          >
            {isAutoUpdate ? <Zap size={16} /> : <ZapOff size={16} />}
            {isAutoUpdate ? "실시간 업데이트 중" : "업데이트 중지됨"}
          </button>

          <label 
            className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/10 rounded-2xl text-white cursor-pointer transition-all text-sm font-bold group relative"
            title="첫 번째 행은 제목, 두 번째 행부터 [기간, 판매량] 형식으로 작성하세요."
          >
            <FileUp size={16} />
            Excel 업로드
            <input 
              type="file" 
              accept=".xlsx, .xls, .csv" 
              className="hidden" 
              onChange={handleFileUpload}
            />
          </label>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
        {/* Mixed Chart Container */}
        <div className="glass p-6 sm:p-8 rounded-[32px] border border-white/10 flex flex-col h-[350px] sm:h-[400px]">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <BarChart3 size={20} className="text-lime" />
              판매 성과 혼합 분석
            </h3>
            <button
              onClick={() => setShowBars(!showBars)}
              className={cn(
                "px-3 py-1.5 rounded-xl text-xs font-bold transition-all border",
                showBars 
                  ? "bg-lime/20 border-lime/30 text-lime" 
                  : "bg-white/5 border-white/10 text-white/40"
              )}
            >
              {showBars ? "막대 숨기기" : "막대 보이기"}
            </button>
          </div>
          <div className="flex-1 min-h-0">
            <Chart type="bar" options={options} data={mixedData} />
          </div>
        </div>

        {/* Pie Chart Container */}
        <div className="glass p-6 sm:p-8 rounded-[32px] border border-white/10 flex flex-col h-[350px] sm:h-[400px]">
          <h3 className="text-lg font-bold text-white mb-6">고객 분포 현황</h3>
          <div className="flex-1 min-h-0 flex items-center justify-center">
            <div className="w-full h-full max-h-[300px]">
              <Pie 
                data={pieData} 
                options={{
                  ...options,
                  scales: undefined, // Pie chart doesn't use scales
                }} 
              />
            </div>
          </div>
        </div>
      </div>

      <div className="text-center pt-8">
        <p className="text-sm text-white/20 italic">Chart.js를 이용한 실시간 데이터 시각화 대시보드</p>
      </div>

      {/* Data Table Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        className="glass p-8 rounded-[32px] border border-white/10"
      >
        <div className="flex items-center gap-3 mb-8">
          <div className="bg-lime/20 p-2 rounded-lg text-lime">
            <Table size={20} />
          </div>
          <h3 className="text-xl font-bold text-white">판매 데이터 상세 내역</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10">
                <th className="py-4 px-4 text-white/40 font-medium text-sm">기간 (Label)</th>
                <th className="py-4 px-4 text-white/40 font-medium text-sm">판매 수량 (Value)</th>
                <th className="py-4 px-4 text-white/40 font-medium text-sm text-right">누적 합계</th>
              </tr>
            </thead>
            <tbody>
              {labels.map((label, index) => (
                <tr key={index} className="border-b border-white/5 hover:bg-white/5 transition-colors group">
                  <td className="py-4 px-4 text-white font-medium">{label}</td>
                  <td className="py-4 px-4">
                    <span className="bg-lime/10 text-lime px-3 py-1 rounded-full text-sm font-bold">
                      {salesData[index]}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-white/70 text-right font-mono">
                    {cumulativeSales[index]}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {labels.length === 0 && (
          <div className="text-center py-12 text-white/20 italic">
            데이터가 없습니다. 엑셀 파일을 업로드하거나 실시간 업데이트를 활성화하세요.
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
