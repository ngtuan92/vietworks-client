import React, { useState, useEffect } from 'react';
import cvService from '../../../services/cvService';
import aiCvService from '../../../services/aiCvService';
import { useNotification } from '../../../contexts/NotificationContext';

const AICvReviewEngine = ({ onClose }) => {
  const { success, error } = useNotification();
  
  // Modal states
  const [activeTab, setActiveTab] = useState('new'); // 'new', 'history'
  const [loading, setLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0); // 0, 1, 2, 3
  const [loadingText, setLoadingText] = useState('');
  
  // Form input states
  const [targetPosition, setTargetPosition] = useState('');
  const [cvSource, setCvSource] = useState('local'); // 'local', 'saved'
  const [localFile, setLocalFile] = useState(null);
  const [selectedSavedCvId, setSelectedSavedCvId] = useState('');
  
  // Data lists
  const [uploadedCvs, setUploadedCvs] = useState([]);
  const [reviewsHistory, setReviewsHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [loadingUploadedCvs, setLoadingUploadedCvs] = useState(false);

  // Result display state
  const [activeResult, setActiveResult] = useState(null);
  const [resultTab, setResultTab] = useState('overview'); // 'overview', 'skills', 'interview'
  const [expandedQuestionIndex, setExpandedQuestionIndex] = useState(null);

  // Drag and drop states
  const [dragActive, setDragActive] = useState(false);

  // Fetch uploaded CVs (for selection) and history
  const loadUploadedCvs = async () => {
    try {
      setLoadingUploadedCvs(true);
      const res = await cvService.getUserUploadedCvs();
      if (res.success) {
        setUploadedCvs(res.data);
      }
    } catch (err) {
      console.error('Failed to load uploaded CVs:', err);
    } finally {
      setLoadingUploadedCvs(false);
    }
  };

  const loadReviewsHistory = async () => {
    try {
      setLoadingHistory(true);
      const res = await aiCvService.getUserReviews();
      if (res.success) {
        setReviewsHistory(res.data);
      }
    } catch (err) {
      console.error('Failed to load reviews history:', err);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    loadReviewsHistory();
    loadUploadedCvs();
  }, []);

  // Handle Drag Over & Enter
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  // Handle Drop
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type === "application/pdf") {
        setLocalFile(file);
      } else {
        error("Hệ thống chỉ hỗ trợ định dạng PDF.");
      }
    }
  };

  // Progress animation simulator
  const startLoadingAnimation = () => {
    setLoading(true);
    setLoadingProgress(0);
    setLoadingText('Đang trích xuất nội dung CV...');
    
    const intervals = [
      setTimeout(() => {
        setLoadingProgress(1);
        setLoadingText('AI đang phân tích cấu trúc và kinh nghiệm làm việc...');
      }, 4000),
      setTimeout(() => {
        setLoadingProgress(2);
        setLoadingText('Đang chấm điểm kỹ năng và phân tích mức độ trùng khớp...');
      }, 9000),
      setTimeout(() => {
        setLoadingProgress(3);
        setLoadingText('Đang soạn thảo bộ câu hỏi phỏng vấn tối ưu...');
      }, 15000)
    ];

    return () => intervals.forEach(clearTimeout);
  };

  // Submit Handler
  const handleStartAnalysis = async (e) => {
    e.preventDefault();
    
    if (!targetPosition.trim()) {
      error("Vui lòng nhập vị trí tuyển dụng mong muốn.");
      return;
    }

    if (cvSource === 'local' && !localFile) {
      error("Vui lòng tải lên file CV dạng PDF.");
      return;
    }

    if (cvSource === 'saved' && !selectedSavedCvId) {
      error("Vui lòng chọn một CV trong danh sách.");
      return;
    }

    const clearTimers = startLoadingAnimation();

    try {
      const formData = new FormData();
      formData.append('target_position', targetPosition.trim());
      
      if (cvSource === 'local') {
        formData.append('file', localFile);
      } else {
        formData.append('uploadedCvId', selectedSavedCvId);
      }

      const res = await aiCvService.createReview(formData);
      
      if (res.success) {
        success("Đánh giá CV bằng AI hoàn tất!");
        setActiveResult(res.data);
        setResultTab('overview');
        loadReviewsHistory(); // Refresh history
      } else {
        error(res.message || "Không thể phân tích CV.");
      }
    } catch (err) {
      console.error(err);
      const errMsg = err.response?.data?.message || "Đã xảy ra lỗi trong quá trình phân tích CV.";
      error(errMsg);
    } finally {
      clearTimers();
      setLoading(false);
    }
  };

  const selectHistoryItem = (review) => {
    setActiveResult(review);
    setResultTab('overview');
  };

  // Get score color
  const getScoreColor = (score) => {
    if (score >= 80) return { text: 'text-emerald-600', border: 'border-emerald-500', bg: 'bg-emerald-50', stroke: '#10b981' };
    if (score >= 50) return { text: 'text-amber-600', border: 'border-amber-500', bg: 'bg-amber-50', stroke: '#f59e0b' };
    return { text: 'text-rose-600', border: 'border-rose-500', bg: 'bg-rose-50', stroke: '#f43f5e' };
  };

  const scoreDetails = activeResult ? getScoreColor(activeResult.score) : null;
  const analysisData = activeResult?.rawResult || {};

  return (
    <div className="bg-white text-slate-800 rounded-3xl shadow-xl border border-slate-200 w-full h-[90vh] md:h-[950px] flex flex-col overflow-hidden animate-fade-in animate-duration-200 mx-auto">
      
      {/* Engine Header */}
      <div className="bg-[#003f87] text-white px-8 py-5 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-[28px] text-amber-400">psychology</span>
          <div>
            <h3 className="font-bold text-lg leading-tight">VietWorks AI - Trợ lý Chấm điểm CV</h3>
            <p className="text-xs text-blue-200">Chấm điểm ATS, phát hiện Red Flags & Chuẩn bị phỏng vấn</p>
          </div>
        </div>
        {onClose && (
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        )}
      </div>

            {/* Main Modal Body */}
            <div className="flex-grow flex overflow-hidden">
              
              {/* Show loading state */}
              {loading ? (
                <div className="w-full h-full flex flex-col items-center justify-center bg-slate-50/80 p-8">
                  <div className="relative w-28 h-28 mb-8">
                    {/* Ring animation */}
                    <div className="absolute inset-0 rounded-full border-4 border-slate-200"></div>
                    <div className="absolute inset-0 rounded-full border-4 border-t-[#003f87] border-r-[#003f87] animate-spin"></div>
                    <div className="absolute inset-2 bg-white rounded-full flex items-center justify-center">
                      <span className="material-symbols-outlined text-[36px] text-[#003f87] animate-bounce">psychology</span>
                    </div>
                  </div>
                  
                  <h4 className="text-lg font-bold text-slate-800 mb-2">Đang chấm điểm hồ sơ của bạn</h4>
                  <p className="text-sm text-slate-500 text-center max-w-md animate-pulse">
                    {loadingText}
                  </p>
                  
                  {/* Progress bar steps */}
                  <div className="flex items-center gap-2 mt-8 w-full max-w-md justify-between">
                    {[0, 1, 2, 3].map((step) => (
                      <div 
                        key={step} 
                        className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${
                          loadingProgress >= step ? 'bg-[#003f87]' : 'bg-slate-200'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              ) : activeResult ? (
                /* RESULTS VIEW PANEL */
                <div className="w-full h-full flex flex-col bg-slate-50 overflow-hidden">
                  
                  {/* Back button and Target details header */}
                  <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shrink-0">
                    <button 
                      onClick={() => setActiveResult(null)}
                      className="flex items-center gap-1.5 text-xs font-bold text-[#003f87] hover:underline cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[16px]">arrow_back</span>
                      Quay lại đánh giá
                    </button>
                    
                    <div className="text-right">
                      <span className="text-[10px] uppercase font-bold text-slate-400">Vị trí phân tích:</span>
                      <p className="text-sm font-bold text-slate-800">{activeResult.jdText}</p>
                    </div>
                  </div>

                  {/* Results Subtabs */}
                  <div className="bg-white border-b border-slate-200 px-6 flex gap-6 shrink-0">
                    {[
                      { id: 'overview', label: 'Kết quả chung', icon: 'dashboard' },
                      { id: 'skills', label: 'Kỹ năng & Thành tích', icon: 'military_tech' },
                      { id: 'interview', label: 'Chuẩn bị phỏng vấn', icon: 'chat_bubble' }
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setResultTab(tab.id)}
                        className={`flex items-center gap-2 py-3.5 border-b-2 font-bold text-sm transition-all cursor-pointer ${
                          resultTab === tab.id 
                            ? 'border-[#003f87] text-[#003f87]' 
                            : 'border-transparent text-slate-500 hover:text-slate-700'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[18px]">{tab.icon}</span>
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  {/* Scrollable Result Content */}
                  <div className="flex-grow overflow-y-auto p-6 space-y-6">
                    
                    {/* Tab 1: Overview */}
                    {resultTab === 'overview' && (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        
                        {/* Score Circle Card */}
                        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center justify-center text-center">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">Điểm Tương Thích</h4>
                          
                          <div className="relative w-36 h-36 flex items-center justify-center">
                            <svg className="w-full h-full transform -rotate-90">
                              <circle 
                                cx="72" cy="72" r="62" 
                                stroke="#f1f5f9" strokeWidth="8" fill="transparent" 
                              />
                              <circle 
                                cx="72" cy="72" r="62" 
                                stroke={scoreDetails.stroke} strokeWidth="10" fill="transparent" 
                                strokeDasharray={2 * Math.PI * 62}
                                strokeDashoffset={2 * Math.PI * 62 * (1 - activeResult.score / 100)}
                                strokeLinecap="round"
                                className="transition-all duration-1000"
                              />
                            </svg>
                            <div className="absolute flex flex-col items-center">
                              <span className={`text-4xl font-extrabold font-sans leading-none ${scoreDetails.text}`}>
                                {activeResult.score}
                              </span>
                              <span className="text-[10px] text-slate-400 font-bold uppercase mt-1">trên 100</span>
                            </div>
                          </div>
                          
                          <div className={`mt-5 px-3 py-1.5 rounded-lg text-xs font-bold ${scoreDetails.bg} ${scoreDetails.text} border ${scoreDetails.border}`}>
                            {activeResult.score >= 80 ? 'Hồ sơ cực kỳ tiềm năng' : activeResult.score >= 50 ? 'Khá phù hợp công việc' : 'Cần cải thiện thêm'}
                          </div>
                        </div>

                        {/* Level & Details Card */}
                        <div className="md:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
                          <div>
                            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3.5">Thông tin chi tiết ứng viên</h4>
                            
                            <div className="grid grid-cols-2 gap-4 mb-4">
                              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                                <span className="text-[10px] text-slate-400 font-bold block mb-1">Kinh nghiệm xác thực</span>
                                <span className="text-base font-bold text-slate-800">
                                  {analysisData.candidate_overview?.calculated_years_of_experience || 0} năm
                                </span>
                              </div>
                              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                                <span className="text-[10px] text-slate-400 font-bold block mb-1">Cấp bậc thực tế</span>
                                <span className="text-base font-bold text-slate-800">
                                  {analysisData.candidate_overview?.verified_level || 'Chưa rõ'}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                              <span className="material-symbols-outlined text-slate-500">warning_amber</span>
                              <div className="flex-1">
                                <span className="text-[10px] text-slate-400 font-bold block">Thổi phồng chức danh</span>
                                <span className={`text-xs font-bold ${analysisData.candidate_overview?.title_inflation_detected ? 'text-amber-600' : 'text-emerald-600'}`}>
                                  {analysisData.candidate_overview?.title_inflation_detected 
                                    ? 'Phát hiện chức danh thực tế cao hơn năng lực ghi nhận' 
                                    : 'Thông tin trung thực, không phát hiện thổi phồng'}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="mt-4 pt-4 border-t border-slate-100">
                            <span className="text-[10px] text-slate-400 font-bold block mb-1">Đánh giá tổng quan từ AI</span>
                            <p className="text-xs text-slate-600 leading-relaxed italic">
                              "{analysisData.evaluation?.reasoning || 'Không có đánh giá.'}"
                            </p>
                          </div>
                        </div>

                        {/* Red Flags Card */}
                        <div className="md:col-span-3 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-rose-500 text-[18px]">warning</span>
                            Điểm đáng chú ý / Cảnh báo
                          </h4>
                          
                          {analysisData.candidate_overview?.red_flags && analysisData.candidate_overview.red_flags.length > 0 ? (
                            <div className="space-y-2">
                              {analysisData.candidate_overview.red_flags.map((flag, idx) => (
                                <div key={idx} className="flex gap-2.5 items-start p-3 bg-rose-50/50 rounded-xl border border-rose-100">
                                  <span className="material-symbols-outlined text-rose-500 text-[16px] mt-0.5">report_problem</span>
                                  <span className="text-xs text-rose-800 font-semibold">{flag}</span>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 p-3 bg-emerald-50/50 rounded-xl border border-emerald-100">
                              <span className="material-symbols-outlined text-emerald-600 text-[18px]">check_circle</span>
                              <span className="text-xs text-emerald-800 font-semibold">Tuyệt vời! Không phát hiện điểm đáng ngờ hay Red flags trên CV của bạn.</span>
                            </div>
                          )}
                        </div>

                        {/* Detailed Revision Suggestions Card */}
                        <div className="md:col-span-3 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-[#003f87] text-[18px]">edit_note</span>
                            Gợi ý sửa đổi chi tiết trên CV
                          </h4>
                          
                          {analysisData.detailed_suggestions && analysisData.detailed_suggestions.length > 0 ? (
                            <div className="space-y-4">
                              {analysisData.detailed_suggestions.map((suggestion, idx) => (
                                <div key={idx} className="border border-slate-100 rounded-xl overflow-hidden shadow-xs bg-slate-50/20 p-4 space-y-3">
                                  {/* Section Header */}
                                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                                    <span className="text-xs font-bold px-2.5 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-md">
                                      {suggestion.section || 'Phần CV'}
                                    </span>
                                  </div>
                                  
                                  {/* Current Text Area (Red bg) */}
                                  <div className="p-3 bg-rose-50/40 rounded-xl border border-rose-100/50">
                                    <span className="text-[10px] text-rose-500 font-bold block uppercase mb-1">Nội dung chưa tốt trong CV:</span>
                                    <p className="text-xs text-slate-700 leading-relaxed font-mono">
                                      "{suggestion.current_text}"
                                    </p>
                                  </div>

                                  {/* Issue / Reason */}
                                  <div className="flex gap-2 items-start px-2 text-xs text-slate-600">
                                    <span className="material-symbols-outlined text-rose-500 text-[16px] mt-0.5">report_problem</span>
                                    <div className="flex-1">
                                      <span className="text-[10px] text-slate-400 font-bold block uppercase">Vấn đề phát hiện:</span>
                                      <p className="font-medium text-slate-700 mt-0.5">{suggestion.issue}</p>
                                    </div>
                                  </div>

                                  {/* Suggested Rewrite (Green bg) */}
                                  <div className="p-3 bg-emerald-50/40 rounded-xl border border-emerald-100/50 space-y-2">
                                    <div className="flex items-center justify-between">
                                      <span className="text-[10px] text-emerald-600 font-bold uppercase">Gợi ý viết lại từ AI:</span>
                                      <button
                                        onClick={() => {
                                          navigator.clipboard.writeText(suggestion.suggested_text);
                                          success("Đã sao chép nội dung gợi ý viết lại!");
                                        }}
                                        className="px-2 py-1 bg-white hover:bg-slate-100 text-[10px] font-bold text-emerald-700 rounded border border-emerald-200 transition-colors flex items-center gap-1 cursor-pointer"
                                      >
                                        <span className="material-symbols-outlined text-[12px]">content_copy</span>
                                        Sao chép
                                      </button>
                                    </div>
                                    <p className="text-xs text-slate-800 font-semibold leading-relaxed">
                                      {suggestion.suggested_text}
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 p-3 bg-emerald-50/50 rounded-xl border border-emerald-100">
                              <span className="material-symbols-outlined text-emerald-600 text-[18px]">check_circle</span>
                              <span className="text-xs text-emerald-800 font-semibold">Tuyệt vời! Không tìm thấy lỗi diễn đạt hay vấn đề cần sửa đổi nghiêm trọng trên CV.</span>
                            </div>
                          )}
                        </div>

                      </div>
                    )}

                    {/* Tab 2: Skills & Impact */}
                    {resultTab === 'skills' && (
                      <div className="space-y-6">
                        
                        {/* Skills Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {/* Verified Skills */}
                          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
                              <span className="material-symbols-outlined text-emerald-500 text-[18px]">task_alt</span>
                              Kỹ năng đã xác thực
                            </h4>
                            <p className="text-[10px] text-slate-400 mb-4 italic">Kỹ năng được chứng minh bằng các dự án/kinh nghiệm thực tế trên CV</p>
                            
                            {analysisData.skill_matrix?.verified_hard_skills && analysisData.skill_matrix.verified_hard_skills.length > 0 ? (
                              <div className="flex flex-wrap gap-2">
                                {analysisData.skill_matrix.verified_hard_skills.map((skill, idx) => (
                                  <span key={idx} className="bg-emerald-50 text-emerald-700 border border-emerald-100 px-3 py-1.5 rounded-lg text-xs font-bold">
                                    {skill}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <span className="text-xs text-slate-400 italic">Không tìm thấy kỹ năng phù hợp nào được chứng minh cụ thể.</span>
                            )}
                          </div>

                          {/* Missing Skills */}
                          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
                              <span className="material-symbols-outlined text-slate-500 text-[18px]">cancel</span>
                              Kỹ năng thiết yếu còn thiếu
                            </h4>
                            <p className="text-[10px] text-slate-400 mb-4 italic">Các kỹ năng quan trọng cho vị trí {activeResult.jdText} nhưng không thấy trong CV</p>
                            
                            {analysisData.skill_matrix?.missing_critical_skills && analysisData.skill_matrix.missing_critical_skills.length > 0 ? (
                              <div className="flex flex-wrap gap-2">
                                {analysisData.skill_matrix.missing_critical_skills.map((skill, idx) => (
                                  <span key={idx} className="bg-slate-100 text-slate-600 border border-slate-200 border-dashed px-3 py-1.5 rounded-lg text-xs font-bold">
                                    {skill}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <span className="text-xs text-emerald-600 font-bold bg-emerald-50 px-3 py-2 rounded-xl border border-emerald-100 flex items-center gap-1.5">
                                <span className="material-symbols-outlined text-[16px]">check_circle</span>
                                Bạn đã điền đầy đủ mọi kỹ năng bắt buộc cho vị trí này!
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Achievements Comparison */}
                        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">Đo lường Hiệu quả Mô tả</h4>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            
                            {/* Good: Metric driven */}
                            <div className="bg-emerald-50/20 p-4 rounded-xl border border-emerald-100/50">
                              <div className="flex items-center gap-2 mb-3 text-emerald-700 font-bold text-xs">
                                <span className="material-symbols-outlined text-[18px]">trending_up</span>
                                Điểm mạnh: Thành tích đo lường được
                              </div>
                              {analysisData.impact_analysis?.metric_driven_achievements && analysisData.impact_analysis.metric_driven_achievements.length > 0 ? (
                                <ul className="space-y-2.5">
                                  {analysisData.impact_analysis.metric_driven_achievements.map((item, idx) => (
                                    <li key={idx} className="text-xs text-slate-700 flex gap-2 items-start leading-relaxed">
                                      <span className="material-symbols-outlined text-emerald-500 text-[14px] mt-0.5">check_circle</span>
                                      <span>{item}</span>
                                    </li>
                                  ))}
                                </ul>
                              ) : (
                                <span className="text-xs text-slate-400 italic">Không tìm thấy thành tích có số liệu hoặc kết quả đo lường rõ ràng.</span>
                              )}
                            </div>

                            {/* Weak: Vague claims */}
                            <div className="bg-amber-50/20 p-4 rounded-xl border border-amber-100/50">
                              <div className="flex items-center gap-2 mb-3 text-amber-700 font-bold text-xs">
                                <span className="material-symbols-outlined text-[18px]">error</span>
                                Điểm yếu: Mô tả mơ hồ / Thiếu số liệu
                              </div>
                              {analysisData.impact_analysis?.vague_statements && analysisData.impact_analysis.vague_statements.length > 0 ? (
                                <ul className="space-y-2.5">
                                  {analysisData.impact_analysis.vague_statements.map((item, idx) => (
                                    <li key={idx} className="text-xs text-slate-700 flex gap-2 items-start leading-relaxed">
                                      <span className="material-symbols-outlined text-amber-500 text-[14px] mt-0.5">report</span>
                                      <span>{item}</span>
                                    </li>
                                  ))}
                                </ul>
                              ) : (
                                <span className="text-xs text-emerald-700 font-bold italic">Tuyệt vời! Mọi mô tả kinh nghiệm đều rất sắc nét và thực tế.</span>
                              )}
                            </div>

                          </div>
                        </div>

                      </div>
                    )}

                    {/* Tab 3: Interview prep */}
                    {resultTab === 'interview' && (
                      <div className="space-y-4">
                        <div className="bg-[#003f87]/5 p-4 rounded-xl border border-[#003f87]/15">
                          <span className="text-xs font-bold text-[#003f87] block mb-1">Mẹo chuẩn bị phỏng vấn của VietWorks AI</span>
                          <p className="text-xs text-slate-600 leading-relaxed">
                            Mô hình đã biên soạn bộ câu hỏi này dựa trên các điểm yếu, các từ khóa chưa vững trên CV của bạn để thử thách mức độ sâu sắc của kỹ năng. Hãy tự trả lời và đối chiếu với từ khóa kỳ vọng.
                          </p>
                        </div>
                        
                        {analysisData.interview_generation && analysisData.interview_generation.length > 0 ? (
                          <div className="space-y-3">
                            {analysisData.interview_generation.map((q, idx) => {
                              const isExpanded = expandedQuestionIndex === idx;
                              return (
                                <div key={idx} className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
                                  {/* Accordion header */}
                                  <div 
                                    onClick={() => setExpandedQuestionIndex(isExpanded ? null : idx)}
                                    className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors"
                                  >
                                    <div className="flex items-center gap-3">
                                      <span className="text-xs font-bold px-2 py-1 bg-[#003f87]/10 text-[#003f87] rounded-md shrink-0">
                                        {q.category || 'Hỏi xoáy'}
                                      </span>
                                      <p className="text-xs font-bold text-slate-700 pr-4">{q.question}</p>
                                    </div>
                                    <span className="material-symbols-outlined text-slate-400 shrink-0 select-none">
                                      {isExpanded ? 'expand_less' : 'expand_more'}
                                    </span>
                                  </div>

                                  {/* Accordion content */}
                                  {isExpanded && (
                                    <div className="px-4 pb-4 pt-1 border-t border-slate-100 bg-slate-50/50 space-y-3">
                                      {/* Expected keywords */}
                                      <div>
                                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Từ khóa cốt lõi cần có trong câu trả lời:</span>
                                        <div className="flex flex-wrap gap-1.5">
                                          {q.expected_answer_keywords?.map((kw, kIdx) => (
                                            <span key={kIdx} className="bg-emerald-50 text-emerald-800 border border-emerald-100 px-2 py-0.5 rounded text-[10px] font-bold">
                                              {kw}
                                            </span>
                                          ))}
                                        </div>
                                      </div>

                                      {/* Warning / lies */}
                                      {q.red_flag_if_candidate_says && (
                                        <div className="p-3 bg-rose-50 border border-rose-100 rounded-lg flex gap-2 items-start">
                                          <span className="material-symbols-outlined text-rose-500 text-[16px] mt-0.5">report_problem</span>
                                          <div className="flex-1">
                                            <span className="text-[10px] text-rose-600 font-bold uppercase block">Cảnh báo: Dấu hiệu trả lời yếu hoặc không trung thực:</span>
                                            <p className="text-xs text-rose-800 font-semibold">{q.red_flag_if_candidate_says}</p>
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <div className="py-8 text-center text-slate-400 text-xs italic">Không tìm thấy câu hỏi gợi ý nào.</div>
                        )}
                      </div>
                    )}

                  </div>

                </div>
              ) : (
                /* MAIN FORM AND HISTORY VIEW */
                <div className="w-full h-full flex flex-col md:flex-row">
                  
                  {/* Left Column: Form input */}
                  <div className="flex-1 border-r border-slate-200 p-8 overflow-y-auto flex flex-col justify-between">
                    <div>
                      {/* Tabs inside body */}
                      <div className="flex bg-slate-100 p-1 rounded-xl mb-6">
                        <button
                          onClick={() => setActiveTab('new')}
                          className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                            activeTab === 'new' ? 'bg-white text-[#003f87] shadow-xs' : 'text-slate-500 hover:text-slate-800'
                          }`}
                        >
                          <span className="material-symbols-outlined text-[16px]">add_circle</span>
                          Đánh giá mới
                        </button>
                        <button
                          onClick={() => setActiveTab('history')}
                          className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                            activeTab === 'history' ? 'bg-white text-[#003f87] shadow-xs' : 'text-slate-500 hover:text-slate-800'
                          }`}
                        >
                          <span className="material-symbols-outlined text-[16px]">history</span>
                          Lịch sử đánh giá ({reviewsHistory.length})
                        </button>
                      </div>

                      {activeTab === 'new' ? (
                        /* NEW EVALUATION FORM */
                        <form onSubmit={handleStartAnalysis} className="space-y-5">
                          {/* Target position input */}
                          <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-700 block">Vị trí ứng tuyển mong muốn <span className="text-rose-500">*</span></label>
                            <input 
                              type="text" 
                              value={targetPosition}
                              onChange={(e) => setTargetPosition(e.target.value)}
                              placeholder="Ví dụ: Front-end React Developer, Data Analyst..."
                              className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-xl p-3 outline-none focus:border-[#003f87] focus:ring-4 focus:ring-[#003f87]/10 transition-all font-semibold"
                            />
                          </div>

                          {/* CV Source selection */}
                          <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-700 block">Nguồn file CV <span className="text-rose-500">*</span></label>
                            <div className="flex bg-slate-100 p-1 rounded-xl">
                              <button
                                type="button"
                                onClick={() => setCvSource('local')}
                                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                                  cvSource === 'local' ? 'bg-white text-[#003f87] shadow-xs' : 'text-slate-500 hover:text-slate-800'
                                }`}
                              >
                                File từ máy (.pdf)
                              </button>
                              <button
                                type="button"
                                onClick={() => setCvSource('saved')}
                                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                                  cvSource === 'saved' ? 'bg-white text-[#003f87] shadow-xs' : 'text-slate-500 hover:text-slate-800'
                                }`}
                              >
                                Chọn CV đã tải lên
                              </button>
                            </div>
                          </div>

                          {/* CV source content */}
                          {cvSource === 'local' ? (
                            /* Local uploader area */
                            <div 
                              onDragEnter={handleDrag}
                              onDragOver={handleDrag}
                              onDragLeave={handleDrag}
                              onDrop={handleDrop}
                              className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center text-center transition-all ${
                                dragActive ? 'border-[#003f87] bg-blue-50/20' : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
                              }`}
                            >
                              <span className="material-symbols-outlined text-[36px] text-slate-400 mb-2">upload_file</span>
                              
                              {localFile ? (
                                <div className="space-y-1">
                                  <p className="text-xs font-bold text-slate-800 max-w-[200px] truncate">{localFile.name}</p>
                                  <p className="text-[10px] text-slate-400">{(localFile.size / 1024 / 1024).toFixed(2)} MB</p>
                                  <button 
                                    type="button" 
                                    onClick={() => setLocalFile(null)}
                                    className="text-[10px] font-bold text-rose-500 hover:underline mt-2 cursor-pointer"
                                  >
                                    Chọn file khác
                                  </button>
                                </div>
                              ) : (
                                <>
                                  <p className="text-xs font-bold text-slate-600 mb-1">Kéo thả file PDF vào đây hoặc</p>
                                  <label className="text-xs font-bold text-[#003f87] hover:underline cursor-pointer">
                                    Duyệt file trên máy
                                    <input 
                                      type="file" 
                                      accept=".pdf" 
                                      onChange={(e) => {
                                        if (e.target.files && e.target.files[0]) {
                                          setLocalFile(e.target.files[0]);
                                        }
                                      }} 
                                      className="hidden" 
                                    />
                                  </label>
                                  <p className="text-[10px] text-slate-400 mt-2">Định dạng hỗ trợ: duy nhất file .pdf (Tối đa 10MB)</p>
                                </>
                              )}
                            </div>
                          ) : (
                            /* Saved CV list selection */
                            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                              {loadingUploadedCvs ? (
                                <div className="py-8 text-center text-xs text-slate-400">Đang tải danh sách CV của bạn...</div>
                              ) : uploadedCvs.length > 0 ? (
                                uploadedCvs.map((cv) => (
                                  <div 
                                    key={cv._id}
                                    onClick={() => setSelectedSavedCvId(cv._id)}
                                    className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                                      selectedSavedCvId === cv._id 
                                        ? 'border-[#003f87] bg-blue-50/20' 
                                        : 'border-slate-200 hover:bg-slate-50'
                                    }`}
                                  >
                                    <div className="flex items-center gap-2 overflow-hidden mr-2">
                                      <span className="material-symbols-outlined text-red-500 text-[20px] shrink-0">picture_as_pdf</span>
                                      <div className="min-w-0">
                                        <p className="text-xs font-bold text-slate-700 truncate">{cv.title}</p>
                                        <p className="text-[9px] text-slate-400">{cv.fileName} | {new Date(cv.createdAt).toLocaleDateString('vi-VN')}</p>
                                      </div>
                                    </div>
                                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                                      selectedSavedCvId === cv._id ? 'border-[#003f87] bg-[#003f87]' : 'border-slate-300'
                                    }`}>
                                      {selectedSavedCvId === cv._id && (
                                        <span className="material-symbols-outlined text-white text-[10px] font-black">check</span>
                                      )}
                                    </div>
                                  </div>
                                ))
                              ) : (
                                <div className="text-center py-8 border border-dashed border-slate-200 rounded-xl bg-slate-50">
                                  <p className="text-xs text-slate-500 font-semibold mb-2">Bạn chưa tải lên file CV nào.</p>
                                  <button 
                                    type="button" 
                                    onClick={() => setCvSource('local')}
                                    className="text-xs font-bold text-[#003f87] hover:underline cursor-pointer"
                                  >
                                    Tải file trực tiếp từ máy
                                  </button>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Submit Action */}
                          <button 
                            type="submit"
                            className="w-full bg-[#003f87] hover:bg-[#002f6b] text-white font-bold py-3 px-4 rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer mt-4"
                          >
                            <span className="material-symbols-outlined text-[20px]">psychology</span>
                            Bắt đầu phân tích bằng AI
                          </button>
                        </form>
                      ) : (
                        /* HISTORY LIST TAB */
                        <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-1">
                          {loadingHistory ? (
                            <div className="py-8 text-center text-xs text-slate-400">Đang tải lịch sử...</div>
                          ) : reviewsHistory.length > 0 ? (
                            reviewsHistory.map((h) => {
                              const details = getScoreColor(h.score);
                              return (
                                <div 
                                  key={h._id}
                                  onClick={() => selectHistoryItem(h)}
                                  className="p-3.5 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 cursor-pointer flex items-center justify-between transition-all"
                                >
                                  <div className="min-w-0 mr-3">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase">Vị trí: {h.jdText}</span>
                                    <p className="text-xs font-bold text-slate-700 truncate mt-0.5">
                                      {h.uploadedCvId?.title || 'CV tải lên trực tiếp'}
                                    </p>
                                    <p className="text-[9px] text-slate-400 mt-0.5">
                                      {new Date(h.createdAt).toLocaleDateString('vi-VN')} lúc {new Date(h.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                  </div>
                                  
                                  {/* Small Badge Score */}
                                  <div className={`w-11 h-11 rounded-full flex flex-col items-center justify-center border shrink-0 ${details.bg} ${details.border}`}>
                                    <span className={`text-sm font-extrabold leading-none ${details.text}`}>{h.score}</span>
                                    <span className="text-[7px] text-slate-400 font-bold uppercase">Điểm</span>
                                  </div>
                                </div>
                              );
                            })
                          ) : (
                            <div className="text-center py-12 text-slate-400 text-xs italic">Chưa có lịch sử chấm điểm.</div>
                          )}
                        </div>
                      )}
                    </div>
                    
                    {/* Small branding footer inside the modal */}
                    <div className="text-[10px] text-slate-400 font-semibold border-t border-slate-100 pt-4 mt-6">
                      Bản quyền thuộc về VietWorks AI System. Phục vụ với độ chính xác cao.
                    </div>
                  </div>

                  {/* Right Column: Tips & Core concepts */}
                  <div className="w-full md:w-80 bg-slate-50 p-8 overflow-y-auto space-y-6 select-none shrink-0">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#003f87]">Trợ giúp & Hướng dẫn</h4>
                    
                    <div className="space-y-4">
                      <div className="space-y-1">
                        <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-[16px] text-amber-500">lightbulb</span>
                          Cách chọn Vị trí ứng tuyển
                        </span>
                        <p className="text-[11px] text-slate-500 leading-relaxed">
                          Nhập chính xác vị trí tuyển dụng ghi trên tin tuyển dụng. Ví dụ: "Senior React Developer" thay vì chỉ nhập "IT". Càng rõ ràng, AI chấm điểm càng chuẩn xác.
                        </p>
                      </div>

                      <div className="space-y-1">
                        <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-[16px] text-blue-500">info</span>
                          Độ tương thích ATS
                        </span>
                        <p className="text-[11px] text-slate-500 leading-relaxed">
                          Hệ thống giả lập bộ lọc ATS (Applicant Tracking System) tiêu chuẩn doanh nghiệp để bóc tách thông tin dựa trên kết quả thực tế, không tính từ láy phóng đại hoặc tự ca ngợi.
                        </p>
                      </div>

                      <div className="space-y-1">
                        <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-[16px] text-rose-500">warning</span>
                          Phát hiện Red Flags
                        </span>
                        <p className="text-[11px] text-slate-500 leading-relaxed">
                          AI tự động dò quét các khoảng trống thời gian làm việc (job gaps), tần suất nhảy việc quá nhiều, hoặc các kỹ năng được kể liệt kê hàng loạt nhưng thiếu chứng minh dự án thực tế.
                        </p>
                      </div>
                    </div>
                  </div>

                </div>
              )}

            </div>
    </div>
  );
};

export default AICvReviewEngine;
