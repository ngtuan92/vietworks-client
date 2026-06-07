import { useState } from 'react';
import { Upload, FileText, CheckCircle, AlertTriangle, ArrowRight, RefreshCw, Cpu, Award, Zap, ThumbsUp } from 'lucide-react';

const MOCK_ONLINE_CVS = [
  { id: 'cv1', title: 'CV Kỹ sư Phần mềm - Nguyễn Văn A' },
  { id: 'cv2', title: 'CV Designer UI/UX - Nguyễn Văn A' }
];

const AICvReview = () => {
  const [selectedCvSource, setSelectedCvSource] = useState('upload');
  const [selectedOnlineCv, setSelectedOnlineCv] = useState('');
  const [file, setFile] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState(0);
  const [result, setResult] = useState(null);
  const [activeTab, setActiveTab] = useState('summary');

  const steps = [
    'Trích xuất dữ liệu văn bản từ CV...',
    'Phân tích mật độ từ khóa kỹ năng...',
    'Đánh giá cấu trúc & định dạng ATS...',
    'So sánh với xu hướng thị trường ngành...',
    'Hoàn thiện báo cáo phân tích AI...'
  ];

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && (droppedFile.type === 'application/pdf' || droppedFile.name.endsWith('.docx'))) {
      setFile(droppedFile);
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const runAnalysis = () => {
    if (selectedCvSource === 'upload' && !file) return;
    if (selectedCvSource === 'online' && !selectedOnlineCv) return;

    setAnalyzing(true);
    setAnalysisStep(0);
    setResult(null);

    // Simulate analysis steps
    const interval = setInterval(() => {
      setAnalysisStep((prev) => {
        if (prev < steps.length - 1) {
          return prev + 1;
        } else {
          clearInterval(interval);
          setAnalyzing(false);
          // Show mock results
          setResult({
            score: 82,
            atsMatch: 88,
            strengths: [
              'Bố cục trình bày rõ ràng, sử dụng font chữ chuyên nghiệp dễ đọc.',
              'Kinh nghiệm làm việc được viết theo trình tự thời gian đảo ngược chuẩn.',
              'Mô tả kinh nghiệm có chứa động từ hành động mạnh mẽ (Thiết kế, Phát triển, Tối ưu hóa).'
            ],
            improvements: [
              'Thiếu các chỉ số đo lường hiệu quả công việc cụ thể (ví dụ: tăng 20% doanh số, giảm 15% thời gian tải trang).',
              'Chưa cập nhật đầy đủ các kỹ năng đang hot trong ngành (ví dụ: Next.js, Docker).',
              'Độ dài CV hơi dài (vượt quá 2 trang), nên cô đọng lại các dự án cũ.'
            ],
            keywordFit: [
              { skill: 'ReactJS', status: 'OK' },
              { skill: 'JavaScript / ES6+', status: 'OK' },
              { skill: 'TailwindCSS / CSS3', status: 'OK' },
              { skill: 'TypeScript', status: 'WARNING', msg: 'Có nhắc đến nhưng chưa có dự án minh họa' },
              { skill: 'Next.js / SSR', status: 'MISSING', msg: 'Thiếu kỹ năng cốt lõi cho vị trí này' }
            ]
          });
          return prev;
        }
      });
    }, 1200);
  };

  const resetReview = () => {
    setFile(null);
    setResult(null);
    setAnalyzing(false);
    setSelectedOnlineCv('');
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 font-body-md text-slate-800 antialiased">
      <main className="mx-auto max-w-4xl space-y-6">
        
        {/* Header */}
        <section className="rounded-3xl hero-gradient p-6 text-white shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center shrink-0">
              <Cpu className="w-8 h-8 text-yellow-300" />
            </div>
            <div>
              <h1 className="text-2xl font-black">AI CV Review</h1>
              <p className="text-white/80 text-sm mt-0.5">Trợ lý trí tuệ nhân tạo phân tích độ tương thích ATS và cải thiện điểm số CV.</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs bg-black/10 border border-white/10 px-3 py-1.5 rounded-xl self-start md:self-auto">
            <Zap className="w-4 h-4 text-yellow-300" />
            <span>Hạn ngạch miễn phí còn lại: <b>5/5 lượt</b></span>
          </div>
        </section>

        {!analyzing && !result ? (
          /* INPUT CARD */
          <div className="bg-white rounded-3xl border border-slate-200 p-6 md:p-8 space-y-6 shadow-sm">
            <div className="space-y-4">
              <label className="block text-sm font-bold text-slate-900">Chọn nguồn CV để phân tích</label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setSelectedCvSource('upload')}
                  className={`p-4 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center gap-2 ${
                    selectedCvSource === 'upload' 
                      ? 'border-primary bg-blue-50/55 text-primary font-bold shadow-sm' 
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Upload className="w-5 h-5" />
                  <span className="text-xs md:text-sm">Tải file CV lên (PDF/Docx)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedCvSource('online')}
                  className={`p-4 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center gap-2 ${
                    selectedCvSource === 'online' 
                      ? 'border-primary bg-blue-50/55 text-primary font-bold shadow-sm' 
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <FileText className="w-5 h-5" />
                  <span className="text-xs md:text-sm">Chọn CV Online đã tạo</span>
                </button>
              </div>
            </div>

            {selectedCvSource === 'upload' ? (
              /* Dropzone */
              <div
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                className="border-2 border-dashed border-slate-200 rounded-3xl p-8 text-center bg-slate-50 hover:bg-blue-50/20 hover:border-primary/50 transition duration-200 flex flex-col items-center gap-3 cursor-pointer"
                onClick={() => document.getElementById('cv-file-input').click()}
              >
                <div className="h-12 w-12 rounded-2xl bg-white border border-slate-100 flex items-center justify-center shadow-sm text-slate-400">
                  <Upload className="w-6 h-6" />
                </div>
                <input
                  id="cv-file-input"
                  type="file"
                  accept=".pdf,.docx"
                  onChange={handleFileChange}
                  className="hidden"
                />
                {file ? (
                  <div className="space-y-1">
                    <p className="font-bold text-slate-900 text-sm">{file.name}</p>
                    <p className="text-xs text-slate-400">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-slate-700">Kéo thả file CV của bạn vào đây</p>
                    <p className="text-xs text-slate-400">Hoặc click để duyệt file trên thiết bị (Chấp nhận định dạng .pdf, .docx dưới 5MB)</p>
                  </div>
                )}
              </div>
            ) : (
              /* Online CV Select */
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 block">Chọn một trong những CV của bạn *</label>
                <select
                  value={selectedOnlineCv}
                  onChange={(e) => setSelectedOnlineCv(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 outline-none focus:border-primary transition text-sm"
                >
                  <option value="">-- Chọn CV Online --</option>
                  {MOCK_ONLINE_CVS.map(cv => (
                    <option key={cv.id} value={cv.id}>{cv.title}</option>
                  ))}
                </select>
              </div>
            )}

            <button
              onClick={runAnalysis}
              disabled={(selectedCvSource === 'upload' && !file) || (selectedCvSource === 'online' && !selectedOnlineCv)}
              className="w-full py-3.5 bg-primary text-white font-bold rounded-xl hover:bg-primary/95 transition flex items-center justify-center gap-2 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer text-sm"
            >
              <Cpu className="w-4 h-4" />
              Bắt đầu phân tích CV bằng AI
            </button>
          </div>
        ) : analyzing ? (
          /* LOADER */
          <div className="bg-white rounded-3xl border border-slate-200 p-10 text-center space-y-6 shadow-sm min-h-[350px] flex flex-col justify-center items-center">
            <RefreshCw className="w-12 h-12 animate-spin text-primary" />
            <div className="space-y-2 max-w-md">
              <h2 className="text-lg font-black text-slate-900">AI đang phân tích hồ sơ</h2>
              <p className="text-sm text-slate-500">Hệ thống đang quét nội dung, đối chiếu kỹ năng và đo lường sự tương thích với chuẩn ATS toàn cầu...</p>
            </div>
            
            {/* Dynamic steps logs */}
            <div className="w-full max-w-sm rounded-2xl bg-slate-50 border border-slate-100 p-4 text-left font-mono text-xs text-slate-600 space-y-2">
              {steps.map((stepText, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <span className={`h-1.5 w-1.5 rounded-full ${idx <= analysisStep ? 'bg-primary animate-pulse' : 'bg-slate-300'}`} />
                  <span className={idx === analysisStep ? 'text-primary font-bold' : idx < analysisStep ? 'text-slate-400' : 'text-slate-300'}>
                    {stepText} {idx < analysisStep ? '✓' : ''}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* RESULTS CARD */
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* Score Summary Box */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-3xl border border-slate-200 p-6 flex flex-col items-center justify-center text-center shadow-sm">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Điểm số CV</p>
                <div className="relative h-28 w-28 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle cx="56" cy="56" r="46" stroke="#f1f5f9" strokeWidth="10" fill="transparent" />
                    <circle cx="56" cy="56" r="46" stroke="#3b82f6" strokeWidth="10" fill="transparent"
                      strokeDasharray="289" strokeDashoffset={289 - (289 * result.score) / 100} />
                  </svg>
                  <span className="absolute text-2xl font-black text-slate-900">{result.score}/100</span>
                </div>
                <p className="text-xs text-emerald-600 font-bold mt-3 bg-emerald-50 px-2 py-0.5 rounded">Mức độ: Tốt</p>
              </div>

              <div className="bg-white rounded-3xl border border-slate-200 p-6 flex flex-col items-center justify-center text-center shadow-sm">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Độ thân thiện ATS</p>
                <div className="relative h-28 w-28 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle cx="56" cy="56" r="46" stroke="#f1f5f9" strokeWidth="10" fill="transparent" />
                    <circle cx="56" cy="56" r="46" stroke="#10b981" strokeWidth="10" fill="transparent"
                      strokeDasharray="289" strokeDashoffset={289 - (289 * result.atsMatch) / 100} />
                  </svg>
                  <span className="absolute text-2xl font-black text-slate-900">{result.atsMatch}%</span>
                </div>
                <p className="text-xs text-slate-500 mt-3 font-semibold">Tương thích các bộ lọc HR</p>
              </div>

              <div className="bg-white rounded-3xl border border-slate-200 p-6 flex flex-col justify-center items-center shadow-sm text-center">
                <Award className="w-12 h-12 text-yellow-500 mb-2" />
                <h3 className="font-bold text-slate-900 text-sm">Đánh giá tổng quan</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-[200px]">CV có cấu trúc chuẩn, dễ đọc. Cần bổ sung các số liệu về dự án để tăng sức thuyết phục với NTD.</p>
                <button onClick={resetReview} className="mt-4 text-xs font-bold text-primary hover:underline flex items-center gap-1 cursor-pointer">
                  <RefreshCw className="w-3 h-3" /> Quét CV mới
                </button>
              </div>
            </div>

            {/* Detailed Feedback Panel */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="flex border-b border-slate-200 bg-slate-55/40 text-sm">
                <button
                  onClick={() => setActiveTab('summary')}
                  className={`flex-1 py-4 font-bold text-center border-b-2 transition ${
                    activeTab === 'summary' ? 'border-primary text-primary' : 'border-transparent text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Đề xuất cải thiện
                </button>
                <button
                  onClick={() => setActiveTab('keywords')}
                  className={`flex-1 py-4 font-bold text-center border-b-2 transition ${
                    activeTab === 'keywords' ? 'border-primary text-primary' : 'border-transparent text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Độ khớp kỹ năng (JD)
                </button>
              </div>

              <div className="p-6 md:p-8">
                {activeTab === 'summary' && (
                  <div className="space-y-6">
                    {/* Strengths */}
                    <div className="space-y-3">
                      <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-emerald-500" />
                        Điểm mạnh hiện tại ({result.strengths.length})
                      </h4>
                      <ul className="space-y-2 pl-7 list-disc text-sm text-slate-600">
                        {result.strengths.map((str, idx) => (
                          <li key={idx}>{str}</li>
                        ))}
                      </ul>
                    </div>

                    {/* Improvements */}
                    <div className="space-y-3 pt-4 border-t border-slate-100">
                      <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5 text-yellow-500" />
                        Cần cải thiện tốt hơn ({result.improvements.length})
                      </h4>
                      <ul className="space-y-2 pl-7 list-disc text-sm text-slate-600">
                        {result.improvements.map((imp, idx) => (
                          <li key={idx} className="marker:text-yellow-600">{imp}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

                {activeTab === 'keywords' && (
                  <div className="space-y-4">
                    <p className="text-xs text-slate-500 mb-4">Danh sách từ khóa kỹ năng quan trọng so sánh với vị trí ứng tuyển:</p>
                    <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden bg-slate-50/50">
                      {result.keywordFit.map((k, idx) => (
                        <div key={idx} className="p-4 flex items-center justify-between gap-4 text-sm bg-white">
                          <span className="font-bold text-slate-800">{k.skill}</span>
                          <div className="flex items-center gap-2">
                            {k.status === 'OK' && (
                              <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-800 text-xs font-semibold flex items-center gap-1">
                                <ThumbsUp className="w-3.5 h-3.5" /> Khớp tốt
                              </span>
                            )}
                            {k.status === 'WARNING' && (
                              <span className="px-2.5 py-0.5 rounded-full bg-yellow-50 border border-yellow-100 text-yellow-800 text-xs font-semibold flex items-center gap-1">
                                Cần mô tả rõ hơn: {k.msg}
                              </span>
                            )}
                            {k.status === 'MISSING' && (
                              <span className="px-2.5 py-0.5 rounded-full bg-red-50 border border-red-100 text-red-800 text-xs font-semibold flex items-center gap-1">
                                Thiếu: {k.msg}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-2">
              <button onClick={resetReview} className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold text-sm cursor-pointer transition">
                Quay lại
              </button>
              <Link to="/manage-cv" className="px-6 py-2.5 bg-primary text-white rounded-xl hover:bg-primary/95 font-bold text-sm flex items-center gap-1.5 shadow-sm cursor-pointer transition">
                Quản lý CV & sửa đổi
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AICvReview;
