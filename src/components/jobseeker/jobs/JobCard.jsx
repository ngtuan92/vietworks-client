

import { useNavigate } from 'react-router-dom';
import { BookmarkPlus, Banknote, MapPin, Clock, Award, Briefcase, Calendar } from 'lucide-react';
import { useState } from 'react';
import useJobseekerAuth from '../../../hooks/useJobseekerAuth';
import JobseekerAuthModal from '../../common/JobseekerAuthModal';

const JobCard = ({
  id,
  title,
  company,
  companyAvatar,
  location,
  salary,
  logo,
  updatedTime,
  tags = [],
  skills = [],
  experience,
  level,
  workType,
  deadline,
  showExtra = false,
}) => {
  const navigate = useNavigate();
  const { guard, modalState, closeModal } = useJobseekerAuth();
  const avatarSrc = companyAvatar || logo || 'https://placehold.co/64x64/png?text=C';

  const handleClick = () => { if (id) navigate(`/jobs/${id}`); };
  const handleSave = guard((e) => { e.stopPropagation(); console.log('save', id); }, 'save_job');

  return (
    <>

    <div
      className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover-3d hover:border-primary transition-all group cursor-pointer"
      onClick={handleClick}
    >
      <div className="flex flex-col sm:flex-row gap-6">
        <div className="w-16 h-16 bg-gray-50 rounded-lg flex-shrink-0 overflow-hidden flex items-center justify-center border border-gray-100 p-2">
          <img className="w-full h-full object-contain group-hover:scale-110 transition-transform" src={avatarSrc} alt={company} />
        </div>

        <div className="flex-1">
          <div className="flex justify-between items-start gap-3">
            <div>
              <h3 className="text-lg font-bold text-black group-hover:text-primary transition-colors line-clamp-1">{title}</h3>
              <p className="text-gray-600 font-medium">{company}</p>
            </div>
            <button
              className="text-gray-400 hover:text-primary transition-colors"
              onClick={handleSave}
            >
              <BookmarkPlus className="w-6 h-6" />
            </button>
          </div>

          <div className="mt-3 flex flex-wrap gap-x-6 gap-y-2">
            <div className="flex items-center gap-1.5 text-gray-600">
              <Banknote className="w-4 h-4" />
              <span className="text-sm font-bold text-primary">{salary}</span>
            </div>
            <div className="flex items-center gap-1.5 text-gray-600">
              <MapPin className="w-4 h-4" />
              <span className="text-sm">{location}</span>
            </div>
            <div className="flex items-center gap-1.5 text-gray-600">
              <Clock className="w-4 h-4" />
              <span className="text-sm">Cập nhật: {updatedTime}</span>
            </div>
          </div>

          {showExtra ? (
            <div className="mt-2 flex flex-wrap gap-x-6 gap-y-2">
              {experience ? (
                <div className="flex items-center gap-1.5 text-gray-600">
                  <Award className="w-4 h-4" />
                  <span className="text-sm">{experience}</span>
                </div>
              ) : null}
              {level ? (
                <div className="flex items-center gap-1.5 text-gray-600">
                  <Briefcase className="w-4 h-4" />
                  <span className="text-sm">{level}</span>
                </div>
              ) : null}
              {workType ? (
                <div className="flex items-center gap-1.5 text-gray-600">
                  <Briefcase className="w-4 h-4" />
                  <span className="text-sm">{workType}</span>
                </div>
              ) : null}
              {deadline ? (
                <div className="flex items-center gap-1.5 text-orange-600">
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm font-medium">Hạn nộp: {deadline}</span>
                </div>
              ) : null}
            </div>
          ) : null}

          <div className="mt-4 flex flex-wrap gap-2">
            {tags.map((tag, index) => (
              <span key={index} className="px-3 py-1 bg-[#d9e3f2] text-[#3e4853] text-xs font-semibold rounded-full">
                {tag}
              </span>
            ))}
            {skills.slice(0, 3).map((skill, index) => (
              <span key={`skill-${index}`} className="px-3 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                {skill}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>

      <JobseekerAuthModal open={modalState.open} action={modalState.action} onClose={closeModal} />
    </>
  );
};

export default JobCard;
