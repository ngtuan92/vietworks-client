export const getNotificationTarget = (item, user) => {
  const metadata = item?.metadata || {};
  const role = user?.role;

  switch (item?.typeCode) {
    case 'EMPLOYER_VIEWED_CV':
    case 'INTERVIEW_INVITATION':
    case 'APPLICATION_RESULT':
      return metadata.applicationId
        ? { path: `/applied-jobs/${metadata.applicationId}/status` }
        : { path: '/applied-jobs' };

    case 'MATCHING_JOB':
      if (metadata.jobs?.[0]?.jobId) return { path: `/jobs/${metadata.jobs[0].jobId}` };
      return { path: '/matched-jobs' };

    case 'NEW_CV_TEMPLATE':
      return metadata.templateId
        ? { path: `/cv-templates/gallery?templateId=${metadata.templateId}` }
        : { path: '/cv-templates/gallery' };

    case 'NEW_APPLICATION':
      if (metadata.applicationId) return { path: `/employer/applications/${metadata.applicationId}` };
      if (metadata.jobId) return { path: `/employer/jobs/${metadata.jobId}/applications` };
      return { path: '/employer/candidates' };

    case 'JOB_APPROVED':
    case 'JOB_REJECTED':
    case 'JOB_BANNED':
      if (metadata.jobId) return { path: `/employer/jobs/${metadata.jobId}/applications` };
      return { path: '/employer/jobs' };

    case 'COMPANY_VERIFIED':
    case 'COMPANY_REJECTED':
      return { path: '/employer/company-profile' };

    case 'NEW_MESSAGE':
      if (role === 'EMPLOYER') {
        return metadata.conversationId
          ? { path: `/employer/messages?conversationId=${metadata.conversationId}` }
          : { path: '/employer/messages' };
      }
      return {
        path: '/',
        afterNavigate: () => {
          if (metadata.conversationId) {
            window.dispatchEvent(new CustomEvent('open_chat', {
              detail: { conversationId: metadata.conversationId }
            }));
          }
        }
      };

    case 'PAYMENT_SUCCESS':
    case 'PAYMENT_FAILED':
    case 'PAYMENT_CANCELLED':
    case 'PACKAGE_PURCHASE_SUCCESS':
      return role === 'EMPLOYER'
        ? { path: '/employer/transactions' }
        : { path: '/premium' };

    case 'SYSTEM_UPDATE':
      return role === 'EMPLOYER'
        ? { path: '/employer/notifications' }
        : { path: '/notifications' };

    default:
      return role === 'EMPLOYER'
        ? { path: '/employer/notifications' }
        : { path: '/notifications' };
  }
};

export const navigateToNotificationTarget = (navigate, item, user) => {
  const target = getNotificationTarget(item, user);
  if (!target?.path) return;
  navigate(target.path);
  if (typeof target.afterNavigate === 'function') {
    window.setTimeout(target.afterNavigate, 100);
  }
};
