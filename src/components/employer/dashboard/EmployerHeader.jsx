import { Wallet, Plus, Bell, ShieldCheck, ShieldAlert, ShieldQuestion, ChevronDown, Building2 } from 'lucide-react';
import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import employerCompanyService from '../../../services/employerCompanyService';
import api from '../../../services/api';
import { useAuth } from '../../../hooks/useAuth';

const formatMoney = (value) => {
  const amount = Number(value || 0);
  return `${new Intl.NumberFormat('vi-VN').format(amount)} đ`;
};

const getVerificationMeta = (status) => {
  switch (status) {
    case 'VERIFIED':
      return {
        label: 'Hồ sơ công ty đã xác thực',
        className: 'bg-emerald-50 border-emerald-200/70 text-emerald-700',
        icon: ShieldCheck,
      };
    case 'PENDING':
      return {
        label: 'Hồ sơ công ty đang chờ duyệt',
        className: 'bg-amber-50 border-amber-200/70 text-amber-700',
        icon: ShieldAlert,
      };
    case 'REJECTED':
      return {
        label: 'Hồ sơ công ty bị từ chối',
        className: 'bg-rose-50 border-rose-200/70 text-rose-700',
        icon: ShieldAlert,
      };
    default:
      return {
        label: 'Hồ sơ công ty chưa hoàn thiện',
        className: 'bg-slate-100 border-slate-200 text-slate-600',
        icon: ShieldQuestion,
      };
  }
};

const getCompanyDisplayName = (company, user) => {
  return company?.name || user?.companyName || 'Nhà tuyển dụng';
};

const getEmployerDisplayName = (user, company) => {
  return user?.fullName || user?.name || company?.name || user?.email || 'Nhà tuyển dụng';
};

const EmployerHeader = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [company, setCompany] = useState(null);
  const [wallet, setWallet] = useState(null);

  useEffect(() => {
    let mounted = true;

    const loadHeaderData = async () => {
      try {
        const [companyRes, walletRes] = await Promise.allSettled([
          employerCompanyService.getMyCompanyProfile(),
          api.get('/employer/wallet'),
        ]);

        if (!mounted) return;

        if (companyRes.status === 'fulfilled' && companyRes.value?.success) {
          setCompany(companyRes.value.data || null);
        }

        if (walletRes.status === 'fulfilled' && walletRes.value?.data?.success) {
          setWallet(walletRes.value.data.data || null);
        }
      } catch (error) {
        console.error('Không thể tải dữ liệu header nhà tuyển dụng:', error);
      }
    };

    loadHeaderData();
    return () => {
      mounted = false;
    };
  }, []);

  const verificationMeta = useMemo(
    () => getVerificationMeta(company?.verificationStatus),
    [company?.verificationStatus]
  );

  const StatusIcon = verificationMeta.icon;
  const companyName = getCompanyDisplayName(company, user);
  const employerName = getEmployerDisplayName(user, company);
  const walletBalance = formatMoney(wallet?.balance);

  return (
    <header className="sticky top-0 z-40 flex h-20 flex-shrink-0 items-center justify-between border-b border-slate-200/60 bg-white/92 px-8 backdrop-blur-2xl transition-all">
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-primary shadow-sm">
          <Building2 className="h-5 w-5" />
        </div>

        <div>
          <h1 className="text-xl font-black tracking-tight text-slate-900">
            {companyName}
          </h1>
          <div className="mt-1 flex items-center gap-2">
            <span className={`flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-bold ${verificationMeta.className}`}>
              <StatusIcon className="h-3.5 w-3.5" />
              {verificationMeta.label}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <button
          type="button"
          onClick={() => navigate('/employer/wallet')}
          className="hidden cursor-pointer items-center gap-3 rounded-full border border-slate-200/70 bg-white px-1.5 py-1.5 pr-4 shadow-sm transition-all hover:border-slate-300 hover:shadow-md lg:flex"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary transition-transform hover:scale-110">
            <Wallet className="h-4 w-4" />
          </div>
          <div className="text-left">
            <p className="mb-1 text-[10px] font-bold uppercase leading-none tracking-wider text-slate-400">
              Số dư ví
            </p>
            <div className="flex items-center gap-2">
              <p className="text-sm font-black leading-none tracking-tight text-slate-900">{walletBalance}</p>
              <span
                onClick={(event) => {
                  event.stopPropagation();
                  navigate('/employer/wallet/topup');
                }}
                className="inline-flex items-center gap-0.5 rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold text-white shadow-sm transition-colors hover:bg-primary/90"
              >
                <Plus className="h-3 w-3" /> Nạp
              </span>
            </div>
          </div>
        </button>

        <button
          type="button"
          onClick={() => navigate('/employer/notifications')}
          className="relative rounded-full border border-transparent p-2.5 text-slate-400 transition-all hover:border-slate-200 hover:bg-slate-100 hover:text-slate-900 active:scale-95"
        >
          <Bell className="h-5 w-5" />
          <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full border-2 border-white bg-red-500 animate-pulse"></span>
        </button>

        <div className="hidden h-8 w-px bg-slate-200/80 sm:block"></div>

        <div className="group flex cursor-pointer items-center gap-3">
          <div className="hidden text-right transition-opacity group-hover:opacity-80 sm:block">
            <p className="text-sm font-extrabold tracking-tight text-slate-900">{employerName}</p>
            <p className="text-[10px] font-bold text-slate-500">Nhà tuyển dụng</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border-2 border-slate-100 bg-slate-100 text-sm font-black text-slate-700 shadow-sm transition-all group-hover:border-primary/50 group-hover:shadow-md">
              {company?.avatarUrl ? (
                <img
                  alt={companyName}
                  className="h-full w-full object-cover"
                  src={company.avatarUrl}
                />
              ) : (
                <span>{companyName.charAt(0).toUpperCase()}</span>
              )}
            </div>
            <ChevronDown className="hidden h-4 w-4 text-slate-400 transition-colors group-hover:text-slate-900 sm:block" />
          </div>
        </div>
      </div>
    </header>
  );
};

export default EmployerHeader;
