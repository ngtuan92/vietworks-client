import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import jobService from '../../../services/jobService';
import cvService from '../../../services/cvService';

const ApplyJobModal = ({ job, onClose }) => {
  const navigate = useNavigate();
  const [step, setStep] = useState('select'); // 'select' | 'confirm' | 'success'
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [applyOptions, setApplyOptions] = useState(null);

  const [selectedCv, setSelectedCv] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  useEffect(() => {
    fetchApplyOptions();
  }, [job._id]);

  const fetchApplyOptions = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await jobService.getApplyOptions(job._id);
      if (response.success) {
        setApplyOptions(response.data);

        if (response.data.workLocations.length === 1) {
          setSelectedLocation(response.data.workLocations[0]);
        }
      } else {
        setError(response.message || 'Không thể lấy thông tin ứng tuyển');
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Đã xảy ra lỗi';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!selectedCv) {
      setError('Vui lòng chọn CV');
      return;
    }
    if (!agreedToTerms) {
      setError('Vui lòng đồng ý với thỏa thuận sử dụng dữ liệu cá nhân');
      return;
    }
    if (applyOptions?.requireLocationSelection && !selectedLocation) {
      setError('Vui lòng chọn địa điểm làm việc');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const applyData = {
        cvId: selectedCv.type === 'ONLINE' ? selectedCv.id : null,
        uploadedCvId: selectedCv.type === 'UPLOADED' ? selectedCv.id : null,
        expectedWorkLocation: selectedLocation,
        personalDataAgreementAccepted: agreedToTerms
      };

      const response = await jobService.applyJob(job._id, applyData);
      if (response.success) {
        setStep('success');
      } else {
        setError(response.message || 'Ứng tuyển thất bại');
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Đã xảy ra lỗi khi ứng tuyển';
      
      if (errorMessage.includes('đã ứng tuyển')) {
        setStep('already-applied');
      } else {
        setError(errorMessage);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoToMyApplications = () => {
    navigate('/jobseeker/applied-jobs');
    onClose();
  };

  const handleGoToCreateCV = () => {
    navigate('/jobseeker/cvs/create');
    onClose();
  };

  const handleGoToUploadCV = () => {
    navigate('/jobseeker/cvs/upload');
    onClose();
  };

  const handlePreviewCv = () => {
    if (!selectedCv) return;

    if (selectedCv.type === 'ONLINE') {
      window.open(`/cv-preview/${job._id}/${selectedCv.id}`, '_blank');
    } else {
      const fileUrl = selectedCv.fileUrl;
      const googleViewerUrl = `https://docs.google.com/gview?url=${encodeURIComponent(fileUrl)}&embedded=true`;
      window.open(googleViewerUrl, '_blank');
    }
  };

  if (step === 'success') {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-surface rounded-2xl w-full max-w-md p-8 text-center animate-[fade-in-scale_0.25s_ease-out]">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="material-symbols-outlined text-4xl text-green-600">check</span>
          </div>
          <h2 className="font-headline-lg text-headline-lg text-on-surface mb-2">Ứng tuyển thành công!</h2>
          <p className="text-on-surface-variant mb-6">
            Đã nộp hồ sơ cho <span className="font-semibold">{job.title}</span>
          </p>
          <div className="bg-surface-container-low rounded-lg p-4 mb-6">
            <p className="text-body-sm text-on-surface-variant">
              Hồ sơ của bạn đang được nhà tuyển dụng xem xét. Bạn sẽ nhận được thông báo khi có cập nhật.
            </p>
          </div>
          <div className="flex flex-col gap-3">
            <button
              onClick={handleGoToMyApplications}
              className="w-full py-3 bg-primary-container text-white font-bold rounded-lg hover:shadow-lg transition-all"
            >
              Xem việc đã ứng tuyển
            </button>
            <button
              onClick={onClose}
              className="w-full py-3 border border-outline text-on-surface font-semibold rounded-lg hover:bg-surface-container-low transition-all"
            >
              Tìm việc khác
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'already-applied') {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-surface rounded-2xl w-full max-w-md p-8 text-center animate-[fade-in-scale_0.25s_ease-out]">
          <div className="w-16 h-16 bg-primary-container rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="material-symbols-outlined text-4xl text-on-primary-container">check</span>
          </div>
          <h2 className="font-headline-lg text-headline-lg text-on-surface mb-2">Đã ứng tuyển!</h2>
          <p className="text-on-surface-variant mb-6">
            Bạn đã nộp hồ sơ cho <span className="font-semibold">{job.title}</span> trước đó.
          </p>
          <div className="bg-surface-container-low rounded-lg p-4 mb-6">
            <p className="text-body-sm text-on-surface-variant">
              Không thể ứng tuyển trùng lặp. Xem lại hồ sơ đã nộp tại trang việc đã ứng tuyển.
            </p>
          </div>
          <div className="flex flex-col gap-3">
            <button
              onClick={handleGoToMyApplications}
              className="w-full py-3 bg-primary-container text-white font-bold rounded-lg hover:shadow-lg transition-all"
            >
              Xem việc đã ứng tuyển
            </button>
            <button
              onClick={onClose}
              className="w-full py-3 border border-outline text-on-surface font-semibold rounded-lg hover:bg-surface-container-low transition-all"
            >
              Tìm việc khác
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-surface rounded-2xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col animate-[fade-in-scale_0.25s_ease-out]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-outline-variant flex items-center justify-between shrink-0">
          <div>
            <h2 className="font-headline-md text-headline-md text-on-surface">Ứng tuyển</h2>
            <p className="text-body-sm text-on-surface-variant">{job.title}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-surface-container-low rounded-full transition-colors"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <span className="material-symbols-outlined animate-spin text-2xl text-on-surface-variant">progress_activity</span>
              <span className="ml-3 text-on-surface-variant">Đang tải...</span>
            </div>
          ) : error && !applyOptions ? (
            <div className="p-6">
              <div className="bg-error-container rounded-lg p-4 text-center">
                <span className="material-symbols-outlined text-2xl text-error mb-2">error</span>
                <p className="text-error font-medium">{error}</p>
                <button
                  onClick={fetchApplyOptions}
                  className="mt-3 px-4 py-2 bg-error text-white rounded-lg hover:opacity-90"
                >
                  Thử lại
                </button>
              </div>
            </div>
          ) : applyOptions ? (
            <div className="p-6 space-y-6">
              {/* No CV State */}
              {applyOptions.cvs.length === 0 && (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-surface-container-low rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="material-symbols-outlined text-3xl text-on-surface-variant">description</span>
                  </div>
                  <h3 className="font-headline-md text-headline-md text-on-surface mb-2">Bạn chưa có CV</h3>
                  <p className="text-on-surface-variant text-body-sm mb-6">
                    Hãy tạo hoặc tải lên CV để ứng tuyển
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <button
                      onClick={handleGoToCreateCV}
                      className="px-6 py-3 bg-primary-container text-white font-bold rounded-lg hover:shadow-lg transition-all"
                    >
                      + Tạo CV Online
                    </button>
                    <button
                      onClick={handleGoToUploadCV}
                      className="px-6 py-3 border border-primary text-primary font-bold rounded-lg hover:bg-primary-fixed transition-all"
                    >
                      + Upload CV
                    </button>
                  </div>
                </div>
              )}

              {/* CV Selection */}
              {applyOptions.cvs.length > 0 && (
                <div>
                  <label className="block font-label-md text-label-md text-on-surface mb-3">
                    Chọn CV của bạn
                  </label>
                  <div className="space-y-3">
                    {applyOptions.cvs.map((cv) => (
                      <div
                        key={`${cv.type}-${cv.id}`}
                        onClick={() => setSelectedCv(cv)}
                        className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${selectedCv?.id === cv.id && selectedCv?.type === cv.type
                          ? 'border-primary bg-primary-container/10'
                          : 'border-outline-variant hover:border-primary/50'
                          }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 ${selectedCv?.id === cv.id && selectedCv?.type === cv.type
                            ? 'border-primary bg-primary'
                            : 'border-outline'
                            }`}>
                            {selectedCv?.id === cv.id && selectedCv?.type === cv.type && (
                              <span className="material-symbols-outlined text-sm text-white">check</span>
                            )}
                          </div>
                          <div className="flex-grow overflow-hidden">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-on-surface overflow-hidden text-ellipsis whitespace-nowrap">{cv.title}</span>
                              {cv.isMain && (
                                <span className="px-2 py-0.5 bg-primary-container text-on-primary-container text-label-sm rounded-full shrink-0">Mặc định</span>
                              )}
                            </div>
                            <p className="text-body-sm text-on-surface-variant mt-1">
                              {cv.type === 'ONLINE' ? (
                                <span className="flex items-center gap-1">
                                  <span className="material-symbols-outlined text-base shrink-0">dashboard</span>
                                  <span className="overflow-hidden text-ellipsis whitespace-nowrap">
                                    CV Online{cv.templateName && ` - ${cv.templateName}`}
                                  </span>
                                </span>
                              ) : (
                                <span className="flex items-center gap-1">
                                  <span className="material-symbols-outlined text-base shrink-0">attach_file</span>
                                  <span className="overflow-hidden text-ellipsis whitespace-nowrap">{cv.fileName}</span>
                                </span>
                              )}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Location Selection */}
              {applyOptions.requireLocationSelection && applyOptions.workLocations.length > 0 && (
                <div>
                  <label className="block font-label-md text-label-md text-on-surface mb-3">
                    Chọn địa điểm làm việc <span className="text-error">*</span>
                  </label>
                  <div className="relative">
                    <select
                      value={selectedLocation ? `${selectedLocation.provinceCode}-${selectedLocation.districtCode}` : ''}
                      onChange={(e) => {
                        const loc = applyOptions.workLocations.find(
                          (l) => `${l.provinceCode}-${l.districtCode}` === e.target.value
                        );
                        setSelectedLocation(loc);
                      }}
                      className="w-full px-4 py-3 pr-10 border border-outline rounded-lg bg-surface appearance-none cursor-pointer hover:border-primary focus:border-primary focus:outline-none"
                    >
                      <option value="">-- Chọn địa điểm --</option>
                      {applyOptions.workLocations.map((loc, idx) => (
                        <option key={idx} value={`${loc.provinceCode}-${loc.districtCode}`}>
                          {loc.detailAddress
                            ? `${loc.detailAddress}, ${loc.districtName}, ${loc.provinceName}`
                            : `${loc.districtName}, ${loc.provinceName}`}
                        </option>
                      ))}
                    </select>
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-on-surface-variant pointer-events-none">
                      expand_more
                    </span>
                  </div>
                </div>
              )}

              {/* Single location (auto-selected, show info) */}
              {!applyOptions.requireLocationSelection && applyOptions.workLocations.length === 1 && (
                <div className="bg-surface-container-low rounded-lg p-4">
                  <p className="text-body-sm text-on-surface-variant mb-1">Địa điểm làm việc</p>
                  <p className="font-semibold text-on-surface flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">location_on</span>
                    {applyOptions.workLocations[0].detailAddress
                      ? `${applyOptions.workLocations[0].detailAddress}, ${applyOptions.workLocations[0].districtName}, ${applyOptions.workLocations[0].provinceName}`
                      : `${applyOptions.workLocations[0].districtName}, ${applyOptions.workLocations[0].provinceName}`}
                  </p>
                </div>
              )}

              {/* Personal Data Agreement */}
              {applyOptions.personalDataAgreement && (
                <div className="bg-surface-container-low rounded-lg p-4">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 mt-0.5 ${agreedToTerms ? 'border-primary bg-primary' : 'border-outline'
                      }`}>
                      {agreedToTerms && (
                        <span className="material-symbols-outlined text-sm text-white">check</span>
                      )}
                    </div>
                    <input
                      type="checkbox"
                      checked={agreedToTerms}
                      onChange={(e) => setAgreedToTerms(e.target.checked)}
                      className="sr-only"
                    />
                    <span className="text-body-sm text-on-surface">
                      {applyOptions.personalDataAgreement.checkboxLabel || applyOptions.personalDataAgreement.text}
                    </span>
                  </label>
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className="bg-error-container text-error text-body-sm p-3 rounded-lg flex items-center gap-2">
                  <span className="material-symbols-outlined">error</span>
                  {error}
                </div>
              )}
            </div>
          ) : null}
        </div>

        {/* Footer */}
        {applyOptions?.cvs?.length > 0 && (
          <div className="px-6 py-4 border-t border-outline-variant shrink-0">
            <div className="flex gap-3">
              {selectedCv && (
                <button
                  onClick={handlePreviewCv}
                  className="flex-1 py-3 border border-outline text-on-surface font-semibold rounded-lg hover:bg-surface-container-low transition-all flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined">visibility</span>
                  Xem trước CV
                </button>
              )}
              <button
                onClick={handleSubmit}
                disabled={submitting || !selectedCv || (applyOptions.requireLocationSelection && !selectedLocation) || !agreedToTerms}
                className="flex-1 py-3 bg-primary-container text-white font-bold rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <span className="material-symbols-outlined animate-spin">progress_activity</span>
                    Đang xử lý...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined">send</span>
                    Nộp hồ sơ
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ApplyJobModal;