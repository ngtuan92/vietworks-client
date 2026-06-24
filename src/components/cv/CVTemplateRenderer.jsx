import React from 'react';
import { CVPageFrame, renderSectionTitle } from './CVPageFrame';

const asNode = (renderSection, section, columnContext, isContinuation = false) => (
  section ? renderSection(section, columnContext, isContinuation) : null
);

const maybeWrap = (wrapSection, section, node, isContinuation = false) => {
  if (!section || !node) return null;
  if (isContinuation || !wrapSection) {
    return <div key={section.sectionCode} className="w-full">{node}</div>;
  }
  return wrapSection(section, node);
};

export const CVTemplateRenderer = ({
  selectedLayout,
  style,
  totalPages,
  pages,
  profileSection,
  contactSection,
  renderSection,
  wrapSection,
  renderLeftAvatar,
  pageClassName,
  pageStyle
}) => (
  <>
    {Array.from({ length: totalPages }).map((_, pageIdx) => {
      const pLeft = pages.left?.[pageIdx] || [];
      const pRight = pages.right?.[pageIdx] || [];
      const pHeaderLeft = pages.headerLeft?.[pageIdx] || [];
      const pEqualLeft = pages.equalLeft?.[pageIdx] || [];
      const pEqualRight = pages.equalRight?.[pageIdx] || [];
      const pFullWidth = pages.fullWidth?.[pageIdx] || [];
      const pHarvardClassic = pages.harvardClassic?.[pageIdx] || [];
      const pHarvardGsas = pages.harvardGsas?.[pageIdx] || [];
      const isContinuation = pages.isSectionContinuation;

      const renderList = (sections, pagesArray, columnContext = 'right') => sections.map((section) => {
        const continued = isContinuation(section.sectionCode, pageIdx, pagesArray);
        return maybeWrap(
          wrapSection,
          section,
          asNode(renderSection, section, columnContext, continued),
          continued
        );
      });

      return (
        <CVPageFrame key={pageIdx} className={pageClassName} style={pageStyle}>
          {selectedLayout === 'left-col' && (
            <div className="flex-1 flex w-full overflow-hidden">
              <div style={{ backgroundColor: style.themeColorId }} className="w-[35%] p-6 text-white flex flex-col gap-6">
                {pageIdx === 0 && renderLeftAvatar?.()}
                {renderList(pLeft, pages.left, 'left')}
              </div>
              <div className="flex-1 p-6 bg-white flex flex-col gap-6">
                {pageIdx === 0 && profileSection && (
                  <div className="border-b pb-4" style={{ borderColor: `${style.themeColorId}20` }}>
                    {maybeWrap(wrapSection, profileSection, asNode(renderSection, profileSection, 'right'))}
                  </div>
                )}
                <div className="space-y-6">{renderList(pRight, pages.right, 'right')}</div>
              </div>
            </div>
          )}

          {selectedLayout === 'header-left' && (
            <div className="flex-1 p-8 bg-white flex flex-col gap-6 w-full overflow-hidden">
              {pageIdx === 0 && (
                <div className="flex items-center justify-between border-b pb-4" style={{ borderColor: `${style.themeColorId}30` }}>
                  {profileSection && <div className="flex-1">{maybeWrap(wrapSection, profileSection, asNode(renderSection, profileSection, 'right'))}</div>}
                  {contactSection && <div className="text-right shrink-0">{maybeWrap(wrapSection, contactSection, asNode(renderSection, contactSection, 'right'))}</div>}
                </div>
              )}
              <div className="space-y-6">{renderList(pHeaderLeft, pages.headerLeft, 'right')}</div>
            </div>
          )}

          {selectedLayout === 'two-col-equal' && (
            <div className="flex-1 p-8 bg-white flex flex-col gap-6 w-full overflow-hidden">
              {pageIdx === 0 && profileSection && (
                <div className="p-6 rounded-xl text-white flex justify-between items-center" style={{ backgroundColor: style.themeColorId }}>
                  <div className="flex-1">{maybeWrap(wrapSection, profileSection, asNode(renderSection, profileSection, 'left'))}</div>
                </div>
              )}
              <div className="grid grid-cols-2 gap-6 flex-1">
                <div className="space-y-6 border-r pr-6" style={{ borderColor: `${style.themeColorId}10` }}>
                  {renderList(pEqualLeft, pages.equalLeft, 'right')}
                </div>
                <div className="space-y-6">{renderList(pEqualRight, pages.equalRight, 'right')}</div>
              </div>
            </div>
          )}

          {selectedLayout === 'full-width' && (
            <div className="flex-1 bg-white flex flex-col w-full overflow-hidden text-left">
              {pageIdx === 0 && (
                <div className="px-10 py-6 flex flex-col items-center justify-center border-b" style={{ borderColor: `${style.themeColorId}20` }}>
                  {profileSection && <div className="text-center w-full">{maybeWrap(wrapSection, profileSection, asNode(renderSection, profileSection, 'right'))}</div>}
                  {contactSection && <div className="mt-4 flex justify-center w-full max-w-sm">{maybeWrap(wrapSection, contactSection, asNode(renderSection, contactSection, 'right'))}</div>}
                </div>
              )}
              <div className="px-12 py-5 flex flex-col gap-0 flex-1">{renderList(pFullWidth, pages.fullWidth, 'right')}</div>
            </div>
          )}

          {selectedLayout === 'harvard-classic' && (
            <div className="flex-1 bg-white flex flex-col w-full overflow-hidden text-left">
              {pageIdx === 0 && (
                <div className="px-10 py-6 flex flex-col items-center justify-center border-b-2" style={{ borderColor: style.themeColorId }}>
                  {profileSection && <div className="text-center w-full">{maybeWrap(wrapSection, profileSection, asNode(renderSection, profileSection, 'right'))}</div>}
                  {contactSection && <div className="mt-3 flex justify-center w-full">{maybeWrap(wrapSection, contactSection, asNode(renderSection, contactSection, 'right'))}</div>}
                </div>
              )}
              <div className="px-12 py-5 flex flex-col gap-0 flex-1">{renderList(pHarvardClassic, pages.harvardClassic, 'right')}</div>
            </div>
          )}

          {selectedLayout === 'harvard-gsas' && (
            <div className="flex-1 p-8 bg-white flex flex-col gap-6 w-full overflow-hidden text-left">
              {pageIdx === 0 && (
                <div className="flex items-start justify-between border-b pb-4" style={{ borderColor: `${style.themeColorId}20` }}>
                  {profileSection && <div className="flex-1">{maybeWrap(wrapSection, profileSection, asNode(renderSection, profileSection, 'right'))}</div>}
                  {contactSection && <div className="text-right shrink-0">{maybeWrap(wrapSection, contactSection, asNode(renderSection, contactSection, 'right'))}</div>}
                </div>
              )}
              <div className="space-y-6 flex-1">
                {pHarvardGsas.map((section) => {
                  const continued = isContinuation(section.sectionCode, pageIdx, pages.harvardGsas);
                  const content = (
                    <div className="grid grid-cols-[1fr_3.5fr] gap-6 border-b border-gray-100 pb-4 last:border-b-0">
                      <div className="text-right pr-2">
                        <h4 className="text-[12.5px] font-bold uppercase tracking-wider font-sans" style={{ color: style.themeColorId }}>
                          {renderSectionTitle(section.sectionCode)}
                        </h4>
                      </div>
                      <div className="text-left">{asNode(renderSection, section, 'right', continued)}</div>
                    </div>
                  );
                  return maybeWrap(wrapSection, section, content, continued);
                })}
              </div>
            </div>
          )}
        </CVPageFrame>
      );
    })}
  </>
);
