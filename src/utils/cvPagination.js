export const paginateSectionsWithItemRanges = (secs, style, initialHeight = 0, maxHeight = 1250) => {
  const pages = [];
  let currentPageSecs = [];
  let currentHeight = initialHeight;

  const fontScale = style?.fontSize === 'small' ? 0.85 : style?.fontSize === 'large' ? 1.15 : 1.0;
  const headerHeight = style?.density === 'compact' ? 26 : style?.density === 'comfortable' ? 44 : 34;
  const gapBetweenSections = style?.density === 'compact' ? 8 : style?.density === 'comfortable' ? 24 : 16;

  const getItemHeight = (sectionCode, item) => {
    let h = 40;
    if (sectionCode === 'OBJECTIVE' || sectionCode === 'ADDITIONAL_INFO') {
      h = style?.density === 'compact' ? 35 : style?.density === 'comfortable' ? 65 : 50;
    } else if (sectionCode === 'CONTACT') {
      h = style?.density === 'compact' ? 40 : style?.density === 'comfortable' ? 70 : 55;
    } else if (sectionCode === 'SKILLS' || sectionCode === 'INTERESTS') {
      h = style?.density === 'compact' ? 18 : style?.density === 'comfortable' ? 32 : 24;
    } else if (sectionCode === 'CERTIFICATES' || sectionCode === 'AWARDS') {
      h = style?.density === 'compact' ? 18 : style?.density === 'comfortable' ? 30 : 22;
    } else if (sectionCode === 'EDUCATION') {
      h = style?.density === 'compact' ? 30 : style?.density === 'comfortable' ? 50 : 40;
    } else if (item) {
      const baseH = style?.density === 'compact' ? 32 : style?.density === 'comfortable' ? 50 : 40;
      let descLines = 0;
      if (item.description) {
        const text = item.description.replace(/<[^>]*>/g, '');
        descLines = Math.max(Math.ceil(text.length / 60), 1);
      }
      const descH = descLines * (style?.density === 'compact' ? 12 : style?.density === 'comfortable' ? 20 : 15);
      h = baseH + descH;
    }
    return h * fontScale;
  };

  for (let i = 0; i < secs.length; i++) {
    const sec = secs[i];
    const items = sec.items || [];
    const isObjective = sec.sectionCode === 'OBJECTIVE';
    const isContact = sec.sectionCode === 'CONTACT';

    let secHeaderHeight = headerHeight * fontScale;
    const gap = currentPageSecs.length > 0 ? gapBetweenSections : 0;

    if (isObjective || isContact || sec.sectionCode === 'ADDITIONAL_INFO') {
      const itemH = getItemHeight(sec.sectionCode);
      const totalSecHeight = secHeaderHeight + itemH;

      if (currentPageSecs.length > 0 && currentHeight + gap + totalSecHeight > maxHeight) {
        pages.push(currentPageSecs);
        currentPageSecs = [{ ...sec, renderItemRange: [0, 1] }];
        currentHeight = totalSecHeight;
      } else {
        currentHeight += gap + totalSecHeight;
        currentPageSecs.push({ ...sec, renderItemRange: [0, 1] });
      }
      continue;
    }

    if (sec.sectionCode === 'SKILLS' || sec.sectionCode === 'INTERESTS') {
      const itemH = getItemHeight(sec.sectionCode);
      const rows = Math.max(Math.ceil(items.length / 5), 1);
      const addButtonH = (style?.density === 'compact' ? 12 : style?.density === 'comfortable' ? 20 : 16) * fontScale;
      const totalSecHeight = secHeaderHeight + rows * itemH + addButtonH;

      if (currentPageSecs.length > 0 && currentHeight + gap + totalSecHeight > maxHeight) {
        pages.push(currentPageSecs);
        currentPageSecs = [{ ...sec, renderItemRange: [0, items.length] }];
        currentHeight = totalSecHeight;
      } else {
        currentHeight += gap + totalSecHeight;
        currentPageSecs.push({ ...sec, renderItemRange: [0, items.length] });
      }
      continue;
    }

    if (items.length === 0) {
      const addButtonH = (style?.density === 'compact' ? 12 : style?.density === 'comfortable' ? 20 : 16) * fontScale;
      const emptySecHeight = secHeaderHeight + addButtonH;
      if (currentPageSecs.length > 0 && currentHeight + gap + emptySecHeight > maxHeight) {
        pages.push(currentPageSecs);
        currentPageSecs = [{ ...sec, renderItemRange: [0, 0] }];
        currentHeight = emptySecHeight;
      } else {
        currentHeight += gap + emptySecHeight;
        currentPageSecs.push({ ...sec, renderItemRange: [0, 0] });
      }
      continue;
    }

    let itemIdx = 0;
    let pageStartIdx = 0;
    let headerAdded = false;
    const addButtonH = (style?.density === 'compact' ? 12 : style?.density === 'comfortable' ? 20 : 16) * fontScale;

    while (itemIdx < items.length) {
      const item = items[itemIdx];
      if (!item) {
        itemIdx++;
        continue;
      }
      const itemH = getItemHeight(sec.sectionCode, item);
      const currentGap = (currentPageSecs.length > 0 || headerAdded) ? gapBetweenSections : 0;

      let heightNeeded = itemH;
      if (!headerAdded) {
        heightNeeded += secHeaderHeight;
      }
      if (itemIdx === items.length - 1) {
        heightNeeded += addButtonH;
      }

      if (currentHeight + currentGap + heightNeeded > maxHeight) {
        if (currentHeight === 0 && itemIdx === pageStartIdx) {
          itemIdx++;
          currentHeight += heightNeeded;
          headerAdded = true;
        } else {
          if (itemIdx > pageStartIdx) {
            currentPageSecs.push({ ...sec, renderItemRange: [pageStartIdx, itemIdx] });
          }
          if (currentPageSecs.length > 0) {
            pages.push(currentPageSecs);
          }
          currentPageSecs = [];
          currentHeight = 0;
          pageStartIdx = itemIdx;
          headerAdded = false;
        }
      } else {
        itemIdx++;
        currentHeight += currentGap + heightNeeded;
        headerAdded = true;
      }
    }

    if (itemIdx > pageStartIdx) {
      currentPageSecs.push({ ...sec, renderItemRange: [pageStartIdx, itemIdx] });
    }
  }

  if (currentPageSecs.length > 0) {
    pages.push(currentPageSecs);
  }

  if (pages.length === 0) {
    pages.push([]);
  }

  return pages;
};
