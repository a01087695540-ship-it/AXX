import React, { useState, useMemo, useRef, useEffect } from 'react';
import * as XLSX from 'xlsx';
import {
  Upload,
  Calendar,
  Filter,
  Users,
  Search,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  SlidersHorizontal,
  Info,
  DollarSign,
  Layers,
  Store,
  Briefcase,
  AlertCircle,
  CheckCircle2,
  Database,
  ArrowUpDown,
  Laptop
} from 'lucide-react';
import { SalesRecord } from '../types';
import { defaultSalesData } from './salesDataSeed';

// Excel column mapping
const COLUMN_MAPPING = {
  date: '주문일자',
  revenue: '실매출액',
  totalRevenue: '총매출액',
  discount: '할인액',
  netRevenue: '순매출액',
  quantity: '수량',
  gender: '성별',
  age: '연령대',
  channel: '채널',
  store: '통합매장명',
  premium: '프리미엄',
  region: '거주지역',
  category: '카테고리',
  productName: '상품명',
  receiptNo: '영수증번호',
  customerId: '고객ID'
};

export default function SalesDashboard() {
  const [salesData, setSalesData] = useState<SalesRecord[]>(defaultSalesData);
  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'customer' | 'product' | 'channel' | 'store' | 'detail'>('overview');
  
  // Filtering States
  const [startDate, setStartDate] = useState<string>('2026-06-01');
  const [endDate, setEndDate] = useState<string>('2026-06-10');
  const [selectedGenders, setSelectedGenders] = useState<string[]>([]);
  const [selectedAges, setSelectedAges] = useState<string[]>([]);
  const [selectedChannels, setSelectedChannels] = useState<string[]>([]);
  const [selectedStores, setSelectedStores] = useState<string[]>([]);
  const [selectedPremiums, setSelectedPremiums] = useState<string[]>([]);
  const [selectedRegions, setSelectedRegions] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  // Open multi-select dropdown states
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  // Search & Pagination in Transaction Detail
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);
  const [sortField, setSortField] = useState<keyof SalesRecord>('date');
  const [sortAsc, setSortAsc] = useState(false);

  // Success & Error feedback
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<boolean>(false);

  // File upload input ref
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Get unique options for filter lists from current raw salesData
  const filterOptions = useMemo(() => {
    const genders = new Set<string>();
    const ages = new Set<string>();
    const channels = new Set<string>();
    const stores = new Set<string>();
    const premiums = new Set<string>();
    const regions = new Set<string>();
    const categories = new Set<string>();

    salesData.forEach(row => {
      if (row.gender) genders.add(row.gender);
      if (row.age) ages.add(row.age);
      if (row.channel) channels.add(row.channel);
      if (row.store) stores.add(row.store);
      if (row.premium) premiums.add(row.premium);
      if (row.region) regions.add(row.region);
      if (row.category) categories.add(row.category);
    });

    return {
      genders: Array.from(genders).sort(),
      ages: Array.from(ages).sort(),
      channels: Array.from(channels).sort(),
      stores: Array.from(stores).sort(),
      premiums: Array.from(premiums).sort(),
      regions: Array.from(regions).sort(),
      categories: Array.from(categories).sort()
    };
  }, [salesData]);

  // Handle uploaded Excel file
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.xlsx')) {
      setUploadError('엑셀 파일(.xlsx) 형식만 업로드 가능합니다.');
      return;
    }

    setUploadError(null);
    setUploadSuccess(false);

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const workbook = XLSX.read(bstr, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet) as any[];

        if (jsonData.length === 0) {
          throw new Error('엑셀 시트에 데이터 행이 발견되지 않았습니다.');
        }

        // Map parsed rows
        const parsedRows: SalesRecord[] = jsonData.map((row, idx) => {
          const mapField = (colName: string, defaultVal: any = '') => {
            return row[colName] !== undefined ? row[colName] : defaultVal;
          };

          // Handle Excel serial date
          let dateStr = '2026-06-01';
          const excelDate = row[COLUMN_MAPPING.date];
          if (typeof excelDate === 'number') {
            const tempDate = new Date((excelDate - 25569) * 86400 * 1000);
            const yyyy = tempDate.getFullYear();
            const mm = String(tempDate.getMonth() + 1).padStart(2, '0');
            const dd = String(tempDate.getDate()).padStart(2, '0');
            dateStr = `${yyyy}-${mm}-${dd}`;
          } else if (excelDate instanceof Date) {
            const yyyy = excelDate.getFullYear();
            const mm = String(excelDate.getMonth() + 1).padStart(2, '0');
            const dd = String(excelDate.getDate()).padStart(2, '0');
            dateStr = `${yyyy}-${mm}-${dd}`;
          } else if (typeof excelDate === 'string') {
            dateStr = excelDate.substring(0, 10);
          }

          return {
            date: dateStr,
            revenue: Number(row[COLUMN_MAPPING.revenue]) || 0,
            totalRevenue: Number(row[COLUMN_MAPPING.totalRevenue]) || 0,
            discount: Number(row[COLUMN_MAPPING.discount]) || 0,
            netRevenue: Number(row[COLUMN_MAPPING.netRevenue]) || 0,
            quantity: Number(row[COLUMN_MAPPING.quantity]) || 1,
            gender: String(mapField(COLUMN_MAPPING.gender, '일반')),
            age: String(mapField(COLUMN_MAPPING.age, '전체')),
            channel: String(mapField(COLUMN_MAPPING.channel, '매장')),
            store: String(mapField(COLUMN_MAPPING.store, '롯데리아')),
            premium: String(mapField(COLUMN_MAPPING.premium, '일반')),
            region: String(mapField(COLUMN_MAPPING.region, '서울')),
            category: String(mapField(COLUMN_MAPPING.category, '기타')),
            productName: String(mapField(COLUMN_MAPPING.productName, '상품')),
            receiptNo: String(mapField(COLUMN_MAPPING.receiptNo, `R${100000 + idx}`)),
            customerId: String(mapField(COLUMN_MAPPING.customerId, `cust_${100 + idx}`))
          };
        });

        // Autodetect date ranges
        const dates = parsedRows.map(r => r.date).filter(Boolean).sort();
        if (dates.length > 0) {
          setStartDate(dates[0]);
          setEndDate(dates[dates.length - 1]);
        }

        setSalesData(parsedRows);
        setUploadSuccess(true);
        setTimeout(() => setUploadSuccess(false), 4000);
      } catch (err: any) {
        setUploadError(`엑셀 파싱 에러: ${err?.message || '지원되지 않는 시트 형식입니다.'}`);
      }
    };
    reader.readAsBinaryString(file);
  };

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && fileInputRef.current) {
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(file);
      fileInputRef.current.files = dataTransfer.files;
      const event = { target: { files: dataTransfer.files } } as unknown as React.ChangeEvent<HTMLInputElement>;
      handleFileUpload(event);
    }
  };

  // Reset filters
  const resetFilters = () => {
    setSelectedGenders([]);
    setSelectedAges([]);
    setSelectedChannels([]);
    setSelectedStores([]);
    setSelectedPremiums([]);
    setSelectedRegions([]);
    setSelectedCategories([]);
    if (salesData.length > 0) {
      const dates = salesData.map(r => r.date).filter(Boolean).sort();
      if (dates.length > 0) {
        setStartDate(dates[0]);
        setEndDate(dates[dates.length - 1]);
      }
    }
  };

  // Load sample seed again
  const loadDefaultMockData = () => {
    setSalesData(defaultSalesData);
    setStartDate('2026-06-01');
    setEndDate('2026-06-10');
    resetFilters();
  };

  // Filter application helper
  const filteredRecords = useMemo(() => {
    return salesData.filter(row => {
      // Date Check
      if (startDate && row.date < startDate) return false;
      if (endDate && row.date > endDate) return false;

      // Category Check
      if (selectedGenders.length > 0 && !selectedGenders.includes(row.gender)) return false;
      if (selectedAges.length > 0 && !selectedAges.includes(row.age)) return false;
      if (selectedChannels.length > 0 && !selectedChannels.includes(row.channel)) return false;
      if (selectedStores.length > 0 && !selectedStores.includes(row.store)) return false;
      if (selectedPremiums.length > 0 && !selectedPremiums.includes(row.premium)) return false;
      if (selectedRegions.length > 0 && !selectedRegions.includes(row.region)) return false;
      if (selectedCategories.length > 0 && !selectedCategories.includes(row.category)) return false;

      return true;
    });
  }, [salesData, startDate, endDate, selectedGenders, selectedAges, selectedChannels, selectedStores, selectedPremiums, selectedRegions, selectedCategories]);

  // Stats Calculations
  const stats = useMemo(() => {
    const totalRev = filteredRecords.reduce((sum, r) => sum + r.revenue, 0);
    const totalDis = filteredRecords.reduce((sum, r) => sum + r.discount, 0);
    const totalGross = filteredRecords.reduce((sum, r) => sum + r.totalRevenue, 0);
    const totalQty = filteredRecords.reduce((sum, r) => sum + r.quantity, 0);
    const orderCount = filteredRecords.length;
    
    const avgTicket = orderCount ? Math.round(totalRev / orderCount) : 0;
    const avgDiscountRate = totalGross ? Number(((totalDis / totalGross) * 100).toFixed(1)) : 0;

    return {
      totalRevenue: totalRev,
      totalDiscount: totalDis,
      quantity: totalQty,
      orderCount,
      avgTicket,
      avgDiscountRate
    };
  }, [filteredRecords]);

  // Dropdown filter list rendering component helper
  const renderFilterDropdown = (
    label: string,
    key: string,
    selected: string[],
    setSelected: React.Dispatch<React.SetStateAction<string[]>>,
    options: string[]
  ) => {
    const isOpen = activeDropdown === key;
    const toggle = (e: React.MouseEvent) => {
      e.stopPropagation();
      setActiveDropdown(isOpen ? null : key);
    };

    const handleOptionToggle = (val: string) => {
      if (selected.includes(val)) {
        setSelected(selected.filter(x => x !== val));
      } else {
        setSelected([...selected, val]);
      }
    };

    const selectAll = () => setSelected([]);
    const clearAll = () => setSelected([]);

    return (
      <div className="relative flex flex-col justify-stretch">
        <label className="text-[10px] font-sans text-geo-gray font-bold tracking-wide uppercase mb-1">{label}</label>
        <button
          onClick={toggle}
          type="button"
          className="w-full h-10 px-3 bg-white border border-geo-border hover:border-geo-dark text-left text-xs font-bold font-mono rounded-none flex items-center justify-between outline-none transition-colors"
        >
          <span className="truncate">
            {selected.length === 0 ? `전체 (${options.length})` : `${selected.length}개 선택됨`}
          </span>
          <span className="text-[9px] text-geo-gray">▼</span>
        </button>

        {isOpen && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-geo-border shadow-md z-40 max-h-60 overflow-y-auto rounded-none">
            <div className="p-2 border-b border-geo-border flex gap-1 bg-[#F8F8F7]">
              <button
                onClick={selectAll}
                type="button"
                className="flex-1 py-1 text-[9px] font-bold border border-geo-border bg-white text-geo-dark hover:bg-geo-bg rounded-none"
              >
                전체선택
              </button>
              <button
                onClick={clearAll}
                type="button"
                className="flex-1 py-1 text-[9px] font-bold border border-geo-border bg-white text-geo-dark hover:bg-geo-bg rounded-none"
              >
                해제
              </button>
            </div>
            <div className="py-1">
              {options.length === 0 ? (
                <div className="p-3 text-[10px] text-geo-gray text-center font-mono">가용 옵션 없음</div>
              ) : (
                options.map(opt => {
                  const isChecked = selected.includes(opt);
                  return (
                    <label
                      key={opt}
                      className="flex items-center gap-2 px-3 py-1.5 hover:bg-geo-bg text-xs font-medium cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleOptionToggle(opt)}
                        className="w-3.5 h-3.5 accent-geo-blue rounded-none border-geo-border"
                      />
                      <span className="truncate">{opt}</span>
                    </label>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  // Close active dropdowns on window click
  useEffect(() => {
    const handleWindowClick = () => setActiveDropdown(null);
    window.addEventListener('click', handleWindowClick);
    return () => window.removeEventListener('click', handleWindowClick);
  }, []);

  // Format Helper
  const formatKrw = (num: number) => {
    return `${Math.round(num).toLocaleString('ko-KR')}원`;
  };

  // Process data for charts
  const aggregatedDailyTrend = useMemo(() => {
    const daily: { [date: string]: number } = {};
    filteredRecords.forEach(r => {
      if (r.date) {
        daily[r.date] = (daily[r.date] || 0) + r.revenue;
      }
    });
    return Object.keys(daily).sort().map(date => ({
      date: date.substring(5), // MM-DD format lightly
      revenue: daily[date]
    }));
  }, [filteredRecords]);

  const categoryShare = useMemo(() => {
    const cats: { [cat: string]: number } = {};
    filteredRecords.forEach(r => {
      if (r.category) {
        cats[r.category] = (cats[r.category] || 0) + r.revenue;
      }
    });

    const total = Object.values(cats).reduce((a, b) => a + b, 0);
    return Object.keys(cats).map(cat => ({
      name: cat,
      revenue: cats[cat],
      percent: total ? ((cats[cat] / total) * 100) : 0
    })).sort((a, b) => b.revenue - a.revenue);
  }, [filteredRecords]);

  const genderShare = useMemo(() => {
    const genders: { [g: string]: number } = {};
    filteredRecords.forEach(r => {
      if (r.gender) {
        genders[r.gender] = (genders[r.gender] || 0) + r.revenue;
      }
    });
    const total = Object.values(genders).reduce((a, b) => a + b, 0);
    return Object.keys(genders).map(g => ({
      name: g,
      revenue: genders[g],
      percent: total ? ((genders[g] / total) * 100) : 0
    }));
  }, [filteredRecords]);

  const ageShare = useMemo(() => {
    const ages: { [a: string]: number } = {};
    filteredRecords.forEach(r => {
      if (r.age) {
        ages[r.age] = (ages[r.age] || 0) + r.revenue;
      }
    });
    const total = Object.values(ages).reduce((a, b) => a + b, 0);
    return Object.keys(ages).sort().map(a => ({
      name: a,
      revenue: ages[a],
      percent: total ? ((ages[a] / total) * 100) : 0
    }));
  }, [filteredRecords]);

  const channelShare = useMemo(() => {
    const chs: { [ch: string]: number } = {};
    filteredRecords.forEach(r => {
      if (r.channel) {
        chs[r.channel] = (chs[r.channel] || 0) + r.revenue;
      }
    });
    const total = Object.values(chs).reduce((a, b) => a + b, 0);
    return Object.keys(chs).map(ch => ({
      name: ch,
      revenue: chs[ch],
      percent: total ? ((chs[ch] / total) * 100) : 0
    })).sort((a, b) => b.revenue - a.revenue);
  }, [filteredRecords]);

  const storeShare = useMemo(() => {
    const storesMap: { [st: string]: { revenue: number; count: number } } = {};
    filteredRecords.forEach(r => {
      if (r.store) {
        if (!storesMap[r.store]) {
          storesMap[r.store] = { revenue: 0, count: 0 };
        }
        storesMap[r.store].revenue += r.revenue;
        storesMap[r.store].count += 1;
      }
    });
    return Object.keys(storesMap).map(st => ({
      name: st,
      revenue: storesMap[st].revenue,
      count: storesMap[st].count
    })).sort((a, b) => b.revenue - a.revenue);
  }, [filteredRecords]);

  // Transaction 상세 정렬 및 검색
  const processedDetails = useMemo(() => {
    let list = [...filteredRecords];

    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      list = list.filter(r => 
        r.productName.toLowerCase().includes(q) ||
        r.store.toLowerCase().includes(q) ||
        r.receiptNo.toLowerCase().includes(q) ||
        r.customerId.toLowerCase().includes(q) ||
        r.category.toLowerCase().includes(q) ||
        r.channel.toLowerCase().includes(q)
      );
    }

    list.sort((a, b) => {
      const valA = a[sortField];
      const valB = b[sortField];

      if (typeof valA === 'number' && typeof valB === 'number') {
        return sortAsc ? valA - valB : valB - valA;
      }
      return sortAsc
        ? String(valA).localeCompare(String(valB))
        : String(valB).localeCompare(String(valA));
    });

    return list;
  }, [filteredRecords, searchTerm, sortField, sortAsc]);

  // Detailed paginated page list
  const paginatedDetails = useMemo(() => {
    const startIdx = (currentPage - 1) * pageSize;
    return processedDetails.slice(startIdx, startIdx + pageSize);
  }, [processedDetails, currentPage, pageSize]);

  const totalPages = Math.ceil(processedDetails.length / pageSize) || 1;

  // Reset pagination on search modification
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, pageSize]);

  return (
    <div className="space-y-6">
      {/* EXCEL UPLOAD HERO COMPONENT */}
      <div className="bg-white border border-geo-border p-6 sm:p-8 space-y-6 rounded-none shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 border-b border-l border-geo-border bg-[#F8F8F7] flex items-center justify-center font-mono text-[10px] text-geo-gray-light uppercase tracking-wider">
          AX.XLSX
        </div>

        <div className="max-w-xl space-y-2">
          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 border border-geo-blue/20 bg-geo-blue/5 text-geo-blue text-[9px] font-mono font-bold uppercase rounded-none tracking-wider">
            <Database className="w-3 h-3" />
            AI 연계 매출 데이터 분석 시뮬레이션
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-geo-dark tracking-tight uppercase">
            실무 매출 분석 엔진 (실결과물 체험)
          </h2>
          <p className="text-xs text-geo-gray-dark leading-relaxed">
            3일 과정의 AX 캠프에서 완성하게 될 <strong>원시 매출 로드 자동화 및 통계 시각화 대시보드</strong> 실제 가동 본입니다. 
            아래에 개별 소속 대리점 혹은 기획 부서의 로우 파일(<span className="font-mono bg-[#F8F8F7] px-1 border border-geo-border text-[10px] text-geo-dark">.xlsx</span>)을 업로드하거나 기본 데모 데이터셋을 활용해 전 트랙을 시각화 제어해보세요.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch pt-2">
          {/* DRAG DROPZONE */}
          <div 
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className="lg:col-span-8 border-2 border-dashed border-geo-border hover:border-geo-dark bg-[#F8F8F7] hover:bg-white flex flex-col items-center justify-center p-8 text-center cursor-pointer transition-all duration-200 group relative"
          >
            <input 
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".xlsx"
              className="hidden"
            />
            <Upload className="w-10 h-10 text-geo-gray group-hover:text-geo-dark mb-3.5 transition-colors shrink-0" />
            <p className="text-xs font-bold text-geo-dark group-hover:text-geo-blue transition-colors">
              여기로 분석할 엑셀 파일을 드래그하여 놓거나 클릭하여 업로드하세요
            </p>
            <p className="text-[10px] text-geo-gray font-sans font-medium mt-1">
              실무 엑셀 포맷 지원 (수만 행 데이터도 브라우저 인프라 단에서 몇 초 내 자동 맵핑)
            </p>
          </div>

          {/* QUICK DEMO RESET & ACTIONS */}
          <div className="lg:col-span-4 border border-geo-border p-5 flex flex-col justify-between space-y-4 bg-white">
            <div className="space-y-1.5">
              <span className="text-[9px] font-mono text-geo-gray uppercase tracking-wider block">Currently Running</span>
              <p className="text-xs font-bold text-geo-dark flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                {salesData === defaultSalesData ? '롯데GRS 모범 샘플 데이터셋 가동 중' : '사용자 분석 엑셀 데이터셋 구동 중'}
              </p>
              <p className="text-[10px] text-geo-gray font-medium">
                샘플 데이터는 롯데리아, 엔제리너스, 크리스피크림도넛의 가상 일별 거래 전표 20건이 적재되어 있습니다.
              </p>
            </div>

            <button
              onClick={loadDefaultMockData}
              type="button"
              className="w-full h-10 bg-geo-dark text-white font-mono text-[10px] tracking-widest uppercase hover:opacity-90 active:bg-geo-dark transition-all rounded-none cursor-pointer font-bold flex items-center justify-center gap-1"
            >
              <Database className="w-3.5 h-3.5" />
              샘플 데이터셋 다시 로드
            </button>
          </div>
        </div>

        {/* FEEDBACK LABELS */}
        {uploadError && (
          <div className="p-4 bg-rose-50 border border-rose-300 text-rose-800 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {uploadError}
          </div>
        )}

        {uploadSuccess && (
          <div className="p-4 bg-emerald-50 border border-emerald-500 text-emerald-800 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            성공: 엑셀 파일 로드가 완벽하게 처리되어 대시보드가 새로운 데이터셋 기준으로 업데이트 되었습니다! 📊
          </div>
        )}
      </div>

      {/* FILTER CONTROL PANEL */}
      <div className="bg-white border border-geo-border p-5 space-y-4 rounded-none shadow-sm">
        <div className="flex items-center justify-between border-b border-geo-border pb-3">
          <div className="flex items-center gap-2 text-geo-dark">
            <SlidersHorizontal className="w-4 h-4 text-geo-blue shrink-0" />
            <h3 className="font-bold text-xs font-mono uppercase tracking-wider">필터링 매트릭스 MULTI-DIMENSIONAL FILTERS</h3>
          </div>
          <button
            onClick={resetFilters}
            className="text-[10px] font-sans font-bold text-geo-blue hover:text-geo-dark transition-colors"
          >
            필터링 초기화
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {/* Start Date */}
          <div className="flex flex-col">
            <label className="text-[10px] font-sans text-geo-gray font-bold tracking-wide uppercase mb-1">시작일자</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full h-10 px-3 bg-white border border-geo-border focus:border-geo-dark text-xs font-bold font-mono rounded-none outline-none transition-colors"
            />
          </div>

          {/* End Date */}
          <div className="flex flex-col">
            <label className="text-[10px] font-sans text-geo-gray font-bold tracking-wide uppercase mb-1">종료일자</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full h-10 px-3 bg-white border border-geo-border focus:border-geo-dark text-xs font-bold font-mono rounded-none outline-none transition-colors"
            />
          </div>

          {/* Multi Dropdowns */}
          {renderFilterDropdown('식재료 브랜드 / 카테고리', 'category', selectedCategories, setSelectedCategories, filterOptions.categories)}
          {renderFilterDropdown('가맹점 브랜드 점포', 'store', selectedStores, setSelectedStores, filterOptions.stores)}
          {renderFilterDropdown('주문 접수 채널', 'channel', selectedChannels, setSelectedChannels, filterOptions.channels)}
          {renderFilterDropdown('고객 연령대', 'age', selectedAges, setSelectedAges, filterOptions.ages)}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
          {renderFilterDropdown('고객 성별', 'gender', selectedGenders, setSelectedGenders, filterOptions.genders)}
          {renderFilterDropdown('멤버십 등급', 'premium', selectedPremiums, setSelectedPremiums, filterOptions.premiums)}
          {renderFilterDropdown('거주 지역군', 'region', selectedRegions, setSelectedRegions, filterOptions.regions)}
        </div>

        {/* Filter Summary Toast */}
        <div className="p-3 bg-[#F8F8F7] border border-geo-border text-[10px] font-mono text-geo-gray flex flex-wrap gap-x-4 gap-y-2.5">
          <div>
            <strong className="text-geo-dark font-bold">선택 필터 요약:</strong>{' '}
            {filteredRecords.length === salesData.length 
              ? '전체 거래 데이터셋 동작 중' 
              : `다차원 필터링에 의해 ${filteredRecords.length}개 유효 건 추출`}
          </div>
          <span className="text-geo-border-dark hidden md:inline">|</span>
          <div className="flex gap-1">
            <span>브랜드필터: {selectedStores.length ? selectedStores.join(', ') : '전체'}</span>
            <span className="text-[#A0A0A0] opacity-50">•</span>
            <span>카테고리: {selectedCategories.length ? selectedCategories.join(', ') : '전체'}</span>
            <span className="text-[#A0A0A0] opacity-50">•</span>
            <span>채널: {selectedChannels.length ? selectedChannels.join(', ') : '전체'}</span>
          </div>
        </div>
      </div>

      {/* KPI METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
        {[
          { label: '총 매출액 (실매출액)', value: formatKrw(stats.totalRevenue), hint: '할인 제외 결제 수납액', icon: DollarSign, isRed: true },
          { label: '총 판매 거래 건수', value: `${stats.orderCount}건`, hint: '선정 기준 총 영수 접수 건', icon: Database },
          { label: '평균 객단가 (Ticket)', value: formatKrw(stats.avgTicket), hint: '거래 건당 평균 결제액', icon: TrendingUp },
          { label: '총 프로모션 할인금', value: formatKrw(stats.totalDiscount), hint: '총 깎아준 프로모션 예산', icon: SlidersHorizontal },
          { label: '평균 프로모션 할인율', value: `${stats.avgDiscountRate}%`, hint: '총 매출액 대비 할인 비율', icon: Layers },
          { label: '총 상품 수량 qty', value: `${stats.quantity}개`, hint: '판매된 전체 단품 상품 누적 대수', icon: Store }
        ].map((k, index) => {
          const IconComp = k.icon;
          return (
            <div key={index} className={`p-5 bg-white border ${k.isRed ? 'border-geo-dark' : 'border-geo-border'} rounded-none shadow-sm space-y-1.5 flex flex-col justify-between relative group`}>
              <div className="absolute top-4 right-4 text-geo-gray-light group-hover:text-geo-dark transition-colors">
                <IconComp className="w-4 h-4" />
              </div>
              <div className="space-y-1">
                <p className="text-[9px] text-geo-gray font-mono tracking-wider uppercase">{k.label}</p>
                <div className="flex items-baseline gap-1">
                  <span className={`text-2xl font-black ${k.isRed ? 'text-[#ED1C24]' : 'text-geo-dark'} font-mono leading-none`}>
                    {k.value}
                  </span>
                </div>
              </div>
              <p className="text-[9px] text-geo-gray-light font-medium tracking-wide">
                {k.hint}
              </p>
            </div>
          );
        })}
      </div>

      {/* SUB TAB LAYOUT FOR CHARTS */}
      <div className="bg-white border border-geo-border rounded-none shadow-sm overflow-hidden">
        <div className="border-b border-geo-border bg-[#F8F8F7] flex flex-wrap">
          {[
            { id: 'overview', name: 'OVERVIEW / 종합 추이' },
            { id: 'customer', name: 'CUSTOMER / 고객 집중 분석' },
            { id: 'product', name: 'PRODUCT / 상품 비중 분석' },
            { id: 'channel', name: 'CHANNEL / 채널 유통 점검' },
            { id: 'store', name: 'STORE / 매장 실적 비교' },
            { id: 'detail', name: 'DETAIL / 전 거래 내역 원본' }
          ].map(sb => (
            <button
              key={sb.id}
              onClick={() => setActiveSubTab(sb.id as any)}
              className={`px-5 py-3.5 text-[10px] font-mono tracking-wider uppercase border-r border-geo-border transition-all duration-200 font-bold ${
                activeSubTab === sb.id
                  ? 'bg-white text-geo-dark border-b-2 border-b-[#ED1C24]'
                  : 'text-geo-gray hover:text-geo-dark hover:bg-[#F2F2F1]'
              }`}
            >
              {sb.name}
            </button>
          ))}
        </div>

        <div className="p-6 sm:p-8">
          {filteredRecords.length === 0 ? (
            <div className="p-16 text-center text-geo-gray flex flex-col items-center justify-center gap-2">
              <AlertCircle className="w-8 h-8 opacity-40 text-geo-gray shrink-0" />
              <p className="text-xs font-bold">필터 조건과 매칭되는 거래 내역이 존재하지 않습니다.</p>
              <p className="text-[10px] text-geo-gray-light font-medium">검색 기간을 늘리거나 필터 초기화 버튼을 눌러주세요.</p>
            </div>
          ) : (
            <>
              {/* SUBTAB 1: OVERVIEW */}
              {activeSubTab === 'overview' && (
                <div className="space-y-6">
                  {/* Daily Trend Line Chart */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <TrendingUp className="w-4 h-4 text-geo-blue shrink-0" />
                        <h4 className="font-bold text-xs uppercase tracking-wider font-mono text-geo-dark">일자별 매출 추이 TREND GRAPH (실시간 집계)</h4>
                      </div>
                      <span className="text-[9px] text-geo-gray font-mono">X-AXIS: DATE | Y-AXIS: REVENUE</span>
                    </div>

                    {/* Pure Responsive SVG Graph */}
                    <div className="border border-geo-border p-4 bg-[#F8F8F7] h-64 relative">
                      {aggregatedDailyTrend.length < 2 ? (
                        <div className="h-full flex items-center justify-center text-[10px] text-geo-gray font-mono">추이를 표시하기 위한 시계열 정보가 불충분합니다 (2일 이상 데이터 필요)</div>
                      ) : (
                        <svg className="w-full h-full" viewBox="0 0 500 200" preserveAspectRatio="none">
                          {/* Grid Lines */}
                          <line x1="0" y1="50" x2="500" y2="50" stroke="#E5E7EB" strokeWidth="0.5" strokeDasharray="3" />
                          <line x1="0" y1="100" x2="500" y2="100" stroke="#E5E7EB" strokeWidth="0.5" strokeDasharray="3" />
                          <line x1="0" y1="150" x2="500" y2="150" stroke="#E5E7EB" strokeWidth="0.5" strokeDasharray="3" />

                          {/* Data Path Calculations */}
                          {(() => {
                            const revenues = aggregatedDailyTrend.map(t => t.revenue);
                            const maxRev = Math.max(...revenues) || 1;
                            const minRev = Math.min(...revenues) || 0;
                            const range = maxRev - minRev || 1;

                            // Calculate points
                            const points = aggregatedDailyTrend.map((t, idx) => {
                              const x = (idx / (aggregatedDailyTrend.length - 1)) * 500;
                              // Scale y from 20 (top padding) to 180 (bottom padding)
                              const y = 180 - ((t.revenue - minRev) / range) * 150;
                              return { x, y, val: t.revenue, label: t.date };
                            });

                            const dPath = points.map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
                            const fillPath = `${dPath} L ${points[points.length - 1].x} 190 L ${points[0].x} 190 Z`;

                            return (
                              <>
                                {/* Vertical bars lightly */}
                                {points.map((p, idx) => (
                                  <line key={`v-${idx}`} x1={p.x} y1="10" x2={p.x} y2="190" stroke="#F1F1F0" strokeWidth="1" />
                                ))}

                                {/* Areas filler code */}
                                <path d={fillPath} fill="url(#blue-gradient)" opacity="0.1" />

                                {/* Line path */}
                                <path d={dPath} fill="none" stroke="#ED1C24" strokeWidth="2.5" />

                                {/* Dot markers with custom circle trigger */}
                                {points.map((p, idx) => (
                                  <g key={`m-${idx}`} className="group cursor-pointer">
                                    <circle cx={p.x} cy={p.y} r="4" fill="#ED1C24" stroke="white" strokeWidth="1.5" />
                                    <circle cx={p.x} cy={p.y} r="8" fill="#ED1C24" opacity="0" className="hover:opacity-25 transition-opacity" />
                                    <title>{`날짜: ${p.label}\n매출: ${p.val.toLocaleString()}원`}</title>
                                  </g>
                                ))}

                                {/* Date Labels underneath */}
                                {points.filter((_, i) => i % Math.max(1, Math.round(points.length / 6)) === 0 || i === points.length - 1).map((p, idx) => (
                                  <text
                                    key={`lbl-${idx}`}
                                    x={p.x}
                                    y="195"
                                    fontSize="8"
                                    fill="#737373"
                                    textAnchor={p.x > 450 ? 'end' : p.x < 50 ? 'start' : 'middle'}
                                    className="font-mono font-bold"
                                  >
                                    {p.label}
                                  </text>
                                ))}

                                {/* Gradiation Defs */}
                                <defs>
                                  <linearGradient id="blue-gradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#ED1C24" />
                                    <stop offset="100%" stopColor="#ED1C24" stopOpacity="0" />
                                  </linearGradient>
                                </defs>
                              </>
                            );
                          })()}
                        </svg>
                      )}
                    </div>
                  </div>

                  {/* Summary tables side-by-side */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                    <div className="border border-geo-border p-5 space-y-4">
                      <h5 className="font-bold text-xs uppercase tracking-wider font-mono text-geo-dark">실적 핵심 지표 (Overview Indicator List)</h5>
                      <div className="divide-y divide-geo-bg">
                        {[
                          { item: '총 수집 실매출액', val: formatKrw(stats.totalRevenue), percentage: '100%' },
                          { item: '프로모션 총 할인액', val: formatKrw(stats.totalDiscount), percentage: stats.totalRevenue ? `${((stats.totalDiscount / stats.totalRevenue)*100).toFixed(1)}% 대비` : '0%' },
                          { item: '결제 시 전표 수량', val: `${stats.orderCount}건`, percentage: '-' },
                          { item: '서빙 누적 제품 갯수', val: `${stats.quantity}개`, percentage: '-' },
                        ].map((s, idx) => (
                          <div key={idx} className="flex justify-between items-center py-2.5">
                            <span className="text-xs font-semibold text-geo-dark">{s.item}</span>
                            <div className="flex items-center gap-3 font-mono text-xs">
                              <span className="font-black text-geo-dark">{s.val}</span>
                              <span className="text-[9px] bg-[#F8F8F7] px-1.5 py-0.5 border border-geo-border text-geo-gray rounded-none leading-none">{s.percentage}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="border border-geo-border p-5 space-y-4">
                      <h5 className="font-bold text-xs uppercase tracking-wider font-mono text-geo-dark">메뉴 카테고리별 매출 분산 (Top Categories)</h5>
                      <div className="space-y-3.5">
                        {categoryShare.slice(0, 4).map((c, idx) => (
                          <div key={idx} className="space-y-1">
                            <div className="flex justify-between text-xs font-bold text-geo-dark">
                              <span>{c.name}</span>
                              <span className="font-mono">{formatKrw(c.revenue)} ({c.percent.toFixed(1)}%)</span>
                            </div>
                            <div className="h-2 bg-[#F8F8F7] border border-geo-border rounded-none overflow-hidden relative">
                              <div
                                style={{ width: `${c.percent}%` }}
                                className="h-full bg-geo-dark transition-all duration-500"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* SUBTAB 2: CUSTOMER ANALYSIS */}
              {activeSubTab === 'customer' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Gender ratio bar break down */}
                    <div className="border border-geo-border p-5 space-y-4">
                      <h4 className="font-bold text-xs uppercase tracking-wider font-mono text-geo-dark">성별 매출 비중 (Gender Weight)</h4>
                      <div className="space-y-6 pt-2">
                        {genderShare.length === 0 ? (
                          <p className="text-xs text-geo-gray font-mono text-center py-4">성별 데이터 누락</p>
                        ) : (
                          <>
                            {/* Segment bars visual stack */}
                            <div className="h-8 bg-[#F8F8F7] border border-geo-border rounded-none flex overflow-hidden">
                              {genderShare.map((g, idx) => (
                                <div
                                  key={idx}
                                  style={{ width: `${g.percent}%` }}
                                  className={`h-full flex items-center justify-center text-white text-[9px] font-black font-mono transition-all duration-500 ${
                                    g.name === '남성' ? 'bg-geo-dark' : 'bg-[#ED1C24]'
                                  }`}
                                  title={`${g.name}: ${g.percent.toFixed(1)}%`}
                                >
                                  {g.percent > 15 ? `${g.name} ${g.percent.toFixed(0)}%` : ''}
                                </div>
                              ))}
                            </div>

                            <div className="divide-y divide-geo-bg">
                              {genderShare.map((g, idx) => (
                                <div key={idx} className="flex justify-between py-2 text-xs">
                                  <div className="flex items-center gap-1.5">
                                    <div className={`w-2.5 h-2.5 ${g.name === '남성' ? 'bg-geo-dark' : 'bg-[#ED1C24]'}`} />
                                    <span className="font-bold text-geo-dark">{g.name}</span>
                                  </div>
                                  <span className="font-mono text-geo-gray-dark font-bold">{formatKrw(g.revenue)} ({g.percent.toFixed(1)}%)</span>
                                </div>
                              ))}
                            </div>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Age breakdown graph representation */}
                    <div className="border border-geo-border p-5 space-y-4">
                      <h4 className="font-bold text-xs uppercase tracking-wider font-mono text-geo-dark">연령대별 매출 비중 (Age Distribution Share)</h4>
                      <div className="space-y-4 pt-1">
                        {ageShare.map((a, idx) => (
                          <div key={idx} className="space-y-1">
                            <div className="flex justify-between text-xs font-bold text-geo-dark">
                              <span>{a.name}</span>
                              <span className="font-mono text-geo-gray-dark">{formatKrw(a.revenue)} ({a.percent.toFixed(1)}%)</span>
                            </div>
                            <div className="h-2 bg-[#F8F8F7] border border-geo-border rounded-none overflow-hidden">
                              <div
                                style={{ width: `${a.percent}%` }}
                                className="h-full bg-geo-dark transition-all duration-300"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Customer cross segment representation table */}
                  <div className="border border-geo-border p-6 rounded-none space-y-4">
                    <h4 className="font-bold text-xs uppercase tracking-wider font-mono text-geo-dark">고객 대분류 통계 매트릭스</h4>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-[#F8F8F7] border-b border-geo-border text-xs font-mono">
                            <th className="p-3 text-[10px] uppercase font-bold text-geo-dark">성별 GENDER</th>
                            <th className="p-3 text-[10px] uppercase font-bold text-geo-dark">연령대 AGE BAND</th>
                            <th className="p-3 text-[10px] uppercase font-bold text-geo-dark text-right">거래 건수 COUNTS</th>
                            <th className="p-3 text-[10px] uppercase font-bold text-geo-dark text-right">총 실매출 SUM REVENUE</th>
                            <th className="p-3 text-[10px] uppercase font-bold text-geo-dark text-right">평균 결제 Ticket</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-geo-bg text-xs">
                          {(() => {
                            const segments: { [key: string]: { gender: string; age: string; count: number; rev: number } } = {};
                            filteredRecords.forEach(r => {
                              const key = `${r.gender}_${r.age}`;
                              if (!segments[key]) {
                                segments[key] = { gender: r.gender, age: r.age, count: 0, rev: 0 };
                              }
                              segments[key].count += 1;
                              segments[key].rev += r.revenue;
                            });

                            return Object.values(segments)
                              .sort((a, b) => b.rev - a.rev)
                              .map((seg, idx) => (
                                <tr key={idx} className="hover:bg-[#F8F8F7] transition-colors">
                                  <td className="p-3 font-semibold text-geo-dark">{seg.gender}</td>
                                  <td className="p-3 font-medium text-geo-dark">{seg.age}</td>
                                  <td className="p-3 font-mono text-right font-bold text-geo-gray-dark">{seg.count}건</td>
                                  <td className="p-3 font-mono text-right font-black text-geo-dark">{formatKrw(seg.rev)}</td>
                                  <td className="p-3 font-mono text-right text-geo-gray">{formatKrw(seg.rev / seg.count)}</td>
                                </tr>
                              ));
                          })()}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* SUBTAB 3: PRODUCT ANALYSIS */}
              {activeSubTab === 'product' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Category List */}
                    <div className="border border-geo-border p-5 space-y-4">
                      <h4 className="font-bold text-xs uppercase tracking-wider font-mono text-geo-dark">식재료 카테고리 점유율 (Category Breakdown)</h4>
                      <div className="space-y-4 pt-1">
                        {categoryShare.map((c, idx) => (
                          <div key={idx} className="space-y-1">
                            <div className="text-xs font-bold text-geo-dark flex justify-between items-baseline">
                              <span className="flex items-center gap-1.5">
                                <span className="text-[10px] font-mono text-geo-gray">#{idx + 1}</span>
                                {c.name}
                              </span>
                              <span className="font-mono text-geo-gray-dark">{formatKrw(c.revenue)} ({c.percent.toFixed(1)}%)</span>
                            </div>
                            <div className="h-2.5 bg-[#F8F8F7] border border-geo-border rounded-none overflow-hidden">
                              <div
                                style={{ width: `${c.percent}%` }}
                                className="h-full bg-geo-dark transition-all duration-300"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Premium grade ratio based bar list */}
                    <div className="border border-geo-border p-5 space-y-5">
                      <h4 className="font-bold text-xs uppercase tracking-wider font-mono text-geo-dark">멤버십 등급별 매출 기여도 PREMIUM LEVEL CONTRIBUTION</h4>
                      <div className="space-y-4 pt-1">
                        {(() => {
                          const premiums: { [pr: string]: number } = {};
                          filteredRecords.forEach(r => {
                            const pr = r.premium || '일반';
                            premiums[pr] = (premiums[pr] || 0) + r.revenue;
                          });
                          const total = Object.values(premiums).reduce((a, b) => a + b, 0);

                          return Object.keys(premiums).map(pr => ({
                            name: pr,
                            rev: premiums[pr],
                            percent: total ? ((premiums[pr] / total) * 100) : 0
                          }))
                          .sort((a, b) => b.rev - a.rev)
                          .map((p, idx) => (
                            <div key={idx} className="space-y-1">
                              <div className="flex justify-between text-xs font-bold text-geo-dark">
                                <span className="flex items-center gap-1.5">
                                  <span className="w-2.5 h-2.5 rounded-none bg-geo-blue" />
                                  등급: {p.name}
                                </span>
                                <span className="font-mono text-geo-gray-dark font-bold">{formatKrw(p.rev)} ({p.percent.toFixed(1)}%)</span>
                              </div>
                              <div className="h-2 bg-[#F8F8F7] border border-geo-border rounded-none overflow-hidden">
                                <div
                                  style={{ width: `${p.percent}%` }}
                                  className="h-full bg-geo-dark transition-all duration-300 animate-slide-left"
                                />
                              </div>
                            </div>
                          ));
                        })()}
                      </div>
                    </div>
                  </div>

                  {/* Best selling products top 10 */}
                  <div className="border border-geo-border p-6 rounded-none space-y-4">
                    <h4 className="font-bold text-xs uppercase tracking-wider font-mono text-geo-dark">전체 단품 상품별 매출액 상세 랭킹 TOP PRODUCTS</h4>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-[#F8F8F7] border-b border-geo-border text-xs font-mono">
                            <th className="p-3 text-[10px] uppercase font-bold text-geo-dark">랭킹 RANK</th>
                            <th className="p-3 text-[10px] uppercase font-bold text-geo-dark">상세 메뉴 분류</th>
                            <th className="p-3 text-[10px] uppercase font-bold text-geo-dark font-mono">상품 성명 PRODUCT LINE</th>
                            <th className="p-3 text-[10px] uppercase font-bold text-geo-dark text-right">고객 수량 QTY</th>
                            <th className="p-3 text-[10px] uppercase font-bold text-geo-dark text-right">영업 실매출 총원 AMOUNT</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-geo-bg text-xs">
                          {(() => {
                            const products: { [name: string]: { name: string; category: string; qty: number; rev: number } } = {};
                            filteredRecords.forEach(r => {
                              if (r.productName) {
                                if (!products[r.productName]) {
                                  products[r.productName] = { name: r.productName, category: r.category, qty: 0, rev: 0 };
                                }
                                products[r.productName].qty += r.quantity;
                                products[r.productName].rev += r.revenue;
                              }
                            });

                            return Object.values(products)
                              .sort((a, b) => b.rev - a.rev)
                              .map((p, idx) => (
                                <tr key={idx} className="hover:bg-[#F8F8F7] transition-colors">
                                  <td className="p-3 font-mono font-bold text-geo-blue">#{idx + 1}</td>
                                  <td className="p-3 font-medium text-geo-gray">{p.category}</td>
                                  <td className="p-3 font-bold text-geo-dark">{p.name}</td>
                                  <td className="p-3 font-mono text-right font-bold text-geo-gray-dark">{p.qty}개</td>
                                  <td className="p-3 font-mono text-right font-black text-[#ED1C24]">{formatKrw(p.rev)}</td>
                                </tr>
                              ));
                          })()}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* SUBTAB 4: CHANNEL ANALYSIS */}
              {activeSubTab === 'channel' && (
                <div className="space-y-6">
                  {/* Channels dynamic block lists */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {channelShare.map((ch, idx) => (
                      <div key={idx} className="border border-geo-border p-5 bg-white space-y-3">
                        <div className="flex justify-between items-center border-b border-geo-border pb-2">
                          <span className="text-xs font-bold text-geo-dark font-mono uppercase">#{idx+1} {ch.name}</span>
                          <span className="text-[10px] font-mono font-bold text-geo-blue">{ch.percent.toFixed(1)}% 기여</span>
                        </div>
                        <p className="text-[10px] text-geo-gray uppercase">인프라 매출 금액 VOLUME</p>
                        <p className="text-xl font-black text-geo-dark font-mono">{formatKrw(ch.revenue)}</p>
                        <div className="h-1.5 bg-[#F8F8F7] border border-geo-border rounded-none overflow-hidden relative">
                          <div style={{ width: `${ch.percent}%` }} className="h-full bg-[#ED1C24]" />
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Channel details tables */}
                  <div className="border border-geo-border p-6 rounded-none space-y-4">
                    <h4 className="font-bold text-xs uppercase tracking-wider font-mono text-geo-dark">전체 접수 유통 채널별 정산 데이터</h4>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-[#F8F8F7] border-b border-geo-border text-xs font-mono">
                            <th className="p-3 text-[10px] uppercase font-bold text-geo-dark">채널명 CHANNEL</th>
                            <th className="p-3 text-[10px] uppercase font-bold text-geo-dark text-right">총 배송/접수 건수 COUNTS</th>
                            <th className="p-3 text-[10px] uppercase font-bold text-geo-dark text-right font-mono">실거래 매출액 SUM AMOUNT</th>
                            <th className="p-3 text-[10px] uppercase font-bold text-geo-dark text-right">평균 매출 객단가 avg</th>
                            <th className="p-3 text-[10px] uppercase font-bold text-geo-dark text-right">전체 점유 퍼센테이지 SH</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-geo-bg text-xs">
                          {channelShare.map((ch, idx) => {
                            const matchingRecords = filteredRecords.filter(r => r.channel === ch.name);
                            const count = matchingRecords.length;
                            const avgValue = count ? Math.round(ch.revenue / count) : 0;
                            return (
                              <tr key={idx} className="hover:bg-[#F8F8F7] transition-colors">
                                <td className="p-3 font-bold text-geo-dark">{ch.name}</td>
                                <td className="p-3 font-mono text-right font-bold text-geo-gray-dark">{count}건 건수</td>
                                <td className="p-3 font-mono text-right font-black text-geo-dark">{formatKrw(ch.revenue)}</td>
                                <td className="p-3 font-mono text-right text-geo-gray">{formatKrw(avgValue)}</td>
                                <td className="p-3 font-mono text-right font-bold text-geo-blue">{ch.percent.toFixed(1)}%</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* SUBTAB 5: STORE ANALYSIS */}
              {activeSubTab === 'store' && (
                <div className="space-y-6">
                  {/* Top participating stores bar chart representations */}
                  <div className="border border-geo-border p-5 space-y-4">
                    <h4 className="font-bold text-xs uppercase tracking-wider font-mono text-geo-dark">통합매장 브랜드별 매출 공헌 랭킹 STORES COMPARISONS</h4>
                    <div className="space-y-4 pt-1">
                      {storeShare.map((st, idx) => {
                        const totalMax = storeShare[0]?.revenue || 1;
                        const barWidth = (st.revenue / totalMax) * 100;
                        return (
                          <div key={idx} className="grid grid-cols-1 md:grid-cols-12 gap-2 items-center">
                            <div className="md:col-span-3 text-xs font-bold text-geo-dark flex items-center gap-1">
                              <span className="text-[10px] font-mono text-geo-gray font-semibold">RANK #{idx + 1}</span>
                              {st.name}
                            </div>
                            <div className="md:col-span-6">
                              <div className="h-3 bg-[#F8F8F7] border border-geo-border rounded-none overflow-hidden relative">
                                <div style={{ width: `${barWidth}%` }} className="h-full bg-geo-dark" />
                              </div>
                            </div>
                            <div className="md:col-span-3 font-mono text-right text-xs font-black text-geo-dark">
                              {formatKrw(st.revenue)} <span className="text-[10px] text-geo-gray font-normal font-sans">({st.count}건)</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Store lists table */}
                  <div className="border border-geo-border p-6 rounded-none space-y-4">
                    <h4 className="font-bold text-xs uppercase tracking-wider font-mono text-geo-dark">개별 취급 매장 인프라 실적 내역서</h4>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-[#F8F8F7] border-b border-geo-border text-xs font-mono">
                            <th className="p-3 text-[10px] uppercase font-bold text-geo-dark">매장명 STORE</th>
                            <th className="p-3 text-[10px] uppercase font-bold text-geo-dark text-right">체결 거래 수량 COUNTS</th>
                            <th className="p-3 text-[10px] uppercase font-bold text-geo-dark text-right font-mono">총매출 수납 금액 VOLUME</th>
                            <th className="p-3 text-[10px] uppercase font-bold text-geo-dark text-right">점당 평균 티켓가 Ticket</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-geo-bg text-xs">
                          {storeShare.map((st, idx) => (
                            <tr key={idx} className="hover:bg-[#F8F8F7] transition-colors">
                              <td className="p-3 font-bold text-geo-dark">{st.name}</td>
                              <td className="p-3 font-mono text-right font-bold text-geo-gray-dark">{st.count}건</td>
                              <td className="p-3 font-mono text-right font-black text-[#ED1C24]">{formatKrw(st.revenue)}</td>
                              <td className="p-3 font-mono text-right text-geo-gray">{formatKrw(st.revenue / st.count)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* SUBTAB 6: DETAILED TRANSACTION TRACE */}
              {activeSubTab === 'detail' && (
                <div className="space-y-5">
                  <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                    {/* Live search box */}
                    <div className="w-full sm:max-w-xs relative text-left">
                      <Search className="w-4 h-4 text-geo-gray absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="전 거래 내역 품명, 점포, 번호 통합 검색"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full h-10 pl-9 pr-4 border border-geo-border bg-[#F8F8F7] text-xs font-bold focus:bg-white focus:border-geo-dark transition-all outline-none rounded-none focus:ring-0"
                      />
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-auto font-mono text-xs text-geo-gray">
                      <span>조회 결과:</span>
                      <strong className="text-geo-dark font-black">{processedDetails.length}건</strong>
                      <span>/ {salesData.length}건</span>
                    </div>
                  </div>

                  {/* Big Ledger Table */}
                  <div className="overflow-x-auto border border-geo-border rounded-none">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-[#F8F8F7] border-b border-geo-border text-xs font-mono">
                          {[
                            { field: 'date', label: '주문일 DATE' },
                            { field: 'receiptNo', label: '영수증번호 RECEIPT' },
                            { field: 'store', label: '매장명 STORE' },
                            { field: 'category', label: '대분류 CAT' },
                            { field: 'productName', label: '메뉴 품목 PRODUCT' },
                            { field: 'quantity', label: '수량 QTY', right: true },
                            { field: 'revenue', label: '정산 실매출 REV', right: true },
                            { field: 'discount', label: '할인금 DIS', right: true },
                            { field: 'gender', label: '성별' },
                            { field: 'age', label: '연령대 AGE' },
                            { field: 'channel', label: '루트 루트' }
                          ].map(col => (
                            <th 
                              key={col.field}
                              onClick={() => {
                                if (sortField === col.field) {
                                  setSortAsc(!sortAsc);
                                } else {
                                  setSortField(col.field as any);
                                  setSortAsc(true);
                                }
                              }}
                              className={`p-3.5 text-[10px] font-mono text-geo-dark uppercase tracking-wider font-bold cursor-pointer hover:bg-geo-bg transition-colors ${
                                col.right ? 'text-right' : ''
                              }`}
                            >
                              <span className="inline-flex items-center gap-1">
                                {col.label}
                                <ArrowUpDown className="w-3 h-3 text-geo-gray opacity-60" />
                              </span>
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-geo-bg text-xs font-medium">
                        {paginatedDetails.length === 0 ? (
                          <tr>
                            <td colSpan={11} className="p-12 text-center text-geo-gray">
                              <p className="text-xs font-mono font-bold">검색어 매칭 구절 및 조회된 세부 전표 건이 전무합니다.</p>
                            </td>
                          </tr>
                        ) : (
                          paginatedDetails.map((tr, idx) => (
                            <tr key={idx} className="hover:bg-[#F8F8F7] transition-colors leading-normal">
                              <td className="p-3.5 font-mono text-geo-gray-dark">{tr.date}</td>
                              <td className="p-3.5 font-mono text-geo-blue font-bold">{tr.receiptNo}</td>
                              <td className="p-3.5 text-geo-dark font-bold">{tr.store}</td>
                              <td className="p-3.5 text-geo-gray-light">{tr.category}</td>
                              <td className="p-3.5 font-bold text-geo-dark">{tr.productName}</td>
                              <td className="p-3.5 text-right font-mono font-black text-geo-dark">{tr.quantity}개</td>
                              <td className="p-3.5 text-right font-mono font-bold text-[#ED1C24]">{formatKrw(tr.revenue)}</td>
                              <td className="p-3.5 text-right font-mono text-geo-gray">{formatKrw(tr.discount)}</td>
                              <td className="p-3.5 text-geo-gray">{tr.gender}</td>
                              <td className="p-3.5 text-geo-gray font-semibold">{tr.age}</td>
                              <td className="p-3.5 text-geo-gray-light">{tr.channel}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination control interface */}
                  {totalPages > 1 && (
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-2">
                      <p className="text-[10px] text-geo-gray font-mono tracking-wider">
                        총 {processedDetails.length}건 중 {(currentPage - 1) * pageSize + 1}~{Math.min(currentPage * pageSize, processedDetails.length)}번째 전표 출력 중
                      </p>

                      <div className="flex items-center gap-3">
                        {/* Page Size select control */}
                        <div className="flex items-center gap-1.5 font-mono text-[10px] text-geo-gray">
                          <span>행수단위:</span>
                          <select
                            value={pageSize}
                            onChange={(e) => setPageSize(Number(e.target.value))}
                            className="h-8 border border-geo-border bg-white text-[11px] font-bold text-geo-dark rounded-none outline-none focus:border-geo-dark pr-6 cursor-pointer"
                          >
                            <option value="15">15개</option>
                            <option value="30">30개</option>
                            <option value="50">50개</option>
                            <option value="100">100개</option>
                          </select>
                        </div>

                        {/* Page Buttons switcher */}
                        <div className="flex items-center gap-1">
                          <button
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage(currentPage - 1)}
                            className="w-8 h-8 flex items-center justify-center border border-geo-border bg-white text-geo-dark text-xs hover:border-geo-dark disabled:opacity-30 disabled:cursor-not-allowed transition-all rounded-none cursor-pointer"
                          >
                            <ChevronLeft className="w-4 h-4" />
                          </button>
                          
                          <div className="flex items-center gap-1 font-mono text-xs font-bold">
                            <span className="px-3 py-1.5 bg-geo-dark text-white rounded-none">{currentPage}</span>
                            <span className="text-geo-gray">/</span>
                            <span className="px-3 py-1.5 border border-geo-border bg-[#F8F8F7] text-geo-dark rounded-none">{totalPages}</span>
                          </div>

                          <button
                            disabled={currentPage === totalPages}
                            onClick={() => setCurrentPage(currentPage + 1)}
                            className="w-8 h-8 flex items-center justify-center border border-geo-border bg-white text-geo-dark text-xs hover:border-geo-dark disabled:opacity-30 disabled:cursor-not-allowed transition-all rounded-none cursor-pointer"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
