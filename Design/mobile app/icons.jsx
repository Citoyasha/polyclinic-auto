// Lucide-style stroke icons. Outline, 1.75 stroke, currentColor.

const _ico = (children, size = 22) => (props) => {
  const { size: s = size, strokeWidth: sw = 1.75, ...rest } = props || {};
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none"
         stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round"
         {...rest}>
      {children}
    </svg>
  );
};

const IconCar = _ico(<>
  <path d="M5 11l1.7-4.5A2.2 2.2 0 018.8 5h6.4a2.2 2.2 0 012.1 1.5L19 11" />
  <path d="M3 16v-2.5a2 2 0 011-1.7L5 11h14l1 .8A2 2 0 0121 13.5V16a1 1 0 01-1 1h-1" />
  <path d="M5 17h2M17 17h2" />
  <path d="M5 17v2.2M19 17v2.2" />
  <circle cx="7.5" cy="17" r="1.6" fill="currentColor" />
  <circle cx="16.5" cy="17" r="1.6" fill="currentColor" />
</>);

const IconUsers = _ico(<>
  <path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2" />
  <circle cx="9" cy="7" r="4" />
  <path d="M22 21v-2a4 4 0 00-3-3.87" />
  <path d="M16 3.13a4 4 0 010 7.75" />
</>);

const IconBox = _ico(<>
  <path d="M21 8L12 3 3 8v8l9 5 9-5V8z" />
  <path d="M3 8l9 5 9-5" />
  <path d="M12 13v8" />
</>);

const IconSearch = _ico(<>
  <circle cx="11" cy="11" r="7" />
  <path d="M20 20l-3.5-3.5" />
</>);

const IconPlus = _ico(<>
  <path d="M12 5v14M5 12h14" />
</>);

const IconArrowLeft = _ico(<>
  <path d="M15 6l-6 6 6 6" />
</>);

const IconMore = _ico(<>
  <circle cx="12" cy="5" r="1.2" />
  <circle cx="12" cy="12" r="1.2" />
  <circle cx="12" cy="19" r="1.2" />
</>);

const IconPhone = _ico(<>
  <path d="M22 16.9v3a2 2 0 01-2.2 2 19.8 19.8 0 01-8.6-3 19.5 19.5 0 01-6-6A19.8 19.8 0 012.1 4.2 2 2 0 014.1 2h3a2 2 0 012 1.7c.1.9.3 1.8.6 2.6a2 2 0 01-.4 2.1L8 9.6a16 16 0 006 6l1.2-1.2a2 2 0 012.1-.5c.8.3 1.7.5 2.6.6a2 2 0 011.8 2z" />
</>);

const IconCamera = _ico(<>
  <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" />
  <circle cx="12" cy="13" r="4" />
</>);

const IconImage = _ico(<>
  <rect x="3" y="3" width="18" height="18" rx="2" />
  <circle cx="9" cy="9" r="1.5" />
  <path d="M21 15l-5-5L5 21" />
</>);

const IconCheck = _ico(<>
  <path d="M5 12l5 5L20 7" />
</>);

const IconX = _ico(<>
  <path d="M18 6L6 18M6 6l12 12" />
</>);

const IconChevronDown = _ico(<>
  <path d="M6 9l6 6 6-6" />
</>);

const IconChevronRight = _ico(<>
  <path d="M9 6l6 6-6 6" />
</>);

const IconTrash = _ico(<>
  <path d="M3 6h18" />
  <path d="M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2" />
  <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
</>);

const IconFileText = _ico(<>
  <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
  <path d="M14 2v6h6" />
  <path d="M8 13h8M8 17h8M8 9h2" />
</>);

const IconDownload = _ico(<>
  <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
  <path d="M7 10l5 5 5-5" />
  <path d="M12 15V3" />
</>);

const IconShare = _ico(<>
  <circle cx="18" cy="5" r="3" />
  <circle cx="6" cy="12" r="3" />
  <circle cx="18" cy="19" r="3" />
  <path d="M8.6 13.5l6.8 4M15.4 6.5l-6.8 4" />
</>);

const IconUser = _ico(<>
  <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
  <circle cx="12" cy="7" r="4" />
</>);

const IconRefresh = _ico(<>
  <path d="M21 4v6h-6" />
  <path d="M3 20v-6h6" />
  <path d="M3.5 9a9 9 0 0114.85-3.36L21 8" />
  <path d="M20.5 15A9 9 0 015.65 18.36L3 16" />
</>);

Object.assign(window, {
  IconCar, IconUsers, IconBox, IconSearch, IconPlus, IconArrowLeft, IconMore,
  IconPhone, IconCamera, IconImage, IconCheck, IconX, IconChevronDown,
  IconChevronRight, IconTrash, IconFileText, IconDownload, IconShare, IconUser,
  IconRefresh,
});
